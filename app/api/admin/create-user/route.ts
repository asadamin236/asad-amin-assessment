import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmailDirect, createWelcomeEmailHTML } from "@/lib/emailService";

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Secret key for admin creation
const ADMIN_CREATION_SECRET = process.env.NEXT_ADMIN_SECRET_KEY || "your-secret-key";

// Function to check if database tables exist
async function checkTablesExist() {
  try {
    const { error: profilesError } = await supabaseAdmin.from('profiles').select('id').limit(1);
    const { error: clientsError } = await supabaseAdmin.from('clients').select('id').limit(1);
    
    if (profilesError || clientsError) {
      return false; // Tables don't exist
    }
    return true; // Tables exist
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if database tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json({
        error: "Database tables not found. Please run the SQL setup in your Supabase dashboard first.",
        setup_url: "https://supabase.com/dashboard/project/duzgaclqdfsyxmyzgemy/sql"
      }, { status: 500 });
    }
    
    const { email, password, name, business_name, secret } = await request.json();

    // If secret is provided, create an admin user
    if (secret) {
      // Verify secret key for admin creation
      if (secret !== ADMIN_CREATION_SECRET) {
        return NextResponse.json({ error: "Unauthorized: Invalid secret key" }, { status: 401 });
      }

      if (!email || !password || !name || !business_name) {
        return NextResponse.json({ error: "Email, password, name, and business name are required for admin creation" }, { status: 400 });
      }

      // Create the admin user in Supabase Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      // Update the profile to set role as 'admin'
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", newUser.user.id);

      if (profileError) {
        return NextResponse.json({ 
          error: "User created but failed to set admin role: " + profileError.message 
        }, { status: 500 });
      }

      // Add admin to clients table so they appear in the frontend users list
      const { error: clientError } = await supabaseAdmin
        .from("clients")
        .insert([{ name, email, business_name }]);

      if (clientError) {
        console.error("Error adding admin to clients table:", clientError);
        // Don't fail the request, just log the error
      }

      // Send welcome email to admin
      try {
        const emailHTML = createWelcomeEmailHTML(name, business_name, "admin");
        const emailResult = await sendEmailDirect(email, `Welcome to Our Portal, ${name}!`, emailHTML);
        console.log("Admin welcome email sent:", emailResult);
      } catch (emailError) {
        console.error("Failed to send admin welcome email:", emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully and welcome email sent",
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role: "admin",
          name: name,
          business_name: business_name,
        },
      });
    }

    // Regular user creation requires admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Create the new regular user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Insert client data
    const { error: clientInsertError } = await supabaseAdmin
      .from("clients")
      .insert([{ name, email, business_name }]);

    if (clientInsertError) {
      return NextResponse.json({ 
        error: "User created but failed to save client data: " + clientInsertError.message 
      }, { status: 500 });
    }

    // Send welcome email to regular user
    try {
      const emailHTML = createWelcomeEmailHTML(name, business_name, "client");
      const emailResult = await sendEmailDirect(email, `Welcome to Our Portal, ${name}!`, emailHTML);
      console.log("Client welcome email sent:", emailResult);
    } catch (emailError) {
      console.error("Failed to send client welcome email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully and welcome email sent",
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: "client",
        name: name,
        business_name: business_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

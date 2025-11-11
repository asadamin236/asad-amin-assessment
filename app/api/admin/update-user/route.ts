import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
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

    // Get update data from request body
    const { email, name, business_name, role, new_password } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user ID from profiles table (which references auth.users)
    const { data: profileData, error: profileFindError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileFindError || !profileData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = profileData.id;

    // Update password if provided
    if (new_password) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: new_password
      });

      if (passwordError) {
        return NextResponse.json({ 
          error: "Failed to update password: " + passwordError.message 
        }, { status: 500 });
      }
    }

    // Update clients table
    if (name || business_name) {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (business_name) updateData.business_name = business_name;

      const { error: clientError } = await supabaseAdmin
        .from("clients")
        .update(updateData)
        .eq("email", email);

      if (clientError) {
        console.error("Error updating clients table:", clientError);
      }
    }

    // Update role in profiles table
    if (role && (role === 'admin' || role === 'client')) {
      const { error: roleError } = await supabaseAdmin
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (roleError) {
        console.error("Error updating role:", roleError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      updated_fields: {
        name: name || "unchanged",
        business_name: business_name || "unchanged",
        role: role || "unchanged",
        password: new_password ? "updated" : "unchanged"
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}

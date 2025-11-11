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

export async function ensureTablesExist() {
  try {
    // Try to query profiles table to check if it exists
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    // Try to query clients table to check if it exists
    const { error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1);

    // If no errors, tables exist
    if (!profilesError && !clientsError) {
      return true;
    }

    // If tables don't exist, create them using raw SQL
    console.log("Creating database tables...");
    
    const createTablesSQL = `
      -- Create profiles table
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'client',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create clients table  
      CREATE TABLE IF NOT EXISTS clients (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        business_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable Row Level Security
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

      -- Create policies for profiles
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile') THEN
          CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can do anything') THEN
          CREATE POLICY "Service role can do anything" ON profiles FOR ALL USING (auth.role() = 'service_role');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Authenticated users can read clients') THEN
          CREATE POLICY "Authenticated users can read clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Service role can do anything on clients') THEN
          CREATE POLICY "Service role can do anything on clients" ON clients FOR ALL USING (auth.role() = 'service_role');
        END IF;
      END $$;

      -- Create trigger function to auto-create profiles
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, role)
        VALUES (NEW.id, NEW.email, 'client');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create trigger
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    // Execute the SQL using a direct query
    const { error } = await supabaseAdmin.rpc('exec', { sql: createTablesSQL });
    
    if (error) {
      console.error("Error creating tables:", error);
      return false;
    }

    console.log("Database tables created successfully!");
    return true;
  } catch (error) {
    console.error("Database setup error:", error);
    return false;
  }
}

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

export async function POST() {
  return NextResponse.json({
    success: false,
    message: "Please create tables manually in Supabase dashboard",
    instructions: [
      "1. Go to https://supabase.com/dashboard/project/duzgaclqdfsyxmyzgemy/sql",
      "2. Click 'New Query'",
      "3. Copy and paste the SQL from create-tables.sql",
      "4. Click 'RUN' to execute"
    ]
  }, { status: 200 });
}

# Setup Instructions for Supabase Auth

## 1. Run SQL Setup in Supabase

1. Go to your Supabase Dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Copy and paste the contents of `supabase-setup.sql`
5. Click **Run** to execute the SQL

This will create:
- `profiles` table to store user roles (admin/client)
- `clients` table for client data
- Row Level Security (RLS) policies
- Automatic trigger to create profile on user signup

## 2. Get Your Service Role Key

1. In Supabase Dashboard, go to **Settings** > **API**
2. Find the **service_role** key (NOT the anon key)
3. Copy it and add to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

⚠️ **IMPORTANT**: Never commit this key to git or expose it to the client!

## 3. Create Your First Admin User

### Option A: Via Supabase Dashboard (Recommended)
1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add User** > **Create new user**
3. Enter your admin email and password
4. After creating, go to **SQL Editor** and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
   ```

### Option B: Via Signup + SQL
1. Run your Next.js app: `npm run dev`
2. Go to http://localhost:3000/login
3. Sign up with your admin email/password (you'll need to add a signup form or use Supabase dashboard)
4. Then run the SQL command above to make yourself admin

## 4. How It Works

### Admin Flow:
1. Admin logs in with email/password (stored in Supabase Auth)
2. System checks `profiles` table for role = 'admin'
3. Admin can access `/add-client` page
4. Admin creates a client user:
   - System generates random password
   - Creates user in Supabase Auth
   - Adds client to `clients` table
   - Sends welcome email with credentials

### Client Flow:
1. Client receives email with login credentials
2. Client logs in with email/password
3. System checks `profiles` table for role = 'client'
4. Client can only view clients list (no create/update/delete)

## 5. Testing

1. **Login as admin**: Use your admin email/password
2. **Create a client**: Go to `/add-client`, fill in client details
3. **Note the temporary password** shown on success
4. **Logout** and login as the client using their email and temp password
5. **Verify**: Client can see clients list but not the "Add Client" button

## 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
   - `RESEND_API_KEY` (optional)
5. Deploy!

## 7. Optional: Setup Resend for Real Emails

1. Sign up at https://resend.com
2. Get your API key
3. Add to `.env`: `RESEND_API_KEY=your_key_here`
4. Update `context/emailApi.ts` to use real Resend API (commented code is already there)

## Troubleshooting

- **"Unauthorized" error**: Make sure you've set `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- **Can't create users**: Check RLS policies in Supabase Dashboard
- **Role not detected**: Verify `profiles` table has correct role for your user
- **Build errors**: Make sure all pages have `"use client"` directive if using hooks

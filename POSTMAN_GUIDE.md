# Postman Guide: Create Admin User

## Prerequisites
1. Make sure you've run `supabase-setup.sql` in Supabase Dashboard
2. Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file
3. Your Next.js app is running (`npm run dev`)

## Create Admin User via Postman

### Step 1: Setup Postman Request

**Method:** `POST`


**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**

### Step 2: Send Request

Click **Send** in Postman.

### Expected Response (Success):
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": "uuid-here",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Expected Response (Error - Invalid Secret):
```json
{
  "error": "Unauthorized: Invalid secret key"
}
```

## Important Notes

### Security
- The `secret` field uses `NEXT_ADMIN_SECRET_KEY` from your `.env` file
- This prevents unauthorized admin creation
- **Never expose this secret publicly!**
- In production, consider removing this endpoint or adding additional security

### What Happens
1. API creates user in Supabase Auth
2. Auto-confirms email (no verification needed)
3. Updates `profiles` table to set `role = 'admin'`
4. Returns user details

### After Creating Admin
1. Go to `http://localhost:3000/login`
2. Login with the email/password you just created
3. You'll be logged in as admin
4. You can now create client users from the UI

## Verify Admin in Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your admin user
3. Go to **SQL Editor** and run:
   ```sql
   SELECT * FROM profiles WHERE email = 'admin@example.com';
   ```
4. Verify `role` is `'admin'`

## Troubleshooting

### Error: "Invalid secret key"
- Check that `secret` in request matches `NEXT_ADMIN_SECRET_KEY` in `.env`
- Default is: `usduusdhsdjjdjhsjhsdsd`

### Error: "User created but failed to set admin role"
- Make sure you ran `supabase-setup.sql` to create `profiles` table
- Check Supabase Dashboard → SQL Editor for any errors

### Error: "User already registered"
- Email already exists in Supabase Auth
- Use a different email or delete the existing user from Supabase Dashboard

## Alternative: Create Admin via Supabase Dashboard

If you prefer not to use Postman:

1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. Go to **SQL Editor** and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

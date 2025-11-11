# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Supabase project (already configured)
- Gmail account with App Password

## 📋 Deployment Steps

### 1. GitHub Setup
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Admin CRUD Portal with email notifications"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/admin-crud-portal.git

# Push to GitHub
git push -u origin main
```

### 2. Vercel Deployment

1. **Go to [vercel.com](https://vercel.com) and sign in**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure Environment Variables:**

   Add these environment variables in Vercel dashboard:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://duzgaclqdfsyxmyzgemy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1emdhY2xxZGZzeXhteXpnZW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODU3OTYsImV4cCI6MjA3ODM2MTc5Nn0.ad8RFAaAuLg5zm7zDle6T8yqGkZn7MRRuHjvfRTEXKA
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1emdhY2xxZGZzeXhteXpnZW15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4NTc5NiwiZXhwIjoyMDc4MzYxNzk2fQ.ZTjc3cM_OT46451deAnq0-Vkja6wxewPMNBVuwm_VcE
   NEXT_ADMIN_SECRET_KEY=my-secret-admin-key-2024
   EMAIL_USER=asadamin236@gmail.com
   EMAIL_PASS=pmgo kqzv gvmq vqkz
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```

5. **Deploy** - Vercel will automatically build and deploy your app

### 3. Post-Deployment Setup

1. **Update Login URL in Email Template:**
   - Go to `lib/emailService.ts`
   - Change `http://localhost:3000/login` to your Vercel URL
   - Example: `https://your-app-name.vercel.app/login`

2. **Test the Deployment:**
   - Visit your Vercel URL
   - Create an admin user using the secret key
   - Test user creation and email functionality

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |
| `NEXT_ADMIN_SECRET_KEY` | Secret key for admin creation | `my-secret-admin-key-2024` |
| `EMAIL_USER` | Gmail address | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |

## 🎯 Features Deployed

- ✅ **User Authentication** (Supabase Auth)
- ✅ **Admin Dashboard** with user management
- ✅ **CRUD Operations** (Create, Read, Update, Delete users)
- ✅ **Role-Based Access** (Admin vs Client)
- ✅ **Email Notifications** (Welcome emails via Gmail SMTP)
- ✅ **Responsive UI** with modern design
- ✅ **Database Integration** (Supabase PostgreSQL)

## 🔐 Security Notes

- All sensitive keys are stored as environment variables
- Service role key is only used server-side
- Email credentials are secured
- Admin secret key protects admin creation

## 📞 Support

If you encounter any issues during deployment:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure Supabase database is properly configured
4. Test email credentials locally first

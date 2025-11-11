# 🛡️ Admin CRUD Portal

A modern, full-stack admin dashboard built with Next.js, Supabase, and email notifications for complete user management.

## ✨ Features

- 🔐 **Secure Authentication** - Supabase Auth with role-based access
- 👥 **User Management** - Complete CRUD operations for users
- 📧 **Email Notifications** - Automated welcome emails via Gmail SMTP  
- 🛡️ **Admin Dashboard** - Create and manage admin/client users
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🔒 **Role-Based Access** - Different permissions for admin vs client users
- 📊 **Real-time Data** - Live updates with Supabase integration

## 🚀 Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Email:** Nodemailer with Gmail SMTP
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- Gmail account with App Password
- GitHub account (for deployment)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd admin-crud-portal
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_ADMIN_SECRET_KEY=my-secret-admin-key-2024
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

4. **Set up Supabase database:**
Run the SQL script in `supabase-setup.sql` in your Supabase SQL editor.

5. **Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage

### Creating an Admin User
```bash
POST /api/admin/create-user
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name",
  "business_name": "Company Name",
  "secret": "my-secret-admin-key-2024"
}
```

### Creating Regular Users
1. Login as admin
2. Go to Admin Dashboard
3. Fill out the user creation form
4. User receives welcome email automatically

### Managing Users
- View all users in the Clients page
- Edit user details with the edit modal
- Delete users (admin only)
- Role-based UI rendering

## 📁 Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin-specific endpoints
│   │   ├── login/          # Authentication
│   │   └── send-email/     # Email service
│   ├── admin/              # Admin dashboard pages
│   ├── clients/            # Client management
│   └── login/              # Login page
├── context/                # React contexts and API functions
├── lib/                    # Utility functions and services
├── components/             # Reusable UI components
└── public/                 # Static assets
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

Quick deploy:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

## 🔐 Security Features

- Environment variables for sensitive data
- Server-side API key validation
- Role-based access control
- Secure password handling
- Protected admin routes

## 📧 Email System

- Automated welcome emails for new users
- Professional HTML templates
- Role-specific email content
- Gmail SMTP integration
- Error handling and fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please open an issue on GitHub.

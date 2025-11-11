import nodemailer from 'nodemailer';

export interface EmailResult {
  success: boolean;
  message: string;
  provider?: string;
  details?: {
    to: string;
    subject: string;
    timestamp: string;
    messageId?: string;
  };
  error?: string;
}

export async function sendEmailDirect(to: string, subject: string, html: string): Promise<EmailResult> {
  try {
    // Gmail SMTP configuration from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = process.env.EMAIL_PORT || '587';

    console.log("Email environment check:");
    console.log("EMAIL_USER:", emailUser ? "Set" : "Missing");
    console.log("EMAIL_PASS:", emailPass ? "Set" : "Missing");

    if (!emailUser || !emailPass) {
      throw new Error("Email credentials not configured in environment variables");
    }

    console.log("Creating Gmail SMTP transporter...");
    
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort),
      secure: false, // true for 465, false for 587
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send email
    console.log(`Sending email to ${to}...`);
    const info = await transporter.sendMail({
      from: `"Portal Team" <${emailUser}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`Email sent successfully to ${to} via Gmail SMTP`);
    console.log('Message ID:', info.messageId);

    return {
      success: true,
      message: `Email sent successfully to ${to}`,
      provider: 'Gmail SMTP',
      details: {
        to,
        subject,
        timestamp: new Date().toISOString(),
        messageId: info.messageId
      }
    };

  } catch (error: any) {
    console.error("❌ Email sending failed:", error);
    return {
      success: false,
      message: `Failed to send email to ${to}`,
      error: error.message
    };
  }
}

export function createWelcomeEmailHTML(name: string, business: string, role: string = 'client'): string {
  const isAdmin = role === 'admin';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to Our Portal!</h2>
        
        <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; color: #555;">Your account has been successfully created! Here are your details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Business:</strong> ${business}</p>
          <p style="margin: 8px 0;"><strong>Role:</strong> ${isAdmin ? 'Administrator' : 'Client'}</p>
        </div>
        
        ${isAdmin ? 
          '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;"><p style="margin: 0; color: #856404;"><strong>Admin Access:</strong> You have full access to manage users and clients in the system.</p></div>' :
          '<div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;"><p style="margin: 0; color: #0c5460;"><strong>Client Access:</strong> You can view and manage your business information through our portal.</p></div>'
        }
        
        <p style="font-size: 16px; color: #555;">You can now log in to your account using your email and password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/login" 
             style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            Login to Portal
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="font-size: 14px; color: #666;">If you have any questions, please don't hesitate to contact our support team.</p>
          <p style="font-size: 14px; color: #666;">Best regards,<br><strong>The Portal Team</strong></p>
        </div>
      </div>
    </div>
  `;
}

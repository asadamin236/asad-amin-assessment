import axios from "axios";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendWelcomeEmail(to: string, name: string, business: string, role: string = 'client') {
  const isAdmin = role === 'admin';
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to Our Portal!</h2>
        
        <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; color: #555;">Your account has been successfully created! Here are your details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
          <p style="margin: 8px 0;"><strong>👤 Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${to}</p>
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

  // Send email via API route (server-side)
  try {
    console.log("📧 Sending email via API route...");
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: `Welcome to Our Portal, ${name}!`,
        html: emailHtml,
        name,
        business_name: business
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Email API response:", result);
    return result;
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error.message,
      message: `Failed to send email to ${to}: ${error.message}`
    };
  }
}

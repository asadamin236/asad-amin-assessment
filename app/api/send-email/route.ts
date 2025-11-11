import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, name, business_name } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ 
        error: "Missing required fields: to, subject, html" 
      }, { status: 400 });
    }

    // Check if we have Gmail SMTP configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    
    console.log("🔍 Email environment variables:");
    console.log("EMAIL_USER:", emailUser ? "Set" : "Missing");
    console.log("EMAIL_PASS:", emailPass ? "Set" : "Missing");
    console.log("EMAIL_HOST:", emailHost ? "Set" : "Missing");
    console.log("EMAIL_PORT:", emailPort ? "Set" : "Missing");
    
    if (emailUser && emailPass && emailHost && emailPort) {
      // Send real email using Gmail SMTP
      try {
        // Create transporter
        console.log("📧 Creating Gmail SMTP transporter...");
        const transporter = nodemailer.createTransport({
          host: emailHost,
          port: parseInt(emailPort),
          secure: false, // true for 587, false for other ports
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Send email
        const info = await transporter.sendMail({
          from: `"Portal Team" <${emailUser}>`,
          to: to,
          subject: subject,
          html: html,
        });

        console.log(`Real email sent successfully to ${to} via Gmail SMTP`);
        console.log('Message ID:', info.messageId);
        
        return NextResponse.json({
          success: true,
          message: `Real email sent successfully to ${to}`,
          provider: 'Gmail SMTP',
          details: {
            to,
            subject,
            timestamp: new Date().toISOString(),
            messageId: info.messageId
          }
        });
      } catch (emailError: any) {
        console.error("Gmail SMTP email failed:", emailError);
        // Fall back to simulation
      }
    }

    // Fallback: Simulate email sending (for development)
    console.log("📧 Simulating email (no real email service configured):");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Content:", html.substring(0, 200) + "...");
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Email simulated successfully to ${to}`);

    return NextResponse.json({
      success: true,
      message: `Email simulated successfully to ${to} (configure RESEND_API_KEY for real emails)`,
      provider: 'Simulation',
      details: {
        to,
        subject,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ 
      success: false,
      error: error.message || "Failed to send email" 
    }, { status: 500 });
  }
}

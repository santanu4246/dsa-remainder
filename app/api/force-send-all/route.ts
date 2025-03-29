import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// This endpoint forces sending emails to all users with preferences
// Even if they already received an email today
// Useful for testing and manual trigger

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Log trigger for debugging
    console.log(`🔨 Force send trigger received at: ${new Date().toISOString()}`);
    console.log(`🔨 Triggered by: ${session.user.email}`);
    
    // Check if nodemailer configurations exist
    if (!process.env.nodemailer_user || !process.env.nodemailer_pass) {
      console.error("❌ Email credentials not found in environment variables!");
      return NextResponse.json({ 
        success: false, 
        error: "Email configuration missing" 
      }, { status: 500 });
    }

    // Get all users who have set preferences
    const users = await db.user.findMany({
      where: {
        // Only get users who have selected topics
        topics: {
          some: {} // This ensures the user has at least one topic
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log(`👤 Found ${users.length} users with preferences to process`);

    const results = [];
    const errors = [];

    // Process users one by one
    for (const user of users) {
      try {
        console.log(`📧 Processing user: ${user.email}`);
        
        // Don't check for existing emails since this is a force send
        console.log(`🚀 Force sending email to ${user.email}...`);
        
        // First delete any existing email logs for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await db.emailLog.deleteMany({
          where: {
            userId: user.id,
            sentAt: {
              gte: today
            }
          }
        });
        
        // Now send the email
        const result = await sendQuestionToUser(user.id);
        
        if (result.success) {
          console.log(`✅ Successfully sent to: ${user.email}`);
          results.push({
            email: user.email,
            question: result.question
          });
        } else {
          console.error(`❌ Failed to send to ${user.email}:`, result.error);
          errors.push({ 
            email: user.email,
            error: result.error || "Unknown error" 
          });
        }
        
        // Add a small delay between emails to avoid Gmail sending limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Error processing user ${user.email}:`, errorMessage);
        errors.push({ 
          email: user.email, 
          error: errorMessage 
        });
      }
    }
    
    const response = {
      success: true,
      message: `Force processed ${users.length} users - ${results.length} successful, ${errors.length} failed`,
      successCount: results.length,
      errorCount: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log("📊 Force email sending completed:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Force email sending failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send emails",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
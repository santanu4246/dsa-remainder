import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";

// This endpoint can be triggered by external cron services like cron-job.org
// It will always attempt to send emails when called

export async function GET() {
  try {
    // Log trigger time for debugging
    const now = new Date();
    console.log(`🔔 Daily email (1:30 PM) trigger received at: ${now.toISOString()}`);
    
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

    // Process users one by one to avoid rate limits
    for (const user of users) {
      try {
        console.log(`📧 Processing user: ${user.email}`);
        
        // Check if user already received a question today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingEmail = await db.emailLog.findFirst({
          where: {
            userId: user.id,
            sentAt: {
              gte: today
            }
          }
        });
        
        if (existingEmail) {
          console.log(`⏭️ Already sent to user ${user.email} today, skipping`);
          continue;
        }

        console.log(`🚀 Attempting to send email to ${user.email}...`);
        const result = await sendQuestionToUser(user.id);
        
        if (result.success) {
          console.log(`✅ Successfully sent to: ${user.email}`);
          results.push({
            email: user.email,
            question: result.question
          });
        } else {
          if (!result.alreadySent) {
            console.error(`❌ Failed to send to ${user.email}:`, result.error);
            errors.push({ 
              email: user.email,
              error: result.error || "Unknown error" 
            });
          }
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
      message: `Processed ${users.length} users - ${results.length} successful, ${errors.length} failed`,
      successCount: results.length,
      errorCount: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    };

    console.log("📊 Email sending completed:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Email sending failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send emails",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
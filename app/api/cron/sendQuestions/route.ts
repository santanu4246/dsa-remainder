import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";

// This is a manual trigger endpoint for sending daily questions at 1:00 PM
// Since Vercel Free plan doesn't support cron jobs

interface ErrorInfo {
  userId: string;
  error: string;
}

// Define a type for successful results
interface SuccessResult {
  success: true;
  emailLog: {
    id: number;
    userId: string;
    questionLink: string;
    sentAt: Date;
  };
  question: string;
}

export async function GET() {
  try {
    // Log the request for debugging
    console.log("Email sending triggered at:", new Date().toISOString());

    // Check if nodemailer configurations exist
    if (!process.env.nodemailer_user || !process.env.nodemailer_pass) {
      console.error("Email credentials not found in environment variables!");
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

    console.log(`Found ${users.length} users with preferences to process`);

    const results: SuccessResult[] = [];
    const errors: ErrorInfo[] = [];

    // Process users one by one to avoid rate limits
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email}`);
        
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
          console.log(`Already sent to user ${user.email} today`);
          continue;
        }

        const result = await sendQuestionToUser(user.id);
        
        if (result.success) {
          console.log(`Successfully sent to: ${user.email}`);
          results.push(result as SuccessResult);
        } else {
          if (!result.alreadySent) {
            console.error(`Failed to send to ${user.email}:`, result.error);
            errors.push({ 
              userId: user.id, 
              error: result.error || "Unknown error" 
            });
          }
        }
        
        // Add a small delay between emails to avoid Gmail sending limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error processing user ${user.email}:`, errorMessage);
        errors.push({ userId: user.id, error: errorMessage });
      }
    }
    
    const response = {
      success: true,
      message: `Processed ${users.length} users - ${results.length} successful, ${errors.length} failed`,
      successCount: results.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log("Email sending completed:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send emails",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
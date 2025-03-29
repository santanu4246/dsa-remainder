import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";

// This cron job runs daily at 12:25 PM
export const config = {
  runtime: "edge",
  // For testing you might use "* * * * *" (every minute)
  // In production, use "25 12 * * *" (12:25 PM daily)
  schedule: "25 12 * * *",
  regions: ["iad1"], // Choose your regions
};

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
    console.log("Cron job triggered at:", new Date().toISOString());

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

    // Process all users in parallel for faster execution
    const sendPromises = users.map(async (user) => {
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
          return;
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
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error processing user ${user.email}:`, errorMessage);
        errors.push({ userId: user.id, error: errorMessage });
      }
    });

    // Wait for all emails to be sent
    await Promise.all(sendPromises);
    
    const response = {
      success: true,
      message: `Processed ${users.length} users - ${results.length} successful, ${errors.length} failed`,
      successCount: results.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log("Cron job completed:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to execute cron job",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
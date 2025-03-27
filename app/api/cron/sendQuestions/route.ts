import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// This cron job runs daily at 8:00 AM (08:00)
export const config = {
  runtime: "edge",
  // For testing you might use "* * * * *" (every minute)
  // In production, use "0 8 * * *" (8:00 AM daily)
  schedule: "0 8 * * *",
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

export async function GET(request: Request) {
  try {
    // Check if this is a cron request or manual trigger
    const authHeader = request.headers.get("Authorization");
    const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET_KEY}`;
    
    // If it's not a cron request, check for user authentication
    if (!isCronRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
    }

    // Get all users with their preferences
    const users = await db.user.findMany({
      select: {
        id: true
      }
    });

    const results: SuccessResult[] = [];
    const errors: ErrorInfo[] = [];

    // Process each user in parallel
    const sendPromises = users.map(async (user) => {
      try {
        const result = await sendQuestionToUser(user.id);
        if (result.success) {
          results.push(result as SuccessResult);
        } else {
          // Don't consider "already sent" as an error
          if (result.alreadySent) {
            console.log(`Already sent to user ${user.id} today`);
          } else {
            errors.push({ 
              userId: user.id, 
              error: result.error || "Unknown error" 
            });
          }
        }
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push({ userId: user.id, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    });

    await Promise.all(sendPromises);
    
    return NextResponse.json({
      success: true,
      message: `Processed ${users.length} users - ${results.length} successful, ${errors.length} failed`,
      successCount: results.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to execute cron job" 
    }, { status: 500 });
  }
} 
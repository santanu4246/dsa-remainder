import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

export async function GET() {
  try {
    // Verify the user is authenticated and has admin rights
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Optional: Check if the user is an admin by looking at their role
    // Implement this if you have a user role system
    
    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true
      }
    });

    const results = [];
    const errors = [];

    // Process each user
    for (const user of users) {
      try {
        const result = await sendQuestionToUser(user.id);
        if (result.success) {
          results.push({
            userId: user.id,
            question: result.question
          });
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
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push({ userId: user.id, error: errorMessage });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${users.length} users - ${results.length} successful, ${errors.length} failed`,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Manual send failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send emails" 
    }, { status: 500 });
  }
} 
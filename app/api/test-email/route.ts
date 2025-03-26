import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";

export async function GET(request: Request) {
  try {
    // Get the first user to test with
    const user = await db.user.findFirst({
      where: {
        email: {
          not: ""
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "No users found with an email address"
      }, { status: 404 });
    }

    // Send a test email to this user
    const result = await sendQuestionToUser(user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${user.email}`,
        details: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Unknown error occurred",
        details: result
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send test email" 
    }, { status: 500 });
  }
} 
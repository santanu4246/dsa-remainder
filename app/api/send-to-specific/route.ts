import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuestionToUser } from "@/lib/scheduledEmails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get target email from URL params
    const url = new URL(request.url);
    const emailParam = url.searchParams.get("email");
    
    if (!emailParam) {
      return NextResponse.json({ 
        success: false, 
        error: "Email parameter is required" 
      }, { status: 400 });
    }
    
    // Find the user by email
    const targetUser = await db.user.findUnique({
      where: { email: emailParam },
      select: { id: true, email: true }
    });
    
    if (!targetUser) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }
    
    // Send a question to the user
    const result = await sendQuestionToUser(targetUser.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully sent question to ${targetUser.email}`,
        question: result.question
      });
    } else {
      // If already sent today, provide a clear message
      if (result.alreadySent) {
        return NextResponse.json({
          success: false,
          message: `User ${targetUser.email} already received a question today`,
          alreadySent: true
        });
      }
      
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to send email"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error sending to specific user:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send email" 
    }, { status: 500 });
  }
} 
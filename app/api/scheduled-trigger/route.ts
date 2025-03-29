import { NextResponse } from "next/server";

// This is a simple endpoint to check if the server is receiving requests
// and can be used with free external cron job services

export async function GET() {
  try {
    // Get the current time
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    console.log(`Scheduled trigger received at: ${now.toISOString()}`);
    
    // Check if it's around 1:00 PM (allow 5 minute window)
    const is1PM = hour === 13 && minute < 5;
    
    if (is1PM) {
      // Redirect to the actual email sending endpoint
      const response = await fetch(new URL('/api/cron/sendQuestions', new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000')), {
        method: 'GET'
      });
      
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: "Triggered email sending",
        emailResult: data,
        timestamp: now.toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "Scheduled trigger received, but not at email sending time",
      shouldSendEmails: is1PM,
      currentTime: now.toISOString()
    });
  } catch (error) {
    console.error("Scheduled trigger error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
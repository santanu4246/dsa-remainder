import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { db } from "@/lib/db";
import axios from "axios";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Default values if no LeetCode username or can't fetch data
    let practiceData = {
      rate: 0,
      total: 0,
      last30Days: 0
    };

    // Only attempt to fetch LeetCode data if username exists
    if (user.leetcodeUsername) {
      try {
        // Fetch calendar data from LeetCode API
        const calendarResponse = await axios.get(
          `https://alfa-leetcode-api.onrender.com/${user.leetcodeUsername}`
        );
        
        if (calendarResponse.data && calendarResponse.data.submissionCalendar) {
          const calendarData = calendarResponse.data.submissionCalendar;
          practiceData = calculatePracticeRate(calendarData);
        }
      } catch (error) {
        console.error("Error fetching LeetCode calendar data:", error);
      }
    }

    return NextResponse.json(practiceData);
  } catch (error) {
    console.error("Error fetching practice data:", error);
    return NextResponse.json({ error: "Failed to fetch practice data" }, { status: 500 });
  }
}

// Calculate practice rate
function calculatePracticeRate(calendarData: Record<string, number>) {
  // Prepare date range for last 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let daysWithSubmissions = 0;
  let submissionsLast30Days = 0;
  const totalSubmissions = Object.values(calendarData).reduce((sum, count) => sum + count, 0);
  
  // Count submissions in the last 30 days
  Object.entries(calendarData).forEach(([timestamp, count]) => {
    const submissionDate = new Date(parseInt(timestamp) * 1000);
    if (submissionDate >= thirtyDaysAgo && submissionDate <= today) {
      submissionsLast30Days += count;
      daysWithSubmissions++;
    }
  });
  
  // Calculate practice rate (percentage of days with submissions in the last 30 days)
  const practiceRate = Math.round((daysWithSubmissions / 30) * 100);
  
  return {
    rate: practiceRate,
    total: totalSubmissions,
    last30Days: submissionsLast30Days
  };
} 
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
    let streakData = {
      currentStreak: 0,
      lastSubmission: "Never"
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
          streakData = calculateStreak(calendarData);
        }
      } catch (error) {
        console.error("Error fetching LeetCode calendar data:", error);
      }
    }

    return NextResponse.json(streakData);
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json({ error: "Failed to fetch streak data" }, { status: 500 });
  }
}

// Calculate streak from calendar data
function calculateStreak(calendarData: Record<string, number>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Convert timestamps to dates and sort them
  const submissionDates = Object.keys(calendarData)
    .map(timestamp => {
      const date = new Date(parseInt(timestamp) * 1000);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a); // Sort in descending order (newest first)
  
  if (submissionDates.length === 0) {
    return {
      currentStreak: 0,
      lastSubmission: "Never"
    };
  }
  
  const lastSubmissionDate = new Date(submissionDates[0]);
  const lastSubmission = lastSubmissionDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
  
  // Check if the last submission was today or yesterday
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((today.getTime() - lastSubmissionDate.getTime()) / oneDayMs);
  
  // If last submission was more than a day ago, streak is broken
  if (diffDays > 1) {
    return {
      currentStreak: 0,
      lastSubmission
    };
  }
  
  // Calculate current streak
  let currentStreak = 1;
  let currentDate = diffDays === 0 ? yesterday(today) : twoDaysAgo(today);
  
  for (let i = 1; i < submissionDates.length; i++) {
    const submissionDate = new Date(submissionDates[i]);
    const diffFromCurrent = Math.floor((currentDate.getTime() - submissionDate.getTime()) / oneDayMs);
    
    if (diffFromCurrent === 0) {
      currentStreak++;
      currentDate = yesterday(currentDate);
    } else if (diffFromCurrent === 1) {
      currentStreak++;
      currentDate = submissionDate;
    } else {
      break;
    }
  }
  
  return {
    currentStreak: diffDays === 0 ? currentStreak : 0,
    lastSubmission
  };
}

// Get yesterday's date
function yesterday(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - 1);
  return result;
}

// Get two days ago date
function twoDaysAgo(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - 2);
  return result;
} 
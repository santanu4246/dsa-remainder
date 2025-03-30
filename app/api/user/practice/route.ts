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
          `https://leetcode-stats-api.herokuapp.com/${user.leetcodeUsername}`
        );
        
        console.log("LeetCode API Response (Practice):", {
          username: user.leetcodeUsername,
          hasData: !!calendarResponse.data,
          stats: calendarResponse.data
        });
        
        if (calendarResponse.data) {
          const totalSolved = calendarResponse.data.totalSolved || 0;
          const acceptanceRate = calendarResponse.data.acceptanceRate || 0;
          
          // Calculate practice rate based on total solved problems
          practiceData = {
            rate: Math.min(Math.round((totalSolved / 2000) * 100), 100), // Assuming 2000 as max problems
            total: totalSolved,
            last30Days: Math.round(totalSolved * (acceptanceRate / 100)) // Estimate of successful submissions
          };
          
          console.log("Calculated Practice Data:", practiceData);
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
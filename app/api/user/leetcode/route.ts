import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { db } from "@/lib/db";
import axios from "axios";

// Get LeetCode username
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("No authenticated session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("Session user email:", session.user.email);
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found, leetcode username:", user.leetcodeUsername);
    return NextResponse.json({
      success: true,
      username: user.leetcodeUsername || null
    });
  } catch (error) {
    console.error("Error fetching LeetCode username:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch LeetCode username" 
    }, { status: 500 });
  }
}

// Update LeetCode username
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 });
    }

    const body = await req.json();
    const { username } = body;

    console.log("Received request to update username:", username);

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid username" 
      }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    // Skip validation since the API might be unreliable
    // Just update the username directly and let the frontend handle validation

    // Update user's LeetCode username
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { leetcodeUsername: username }
    });

    console.log("Username updated successfully:", username);
    return NextResponse.json({
      success: true,
      username
    });
  } catch (error) {
    console.error("Error updating LeetCode username:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to update LeetCode username" 
    }, { status: 500 });
  }
}

// Fetch LeetCode details directly
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.leetcodeUsername) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found or LeetCode username not set" 
      }, { status: 404 });
    }

    // Fetch user details from the LeetCode API
    try {
      console.log(`Fetching LeetCode data for ${user.leetcodeUsername}...`);
      // Try to fetch basic profile data first
      const profileResponse = await axios.get(
        `https://alfa-leetcode-api.onrender.com/${user.leetcodeUsername}`,
        { timeout: 10000 }
      );
      
      // Then fetch solved stats
      const solvedResponse = await axios.get(
        `https://alfa-leetcode-api.onrender.com/${user.leetcodeUsername}/solved`,
        { timeout: 10000 }
      );
      
      // Combine the data
      const userData = {
        profile: profileResponse.data || {},
        stats: solvedResponse.data || {}
      };
      
      return NextResponse.json({
        success: true,
        username: user.leetcodeUsername,
        data: userData
      });
    } catch (apiError: any) {
      console.error("Error fetching from LeetCode API:", apiError.message);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to fetch LeetCode data. The API might be unavailable." 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in LeetCode details endpoint:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to process request" 
    }, { status: 500 });
  }
} 
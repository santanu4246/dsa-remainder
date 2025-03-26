import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/auth";
import { Difficulty } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { topics: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      difficulty: user.difficulty,
      topics: user.topics.map(topic => topic.name)
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { topics, difficulty } = await req.json();

    // Validate difficulty
    if (difficulty && !["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    // Get the user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { topics: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user preferences
    if (topics && Array.isArray(topics)) {
      // Disconnect all existing topics
      await db.user.update({
        where: { id: user.id },
        data: {
          topics: {
            disconnect: user.topics.map(topic => ({ id: topic.id }))
          }
        }
      });

      // Connect or create topics
      for (const topicName of topics) {
        const topic = await db.topic.upsert({
          where: { name: topicName },
          update: {},
          create: { name: topicName }
        });

        await db.user.update({
          where: { id: user.id },
          data: {
            topics: {
              connect: { id: topic.id }
            }
          }
        });
      }
    }

    // Update difficulty if provided
    if (difficulty) {
      await db.user.update({
        where: { id: user.id },
        data: { difficulty: difficulty as Difficulty }
      });
    }

    // Get updated user with topics
    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      include: { topics: true }
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      difficulty: updatedUser?.difficulty,
      topics: updatedUser?.topics.map(topic => topic.name)
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
} 
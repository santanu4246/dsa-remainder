import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/auth";

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

    // Get the email logs for this user
    const emailLogs = await db.emailLog.findMany({
      where: { userId: user.id },
      orderBy: { sentAt: 'desc' },
      take: 10 // Get the 10 most recent logs
    });

    // Extract the title slug from the question link
    const emailHistory = emailLogs.map(log => {
      const match = log.questionLink.match(/problems\/([^/]+)/);
      const titleSlug = match ? match[1] : '';
      
      return {
        id: log.id,
        questionLink: log.questionLink,
        titleSlug: titleSlug,
        sentAt: log.sentAt
      };
    });

    return NextResponse.json(emailHistory);
  } catch (error) {
    console.error("Error fetching user history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
} 
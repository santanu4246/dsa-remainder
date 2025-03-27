import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create a sample question for the test email
    const testQuestion = {
      title: "Two Sum",
      difficulty: "EASY",
      titleSlug: "two-sum"
    };

    const questionLink = `https://leetcode.com/problems/${testQuestion.titleSlug}/`;

    // Send direct test email
    try {
      await sendDirectEmail(
        session.user.email,
        session.user.name || "Coding Enthusiast",
        testQuestion,
        questionLink
      );

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully"
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : "Email sending failed"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Test email route error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process request" 
    }, { status: 500 });
  }
}

// Simplified email sending function that doesn't rely on external API
async function sendDirectEmail(
  email: string,
  name: string,
  question: {title: string; difficulty: string; titleSlug: string},
  questionLink: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.nodemailer_user,
      pass: process.env.nodemailer_pass
    }
  });

  const difficultyColor = 
    question.difficulty === 'EASY' ? 'green' : 
    question.difficulty === 'MEDIUM' ? 'orange' : 'red';

  const mailOptions = {
    from: `"DSA Remainder" <${process.env.nodemailer_user}>`,
    to: email,
    subject: `Your Daily ${question.difficulty} Challenge: ${question.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Hello ${name}!</h2>
        <p>Here's your daily DSA challenge based on your preferences:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">${question.title}</h3>
          <p>Difficulty: <span style="font-weight: bold; color: ${difficultyColor};">${question.difficulty}</span></p>
          <a href="${questionLink}" style="display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 10px 15px; border-radius: 4px; margin-top: 10px;">Solve Challenge</a>
        </div>
        <p>Consistent practice is key to mastering Data Structures and Algorithms. Keep up the great work!</p>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">You received this email because you're subscribed to DSA Remainder. You can update your preferences in your profile settings.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Direct test email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send direct test email to ${email}:`, error);
    throw error;
  }
} 
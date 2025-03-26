import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

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
        email: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "No users found with an email address"
      }, { status: 404 });
    }

    // Use a hardcoded question to bypass API rate limits
    const question = {
      title: "Two Sum",
      titleSlug: "two-sum",
      difficulty: "EASY"
    };

    // Create the question link
    const questionLink = `https://leetcode.com/problems/${question.titleSlug}/`;
    
    // Log the email to our database
    const emailLog = await db.emailLog.create({
      data: {
        userId: user.id,
        questionLink: questionLink
      }
    });

    // Send direct email to the user
    await sendDirectEmail(user.email, user.name || "Coding Enthusiast", question, questionLink);

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${user.email}`,
      details: {
        user: user.email,
        question: question.title,
        emailLog
      }
    });
  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send test email" 
    }, { status: 500 });
  }
}

// Simplified email sending function that doesn't rely on external API
async function sendDirectEmail(
  email: string,
  name: string,
  question: any,
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
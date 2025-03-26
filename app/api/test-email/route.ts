import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import nodemailer from "nodemailer";
import { sendQuestionEmail } from "@/lib/scheduledEmails";

export async function GET(_: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Prepare test email data
    const testQuestion = {
      title: "Test Question",
      difficulty: "MEDIUM",
      titleSlug: "test-question"
    };
    
    const questionLink = `https://leetcode.com/problems/${testQuestion.titleSlug}/`;
    
    // Send the test email using the utility function
    await sendQuestionEmail(
      session.user.email,
      session.user.name || "Test User",
      testQuestion,
      questionLink
    );
    
    return NextResponse.json({ 
      success: true,
      message: `Test email sent to ${session.user.email}`
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to send test email" 
    }, { status: 500 });
  }
}

// Simple email sending function for testing
// async function sendTestEmail(
//   email: string,
//   name: string,
//   question: {title: string; difficulty: string; titleSlug: string},
//   questionLink: string
// ) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.nodemailer_user,
//       pass: process.env.nodemailer_pass
//     }
//   });

//   const difficultyColor = 
//     question.difficulty === 'EASY' ? 'green' : 
//     question.difficulty === 'MEDIUM' ? 'orange' : 'red';

//   const mailOptions = {
//     from: `"DSA Remainder" <${process.env.nodemailer_user}>`,
//     to: email,
//     subject: `Test Email: ${question.difficulty} Challenge: ${question.title}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//         <h2 style="color: #333;">Hello ${name}!</h2>
//         <p>This is a test email from DSA Remainder:</p>
//         <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <h3 style="margin-top: 0; color: #2c3e50;">${question.title}</h3>
//           <p>Difficulty: <span style="font-weight: bold; color: ${difficultyColor};">${question.difficulty}</span></p>
//           <a href="${questionLink}" style="display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 10px 15px; border-radius: 4px; margin-top: 10px;">Solve Challenge</a>
//         </div>
//         <p>This is only a test. No action is required.</p>
//       </div>
//     `
//   };

//   await transporter.sendMail(mailOptions);
// } 
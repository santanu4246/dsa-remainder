import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";
import nodemailer from "nodemailer";

// Interface for the question structure returned by the API
interface Question {
  title: string;
  titleSlug: string;
  difficulty: string;
}

export async function GET() {
  try {
    // Get all users with their preferences
    const users = await db.user.findMany({
      include: {
        topics: true
      }
    });

    const results = [];

    // Process each user
    for (const user of users) {
      if (!user.email) {
        continue; // Skip users without emails (removed verification check)
      }

      // Get topics as string array
      const userTopics = user.topics.map(topic => topic.name);
      
      if (userTopics.length === 0) {
        continue; // Skip users with no selected topics
      }

      // Define the difficulty based on user preference
      const difficulty = user.difficulty;

      // Fetch questions based on user preferences
      const topicsQuery = userTopics.join("+");
      const url = `https://alfa-leetcode-api.onrender.com/problems?tags=${topicsQuery}&difficulty=${difficulty}&limit=5`;
      
      const { data } = await axios.get(url);
      const questions = data.problemsetQuestionList || [];
      
      if (questions.length === 0) {
        continue; // Skip if no questions found
      }

      // Select a random question from the results
      const randomIndex = Math.floor(Math.random() * questions.length);
      const selectedQuestion = questions[randomIndex];
      
      // Create the question link
      const questionLink = `https://leetcode.com/problems/${selectedQuestion.titleSlug}/`;
      
      // Log the email to our database
      await db.emailLog.create({
        data: {
          userId: user.id,
          questionLink: questionLink
        }
      });

      // Send email to the user
      await sendQuestionEmail(
        user.email,
        user.name || "Coding Enthusiast",
        selectedQuestion,
        questionLink
      );

      results.push({
        user: user.email,
        questionSent: selectedQuestion.title
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${results.length} users`,
      results 
    });
  } catch (error) {
    console.error("Error sending scheduled questions:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process scheduled questions" 
    }, { status: 500 });
  }
}

// Function to send an email with the selected question
async function sendQuestionEmail(
  email: string,
  name: string,
  question: Question,
  questionLink: string
) {
  // Create SMTP transporter using environment variables
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Using Gmail SMTP service
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,  // Use SSL
    auth: {
      user: process.env.nodemailer_user,
      pass: process.env.nodemailer_pass
    }
  });

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
          <p>Difficulty: <span style="font-weight: bold; color: ${
            question.difficulty === 'EASY' ? 'green' : 
            question.difficulty === 'MEDIUM' ? 'orange' : 'red'
          };">${question.difficulty}</span></p>
          <a href="${questionLink}" style="display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 10px 15px; border-radius: 4px; margin-top: 10px;">Solve Challenge</a>
        </div>
        <p>Consistent practice is key to mastering Data Structures and Algorithms. Keep up the great work!</p>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">You received this email because you're subscribed to DSA Remainder. You can update your preferences in your profile settings.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
} 
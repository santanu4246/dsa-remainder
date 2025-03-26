import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import axios from "axios";
import { Difficulty } from "@prisma/client";

// Cache for storing questions by topic and difficulty
const questionsCache: Record<string, { timestamp: number, data: any[] }> = {};
// Cache expiration: 24 hours in milliseconds
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Function to send a question to a specific user
export async function sendQuestionToUser(userId: string) {
  try {
    // Check if user already received a question today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEmail = await db.emailLog.findFirst({
      where: {
        userId,
        sentAt: {
          gte: today
        }
      }
    });
    
    if (existingEmail) {
      return {
        success: false,
        error: "User already received a question today",
        alreadySent: true
      };
    }

    // Get user with preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { topics: true }
    });

    if (!user || !user.email) {
      throw new Error("User not found or no email address available");
    }

    // Get topics as string array
    const userTopics = user.topics.map(topic => topic.name);
    
    if (userTopics.length === 0) {
      throw new Error("User has no selected topics");
    }

    // Define the difficulty based on user preference
    const difficulty = user.difficulty;

    // Try to get problems from cache or API with retry logic
    const questions = await getQuestionsWithRetry(userTopics, difficulty);
    
    if (questions.length === 0) {
      throw new Error("No questions found for user preferences");
    }

    // Select a random question from the results
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];
    
    // Create the question link
    const questionLink = `https://leetcode.com/problems/${selectedQuestion.titleSlug}/`;
    
    // Log the email to our database
    const emailLog = await db.emailLog.create({
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

    return {
      success: true,
      emailLog,
      question: selectedQuestion.title
    };
  } catch (error) {
    console.error("Error sending question to user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Get questions with retry logic for handling rate limits
async function getQuestionsWithRetry(topics: string[], difficulty: Difficulty, maxRetries = 3): Promise<any[]> {
  const topicsQuery = topics.join("+");
  const cacheKey = `${topicsQuery}-${difficulty}`;
  
  // Check if we have cached data that isn't expired
  if (questionsCache[cacheKey] && 
      Date.now() - questionsCache[cacheKey].timestamp < CACHE_EXPIRATION) {
    console.log("Using cached questions data");
    return questionsCache[cacheKey].data;
  }
  
  // Try to fetch from API with retry logic
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    try {
      // Add delay between retries (exponential backoff)
      if (retries > 0) {
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Try to fetch data from alternate endpoints to distribute load
      let data;
      try {
        // First try the problems endpoint
        const url = `https://alfa-leetcode-api.onrender.com/problems?tags=${topicsQuery}&difficulty=${difficulty}&limit=5`;
        const response = await axios.get(url, { timeout: 10000 });
        data = response.data.problemsetQuestionList || [];
      } catch (error) {
        // Fall back to daily question as a last resort
        const dailyResponse = await axios.get('https://alfa-leetcode-api.onrender.com/daily');
        const dailyQuestion = dailyResponse.data.question;
        if (dailyQuestion) {
          data = [dailyQuestion];
        } else {
          throw error; // Re-throw if we couldn't get a daily question either
        }
      }
      
      // Cache the result
      questionsCache[cacheKey] = {
        timestamp: Date.now(),
        data: data
      };
      
      return data;
    } catch (error) {
      lastError = error;
      retries++;
      
      // If it's not a rate limit error, don't retry
      if (axios.isAxiosError(error) && error.response?.status !== 429) {
        break;
      }
      
      console.log(`API request failed (attempt ${retries}/${maxRetries}): ${error.message}`);
    }
  }
  
  // If we have older cached data, use it as a fallback even if expired
  if (questionsCache[cacheKey]) {
    console.log("Using expired cache as fallback");
    return questionsCache[cacheKey].data;
  }
  
  // If no cached data and all retries failed, throw the last error
  throw lastError || new Error("Failed to fetch questions after retries");
}

// Function to send a question email
async function sendQuestionEmail(
  email: string,
  name: string,
  question: any,
  questionLink: string
) {
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
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw error;
  }
} 
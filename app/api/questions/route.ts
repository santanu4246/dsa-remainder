import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// interface Question {
//   title: string;
//   titleSlug: string;
//   difficulty: string;
//   questionLink: string;
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topics, difficulty } = body;

    if (!topics || !difficulty) {
      return NextResponse.json({ error: "Topic and difficulty are required" }, { status: 400 });
    }

    const topicsQuery = topics.join("+");
    const url = topicsQuery
      ? `https://alfa-leetcode-api.onrender.com/problems?tags=${topicsQuery}&difficulty=${difficulty.toUpperCase()}`
      : "https://leetcode-api-pied.vercel.app/problems";

    const { data } = await axios.get(url);
    const questions = data.problemsetQuestionList || [];

    // if (difficulty) {
    //   questions = questions.filter(
    //     (q: any) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
    //   );
    // }

    // questions = questions.map((q: any) => ({
    //   title: q.title,
    //   questionLink: `https://leetcode.com/problems/${q.titleSlug}/`,
    // }));

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

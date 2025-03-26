"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, History, Calendar, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  titleSlug: string;
  questionLink: string;
  sentAt: string;
  title?: string;
  difficulty?: string;
}

export default function QuestionsHistory() {
  const [history, setHistory] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/user/history");
        
        // Fetch additional details for each question from LeetCode API
        const questionsWithDetails = await Promise.all(
          response.data.map(async (question: Question) => {
            try {
              const detailsResponse = await axios.get(
                `https://alfa-leetcode-api.onrender.com/select?titleSlug=${question.titleSlug}`
              );
              
              // Check the structure of the response and extract the title and difficulty properly
              let title = "";
              let difficulty = "";
              
              if (detailsResponse.data && detailsResponse.data.data && detailsResponse.data.data.question) {
                // Standard response structure
                title = detailsResponse.data.data.question.title;
                difficulty = detailsResponse.data.data.question.difficulty;
              } else if (detailsResponse.data && detailsResponse.data.question) {
                // Alternative response structure
                title = detailsResponse.data.question.title;
                difficulty = detailsResponse.data.question.difficulty;
              }
              
              console.log("Question details for", question.titleSlug, ":", { title, difficulty });
              
              return {
                ...question,
                title: title || `Problem: ${question.titleSlug}`,
                difficulty: difficulty
              };
            } catch (error) {
              console.error("Error fetching details for", question.titleSlug, ":", error);
              // If there's an error fetching details, create a title from the titleSlug
              return {
                ...question,
                title: titleSlugToTitle(question.titleSlug),
                difficulty: "UNKNOWN"
              };
            }
          })
        );
        
        setHistory(questionsWithDetails);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);
  
  // Convert title-slug-format to Title Slug Format
  const titleSlugToTitle = (slug: string) => {
    if (!slug) return "Unknown Problem";
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  const getStatusBadge = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return <Badge className="bg-green-950 text-green-400 border border-green-800">Easy</Badge>;
      case "medium":
        return <Badge className="bg-amber-950 text-amber-400 border border-amber-800">Medium</Badge>;
      case "hard":
        return <Badge className="bg-red-950 text-red-400 border border-red-800">Hard</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-400 border border-zinc-700">Unknown</Badge>;
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "hard":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getDifficultyGradient = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-gradient-to-r from-green-950 to-zinc-900 hover:from-green-900 hover:to-zinc-900";
      case "medium":
        return "bg-gradient-to-r from-amber-950 to-zinc-900 hover:from-amber-900 hover:to-zinc-900";
      case "hard":
        return "bg-gradient-to-r from-red-950 to-zinc-900 hover:from-red-900 hover:to-zinc-900";
      default:
        return "bg-zinc-900 hover:bg-zinc-800";
    }
  };

  if (loading) {
    return (
      <Card className="border-0 bg-zinc-900 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center">
            <History className="h-5 w-5 text-zinc-400 mr-2" />
            <CardTitle className="text-zinc-300">Practice History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-zinc-800 h-10 w-10 mb-3"></div>
              <div className="h-2 w-32 bg-zinc-800 rounded mb-2"></div>
              <div className="h-2 w-24 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-zinc-900 shadow-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center">
          <History className="h-5 w-5 text-zinc-400 mr-2" />
          <CardTitle className="text-zinc-300">Practice History</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
            All Problems
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <div className="bg-zinc-800/50 rounded-lg p-6 max-w-sm mx-auto">
              <Calendar className="h-10 w-10 text-zinc-400 mx-auto mb-3 opacity-80" />
              <p className="font-medium text-zinc-300 mb-2">No practice history yet</p>
              <p className="text-sm mb-4">
                Your practice history will appear here after receiving your first problem
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((question) => (
              <a 
                key={question.id} 
                href={question.questionLink || `https://leetcode.com/problems/${question.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-lg p-4 transition-all duration-200 ${getDifficultyGradient(question.difficulty)} border border-zinc-800 hover:border-zinc-700`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getDifficultyIcon(question.difficulty)}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-200 mb-1">
                        {question.title || titleSlugToTitle(question.titleSlug)}
                      </div>
                      <div className="flex items-center text-xs text-zinc-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Sent on {formatDate(question.sentAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(question.difficulty)}
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
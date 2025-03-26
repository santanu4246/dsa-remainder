"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart3, Edit2, ExternalLink } from "lucide-react";

interface LeetCodeStats {
  solvedProblem: number;
  totalQuestions: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
}

export default function LeetCodeStats() {
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameSheetOpen, setUsernameSheetOpen] = useState(false);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch username from API instead of localStorage
    const fetchUsername = async () => {
      try {
        console.log("Fetching LeetCode username...");
        const response = await axios.get("/api/user/leetcode");
        console.log("Username response:", response.data);
        const username = response.data.username;
        
        if (username) {
          setLeetcodeUsername(username);
          fetchLeetCodeStats(username);
        } else {
          console.log("No username found, showing connection sheet");
          setUsernameSheetOpen(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching LeetCode username:", error);
        setError("Failed to fetch username. Please try again.");
        setLoading(false);
      }
    };
    
    fetchUsername();
  }, []);

  const fetchLeetCodeStats = async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching LeetCode stats for ${username}...`);
      
      // First try the direct API endpoint that combines all requests
      try {
        // The PUT endpoint fetches both profile and stats data
        const directResponse = await axios.put("/api/user/leetcode");
        console.log("Direct LeetCode API response:", directResponse.data);
        
        if (directResponse.data.success && directResponse.data.data) {
          const { stats } = directResponse.data.data;
          
          if (stats) {
            setStats({
              solvedProblem: stats.solvedProblem || 0,
              totalQuestions: stats.totalQuestions || 0,
              easySolved: stats.easySolved || 0,
              easyTotal: stats.totalEasy || 0,
              mediumSolved: stats.mediumSolved || 0,
              mediumTotal: stats.totalMedium || 0,
              hardSolved: stats.hardSolved || 0,
              hardTotal: stats.totalHard || 0,
            });
            setLoading(false);
            return;
          }
        }
        // If we get here, the direct endpoint failed but didn't throw
        console.log("Direct API response did not contain valid data, falling back to external API");
      } catch (directError) {
        console.error("Direct API fetch failed, falling back to external API:", directError);
      }
      
      // Fallback to direct external API call
      const externalResponse = await axios.get(
        `https://alfa-leetcode-api.onrender.com/${username}/solved`,
        { timeout: 8000 }
      );
      console.log("External LeetCode stats response:", externalResponse.data);
      
      if (!externalResponse.data || typeof externalResponse.data !== 'object') {
        throw new Error('Invalid response from LeetCode API');
      }
      
      // Handle API response structure which might vary
      const statsData = {
        solvedProblem: externalResponse.data.solvedProblem || 0,
        totalQuestions: externalResponse.data.totalQuestions || 0,
        easySolved: externalResponse.data.easySolved || 0,
        easyTotal: externalResponse.data.totalEasy || 0,
        mediumSolved: externalResponse.data.mediumSolved || 0,
        mediumTotal: externalResponse.data.totalMedium || 0,
        hardSolved: externalResponse.data.hardSolved || 0,
        hardTotal: externalResponse.data.totalHard || 0,
      };
      
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching LeetCode stats:", error);
      setError("Failed to fetch LeetCode stats. The LeetCode API might be unavailable.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async () => {
    if (!newUsername.trim()) {
      setError("Please enter a valid username");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Saving LeetCode username: ${newUsername.trim()}`);
      
      // Save username to API
      const response = await axios.post("/api/user/leetcode", { 
        username: newUsername.trim() 
      });
      console.log("Save username response:", response.data);
      
      if (response.data.success) {
        // Username saved successfully, now try to fetch stats
        const username = newUsername.trim();
        setLeetcodeUsername(username);
        
        try {
          await fetchLeetCodeStats(username);
          setUsernameSheetOpen(false);
        } catch (statsError) {
          console.error("Error fetching stats after saving username:", statsError);
          // Still close the dialog since username was saved
          setUsernameSheetOpen(false);
          // But set an error to show on the card
          setError("Username saved, but couldn't fetch LeetCode stats. The API might be unavailable.");
        }
      } else {
        throw new Error(response.data.error || "Failed to save username");
      }
    } catch (error) {
      console.error("Error saving LeetCode username:", error);
      // Check if it's a network error to provide a more helpful message
      if (error instanceof Error && error.message.includes("Network Error")) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Failed to save username. Please try again.");
      }
      setLoading(false);
    }
  };

  const calculatePercentage = (solved: number, total: number) => {
    return total > 0 ? (solved / total) * 100 : 0;
  };

  return (
    <>
      <Card className="border-0 bg-zinc-900 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-zinc-400 mr-2" />
            <CardTitle className="text-zinc-300">LeetCode Progress</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewUsername(leetcodeUsername);
              setUsernameSheetOpen(true);
            }}
            className="border-zinc-800 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-8">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-zinc-800 h-10 w-10 mb-3"></div>
                <div className="h-2 w-32 bg-zinc-800 rounded mb-2"></div>
                <div className="h-2 w-24 bg-zinc-800 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-zinc-500">
              <div className="bg-red-900/20 rounded-lg p-6 max-w-sm mx-auto">
                <p className="font-medium text-red-300 mb-2">Error</p>
                <p className="text-sm mb-4">{error}</p>
                <Button 
                  onClick={() => setUsernameSheetOpen(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Total Stats Card */}
              <div className="bg-gradient-to-r from-blue-950 to-zinc-900 rounded-lg p-5 border border-blue-900/40">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-zinc-300 font-semibold">Total Solved</span>
                  <div className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full flex items-center">
                    <span className="text-lg font-bold">{stats.solvedProblem}</span>
                    <span className="text-blue-400/70 text-xs ml-1">/ {stats.totalQuestions}</span>
                  </div>
                </div>
                <Progress
                  value={calculatePercentage(stats.solvedProblem, stats.totalQuestions)}
                  className="h-2.5 bg-blue-950"
                  indicatorClassName="bg-blue-500"
                />
                <div className="mt-2 text-xs text-blue-400/70 flex justify-end">
                  {Math.round(calculatePercentage(stats.solvedProblem, stats.totalQuestions))}% complete
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Easy */}
                <div className="bg-gradient-to-r from-green-950 to-zinc-900 p-4 rounded-lg border border-green-900/40">
                  <div className="mb-3">
                    <h4 className="text-green-400 font-medium mb-2">Easy</h4>
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded-full text-xs">
                        {stats.easySolved} / {stats.easyTotal}
                      </div>
                      <span className="text-xs text-green-400/70">
                        {Math.round(calculatePercentage(stats.easySolved, stats.easyTotal))}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={calculatePercentage(stats.easySolved, stats.easyTotal)}
                    className="h-1.5 bg-green-950"
                    indicatorClassName="bg-green-500"
                  />
                </div>

                {/* Medium */}
                <div className="bg-gradient-to-r from-amber-950 to-zinc-900 p-4 rounded-lg border border-amber-900/40">
                  <div className="mb-3">
                    <h4 className="text-amber-400 font-medium mb-2">Medium</h4>
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded-full text-xs">
                        {stats.mediumSolved} / {stats.mediumTotal}
                      </div>
                      <span className="text-xs text-amber-400/70">
                        {Math.round(calculatePercentage(stats.mediumSolved, stats.mediumTotal))}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={calculatePercentage(stats.mediumSolved, stats.mediumTotal)}
                    className="h-1.5 bg-amber-950"
                    indicatorClassName="bg-amber-500"
                  />
                </div>

                {/* Hard */}
                <div className="bg-gradient-to-r from-red-950 to-zinc-900 p-4 rounded-lg border border-red-900/40">
                  <div className="mb-3">
                    <h4 className="text-red-400 font-medium mb-2">Hard</h4>
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-red-900/30 text-red-300 px-2 py-0.5 rounded-full text-xs">
                        {stats.hardSolved} / {stats.hardTotal}
                      </div>
                      <span className="text-xs text-red-400/70">
                        {Math.round(calculatePercentage(stats.hardSolved, stats.hardTotal))}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={calculatePercentage(stats.hardSolved, stats.hardTotal)}
                    className="h-1.5 bg-red-950"
                    indicatorClassName="bg-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 mt-1 border-t border-zinc-800 text-xs">
                <a
                  href={`https://leetcode.com/${leetcodeUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-300 flex items-center group"
                >
                  <span className="text-zinc-500 mr-1">Profile:</span>
                  {leetcodeUsername}
                  <ExternalLink className="h-3 w-3 ml-1 group-hover:text-blue-400" />
                </a>
                <span className="text-zinc-500">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500">
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-6 max-w-sm mx-auto">
                <BarChart3 className="h-10 w-10 text-zinc-400 mx-auto mb-3 opacity-80" />
                <p className="font-medium text-zinc-300 mb-2">No LeetCode profile linked</p>
                <p className="text-sm mb-4">
                  Add your LeetCode username to track your progress
                </p>
                <Button 
                  onClick={() => setUsernameSheetOpen(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Connect Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={usernameSheetOpen} onOpenChange={setUsernameSheetOpen}>
        <SheetContent className="bg-zinc-900 border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-zinc-300">LeetCode Username</SheetTitle>
            <SheetDescription className="text-zinc-500">
              Add your LeetCode username to track your progress.
            </SheetDescription>
          </SheetHeader>
          <div className="my-6">
            <Label htmlFor="leetcode-username" className="text-zinc-300">Username</Label>
            <Input
              id="leetcode-username"
              placeholder="e.g., user123"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" className="border-zinc-700 text-zinc-300">Cancel</Button>
            </SheetClose>
            <Button 
              onClick={handleUsernameSubmit}
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
} 
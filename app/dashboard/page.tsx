"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { SignOutButton } from "@/components/auth/sign-out-button";
import PreferencesForm from "./components/PreferencesForm";
import QuestionsHistory from "./components/QuestionsHistory";
import LeetCodeStats from "./components/LeetCodeStats";
import { TrendingUp, Calendar, Trophy, Zap } from "lucide-react";
import Image from "next/image";

interface StreakData {
  currentStreak: number;
  lastSubmission: string;
}

interface PracticeData {
  rate: number;
  total: number;
  last30Days: number;
}

// New interface for time remaining
interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  timeString: string;
  nextQuestionTime: string;
}

export default function CodingProfileDashboard() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    image: "",
  });
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastSubmission: "Never"
  });
  const [practiceData, setPracticeData] = useState<PracticeData>({
    rate: 0,
    total: 0,
    last30Days: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  // Add state for time remaining until next question
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeString: "Calculating...",
    nextQuestionTime: ""
  });

  // Function to calculate time remaining until next 1:00 PM
  const calculateTimeRemaining = () => {
    const now = new Date();
    const nextQuestionTime = new Date(now);
    
    // Set time to 1:00 PM today
    nextQuestionTime.setHours(13, 0, 0, 0);
    
    // If it's already past 1:00 PM, set to 1:00 PM tomorrow
    if (now >= nextQuestionTime) {
      nextQuestionTime.setDate(nextQuestionTime.getDate() + 1);
    }
    
    // Calculate time difference in milliseconds
    const diff = nextQuestionTime.getTime() - now.getTime();
    
    // Convert to hours, minutes, seconds
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Format for display
    const timeString = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m ${seconds}s`;
    
    const nextQuestionTimeString = now.getDate() === nextQuestionTime.getDate()
      ? `Today at 1:00 PM`
      : `Tomorrow at 1:00 PM`;
    
    return {
      hours,
      minutes,
      seconds,
      timeString,
      nextQuestionTime: nextQuestionTimeString
    };
  };

  useEffect(() => {
    // Set up timer to update countdown every second
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Fetch initial time
    setTimeRemaining(calculateTimeRemaining());
    
    // Clean up timer on unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const response = await axios.get("/api/user");
        if (response.data) {
          setUser({
            name: response.data.name || "",
            email: response.data.email || "",
            image: response.data.image || ""
          });
        }

        // Fetch leetcode username
        const usernameResponse = await axios.get("/api/user/leetcode");
        if (usernameResponse.data && usernameResponse.data.username) {
          setLeetcodeUsername(usernameResponse.data.username);
        }

        // Fetch streak data
        const streakResponse = await axios.get("/api/user/streak");
        if (streakResponse.data) {
          setStreakData({
            currentStreak: streakResponse.data.currentStreak || 0,
            lastSubmission: streakResponse.data.lastSubmission || "Never"
          });
        }

        // Fetch practice data
        const practiceResponse = await axios.get("/api/user/practice");
        if (practiceResponse.data) {
          setPracticeData({
            rate: practiceResponse.data.rate || 0,
            total: practiceResponse.data.total || 0,
            last30Days: practiceResponse.data.last30Days || 0
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen  bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className=" shadow-lg bg-gradient-to-r border-2 border-zinc-800/50 from-zinc-900 to-black overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-xl overflow-hidden border-4 border-zinc-800 shadow-xl bg-gradient-to-br from-zinc-800 to-zinc-900">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover"
                      width={96}
                      height={96}
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">
                  {user.name || "Loading..."}
                </h1>
                <p className="text-zinc-400">{user.email || "Loading..."}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                {/* <Button
                  variant="outline"
                    size="sm" 
                    className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                >
                    <BookOpenIcon className="mr-2 h-4 w-4" />
                    View Profile
                </Button> */}
                <SignOutButton />
              </div>
            </div>
                  </div>
                </CardContent>
              </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Daily Streak */}
          <Card className=" bg-gradient-to-br from-blue-950 to-zinc-900 shadow-lg overflow-hidden border border-blue-900/20">
              <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-md bg-blue-900/30 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                <div>
                  <p className="text-blue-400/70 text-sm font-medium">Daily Streak</p>
                  {isLoading ? (
                    <div className="animate-pulse mt-1">
                      <div className="h-8 w-16 bg-blue-900/30 rounded"></div>
                      <div className="h-3 w-24 bg-blue-900/20 rounded mt-2"></div>
                  </div>
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-blue-300 mt-1">{streakData.currentStreak}</h3>
                      <p className="text-xs text-blue-500/60 mt-1">
                        Last submission: {streakData.lastSubmission}
                      </p>
                    </>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Practice Rate */}
          <Card className=" bg-gradient-to-br from-green-950 to-zinc-900 shadow-lg overflow-hidden border border-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-md bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
            <div>
                  <p className="text-green-400/70 text-sm font-medium">Practice Rate</p>
                  {isLoading ? (
                    <div className="animate-pulse mt-1">
                      <div className="h-8 w-16 bg-green-900/30 rounded"></div>
                      <div className="h-3 w-24 bg-green-900/20 rounded mt-2"></div>
                          </div>
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-green-300 mt-1">{practiceData.rate}%</h3>
                      <p className="text-xs text-green-500/60 mt-1">
                        {practiceData.last30Days} submissions in 30 days
                      </p>
                    </>
                      )}
                    </div>
                  </div>
            </CardContent>
          </Card>
          
          {/* Next Question */}
          <Card className=" bg-gradient-to-br from-purple-950 to-zinc-900 shadow-lg overflow-hidden border border-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-md bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-purple-400/70 text-sm font-medium">Next Question</p>
                  <h3 className="text-3xl font-bold text-purple-300 mt-1">{timeRemaining.timeString}</h3>
                  <p className="text-xs text-purple-500/60 mt-1">{timeRemaining.nextQuestionTime}</p>
                </div>
                  </div>
              </CardContent>
            </Card>

          {/* LeetCode User */}
          <Card className=" bg-gradient-to-br from-amber-950 to-zinc-900 shadow-lg overflow-hidden border border-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-md bg-amber-900/30 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-400/70 text-sm font-medium">LeetCode Profile</p>
                  <h3 className="text-lg font-bold text-amber-300 mt-1 line-clamp-1">
                    {leetcodeUsername || "Not connected"}
                  </h3>
                  {leetcodeUsername ? (
                    <p className="text-xs text-amber-500/60 mt-1">
                      {practiceData.total > 0 ? `${practiceData.total} total submissions` : "Profile connected"}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500/60 mt-1">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-amber-400 hover:text-amber-300"
                        onClick={() => document.getElementById('leetcode-stats')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Connect your profile
                      </Button>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LeetCode Stats */}
          <div className="lg:col-span-6" id="leetcode-stats">
            <LeetCodeStats />
          </div>

          {/* Question History */}
          <div className="lg:col-span-6">
            <QuestionsHistory />
          </div>

          {/* Preferences Form */}
          <div className="lg:col-span-12">
            <PreferencesForm />
        </div>
      </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-6">
          <p className="text-sm text-zinc-500">
            Powered by LeetCode API. Stay consistent and improve your DSA skills!
          </p>
              </div>
            </div>
    </div>
  );
}

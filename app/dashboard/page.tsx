"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import {
  Clock,
  BarChart3,
  Calendar,
  CheckCircle2,
  Trophy,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import axios from "axios";
// import { toast } from "@/components/ui/use-toast"

// List of all DSA topics
const ALL_DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Dynamic Programming",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Sorting",
  "Searching",
  "Recursion",
  "Backtracking",
  "Greedy Algorithms",
  "Divide and Conquer",
  "Hashing",
  "Heaps",
  "Stacks",
  "Queues",
  "Bit Manipulation",
  "Math",
  "Binary Search",
  "Two Pointers",
];

export default function CodingProfileDashboard() {
  // State for username sheet
  const [usernameSheetOpen, setUsernameSheetOpen] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState("Santanu4246");
  const [newUsername, setNewUsername] = useState("");

  // State for DSA topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Arrays",
    "Strings",
    "Dynamic Programming",
  ]);
  const [difficulty, setDifficulty] = useState("medium");

  // Handle username submission
  const handleUsernameSubmit = () => {
    if (newUsername.trim()) {
      setLeetcodeUsername(newUsername.trim());
      setUsernameSheetOpen(false);
      // toast({
      //   title: "Username Updated",
      //   description: `Your LeetCode username has been updated to ${newUsername.trim()}.`,
      // })
    }
  };

  // Handle topic selection
  const handleTopicChange = (topic: string, checked: boolean) => {
    if (checked) {
      setSelectedTopics((prev) => [...prev, topic]);
    } else {
      setSelectedTopics((prev) => prev.filter((t) => t !== topic));
    }
  };

  // Select all topics
  const selectAllTopics = () => {
    setSelectedTopics([...ALL_DSA_TOPICS]);
  };

  // Clear all topics
  const clearAllTopics = () => {
    setSelectedTopics([]);
  };

  // Remove a topic
  const removeTopic = (topic: string) => {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic));
  };

  // Update preferences
  const updatePreferences = () => {
    // toast({
    //   title: "Preferences Updated",
    //   description: `Updated to ${selectedTopics.length} topics with ${difficulty} difficulty.`,
    // })
  };
  const [user, setuser] = useState({
    name: "",
    email: "",
    image: "",
  });

  const getUser = async () => {
    const session = await axios.get("/api/auth/session");
    console.log(session.data.user.name); // Logs the fetched name
    setuser({
      name: session.data.user.name,
      email: session.data.user.email,
      image: session.data.user.image,
    });
  };

  // Trigger getUser on component mount
  useEffect(() => {
    getUser();
  }, []);

  // Log the updated user state whenever it changes
  useEffect(() => {
    console.log(user); // Logs the updated state
  }, [user]);

  return (
    <div className="min-h-screen bg-black dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-950 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-primary/10">
                  <img
                    src={user.image}
                    alt="John Doe"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {user.name}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1"
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="font-medium">42 days streak</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 px-2.5 py-1"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined Apr 2023</span>
                  </Badge>
                </div>
              </div>

              <div className="ml-auto hidden md:flex gap-3">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => setUsernameSheetOpen(true)}
                >
                  {leetcodeUsername
                    ? "Change LeetCode Username"
                    : "Add LeetCode Username"}
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Section */}
          <div className="md:col-span-2 space-y-6 ">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Performance Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-zinc-900 to-zinc-950 ">
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Problems Solved
                    </p>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-50">
                    387{" "}
                    <span className="text-slate-400 text-lg font-normal">
                      / 2500
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">15% completion</p>
                  <Progress value={15} className="h-1.5 mt-3" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-zinc-900 to-zinc-950">
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Global Ranking
                    </p>
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-50">
                    #45,872
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Top 10%</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-zinc-900 to-zinc-950">
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Contest Rating
                    </p>
                    <Target className="h-4 w-4 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-50">
                    1725
                  </h3>
                  <p className="text-sm text-green-500 font-medium mt-1">
                    Top 25%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-zinc-900 to-zinc-950">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                  Difficulty Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-500">Easy</p>
                      <p className="text-sm font-medium">74/667</p>
                    </div>
                    <Progress
                      value={(74 / 667) * 100}
                      className="h-2 bg-slate-100 dark:bg-slate-800"
                      indicatorClassName="bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-amber-500">
                        Medium
                      </p>
                      <p className="text-sm font-medium">48/1813</p>
                    </div>
                    <Progress
                      value={(48 / 1813) * 100}
                      className="h-2 bg-slate-100 dark:bg-slate-800"
                      indicatorClassName="bg-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-500">Hard</p>
                      <p className="text-sm font-medium">2/811</p>
                    </div>
                    <Progress
                      value={(2 / 811) * 100}
                      className="h-2 bg-slate-100 dark:bg-slate-800"
                      indicatorClassName="bg-red-500"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <p className="text-sm text-slate-500">
                    LeetCode Username:{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {leetcodeUsername || "Not set"}
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setUsernameSheetOpen(true)}
                  >
                    {leetcodeUsername ? "Edit Username" : "Add Username"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Recently Solved Questions
              </h2>
              <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <th className="text-xs font-medium text-slate-500 text-left px-6 py-3">
                          PROBLEM
                        </th>
                        <th className="text-xs font-medium text-slate-500 text-left px-6 py-3">
                          DIFFICULTY
                        </th>
                        <th className="text-xs font-medium text-slate-500 text-left px-6 py-3">
                          TOPIC
                        </th>
                        <th className="text-xs font-medium text-slate-500 text-left px-6 py-3">
                          DATE SOLVED
                        </th>
                        <th className="text-xs font-medium text-slate-500 text-left px-6 py-3">
                          TIME SPENT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              Two Sum
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                          >
                            Easy
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Arrays
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Jun 15, 2023
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>15m</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              Add Two Numbers
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                          >
                            Medium
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Linked Lists
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Jun 14, 2023
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>25m</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              Median of Two Sorted Arrays
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
                          >
                            Hard
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Arrays
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Jun 13, 2023
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>40m</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              Longest Palindromic Substring
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                          >
                            Medium
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Strings
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          Jun 12, 2023
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>30m</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-zinc-900 to-zinc-950" >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Customize Daily DSA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Select DSA Topics
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-primary"
                        onClick={selectAllTopics}
                      >
                        Select All
                      </Button>
                      {selectedTopics.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-red-500"
                          onClick={clearAllTopics}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 border rounded-md p-2">
                    {ALL_DSA_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`topic-${topic}`}
                          checked={selectedTopics.includes(topic)}
                          onChange={(e) =>
                            handleTopicChange(topic, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`topic-${topic}`}
                          className="text-sm text-slate-700 dark:text-slate-300"
                        >
                          {topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Select Difficulty
                  </label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="px-3 py-1.5 flex items-center gap-1"
                      >
                        {topic}
                        <button
                          onClick={() => removeTopic(topic)}
                          className="h-4 w-4 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full mt-2"
                  onClick={updatePreferences}
                  disabled={selectedTopics.length === 0}
                >
                  Update Preferences
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Next DSA Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your next question will be delivered to:
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    john.doe@example.com
                  </p>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Tomorrow at 9:00 AM</span>
                </div>

                <div className="pt-2 border-t border-blue-100 dark:border-blue-900/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Topic:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    >
                      Dynamic Programming
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Difficulty:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                    >
                      Medium
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* LeetCode Username Sheet */}
      <Sheet open={usernameSheetOpen} onOpenChange={setUsernameSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>LeetCode Username</SheetTitle>
            <SheetDescription>
              Enter your LeetCode username to sync your progress and stats.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leetcode-username">Username</Label>
                <Input
                  id="leetcode-username"
                  placeholder="Enter your LeetCode username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-500">
                Your LeetCode username will be used to fetch your latest stats
                and progress.
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button
              onClick={handleUsernameSubmit}
              disabled={!newUsername.trim()}
            >
              Save Username
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
// import { toast } from "@/components/ui/use-toast";
import { XCircle, Settings, Check, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Group topics by category
const TOPIC_CATEGORIES = {
  "Data Structures": ["Arrays", "Strings", "Linked Lists", "Trees", "Stacks", "Queues", "Heaps", "Hashing"],
  "Algorithms": ["Sorting", "Searching", "Binary Search", "Two Pointers", "Bit Manipulation", "Math"],
  "Advanced Techniques": ["Dynamic Programming", "Greedy Algorithms", "Backtracking", "Recursion", "Divide and Conquer", "Graphs"]
};

export default function PreferencesForm() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("EASY");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", message: string} | null>(null);

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.get("/api/user/preferences");
        setSelectedTopics(response.data.topics);
        setDifficulty(response.data.difficulty);
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchPreferences();
  }, []);

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
  const updatePreferences = async () => {
    if (selectedTopics.length === 0) {
      setSaveMessage({
        type: "error",
        message: "Please select at least one topic"
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/user/preferences", {
        topics: selectedTopics,
        difficulty
      });

      setSaveMessage({
        type: "success",
        message: `Updated to ${selectedTopics.length} topics with ${difficulty.toLowerCase()} difficulty`
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating preferences:", error);
      setSaveMessage({
        type: "error",
        message: "Failed to update preferences"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get topic count by category
  const getTopicCountByCategory = (category: string) => {
    const categoryTopics = TOPIC_CATEGORIES[category as keyof typeof TOPIC_CATEGORIES] || [];
    return categoryTopics.filter(topic => selectedTopics.includes(topic)).length;
  };

  if (initialLoad) {
    return (
      <Card className="border-0 bg-zinc-900 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-zinc-800">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-zinc-400 mr-2" />
            <CardTitle className="text-zinc-300">Loading preferences...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex justify-center">
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
        <div>
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-zinc-400 mr-2" />
            <CardTitle className="text-zinc-300">Practice Preferences</CardTitle>
          </div>
          <CardDescription className="text-zinc-500 mt-1">
            Customize your daily problem preferences
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-zinc-800 text-zinc-400">
            {selectedTopics.length} topics selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {saveMessage && (
          <Alert className={`${saveMessage.type === 'success' ? 'bg-green-950 text-green-500 border-green-900' : 'bg-red-950 text-red-500 border-red-900'} mb-4`}>
            <AlertDescription className="flex items-center gap-2">
              {saveMessage.type === 'success' ? (
                <Check className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {saveMessage.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Difficulty Selection */}
        <div className="space-y-3">
          <Label htmlFor="difficulty" className="text-zinc-400 flex items-center gap-2">
            Difficulty Level
          </Label>
          <Select
            value={difficulty}
            onValueChange={setDifficulty}
          >
            <SelectTrigger id="difficulty" className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="EASY" className="text-green-500 focus:bg-zinc-800 focus:text-green-500">Easy</SelectItem>
              <SelectItem value="MEDIUM" className="text-yellow-500 focus:bg-zinc-800 focus:text-yellow-500">Medium</SelectItem>
              <SelectItem value="HARD" className="text-red-500 focus:bg-zinc-800 focus:text-red-500">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TOPIC_CATEGORIES).map(([category, topics]) => (
            <Card key={category} className="bg-zinc-800 border-zinc-700">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex justify-between items-center">
                  <span className="text-zinc-300">{category}</span>
                  <Badge className="text-xs bg-zinc-700 text-zinc-400">
                    {getTopicCountByCategory(category)}/{topics.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 space-y-1.5">
                {topics.map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topic-${topic}`}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={(checked) =>
                        handleTopicChange(topic, !!checked)
                      }
                      className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`topic-${topic}`}
                      className="cursor-pointer text-sm text-zinc-300"
                    >
                      {topic}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Topics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-zinc-400">Selected Topics</Label>
            <div className="space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                onClick={selectAllTopics}
              >
                Select All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                onClick={clearAllTopics}
              >
                Clear All
              </Button>
            </div>
          </div>
          <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 min-h-[70px]">
            <div className="flex flex-wrap gap-2 py-2">
              {selectedTopics.length === 0 ? (
                <p className="text-sm text-zinc-500 w-full text-center">No topics selected</p>
              ) : (
                selectedTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="py-1 px-2 bg-zinc-700 text-zinc-300 border-zinc-600 flex items-center gap-1"
                  >
                    {topic}
                    <XCircle
                      size={14}
                      className="cursor-pointer hover:text-red-400 ml-1"
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
          disabled={loading || selectedTopics.length === 0}
          onClick={updatePreferences}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              Updating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 
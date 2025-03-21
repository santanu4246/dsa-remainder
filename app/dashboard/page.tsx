"use client";

import React, { useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState<{ title: string; questionLink: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    if (!topic || !difficulty) {
      setError("Please enter both topic and difficulty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/questions", { topic, difficulty });
      setQuestions(response.data.questions);
    } catch (err) {
      setError("Failed to fetch questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Fetch LeetCode Questions</h2>

      <input
        type="text"
        placeholder="Enter topic (e.g., array, dp)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      
      <input
        type="text"
        placeholder="Enter difficulty (easy, medium, hard)"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      
      <button
        onClick={fetchQuestions}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Questions"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4">
        {questions.length > 0 && <h3 className="text-xl font-semibold">Questions:</h3>}
        <ul className="mt-2">
          {questions.map((q, index) => (
            <li key={index} className="mb-2">
              <a href={q.questionLink} target="_blank" className="text-blue-600 underline">
                {q.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

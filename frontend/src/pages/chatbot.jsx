import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm the CampusJob Assistant. I can help you find jobs, answer questions about applications, and provide career advice. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/chatbot/send-message`,
        {
          message: inputValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const botMessage = {
          id: messages.length + 2,
          text: response.data.message,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Check if response contains job search terms
        if (
          inputValue.toLowerCase().includes("search") ||
          inputValue.toLowerCase().includes("find")
        ) {
          searchJobsFromQuery(inputValue);
        }
      } else {
        const errorMessage = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const searchJobsFromQuery = async (query) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/chatbot/search-jobs`,
        {
          query: query,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.jobs.length > 0) {
        setSearchResults(response.data.jobs);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>CampusJob Assistant</h1>
        <p>Your AI-powered job search companion</p>
      </div>

      <div className="chatbot-content">
        <div className="chatbot-left">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender} ${
                  message.error ? "error" : ""
                }`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="message-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about jobs, skills, applications..."
              disabled={loading}
              className="message-input"
            />
            <button type="submit" disabled={loading} className="send-button">
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>

        <div className="chatbot-right">
          <div className="suggestions-panel">
            <h3>Quick Questions</h3>
            <div className="quick-questions">
              <button
                onClick={() =>
                  handleQuickQuestion("Show me software engineering jobs")
                }
                className="question-btn"
              >
                Find Software Jobs
              </button>
              <button
                onClick={() => handleQuickQuestion("What skills do I need?")}
                className="question-btn"
              >
                Skill Requirements
              </button>
              <button
                onClick={() =>
                  handleQuickQuestion("How to apply for internships?")
                }
                className="question-btn"
              >
                Internship Tips
              </button>
              <button
                onClick={() => handleQuickQuestion("Tell me about remote jobs")}
                className="question-btn"
              >
                Remote Jobs
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-panel">
              <h3>Related Jobs</h3>
              <div className="jobs-list">
                {searchResults.map((job) => (
                  <div key={job.id} className="job-card">
                    <h4>{job.title}</h4>
                    <p className="company">{job.company_name}</p>
                    <p className="location">{job.location}</p>
                    <p className="salary">{job.salary_range}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

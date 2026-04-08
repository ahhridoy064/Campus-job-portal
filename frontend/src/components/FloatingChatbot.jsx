import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/floating-chatbot.css";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm CampusJob AI Assistant. I can help you find jobs, answer questions about positions, and provide career advice. What are you looking for?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Intelligent response generator (ChatGPT-like)
  const generateSmartResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
    const responses = {
      job: ["I found several job opportunities on CampusJob! We have positions in software development, marketing, design, and more. What field interests you?", "We're currently hiring for multiple positions. Are you looking for an entry-level role, internship, or graduate position?"],
      software: ["Great choice! We have 15+ software engineering positions available. Salaries range from 50,000 to 150,000+ BDT depending on experience. Would you like to know more about specific companies?", "Software development roles are in high demand. We have frontend, backend, and full-stack positions. Which interests you most?"],
      internship: ["We have excellent internship opportunities. Undergraduate students typically earn 15,000-25,000 BDT per month.", "Many companies are offering 3-6 month internships. This is a great way to gain experience."],
      skill: ["Popular in-demand skills include JavaScript, Python, Java, Data Analytics, and UI/UX Design.", "To stand out, focus on: programming languages, data analysis, cloud technologies, and soft skills."],
      learn: ["JavaScript, Python, and SQL are great starting points. Many of our job openings require these skills.", "I'd recommend learning JavaScript for web development, Python for data science, or Java for backend development."],
      apply: ["The application process is simple: 1) Create your profile 2) Browse jobs 3) Click apply 4) Submit documents.", "You can apply directly through the platform. Make sure your profile is complete."],
      salary: ["Entry-level positions typically start at 30,000-50,000 BDT, mid-level roles at 70,000-120,000 BDT, and senior roles at 150,000+ BDT.", "Salaries depend on your experience, skills, and the position."],
      company: ["We have partnerships with 50+ companies including tech startups, established IT firms, and multinational corporations.", "From startups to large enterprises - we have opportunities from many well-known companies."],
      remote: ["Yes! We have remote positions available. Many companies now offer work-from-home or hybrid arrangements.", "Remote roles are increasingly popular. I can help you find companies with flexible work arrangements."],
      location: ["Most positions are in Dhaka, but we also have opportunities in Chittagong, Sylhet, and other cities.", "We have positions in major cities across Bangladesh. What's your preferred location?"],
      hello: ["Hello! Welcome. I'm here to help you explore job opportunities and advance your career.", "Hi there! 👋 Welcome to CampusJob. How can I help you find your next opportunity?"],
      help: ["I can help you: find jobs, understand requirements, answer questions about applications, and provide career advice.", "Need help finding a job? I'm here to assist with job search, skill development, and career guidance."],
      default: ["That's interesting! Could you tell me more about what you're looking for?", "I'm here to help! Are you looking for a job, want to know about required skills, or have other questions?"],
    };

    for (const [keyword, responseList] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return responseList[Math.floor(Math.random() * responseList.length)];
      }
    }

    const defaultList = responses.default;
    return defaultList[Math.floor(Math.random() * defaultList.length)];
  };

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

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/chatbot/send-message`,
        {
          message: currentInput,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.success) {
        setApiConnected(true);
        const botMessage = {
          id: messages.length + 2,
          text: response.data.message,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const smartResponse = generateSmartResponse(currentInput);
        const botMessage = {
          id: messages.length + 2,
          text: smartResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("API Error:", error.message);
      setApiConnected(false);

      const smartResponse = generateSmartResponse(currentInput);
      const botMessage = {
        id: messages.length + 2,
        text: smartResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="floating-chatbot-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Chatbot"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-chatbot-window">
          {/* Header */}
          <div className="chatbot-window-header">
            <div className="chatbot-header-content">
              <h3>CampusJob AI</h3>
              <p className="status-online">
                {apiConnected ? "●" : "◯"} {apiConnected ? "Connected" : "Offline Mode"}
              </p>
            </div>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender} ${
                  message.error ? "error" : ""
                }`}
              >
                <div className="message-bubble">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <div className="message-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="chatbot-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about jobs, skills, or career advice..."
              disabled={loading}
              className="chatbot-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="chatbot-send-btn"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;

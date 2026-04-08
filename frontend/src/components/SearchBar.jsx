import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import { getJobs } from "../utils/api";

const SearchBar = ({
    placeholder = "Search jobs...",
    onSearch = () => {},
    data = null, // optional array of items to suggest from
}) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [jobsCache, setJobsCache] = useState([]);
    const containerRef = useRef(null);

    // Load jobs if no data provided (only once)
    useEffect(() => {
        if (!data) {
            getJobs()
                .then((res) => setJobsCache(res))
                .catch(() => setJobsCache([]));
        }
    }, [data]);

    // compute suggestions when input changes
    useEffect(() => {
        const source = data || jobsCache;
        if (input.trim() === "") {
            setSuggestions([]);
            return;
        }
        const term = input.toLowerCase();
        const matches = source
            .filter((job) => job.title.toLowerCase().includes(term))
            .slice(0, 5);
        setSuggestions(matches);
    }, [input, data, jobsCache]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(input);
        setSuggestions([]);
    };

    const handleSuggestionClick = (text) => {
        setInput(text);
        onSearch(text);
        setSuggestions([]);
    };

    // hide suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
            <form
                className="flex items-center bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-xl border border-blue-500/20 px-4 py-3 gap-3 w-full shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-400/30"
                onSubmit={handleSubmit}
            >
                <svg
                    className="w-5 h-5 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-2 py-2 rounded-lg border-none focus:outline-none text-slate-200 bg-transparent placeholder-slate-400 focus:bg-slate-700/50 transition-all duration-200"
                />
                <Button variant="primary" className="px-6">
                    Search
                </Button>
            </form>
            {suggestions.length > 0 && (
                <ul className="absolute z-20 bg-slate-800/90 rounded-lg mt-1 w-full max-h-60 overflow-auto shadow-xl">
                    {suggestions.map((job) => (
                        <li
                            key={job.id}
                            className="px-4 py-2 text-slate-200 hover:bg-slate-700 cursor-pointer"
                            onClick={() => handleSuggestionClick(job.title)}
                        >
                            {job.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;

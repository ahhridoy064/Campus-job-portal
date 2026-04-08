<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Job;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    private $geminiApiKey;
    private $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    public function __construct()
    {
        $this->geminiApiKey = env('GOOGLE_AI_API_KEY');
    }

    /**
     * Send message to chatbot and get response
     */
    public function sendMessage(Request $request)
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000',
            ]);

            $userMessage = $request->input('message');

            // Get job data to provide context
            $jobs = Job::select('id', 'title', 'description', 'company_name', 'location', 'salary_range')->limit(10)->get();
            $jobsContext = $this->formatJobsContext($jobs);

            // Build system message with job context
            $systemMessage = $this->buildSystemMessage($jobsContext);

            // Check if API key is valid (test if it's demo key)
            if (empty($this->geminiApiKey)) {
                // Use mock response for demo/testing
                $demos = [
                    'software' => 'We have 15 software engineering positions available with salaries ranging from 50,000 to 150,000 BDT. Are you interested in a specific company or location?',
                    'job' => 'We currently have 200+ job opportunities across various fields. Are you looking for entry-level positions, internships, or graduate roles?',
                    'skill' => 'Popular skills in demand: Java, Python, JavaScript, Data Analytics, and Web Development. Which skill would you like to develop?',
                ];

                $response = 'Hello! 👋 I\'m CampusJob AI assistant. I can help you find jobs, answer questions about positions, and provide career advice. What are you looking for?';

                foreach ($demos as $keyword => $reply) {
                    if (stripos($userMessage, $keyword) !== false) {
                        $response = $reply;
                        break;
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => $response,
                    'timestamp' => now(),
                ]);
            }

            // Call Gemini API
            $fullPrompt = $systemMessage . "\n\nUser: " . $userMessage;

            $response = Http::timeout(30)->post($this->geminiUrl . '?key=' . $this->geminiApiKey, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $fullPrompt,
                            ],
                        ],
                    ],
                ],
            ]);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to get response from AI service',
                    'details' => $response->json(),
                ], 400);
            }

            $responseData = $response->json();
            $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? 'Sorry, I couldn\'t generate a response.';

            return response()->json([
                'success' => true,
                'message' => $aiResponse,
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get job search results based on query
     */
    public function searchJobs(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string|max:255',
            ]);

            $query = $request->input('query');

            $jobs = Job::where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('company_name', 'like', "%{$query}%")
                  ->orWhere('location', 'like', "%{$query}%");
            })
            ->select('id', 'title', 'company_name', 'location', 'salary_range')
            ->orderBy('title', 'asc') // sort results alphabetically by title
            ->limit(5)
            ->get();

            return response()->json([
                'success' => true,
                'jobs' => $jobs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format jobs context for the chatbot
     */
    private function formatJobsContext($jobs)
    {
        if ($jobs->isEmpty()) {
            return 'No jobs currently available.';
        }

        $jobsList = '';
        foreach ($jobs as $job) {
            $jobsList .= "- {$job->title} at {$job->company_name}, {$job->location}, Salary: {$job->salary_range}\n";
        }

        return $jobsList;
    }

    /**
     * Build system message for the chatbot
     */
    private function buildSystemMessage($jobsContext)
    {
        return "You are an intelligent, helpful, and professional career advisor AI assistant for CampusJob, a leading online job portal in Bangladesh. Your name is CampusJob AI.

CORE RESPONSIBILITIES:
1. Help job seekers find relevant positions based on their interests and skills
2. Provide accurate information about job requirements, qualifications, and salary ranges
3. Give career development advice and skill recommendations
4. Answer questions about the application process and company information
5. Be supportive, encouraging, and professional in all interactions

AVAILABLE POSITIONS:
{$jobsContext}

PERSONALITY & TONE:
- Professional yet friendly and approachable
- Clear and concise in explanations
- Encouraging about career growth opportunities
- Honest about market demands and opportunities
- Helpful in guiding users to make informed decisions

GUIDELINES:
- Always encourage skill development
- Provide specific, actionable advice
- Mention salary ranges when relevant
- Highlight different career paths available
- Be supportive of all experience levels
- Keep responses concise but informative
- Use examples from available positions when possible

Remember: Your goal is to help users succeed in their career journey with CampusJob.";
    }
}

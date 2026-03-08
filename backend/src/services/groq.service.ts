import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate text using Groq AI
 * @param prompt - The prompt to send to the AI
 * @param model - The model to use (default: llama-3.3-70b-versatile)
 * @returns Generated text response
 */
export async function generateText(
  prompt: string,
  model: string = 'llama-3.3-70b-versatile'
): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq AI error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Generate structured JSON response
 * @param prompt - The prompt to send to the AI
 * @param model - The model to use
 * @returns Parsed JSON response
 */
export async function generateJSON<T = any>(
  prompt: string,
  model: string = 'llama-3.3-70b-versatile'
): Promise<T> {
  try {
    const response = await generateText(prompt, model);
    
    // Extract JSON from response (sometimes AI wraps it in ```json```)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Try direct parse
    return JSON.parse(response);
  } catch (error) {
    console.error('Groq JSON parse error:', error);
    throw new Error('Failed to parse AI JSON response');
  }
}

/**
 * Generate writing feedback
 * @param content - User's writing
 * @param promptText - The writing prompt
 * @param levelCode - User's English level
 * @returns AI feedback object
 */
export async function generateWritingFeedback(
  content: string,
  promptText: string,
  levelCode: string
) {
  const systemPrompt = `You are an English teacher evaluating a student's writing at ${levelCode} level.

Analyze the following text and provide detailed feedback in JSON format:
{
  "grammar_score": 0-100,
  "vocabulary_score": 0-100,
  "coherence_score": 0-100,
  "overall_score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "grammar_errors": [{"error": "mistake", "correction": "fix", "explanation": "why"}],
  "vocabulary_suggestions": ["word1: better alternative", "word2: better alternative"],
  "general_feedback": "Overall comments about the writing"
}

Be encouraging and constructive. Focus on helping the student improve.

Prompt: ${promptText}

Student's Writing:
${content}

Respond ONLY with the JSON object, no additional text.`;

  try {
    return await generateJSON(systemPrompt);
  } catch (error) {
    console.error('Failed to generate writing feedback:', error);
    // Return default feedback if AI fails
    return {
      grammar_score: 70,
      vocabulary_score: 70,
      coherence_score: 70,
      overall_score: 70,
      strengths: ['Completed the writing task', 'Clear communication'],
      improvements: ['Practice more complex sentence structures', 'Expand vocabulary'],
      grammar_errors: [],
      vocabulary_suggestions: [],
      general_feedback: 'Thank you for your submission. Keep practicing to improve your writing skills!',
    };
  }
}

/**
 * Generate AI explanation for a question
 * @param question - The question text
 * @param correctAnswer - The correct answer
 * @param userAnswer - User's answer (optional)
 * @returns Explanation text
 */
export async function generateExplanation(
  question: string,
  correctAnswer: string,
  userAnswer?: string
): Promise<string> {
  const prompt = userAnswer
    ? `Explain why "${correctAnswer}" is the correct answer to this question, and why "${userAnswer}" is incorrect:

Question: ${question}

Provide a brief, educational explanation (2-3 sentences).`
    : `Explain why "${correctAnswer}" is the correct answer to this question:

Question: ${question}

Provide a brief, educational explanation (2-3 sentences).`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error('Failed to generate explanation:', error);
    return `The correct answer is "${correctAnswer}".`;
  }
}

export default {
  generateText,
  generateJSON,
  generateWritingFeedback,
  generateExplanation,
};
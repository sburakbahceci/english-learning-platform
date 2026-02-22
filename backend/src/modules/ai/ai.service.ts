import Groq from 'groq-sdk';
import prisma from '../../config/database';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const SYSTEM_PROMPT = `You are an expert English language learning assistant for Lingoria, an AI-powered English learning platform. Your role is to help users improve their English skills from A1 (Beginner) to C2 (Proficiency) levels.

IMPORTANT RULES:
1. ONLY answer questions related to English learning, grammar, vocabulary, pronunciation, writing, reading, listening, and speaking.
2. If a user asks about topics unrelated to English learning, politely redirect them: "I'm here to help you learn English! Let's focus on improving your language skills. How can I assist you with English today?"
3. Be encouraging, patient, and supportive.
4. Provide clear explanations with examples.
5. When explaining grammar, use simple language and give practical examples.
6. For vocabulary questions, provide: definition, example sentence, and usage context.
7. Correct mistakes gently and explain why something is correct/incorrect.
8. Adapt your language level to the user's proficiency (simpler for A1-A2, more complex for C1-C2).
9. Use emojis occasionally to make learning fun (📚, ✅, 💡, 🎯).
10. Always stay in character as a friendly English teacher.

Remember: You are part of Lingoria platform. Focus ONLY on English language learning topics.`;

export class AIService {
  async sendMessage(userId: string, sessionId: string, userMessage: string) {
    try {
      // Session var mı kontrol et
      let session = await prisma.aiChatSession.findUnique({
        where: {
          userId_sessionId: {
            userId,
            sessionId,
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Son 20 mesaj
          },
        },
      });

      if (!session) {
        session = await prisma.aiChatSession.create({
          data: {
            userId,
            sessionId,
          },
          include: {
            messages: true,
          },
        });
      }

      // User mesajını kaydet
      await prisma.aiChatMessage.create({
        data: {
          sessionId: session.id,
          userId,
          role: 'user',
          content: userMessage,
        },
      });

      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...session.messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      console.log('📤 Sending to Groq AI...');

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse =
        response.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';

      console.log('📥 Groq response received');

      // AI cevabını kaydet
      const assistantMessage = await prisma.aiChatMessage.create({
        data: {
          sessionId: session.id,
          userId,
          role: 'assistant',
          content: aiResponse,
        },
      });

      // Session update
      await prisma.aiChatSession.update({
        where: { id: session.id },
        data: { lastMessageAt: new Date() },
      });

      return {
        message: assistantMessage,
        sessionId: session.sessionId,
      };
    } catch (error) {
      console.error('❌ Groq API Error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async explainWrongAnswer(
    question: string,
    userAnswer: string | null,
    correctAnswer: string,
    context?: string
  ) {
    try {
      const prompt = `You are an expert English teacher helping a student understand their mistake.

QUESTION: ${question}

STUDENT'S ANSWER: ${userAnswer || 'No answer provided'}
CORRECT ANSWER: ${correctAnswer}
${context ? `CONTEXT: ${context}` : ''}

Your task:
1. Explain why the student's answer is incorrect (if they answered)
2. Explain why the correct answer is right
3. Provide a simple example to help them remember
4. Use simple, encouraging language (A1-B1 level English)
5. Keep it short (max 3-4 sentences)

Start your explanation immediately without any preamble.`;

      console.log('📤 Sending to Groq AI (llama-3.3-70b-versatile)');
      console.log('Question:', question);
      console.log('User Answer:', userAnswer);
      console.log('Correct Answer:', correctAnswer);

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful English teacher.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const explanation =
        response.choices[0]?.message?.content ||
        'Could not generate explanation.';

      console.log(
        '📥 Groq response received:',
        explanation.substring(0, 100) + '...'
      );

      return explanation;
    } catch (error) {
      console.error('❌ Groq explain error:', error);

      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }

      throw new Error('Failed to generate explanation');
    }
  }

  async getChatHistory(userId: string, sessionId: string) {
    const session = await prisma.aiChatSession.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return [];
    }

    return session.messages;
  }

  async getUserSessions(userId: string) {
    const sessions = await prisma.aiChatSession.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return sessions;
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await prisma.aiChatSession.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await prisma.aiChatSession.delete({
      where: { id: session.id },
    });

    return { success: true };
  }

  async createNewSession(userId: string) {
    const sessionId = `session_${Date.now()}`;

    const session = await prisma.aiChatSession.create({
      data: {
        userId,
        sessionId,
      },
    });

    return session;
  }
}

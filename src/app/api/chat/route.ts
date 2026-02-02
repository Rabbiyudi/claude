import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are Rimon, a smart CRM assistant for community leaders and organizations.
Your job is to analyze user messages and identify their intent to help manage contacts, tasks, and events.

Analyze the user's message and respond with a JSON object containing:
1. "intent": one of ["add_contact", "add_task", "add_event", "search", "update", "general"]
2. "confidence": a number between 0 and 1
3. "extracted_data": relevant data extracted from the message (names, dates, phone numbers, etc.)
4. "action": the suggested action to take
5. "response": a friendly response in the same language as the user's message (Hebrew or English)

Examples:
- "I just met David Cohen at the synagogue" → intent: add_contact, extract name "David Cohen", location "synagogue"
- "Remind me to call Sarah tomorrow" → intent: add_task, extract name "Sarah", due date "tomorrow"
- "Schedule Purim party for next week" → intent: add_event, extract event "Purim party", date "next week"
- "Find all contacts from last month" → intent: search, extract time filter "last month"

Always respond ONLY with valid JSON, no additional text.`;

interface ChatRequest {
  message: string;
  context?: {
    recentContacts?: string[];
    recentEvents?: string[];
    language?: 'en' | 'he';
  };
}

interface IntentResponse {
  intent: 'add_contact' | 'add_task' | 'add_event' | 'search' | 'update' | 'general';
  confidence: number;
  extracted_data: Record<string, unknown>;
  action: {
    type: string;
    suggestedFields?: Record<string, unknown>;
    query?: string;
  };
  response: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context }: ChatRequest = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback to local analysis if no API key
      console.log('No ANTHROPIC_API_KEY found, using local analysis');
      return NextResponse.json(analyzeIntentLocally(message));
    }

    const contextInfo = context
      ? `\nContext: User language preference: ${context.language || 'auto-detect'}`
      : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${message}${contextInfo}`,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    const parsedResponse: IntentResponse = JSON.parse(textContent.text);

    return NextResponse.json({
      ...parsedResponse,
      model: 'claude-sonnet-4-20250514',
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    // If Claude API fails, fallback to local analysis
    if (error instanceof Error && error.message.includes('API')) {
      try {
        const { message } = await request.json();
        return NextResponse.json(analyzeIntentLocally(message));
      } catch {
        // Ignore fallback errors
      }
    }

    return NextResponse.json(
      { error: 'Failed to process message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Local fallback analysis when API is not available
function analyzeIntentLocally(message: string): IntentResponse {
  const lowerMessage = message.toLowerCase();
  const isHebrew = /[\u0590-\u05FF]/.test(message);

  // Contact detection
  if (
    lowerMessage.includes('meet') ||
    lowerMessage.includes('met') ||
    lowerMessage.includes('פגש') ||
    lowerMessage.includes('הכרתי')
  ) {
    return {
      intent: 'add_contact',
      confidence: 0.85,
      extracted_data: { raw_text: message },
      action: {
        type: 'create_contact',
        suggestedFields: { notes: message },
      },
      response: isHebrew
        ? 'זיהיתי שפגשת מישהו חדש. האם ליצור כרטיס איש קשר?'
        : 'I detected you met someone new. Would you like me to create a contact card?',
    };
  }

  // Task detection
  if (
    lowerMessage.includes('remind') ||
    lowerMessage.includes('remember') ||
    lowerMessage.includes('call') ||
    lowerMessage.includes('צריך') ||
    lowerMessage.includes('לזכור') ||
    lowerMessage.includes('להתקשר')
  ) {
    return {
      intent: 'add_task',
      confidence: 0.9,
      extracted_data: { raw_text: message },
      action: {
        type: 'create_task',
        suggestedFields: { title: message, priority: 'medium' },
      },
      response: isHebrew
        ? 'רשמתי את זה כמשימה. להוסיף תאריך יעד?'
        : "I've noted this as a task. Should I add a due date?",
    };
  }

  // Event detection
  if (
    lowerMessage.includes('event') ||
    lowerMessage.includes('schedule') ||
    lowerMessage.includes('party') ||
    lowerMessage.includes('אירוע') ||
    lowerMessage.includes('מסיבה') ||
    lowerMessage.includes('לתזמן')
  ) {
    return {
      intent: 'add_event',
      confidence: 0.88,
      extracted_data: { raw_text: message },
      action: {
        type: 'create_event',
        suggestedFields: { title: message },
      },
      response: isHebrew
        ? 'נשמע כמו אירוע! מתי לתזמן אותו?'
        : 'Sounds like an event! When should I schedule it?',
    };
  }

  // Search detection
  if (
    lowerMessage.includes('find') ||
    lowerMessage.includes('search') ||
    lowerMessage.includes('חפש') ||
    lowerMessage.includes('מצא') ||
    lowerMessage.includes('איפה')
  ) {
    return {
      intent: 'search',
      confidence: 0.92,
      extracted_data: { query: message },
      action: {
        type: 'search',
        query: message,
      },
      response: isHebrew ? 'מחפש...' : 'Let me search for that...',
    };
  }

  // Default general response
  return {
    intent: 'general',
    confidence: 0.7,
    extracted_data: { raw_text: message },
    action: { type: 'log' },
    response: isHebrew ? 'הבנתי! תיעדתי את המידע הזה.' : "Got it! I've logged this information.",
  };
}

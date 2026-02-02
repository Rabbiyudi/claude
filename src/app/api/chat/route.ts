import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // In production, this would call the OpenAI GPT-4o API
    // For now, we'll simulate an intent analysis response

    const mockResponse = analyzeIntent(message);

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function analyzeIntent(message: string) {
  const lowerMessage = message.toLowerCase();

  // Simple intent detection patterns
  if (lowerMessage.includes('meet') || lowerMessage.includes('met') || lowerMessage.includes('פגש')) {
    return {
      intent: 'add_contact',
      confidence: 0.85,
      action: {
        type: 'create_contact',
        suggestedFields: {
          notes: message,
        },
      },
      response: 'I detected you met someone new. Would you like me to create a contact card?',
    };
  }

  if (lowerMessage.includes('remind') || lowerMessage.includes('remember') ||
      lowerMessage.includes('call') || lowerMessage.includes('צריך') || lowerMessage.includes('לזכור')) {
    return {
      intent: 'add_task',
      confidence: 0.9,
      action: {
        type: 'create_task',
        suggestedFields: {
          title: message,
          priority: 'medium',
        },
      },
      response: 'I\'ve noted this as a task. Should I add a due date?',
    };
  }

  if (lowerMessage.includes('event') || lowerMessage.includes('schedule') ||
      lowerMessage.includes('party') || lowerMessage.includes('אירוע') || lowerMessage.includes('מסיבה')) {
    return {
      intent: 'add_event',
      confidence: 0.88,
      action: {
        type: 'create_event',
        suggestedFields: {
          title: message,
        },
      },
      response: 'Sounds like an event! When should I schedule it?',
    };
  }

  if (lowerMessage.includes('find') || lowerMessage.includes('search') ||
      lowerMessage.includes('חפש') || lowerMessage.includes('מצא')) {
    return {
      intent: 'search',
      confidence: 0.92,
      action: {
        type: 'search',
        query: message,
      },
      response: 'Let me search for that...',
    };
  }

  return {
    intent: 'general',
    confidence: 0.7,
    action: {
      type: 'log',
    },
    response: 'Got it! I\'ve logged this information.',
  };
}

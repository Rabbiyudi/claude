import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Send the audio to OpenAI Whisper API for transcription
    // 2. Then send the transcription to GPT-4o for intent analysis
    // 3. Return both the transcription and the analysis

    // Mock response for demonstration
    const mockTranscription = "Met with David Cohen at the coffee shop. He's interested in sponsoring the Purim event. Need to follow up next week with more details.";

    const mockAnalysis = {
      transcription: mockTranscription,
      intent: 'multiple',
      confidence: 0.92,
      actions: [
        {
          type: 'create_contact',
          suggestedFields: {
            name: 'David Cohen',
            notes: 'Met at coffee shop, interested in sponsoring Purim event',
            tags: ['potential sponsor'],
          },
        },
        {
          type: 'create_task',
          suggestedFields: {
            title: 'Follow up with David Cohen about Purim sponsorship',
            priority: 'high',
            dueDate: getNextWeek(),
          },
        },
      ],
      response: 'I detected a new contact and a follow-up task. Would you like me to create both?',
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Transcribe API error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

function getNextWeek(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

import { NextResponse } from 'next/server';

// GET /api/events - Get all events
export async function GET() {
  // In production, this would fetch from a database
  return NextResponse.json({
    message: 'Events API endpoint. In production, connect to your database.',
    status: 'ok',
  });
}

// POST /api/events - Create a new event
export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, date, time, location, category, price, maxParticipants } = body;

  if (!title || !date || !time || !location) {
    return NextResponse.json(
      { error: 'Missing required fields: title, date, time, location' },
      { status: 400 }
    );
  }

  // In production, save to database
  const newEvent = {
    id: Date.now().toString(),
    title,
    description,
    date,
    time,
    location,
    category: category || 'other',
    price: price || 0,
    maxParticipants,
    currentParticipants: 0,
    registrations: [],
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(newEvent, { status: 201 });
}

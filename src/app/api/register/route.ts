import { NextResponse } from 'next/server';

// POST /api/register - Register for an event
export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, fullName, email, phone, numberOfGuests, notes } = body;

  if (!eventId || !fullName || !email || !phone) {
    return NextResponse.json(
      { error: 'Missing required fields: eventId, fullName, email, phone' },
      { status: 400 }
    );
  }

  // In production, save to database and send confirmation email
  const registration = {
    id: Date.now().toString(),
    eventId,
    fullName,
    email,
    phone,
    numberOfGuests: numberOfGuests || 0,
    notes,
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  };

  // TODO: Send confirmation email
  // TODO: Process payment if event has a price

  return NextResponse.json(
    { message: 'Registration successful', registration },
    { status: 201 }
  );
}

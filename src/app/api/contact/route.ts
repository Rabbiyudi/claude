import { NextResponse } from 'next/server';

// POST /api/contact - Submit a contact message
export async function POST(request: Request) {
  const body = await request.json();
  const { fullName, email, subject, message } = body;

  if (!fullName || !email || !subject || !message) {
    return NextResponse.json(
      { error: 'Missing required fields: fullName, email, subject, message' },
      { status: 400 }
    );
  }

  // In production, save to database and send notification email to admin
  const contactMessage = {
    id: Date.now().toString(),
    fullName,
    email,
    phone: body.phone,
    subject,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  // TODO: Send notification to admin email
  // TODO: Send auto-reply to sender

  return NextResponse.json(
    { message: 'Message sent successfully', contactMessage },
    { status: 201 }
  );
}

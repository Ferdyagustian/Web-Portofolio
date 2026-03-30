import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
// Note: You need to add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }
    
    // Optional: Save to Supabase
    // const { supabase } = await import('@/lib/supabase/client');
    // await supabase.from('contact_messages').insert([{ name, email, message }]);

    // Only send email if a real RESEND_API_KEY is provided
    if (!process.env.RESEND_API_KEY) {
      console.log('No RESEND_API_KEY found. Mocking successful email send.', { name, email, message });
      return NextResponse.json({ success: true, mocked: true });
    }

    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: 'agustianprasetyoferdy@gmail.com', // Your email
      subject: `New Message from ${name} (${email})`,
      text: `You have received a new message from your portfolio website.\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    );
  }
}

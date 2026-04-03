import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
// Note: You need to add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Stricter Security Validation
    if (name.length > 100) return NextResponse.json({ error: 'Nama terlalu panjang (max 100 karakter).' }, { status: 400 });
    if (message.length > 2000) return NextResponse.json({ error: 'Pesan terlalu panjang (max 2000 karakter).' }, { status: 400 });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    
    // Save to Supabase (Backup)
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([{ name, email, message }]);
      
      if (dbError) console.error('Database Save Error:', dbError);
      else console.log('Message saved to Supabase successfully.');
    } catch (dbErr) {
      console.error('Failed to connect to Supabase:', dbErr);
    }

    // Only send email if a real RESEND_API_KEY is provided
    if (!process.env.RESEND_API_KEY) {
      console.warn('CRITICAL: RESEND_API_KEY is not set. Emails are being mocked.');
      return NextResponse.json({ 
        success: false, 
        error: 'P konfigurasi sistem belum lengkap (Missing API Key). Mohon hubungi administrator.',
        mocked: true 
      }, { status: 500 });
    }

    console.log(`Attempting to send email via Resend for: ${name} (${email})`);

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend requires exactly this for unverified domains
      to: 'agustianprasetyoferdy@gmail.com',
      subject: `New Message from ${name} (${email})`,
      text: `You have received a new message from your portfolio website.\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (resendError) {
      console.error('Resend API Error:', resendError);
      return NextResponse.json({ error: resendError.message }, { status: 400 });
    }

    console.log('Email sent successfully via Resend:', resendData?.id);
    return NextResponse.json({ success: true, id: resendData?.id });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    );
  }
}

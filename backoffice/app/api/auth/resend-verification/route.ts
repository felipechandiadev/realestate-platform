import { env } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const response = await fetch(`${env.backendApiUrl}/auth/resend-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: payload?.message || 'Error al reenviar el correo' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error('API resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

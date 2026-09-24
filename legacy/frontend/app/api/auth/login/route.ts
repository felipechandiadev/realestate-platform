import { env } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (!env.backendApiUrl) {
      console.error('BACKEND_API_URL no está definida');
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    console.log('📤 Enviando login request a:', `${env.backendApiUrl}/auth/sign-in`);

    const response = await fetch(`${env.backendApiUrl}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📥 Backend response status:', response.status);

    let payload;
    try {
      payload = await response.json();
      console.log('📥 Backend response payload:', payload);
    } catch (parseError) {
      console.error('❌ Error parsing backend response:', parseError);
      return NextResponse.json(
        { success: false, error: 'Error en respuesta del servidor' },
        { status: 502 }
      );
    }

    // Si hay error 403 con EMAIL_NOT_VERIFIED, pasarlo al frontend
    if (response.status === 403 && payload?.error === 'EMAIL_NOT_VERIFIED') {
      return NextResponse.json(
        { success: false, error: 'EMAIL_NOT_VERIFIED', message: payload.message },
        { status: 403 }
      );
    }

    // Si la respuesta no es OK
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: payload?.message || 'Credenciales inválidas' },
        { status: response.status }
      );
    }

    // Login exitoso
    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error('❌ API login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

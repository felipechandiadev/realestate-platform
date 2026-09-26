import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1
}

function readApiMessage(body: string, fallback: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] }
    const message = parsed?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string' && message.trim()) return message
  } catch {
    /* cuerpo no JSON */
  }
  return fallback
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as { accessToken?: string } | null)?.accessToken
  if (!accessToken) {
    return NextResponse.json(
      { message: 'La sesión expiró. Vuelve a iniciar sesión.' },
      { status: 401 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 })
  }

  const name = readText(body.name)
  if (!name) {
    return NextResponse.json({ message: 'El nombre es obligatorio' }, { status: 400 })
  }

  const payload = {
    name,
    description: readText(body.description),
    hasBedrooms: readBool(body.hasBedrooms),
    hasBathrooms: readBool(body.hasBathrooms),
    hasBuiltSquareMeters: readBool(body.hasBuiltSquareMeters),
    hasLandSquareMeters: readBool(body.hasLandSquareMeters),
    hasParkingSpaces: readBool(body.hasParkingSpaces),
    hasFloors: readBool(body.hasFloors),
    hasConstructionYear: readBool(body.hasConstructionYear),
  }

  let response: Response
  try {
    response = await fetch(`${env.backendApiUrl}/property-types`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
  } catch (error) {
    console.error('create property type fetch failed', error)
    return NextResponse.json(
      { message: 'No se pudo contactar al servidor. Inténtalo de nuevo.' },
      { status: 502 },
    )
  }

  const text = await response.text()
  if (!response.ok) {
    const message = readApiMessage(text, 'No se pudo crear el tipo de propiedad')
    console.error('create property type', response.status, text)
    return NextResponse.json({ message }, { status: response.status })
  }

  try {
    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json(
      { message: 'El servidor respondió un formato inesperado' },
      { status: 502 },
    )
  }
}

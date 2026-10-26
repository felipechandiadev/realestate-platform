'use server'

import { clientIpHeader } from '@/lib/client-ip';
import { env } from '@/lib/env'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

export async function submitContactForm(data: ContactFormData) {
  try {
    const res = await fetch(`${env.backendApiUrl}/notifications/public/contact`, {
      method: 'POST',
      headers: { ...(await clientIpHeader()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Submit contact form failed:', res.status, errorText)
      throw new Error(`Failed to submit contact form: ${res.status} ${errorText}`)
    }

    return await res.json()
  } catch (error) {
    console.error('Error submitting contact form:', error)
    throw error
  }
}
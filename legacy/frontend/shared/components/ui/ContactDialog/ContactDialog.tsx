'use client'

import React, { useState } from 'react'
import { Send, Hourglass } from 'lucide-react'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import { TextField } from '@/shared/components/ui/TextField/TextField'
import { Button } from '@/shared/components/ui/Button/Button'
import { useAlert } from '@/shared/hooks/useAlert'
import { submitContactForm } from '@/features/backoffice/notifications/actions/notifications.action'

interface ContactDialogProps {
  open: boolean
  onClose: () => void
}

const ContactDialog: React.FC<ContactDialogProps> = ({ open, onClose }) => {
  const { showAlert } = useAlert()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validación local
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !mensaje.trim()) {
      showAlert({ 
        message: 'Por favor completa todos los campos', 
        type: 'error', 
        duration: 3000 
      })
      return
    }

    setLoading(true)
    try {
      const result = await submitContactForm({
        name: nombre.trim(),
        email: email.trim(),
        phone: telefono.trim(),
        message: mensaje.trim(),
      })

      if (!result.success) {
        throw new Error(result.error || 'Error al enviar el mensaje')
      }

      showAlert({ 
        message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.', 
        type: 'success', 
        duration: 5000 
      })

      // Limpia el formulario
      setNombre('')
      setEmail('')
      setTelefono('')
      setMensaje('')
      
      // Cierra el dialog después de un breve delay
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      showAlert({ 
        message: 'Error al enviar el mensaje. Por favor intenta nuevamente.', 
        type: 'error', 
        duration: 5000 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Limpia el formulario al cerrar
    setNombre('')
    setEmail('')
    setTelefono('')
    setMensaje('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Contacto"
      size="sm"
      scroll="paper"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <TextField
          label="Nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={(e: any) => setNombre(e.target.value)}
          disabled={loading}
          required
        />


        <TextField
          label="Correo Electrónico"
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          disabled={loading}
          required
        />


        <TextField
          label="Teléfono"
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e: any) => setTelefono(e.target.value)}
          disabled={loading}
          required
        />


        <TextField
          label="Mensaje"
          placeholder="Mensaje"
          value={mensaje}
          onChange={(e: any) => setMensaje(e.target.value)}
          rows={4}
          disabled={loading}
          required
        />

        <div className="flex gap-2 justify-end pt-2">
          <Button
            type="button"
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Hourglass size={16} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} />
                Enviar
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ContactDialog

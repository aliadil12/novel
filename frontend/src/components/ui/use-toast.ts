

import { useState, useEffect } from 'react'

interface ToastOptions {
  title: string
  description?: string
  duration?: number
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([])

  const addToast = (options: ToastOptions) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...options, id }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setToasts(prev => prev.filter(toast => {
        if (toast.duration && Date.now() - toast.id > toast.duration) {
          return false
        }
        return true
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return { toasts, addToast, removeToast }
}

export const toast = (options: ToastOptions) => {
  // This is a placeholder. In a real application, you'd use a global state management solution
  console.log('Toast:', options)
}


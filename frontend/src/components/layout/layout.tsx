
'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Header from './header'
import Footer from './footer'
import useAppStore from '@/store'
import { useToast } from '@/components/ui/use-toast'
import ChatComponent from '../chat/ChatComponent'
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const { user } = useAppStore()
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    if (user) {
      socket.on('new notification', () => {
        setUnreadNotifications(prev => prev + 1);
      });
    }

    return () => {
      socket.off('new notification');
    };
  }, [user]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogTrigger asChild>
          <Button 
            className={`fixed bottom-4 right-4 rounded-full p-2 ${
              unreadNotifications > 0 ? 'bg-red-500' : 'bg-amber-500'
            } hover:bg-amber-600 text-white shadow-lg`}
            onClick={handleOpenChat}
          >
            <MessageCircle size={24} />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                {unreadNotifications}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 max-w-md w-full h-[80vh] flex flex-col">
          <ChatComponent 
            onClose={() => setIsChatOpen(false)} 
            unreadNotifications={unreadNotifications}
            setUnreadNotifications={setUnreadNotifications}
          />
        </DialogContent>
      </Dialog>
      <div className="fixed top-4 right-4 z-50">
        {toasts.map(toast => (
          <div key={toast.id} className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-2 ${
            toast.variant === 'destructive' ? 'border-red-500' : 'border-green-500'
          } border-l-4`}>
            <h3 className="font-bold">{toast.title}</h3>
            {toast.description && <p className="text-sm">{toast.description}</p>}
            <button onClick={() => removeToast(toast.id)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

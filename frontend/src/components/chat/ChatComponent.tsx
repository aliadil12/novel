
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useAppStore from '@/store'
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Send, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import AuthModal from '@/components/auth/auth-modal';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, Notification } from '@/types';
import { fetchUnreadNotifications, markNotificationsAsRead } from '@/lib/api';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface ChatComponentProps {
  onClose: () => void;
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ onClose, unreadNotifications, setUnreadNotifications }) => {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAppStore();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('get initial messages');
    });

    newSocket.on('connect_error', (err: Error) => {
      setError(`خطأ في الاتصال: ${err.message}`);
    });

    newSocket.on('initial messages', (initialMessages: Message[]) => {
      console.log('Received initial messages:', initialMessages);
      setMessages(initialMessages);
    });

    newSocket.on('chat message', (msg: Message) => {
      console.log('Received new message:', msg);
      setMessages(prevMessages => [...prevMessages, msg].slice(-100));
      if (msg.text.includes(`@${user.name}`)) {
        toast({
          title: "تم ذكرك في الدردشة",
          description: `${msg.user.name}: ${msg.text}`,
        });
      }
    });

    newSocket.on('new notification', (notification: Notification) => {
      setUnreadNotifications(prev => prev + 1);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, setUnreadNotifications, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (unreadNotifications > 0) {
      const handleUnreadNotifications = async () => {
        try {
          const notifications = await fetchUnreadNotifications();
          if (notifications.length > 0) {
            const lastNotification = notifications[notifications.length - 1];
            scrollToMessage(lastNotification.messageId);
          }
          await markNotificationsAsRead();
          setUnreadNotifications(0);
        } catch (error) {
          console.error('Error handling unread notifications:', error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء معالجة الإشعارات غير المقروءة",
            variant: "destructive",
          });
        }
      };
      handleUnreadNotifications();
    }
  }, [unreadNotifications, setUnreadNotifications, toast]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && user && socket) {
      const messageToSend = inputMessage.trim();
      
      setInputMessage('');
      
      const messageData = {
        userId: user.id,
        text: messageToSend,
        replyTo: replyTo?._id
      };
      
      setReplyTo(null);

      socket.emit('chat message', messageData, (error: any, message: Message) => {
        if (error) {
          setError(`خطأ في إرسال الرسالة: ${error}`);
        }
      });
    } else if (!user) {
      setIsAuthModalOpen(true);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setInputMessage('');
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedTime = format(date, 'h:mm', { locale: ar });
    const period = format(date, 'a', { locale: ar }).replace('AM', 'ص').replace('PM', 'م');
    return `${period} ${formattedTime}`; 
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'اليوم';
    } else if (isYesterday(date)) {
      return 'أمس';
    } else {
      return format(date, 'd MMMM yyyy', { locale: ar });
    }
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderMessages = () => {
    let currentDate: Date | null = null;
    return messages.map((msg, index) => {
      const messageDate = new Date(msg.createdAt);
      let dateHeader = null;
      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        currentDate = messageDate;
        dateHeader = (
          <div className="text-center my-4">
            <span className="bg-[#243447] text-white px-3 py-1 rounded-full text-xs">
              {formatDateHeader(msg.createdAt)}
            </span>
          </div>
        );
      }
      return (
        <React.Fragment key={msg._id}>
          {dateHeader}
          <div 
            id={`message-${msg._id}`}
            className={`mb-4 ${msg.user && user && msg.user._id === user.id ? 'flex flex-row-reverse' : 'flex'}`}
          >
            {msg.user && user && msg.user._id !== user.id && (
              <Avatar className="w-8 h-8 mx-2">
                <AvatarImage src={msg.user.avatarUrl} />
                <AvatarFallback>{msg.user.name ? msg.user.name[0] : '?'}</AvatarFallback>
              </Avatar>
            )}
            <div className={`max-w-[70%] ${
              msg.user && user && msg.user._id === user.id 
                ? 'bg-[#2b5278] rounded-l-lg rounded-br-lg' 
                : 'bg-[#243447] rounded-r-lg rounded-bl-lg'
            } p-3 shadow-sm`}>
              {msg.user && user && msg.user._id !== user.id && (
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-purple-400">{msg.user.name}</span>
                </div>
              )}
              {msg.replyTo && (
                <div className="text-xs bg-[#1c2733] p-2 rounded mb-2">
                  الرد على: {messages.find(m => m._id === msg.replyTo)?.text?.substring(0, 50) || ''}...
                </div>
              )}
              <p className="break-words text-base mb-2">{msg.text}</p>
              <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
                <span className="mr-2">
                  {formatMessageTime(msg.createdAt)}
                </span>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReply(msg)}
                    className="p-0 h-auto text-[#61a6d7] hover:text-[#7fbdea] text-[10px]"
                  >
                    رد
                  </Button>
                )}
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#17212b] text-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-[#2b3b4e] flex justify-between items-center">
        <div className="w-6 h-6" />
        <h2 className="text-lg font-semibold">الدردشة العامة</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
          &times;
        </button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400">لا توجد رسائل حاليًا.</p>
        )}
        {renderMessages()}
        <div ref={messagesEndRef} />
      </ScrollArea>
      {error && (
        <div className="bg-red-500 text-white px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={sendMessage} className="p-4 border-t border-[#2b3b4e]">
        {replyTo && (
          <div className="mb-2 text-xs text-gray-400 bg-[#1c2733] p-2 rounded flex justify-between items-center">
            <span>الرد على: {replyTo.text.substring(0, 30)}...</span>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="p-0 h-auto">
              &times;
            </Button>
          </div>
        )}
        <div className="flex items-center relative">
          {user ? (
            <>
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 text-sm bg-[#1c2733] border-[#2b3b4e] text-white pl-2 pr-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              {inputMessage.trim() && (
                <Button type="submit" size="sm" className="absolute right-2 bg-transparent hover:bg-transparent p-0">
                  <Send className="h-5 w-5 text-[#61a6d7]" />
                </Button>
              )}
            </>
          ) : (
            <Button onClick={() => setIsAuthModalOpen(true)} className="w-full text-sm bg-[#3a5b7d] hover:bg-[#4a6b8d]">
              <User className="mr-2 h-4 w-4" /> تسجيل الدخول للمشاركة
            </Button>
          )}
        </div>
      </form>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default ChatComponent;

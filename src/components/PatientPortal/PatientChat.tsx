import React, { useState, useRef, useEffect } from 'react';
import { Send, File, Image, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface Message {
  id: string;
  sender: 'patient' | 'provider';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  providerName?: string;
  attachmentUrl?: string;
  read: boolean;
}

interface Provider {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  lastSeen?: Date;
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Ana Silva',
    role: 'Fisioterapeuta',
    avatar: 'AS',
    online: true
  },
  {
    id: '2',
    name: 'Maria Santos',
    role: 'Secretária',
    avatar: 'MS',
    online: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Dr. Carlos Lima',
    role: 'Especialista',
    avatar: 'CL',
    online: true
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'provider',
    content: 'Olá! Como você está se sentindo hoje? Conseguiu fazer os exercícios que passamos ontem?',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: 'text',
    providerName: 'Dr. Ana Silva',
    read: true
  },
  {
    id: '2',
    sender: 'patient',
    content: 'Oi Dra. Ana! Estou me sentindo bem melhor. Consegui fazer todos os exercícios, mas senti um pouco de desconforto no movimento de rotação.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'text',
    read: true
  },
  {
    id: '3',
    sender: 'provider',
    content: 'Que ótimo! É normal sentir um leve desconforto no início. Vamos reduzir um pouco a intensidade da rotação por enquanto. Vou enviar um vídeo demonstrativo.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'text',
    providerName: 'Dr. Ana Silva',
    read: true
  },
  {
    id: '4',
    sender: 'provider',
    content: 'exercicio_rotacao_modificado.mp4',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    type: 'file',
    providerName: 'Dr. Ana Silva',
    attachmentUrl: '/videos/exercicio_rotacao.mp4',
    read: true
  },
  {
    id: '5',
    sender: 'patient',
    content: 'Perfeito! Muito obrigado pelo vídeo. Vou seguir essa versão modificada.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'text',
    read: true
  },
  {
    id: '6',
    sender: 'provider',
    content: 'Lembre-se: se sentir dor intensa, pare imediatamente. Vamos nos falar amanhã após seus exercícios, ok?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'text',
    providerName: 'Dr. Ana Silva',
    read: false
  }
];

export default function PatientChat() {
  const [selectedProvider, setSelectedProvider] = useState<Provider>(mockProviders[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `há ${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate provider typing
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'provider',
          content: 'Recebi sua mensagem! Vou analisar e te responder em breve.',
          timestamp: new Date(),
          type: 'text',
          providerName: selectedProvider.name,
          read: false
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatedContainer className="h-full flex">
      {/* Sidebar com lista de profissionais */}
      <div className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-600 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversas
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            Fale com sua equipe médica
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {mockProviders.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 cursor-pointer border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                selectedProvider.id === provider.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedProvider(provider)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {provider.avatar}
                  </div>
                  {provider.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    {provider.role}
                  </p>
                  {!provider.online && provider.lastSeen && (
                    <p className="text-xs text-gray-400 dark:text-dark-500">
                      Visto {formatLastSeen(provider.lastSeen)}
                    </p>
                  )}
                </div>
                {provider.online && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área do chat */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-900">
        {/* Header do chat */}
        <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {selectedProvider.avatar}
              </div>
              {selectedProvider.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-800"></div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {selectedProvider.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                {selectedProvider.online ? 'Online' : 'Offline'} • {selectedProvider.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Área das mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md ${
                  message.sender === 'patient'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-600'
                } rounded-lg p-3 shadow-sm`}
              >
                {message.sender === 'provider' && (
                  <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">
                    {message.providerName}
                  </p>
                )}
                
                {message.type === 'file' ? (
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4" />
                    <span className="text-sm">{message.content}</span>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${
                    message.sender === 'patient' 
                      ? 'text-blue-100' 
                      : 'text-gray-400 dark:text-dark-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </span>
                  {message.sender === 'patient' && (
                    <div className={`w-3 h-3 rounded-full ${
                      message.read ? 'bg-blue-200' : 'bg-white'
                    }`} />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {selectedProvider.name} está digitando...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full resize-none rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white p-3 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="p-1">
                  <File className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1">
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-2">
            Pressione Enter para enviar, Shift+Enter para quebrar linha
          </p>
        </div>
      </div>
    </AnimatedContainer>
  );
}
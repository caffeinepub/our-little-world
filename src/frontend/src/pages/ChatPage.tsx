import { useState, useRef, useEffect } from 'react';
import { useGetAllMessages, useSendMessage, useGetCallerUserProfile } from '../hooks/useQueries';
import { useUserProfiles } from '../hooks/useUserProfiles';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import EmojiPicker from '../components/EmojiPicker';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifInput, setShowGifInput] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useGetAllMessages();
  const { data: userProfile } = useGetCallerUserProfile();
  const sendMessage = useSendMessage();

  // Get unique senders from messages
  const uniqueSenders = Array.from(new Set(messages.map((m) => m.senderId)));
  const { profileMap } = useUserProfiles(uniqueSenders);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({
        content: message.trim(),
        messageType: { __kind__: 'text', text: null },
      });
      setMessage('');
      inputRef.current?.focus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleSendGif = async () => {
    if (!gifUrl.trim()) return;

    try {
      await sendMessage.mutateAsync({
        content: gifUrl.trim(),
        messageType: { __kind__: 'gifUrl', gifUrl: gifUrl.trim() },
      });
      setGifUrl('');
      setShowGifInput(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send GIF');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Limit to last 100 messages for performance
  const displayMessages = messages.slice(-100);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Chat 💬</h2>
          <p className="text-sm text-white/80">Share your thoughts and feelings</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No messages yet 💕</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            displayMessages.map((msg) => {
              const isOwn = userProfile && msg.senderId.toString() === userProfile.name;
              const senderProfile = profileMap.get(msg.senderId.toString());
              return (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  isOwn={!!isOwn}
                  senderProfile={senderProfile || undefined}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-pink-100 p-4 bg-white/50">
          {showGifInput ? (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                placeholder="Paste GIF URL..."
                className="flex-1 px-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSendGif()}
              />
              <Button
                onClick={handleSendGif}
                disabled={!gifUrl.trim() || sendMessage.isPending}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowGifInput(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          ) : null}

          <div className="flex gap-2 items-end">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full shrink-0"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowGifInput(!showGifInput)}
                className="rounded-full shrink-0"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </div>

            <Textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 rounded-xl resize-none"
              rows={1}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-full shrink-0"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {showEmojiPicker && (
            <div className="mt-2">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

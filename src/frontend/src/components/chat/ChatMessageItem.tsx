import { format } from 'date-fns';
import type { Message, UserProfile } from '../../backend';

interface ChatMessageItemProps {
  message: Message;
  isOwn: boolean;
  senderProfile?: UserProfile;
}

export default function ChatMessageItem({ message, isOwn, senderProfile }: ChatMessageItemProps) {
  const displayName = senderProfile?.displayName || 'Unknown';
  const initials = displayName.substring(0, 2).toUpperCase();
  const timestamp = new Date(Number(message.timestamp) / 1000000);

  const renderContent = () => {
    switch (message.messageType.__kind__) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
      case 'emoji':
        return <p className="text-4xl">{message.messageType.emoji}</p>;
      case 'gifUrl':
        return (
          <img
            src={message.messageType.gifUrl}
            alt="GIF"
            className="max-w-xs rounded-xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.insertAdjacentHTML('afterend', '<p class="text-sm text-muted-foreground">Failed to load GIF</p>');
            }}
          />
        );
      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${
          isOwn
            ? 'bg-gradient-to-br from-pink-400 to-purple-400'
            : 'bg-gradient-to-br from-blue-400 to-cyan-400'
        }`}
      >
        {initials}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground">{format(timestamp, 'HH:mm')}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-gradient-to-br from-pink-100 to-purple-100 text-foreground'
              : 'bg-white border border-gray-200 text-foreground'
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

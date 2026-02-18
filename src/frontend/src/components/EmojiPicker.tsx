interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞',
    '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩',
    '😊', '☺️', '😌', '😉', '🥳', '🎉', '🎊', '🎈',
    '👍', '👏', '🙌', '🤝', '💪', '✨', '⭐', '🌟',
    '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🎀',
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-pink-100 p-3 grid grid-cols-8 gap-2 max-w-md">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:bg-pink-50 rounded-lg p-2 transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

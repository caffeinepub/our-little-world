export default function FloatingHeartsBackground() {
  const hearts = ['💗', '💕', '💖', '💝', '💓'];
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="floating-heart"
          style={{
            left: `${(i * 12 + 5) % 95}%`,
            animationDelay: `${i * 1.5}s`,
            fontSize: i % 2 === 0 ? '1.5rem' : '1rem',
          }}
        >
          {hearts[i % hearts.length]}
        </div>
      ))}
    </div>
  );
}

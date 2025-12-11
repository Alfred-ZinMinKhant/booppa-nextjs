interface MarqueeProps {
  items: string[];
}

// Note: The actual animation CSS is typically defined in a global stylesheet (e.g., app/globals.css)
// The component duplicates the items to ensure seamless loop
export default function Marquee({ items }: MarqueeProps) {
  // Duplicate items to ensure a seamless looping effect
  const duplicatedItems = [...items, ...items];

  return (
    <div className="overflow-hidden whitespace-nowrap py-4 bg-gray-900/30 rounded-xl border border-gray-800">
      <div className="marquee hover:animation-play-state:paused">
        {duplicatedItems.map((item, index) => (
          <span 
            key={index} 
            className="text-2xl font-extrabold text-white mx-8 p-2 inline-block bg-gray-800 rounded-lg shadow-inner"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

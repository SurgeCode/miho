import { useState, useEffect, useRef } from "react";

export function TypewriterText({ 
  text, 
  onComplete 
}: { 
  text: string, 
  onComplete?: () => void 
}) {
  const [displayedText, setDisplayedText] = useState("");
  const hasCompletedRef = useRef(false);
  const lastTextRef = useRef(text);
  
  useEffect(() => {
    if (text !== lastTextRef.current || !hasCompletedRef.current) {
      lastTextRef.current = text;
      setDisplayedText("");
      
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          hasCompletedRef.current = true;
          if (onComplete) onComplete();
        }
      }, 30);
      
      return () => clearInterval(timer);
    }
  }, [text, onComplete]);
  
  
  return displayedText;
} 
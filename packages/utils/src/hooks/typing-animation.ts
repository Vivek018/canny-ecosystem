import { useEffect, useState } from "react";

interface UseTypingAnimationOptions {
  loop?: boolean;
  typingSpeed?: number;
  pauseDuration?: number;
}

export function useTypingAnimation(
  texts: string[],
  paused = false,
  options: UseTypingAnimationOptions = {},
) {
  const { typingSpeed = 100, pauseDuration = 1500 } = options;

  const [index, setIndex] = useState(0); // Current text index
  const [text, setText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (paused || texts.length === 0) return;

    const currentText = texts[index];

    // Typing effect
    if (charIndex < currentText.length) {
      const typingTimeout = setTimeout(() => {
        setText((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(typingTimeout);
    }

    // Pause before moving to the next text
    const pauseTimeout = setTimeout(() => {
      setIndex((prev) => (prev + 1) % texts.length);
      setCharIndex(0);
      setText(""); // Reset the text for the next typing cycle
    }, pauseDuration);

    return () => clearTimeout(pauseTimeout);
  }, [charIndex, index, texts, typingSpeed, pauseDuration, paused]);

  return text;
}

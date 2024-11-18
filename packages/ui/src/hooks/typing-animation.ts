import { useEffect, useState } from "react";

interface UseTypingAnimationOptions {
  loop?: boolean;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function useTypingAnimation(
  texts: string[],
  paused = false,
  options: UseTypingAnimationOptions = {}
) {
  const {
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 1500,
  } = options;

  const [index, setIndex] = useState(0); // Current text index
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (paused || texts.length === 0) return;

    const currentText = texts[index];

    if (!isDeleting) {
      // Typing effect
      if (charIndex < currentText.length) {
        const typingTimeout = setTimeout(() => {
          setText((prev) => prev + currentText[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);

        return () => clearTimeout(typingTimeout);
      }
      // Pause before deleting
      const pauseTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }
    // Deleting effect
    if (charIndex > 0) {
      const deletingTimeout = setTimeout(() => {
        setText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, deletingSpeed);

      return () => clearTimeout(deletingTimeout);
    }
    // Move to the next text
    setIsDeleting(false);
    setIndex((prev) => (prev + 1) % texts.length);
  }, [
    charIndex,
    isDeleting,
    index,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    paused,
  ]);

  return text;
}

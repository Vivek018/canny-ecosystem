import { useEffect, useRef } from "react";

type UseAnimateTextScrollOptions = {
  pauseDurationMs?: number;
  speed?: number;
};

export function useAnimateTextScroll(
  options: UseAnimateTextScrollOptions = {}
) {
  const containerRef = useRef<any>(null);
  const contentRef = useRef<any>(null);

  const pauseDuration = options.pauseDurationMs ?? 5000;
  const scrollSpeed = options.speed ?? 1;

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let currentX = 0;
    let animFrame: number;
    let timeout: NodeJS.Timeout;

    let scrollDistance = 0;

    const scrollStep = () => {
      currentX -= scrollSpeed;
      content.style.transform = `translateX(${currentX}px)`;

      if (Math.abs(currentX) >= scrollDistance) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          currentX = 0;
        }, pauseDuration);
      } else {
        animFrame = requestAnimationFrame(scrollStep);
      }
    };

    const handleStartScroll = () => {
      if (!container || !content) return;

      scrollDistance = content.scrollWidth - container.offsetWidth;

      if (scrollDistance <= 0) return;

      cancelAnimationFrame(animFrame);
      clearTimeout(timeout);
      animFrame = requestAnimationFrame(scrollStep);
    };

    const handleStopScroll = () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timeout);
      currentX = 0;
      content.style.transform = `translateX(0px)`;
    };

    container.addEventListener("mouseenter", handleStartScroll);
    container.addEventListener("focusin", handleStartScroll);
    container.addEventListener("mouseleave", handleStopScroll);
    container.addEventListener("focusout", handleStopScroll);

    return () => {
      container.removeEventListener("mouseenter", handleStartScroll);
      container.removeEventListener("focusin", handleStartScroll);
      container.removeEventListener("mouseleave", handleStopScroll);
      container.removeEventListener("focusout", handleStopScroll);
      cancelAnimationFrame(animFrame);
      clearTimeout(timeout);
    };
  }, [pauseDuration, scrollSpeed]);

  return { containerRef, contentRef };
}

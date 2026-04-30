import { useState, useEffect } from "react";

export const useTypewriter = (
  text: string,
  speed = 20,
  start = true,
) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!start) return;

    let i = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, start]);

  const isDone = displayText.length === text.length;

  return { displayText, isDone };
};

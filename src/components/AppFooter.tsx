import { useState, useEffect } from "react";

const AppFooter = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <footer className="h-14 bg-foreground text-primary-foreground flex items-center justify-between px-6 sticky bottom-0 z-40">
      {/* Left - TCS Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-foreground rounded flex items-center justify-center">
          <span className="text-foreground font-bold text-xs">TCS</span>
        </div>
      </div>

      {/* Center - Powered by */}
      <div className="text-sm">
        Powered by{" "}
        <a
          href="https://www.tcs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          TCS Interactive
        </a>
      </div>

      {/* Right - Date & Time */}
      <div className="text-sm text-right">
        <span>{formattedDate}</span>
        <span className="mx-2">|</span>
        <span className="font-mono">{formattedTime}</span>
      </div>
    </footer>
  );
};

export default AppFooter;

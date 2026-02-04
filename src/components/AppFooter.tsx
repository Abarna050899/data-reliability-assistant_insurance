import { useState, useEffect } from "react";
import tcsLogoWhite from "@/assets/tcs-logo-white.png";

const AppFooter = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time in Indian Standard Time (IST)
  const formattedDate = dateTime.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const formattedTime = dateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  });

  return (
    <footer className="h-14 bg-foreground text-primary-foreground flex items-center justify-between px-6 sticky bottom-0 z-50">
      {/* Left - TCS Logo */}
      <div className="flex items-center gap-2">
        <img src={tcsLogoWhite} alt="TCS Logo" className="h-6" />
      </div>

      {/* Center - Date & Time + Powered by */}
      <div className="text-sm flex items-center gap-4">
        <span>{formattedDate}</span>
        <span className="font-mono">{formattedTime}</span>
        <span className="mx-2">|</span>
        <span>
          Powered by{" "}
          <a
            href="https://www.tcs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            TCS Interactive
          </a>
        </span>
      </div>

      {/* Right - Empty to balance layout */}
      <div className="w-24"></div>
    </footer>
  );
};

export default AppFooter;

import tcsLogoWhite from "@/assets/tcs-logo-white.png";

const AppFooter = () => {

  return (
    <footer className="h-14 bg-black text-white flex items-center px-6 fixed bottom-0 left-0 right-0 z-50">
      {/* Left - TCS Logo */}
      <div className="flex items-center">
        <img src={tcsLogoWhite} alt="TCS Logo" className="h-8" />
      </div>

      {/* Center - Powered by */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm">
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

      {/* Right - Empty to balance */}
      <div className="w-24"></div>
    </footer>
  );
};

export default AppFooter;

import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
        <span className="text-sm">Powered by</span>
        <a
          href="https://www.tcs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline hover:text-primary transition-colors flex items-center gap-1"
        >
          TCS Interactive
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;

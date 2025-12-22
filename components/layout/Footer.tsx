import { Heart } from "lucide-react";

interface FooterProps {
  names?: string;
  date?: string;
}

export function Footer({ names = "M & M", date }: FooterProps) {
  return (
    <footer className="bg-primary/10 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Heart className="h-4 w-4 fill-current" />
          <span className="font-serif text-lg">{names}</span>
          <Heart className="h-4 w-4 fill-current" />
        </div>
        {date && (
          <p className="mt-2 text-sm text-gray-600">{date}</p>
        )}
        <p className="mt-4 text-xs text-gray-400">
          Made with love
        </p>
      </div>
    </footer>
  );
}

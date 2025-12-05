import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="relative"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <Badge variant="outline" className="absolute -top-3 -right-3 text-[0.6rem] px-1 py-0 border-amber-400 text-amber-500 font-medium">
        Experimental Dark Mode
      </Badge>
    </div>
  );
} 
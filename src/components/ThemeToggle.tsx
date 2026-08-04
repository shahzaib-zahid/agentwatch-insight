import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("agentwatch-theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
  };

  return (
    <Button variant="ghost" size="icon" className="size-7" onClick={toggle} aria-label="Toggle theme">
      {light ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
    </Button>
  );
}

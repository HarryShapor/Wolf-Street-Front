import { useState, useEffect } from "react";

interface NavItem {
  id: string;
  label: string;
}

export function useScrollTracking(NAV: NavItem[]) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("main");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let current = "main";
      for (const section of NAV) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [NAV]);

  return { scrolled, activeSection };
}

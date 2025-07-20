import { useState, useEffect } from "react";

export function usePageAnimations() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 100);
    setTimeout(() => setHeroVisible(true), 400);
  }, []);

  return { headerVisible, heroVisible };
}

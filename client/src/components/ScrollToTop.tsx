import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // Use instant for a professional, snappier feel on route changes
    });
  }, [location]);

  return null;
}

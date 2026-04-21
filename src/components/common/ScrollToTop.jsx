import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // animasi smooth ke atas
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    // handle kalau ada div scroll
    const all = document.querySelectorAll("*");

    all.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
  }, [pathname]);

  return null;
}
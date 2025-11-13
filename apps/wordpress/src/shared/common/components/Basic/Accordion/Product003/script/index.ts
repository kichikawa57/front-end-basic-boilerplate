import { gsap } from "gsap";

export const accordionProduct003 = () => {
  const accordionHeaders = document.querySelectorAll<HTMLElement>(
    ".js-accordion-003-header"
  );

  for (const accordionHeader of Array.from(accordionHeaders)) {
    accordionHeader.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLElement;

      const isOpen = target.classList.contains("open");

      target.classList.toggle("open");

      const nextElement = target.nextElementSibling as HTMLElement;
      const icon = target.querySelector<HTMLElement>(".js-accordion-003-icon");

      if (!nextElement) return;

      const contentInner = nextElement.querySelector<HTMLElement>(
        ".js-accordion-003-content-inner"
      );

      if (!contentInner) return;

      gsap.to(nextElement, {
        height: isOpen ? 0 : "auto",
        duration: 0.3,
        ease: "power2.inOut"
      });

      gsap.to(icon, {
        rotate: isOpen ? 0 : 180,
        duration: 0.1,
        ease: "power2.inOut"
      });
    });
  }
};

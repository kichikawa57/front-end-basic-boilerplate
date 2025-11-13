import gsap from "gsap";

export const verticalRollingText = () => {
  const items = document.querySelectorAll<HTMLElement>(
    ".js-vertical-rolling-text-wrapper"
  );

  const sharedItems = document.querySelectorAll<HTMLElement>(
    ".js-rebita-rolling-text"
  );

  for (const item of Array.from([...items, ...sharedItems])) {
    item.addEventListener("mouseenter", () => {
      const contents = item.querySelector<HTMLElement>(
        ".js-vertical-rolling-text-contents"
      );

      const text = item.querySelector<HTMLElement>(".js-vertical-rolling-text");

      if (!contents || !text) return;

      const textHeight = text.offsetHeight;

      gsap.set(contents, {
        transform: "translateY(0)"
      });

      gsap.to(contents, {
        duration: 0.4,
        transform: `translateY(-${textHeight}px)`,
        ease: "power2.inOut"
      });
    });
  }
};

export const buttonProduct002 = () => {
  const items = document.querySelectorAll<HTMLElement>(
    ".cm-button-002--animation_002"
  );

  for (const item of Array.from(items)) {
    item.addEventListener("mouseenter", () => {
      const icons = item.querySelectorAll<HTMLElement>(".cm-button-002__icon");
      const firstIcon = icons[0];
      const secondIcon = icons[1];

      firstIcon.classList.remove("is-leave");
      secondIcon.classList.remove("is-leave");

      firstIcon.classList.add("is-hover");
      secondIcon.classList.add("is-hover");
    });

    item.addEventListener("mouseleave", () => {
      const icons = item.querySelectorAll<HTMLElement>(".cm-button-002__icon");
      const firstIcon = icons[0];
      const secondIcon = icons[1];

      firstIcon.classList.remove("is-hover");
      secondIcon.classList.remove("is-hover");

      firstIcon.classList.add("is-leave");
      secondIcon.classList.add("is-leave");
    });
  }
};

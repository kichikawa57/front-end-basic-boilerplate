export const toggleProduct002 = () => {
  const boxes = document.querySelectorAll<HTMLElement>(".js-cm-toggle-002");

  for (const box of Array.from(boxes)) {
    box.addEventListener("click", () => {
      if (
        !box.classList.contains("is-open") &&
        !box.classList.contains("is-close")
      ) {
        box.classList.add("is-open");
        return;
      }

      if (box.classList.contains("is-close")) {
        box.classList.remove("is-close");
        box.classList.add("is-open");
        return;
      }

      if (box.classList.contains("is-open")) {
        box.classList.remove("is-open");
        box.classList.add("is-close");
        return;
      }
    });
  }
};

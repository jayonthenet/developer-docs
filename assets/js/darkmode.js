const prefersDarkTheme = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

document.addEventListener("DOMContentLoaded", function () {
  /* eslint-disable quotes */
  const modeElements = document.getElementsByClassName("mode");
  for (const mode of modeElements) {
    if (mode !== null) {
      mode.addEventListener("click", () => {
        document.documentElement.toggleAttribute("data-dark-mode");
        if (document.documentElement.hasAttribute("data-dark-mode")) {
          localStorage.setItem("theme", "dark");
          document.body.dispatchEvent(new CustomEvent("dark-theme-set"));
        } else {
          localStorage.setItem("theme", "light");
          document.body.dispatchEvent(new CustomEvent("light-theme-set"));
        }
      });
    }
  }

  if (prefersDarkTheme()) {
    document.documentElement.setAttribute("data-dark-mode", "");
    localStorage.setItem("theme", "dark");
    document.body.dispatchEvent(new CustomEvent("dark-theme-set"));
  } else {
    document.documentElement.removeAttribute("data-dark-mode");
    localStorage.setItem("theme", "light");
    document.body.dispatchEvent(new CustomEvent("light-theme-set"));
  }

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        localStorage.setItem("theme", "dark");
        document.documentElement.setAttribute("data-dark-mode", "");
        document.body.dispatchEvent(new CustomEvent("dark-theme-set"));
      } else {
        localStorage.setItem("theme", "light");
        document.documentElement.removeAttribute("data-dark-mode");
        document.body.dispatchEvent(new CustomEvent("light-theme-set"));
      }
    });

  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.setAttribute("data-dark-mode", "");
    document.body.dispatchEvent(new CustomEvent("dark-theme-set"));
  } else {
    document.documentElement.removeAttribute("data-dark-mode");
    document.body.dispatchEvent(new CustomEvent("light-theme-set"));
  }
});

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-dark-mode", "");
} else {
  document.documentElement.removeAttribute("data-dark-mode");
}

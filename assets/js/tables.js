/* eslint-disable quotes */
const tables = document.querySelectorAll("table");

tables.forEach((table) => {
  const wrapper = document.createElement("div");
  wrapper.style.overflowX = "scroll";
  wrapper.style.marginBottom = "1rem";
  table.parentNode.replaceChild(wrapper, table);
  wrapper.appendChild(table);
});

const mobileMenu = document.getElementById('mobile-docs-sidebar');
const mobileMenuToggle = document.getElementById('open-side-menu-button');

if (mobileMenuToggle !== null) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('d-none');
  });
}

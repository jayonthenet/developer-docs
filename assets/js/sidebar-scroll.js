window.addEventListener('scroll', function () {
  const secondSection = document.querySelector('.sidebar-hot-content');
  const isGuidesPage = document.querySelector('.guides-navigation');
  if (secondSection) {
    const maxRemValue = isGuidesPage ? 10 : 5;
    if (window.scrollY <= 80) {
      const percentage = (window.scrollY / 80) * 100;
      const bottomValue = (
        maxRemValue -
        (maxRemValue * percentage) / 100
      ).toFixed(2);
      secondSection.style.bottom = bottomValue + 'rem';
    } else {
      secondSection.style.bottom = '0';
    }
  }
});

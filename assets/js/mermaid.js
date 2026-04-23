/* eslint-disable quotes */
import mermaid from 'mermaid';
import data from './data/mermaid.json';

/* securityLevel 'loose' is required for opening links in new tabs */
const lightModeConfig = {
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    ...data.light,
  },
};

/* securityLevel 'loose' is required for opening links in new tabs */
const darkModeConfig = {
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    ...data.dark,
  },
};

window.mermaid = mermaid;
window.lightModeConfig = lightModeConfig;
window.darkModeConfig = darkModeConfig;

const elements = document.querySelectorAll('.language-mermaid');
elements.forEach((ele) => {
  ele.setAttribute('data-src', ele.innerHTML);
});

const loadMermaid = (config) => {
  mermaid.initialize(config);
  mermaid.init(config, document.querySelectorAll('.language-mermaid'));
};

const resetProcessed = () => {
  return new Promise((resolve) => {
    elements.forEach((ele) => {
      ele.innerHTML = ele.getAttribute('data-src') || '';
      ele.removeAttribute('data-processed');
    });
    resolve();
  });
};

window.resetMermaidDiagrams = resetProcessed;

const init = () => {
  document.body.addEventListener('dark-theme-set', () => {
    resetProcessed().then(loadMermaid(darkModeConfig)).catch(console.error);
  });
  document.body.addEventListener('light-theme-set', () => {
    resetProcessed().then(loadMermaid(lightModeConfig)).catch(console.error);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  init();
  if (localStorage.getItem('theme') === 'dark') {
    loadMermaid(darkModeConfig);
  } else {
    loadMermaid(lightModeConfig);
  }
});

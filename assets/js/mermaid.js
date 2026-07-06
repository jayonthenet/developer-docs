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

window.mermaid = mermaid;
window.lightModeConfig = lightModeConfig;

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

document.addEventListener('DOMContentLoaded', () => {
  loadMermaid(lightModeConfig);
});

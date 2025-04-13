import {Wheel} from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';
window.onload = () => {

    const props = {
      items: [
        {
          label: 'one',
        },
        {
          label: 'two',
        },
        {
          label: 'three',
        },
      ],
    };
  
    const container = document.querySelector('.wheel-wrapper');
  
    window.wheel = new Wheel(container, props);
  
  };
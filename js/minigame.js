//TO-DO
//1)TRIGGER ONREST TO GO BACK 
//2)SET TIMERS FOR INACTIVITY TO GO BACK

import {Wheel} from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';
//USER DEFINED VARIABLES
var slicevalues = [];
var winningitemindex=0;
var revolutions=5;
var duration=3000;


//GLOBAL VARIABLES
var leftsep=document.getElementById('leftsep');
var rightsep=document.getElementById('rightsep');

window.onload = () => {
  const props = {
    items: 
    [        
      {label: 'one'},
      {label: 'two'},
      {label: 'three'},
    ],
    onRest: e => console.log(e),
  };
  const container = document.querySelector('.wheel-wrapper');
  window.wheel = new Wheel(container, props);


  // props.items.push({ label: 'four' });
  // props.items.push({ label: 'five' });

  // props.items.forEach(item => {
  //   console.log(item.label);
  // });

  const spinleft=function(){
    wheel.spinToItem(winningitemindex,duration,false,1,revolutions,null);
    rightsep.removeEventListener('mouseleave',spinright);
    leftsep.removeEventListener('mouseleave',spinleft);
  }
  const spinright=function(){
    wheel.spinToItem(winningitemindex,duration,false,-1,revolutions,null);
    leftsep.removeEventListener('mouseleave',spinleft);
    rightsep.removeEventListener('mouseleave',spinright);
  }

  leftsep.addEventListener('mouseleave',spinleft);
  rightsep.addEventListener('mouseleave',spinright);

  
    
  
};



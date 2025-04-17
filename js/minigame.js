//TO-DO
//1)FUNCTION TO APPEND ITEMS
//2)FUNCTION TO ADD IMAGES


import {Wheel} from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';
//USER DEFINED VARIABLES
var slicevalues = [];
var winningitemindex=0;//BACKEND FUNCTION NEEDED HERE
var winningitemimage="media/"+winningitemindex+".png";
var revolutions=4;
var duration=1000;
var url="product.html";
var onstopchangedelay=0;
var inactivitychangedelay=0;
var promocode=123456;//BACKEND FUNCTION NEEDED HERE


//GLOBAL VARIABLES
var leftsep=document.getElementById('leftsep');
var rightsep=document.getElementById('rightsep');
var wheelstart=0;
var text1=document.getElementById('text1');
var text2=document.getElementById('text2');
var text3=document.getElementById('text3');
var prizeimage=document.getElementById('prizeimage');

window.onload = () => {
  const props = {
    items: 
    [        
      {label: '10%'},
      {label: '20%'},
      {label: '30%'},
    ],
    onRest: onwheelstop,
  };
  const container = document.querySelector('.wheel-wrapper');
  window.wheel = new Wheel(container, props);
  changepageinactivity();


  // props.items.push({ label: 'four' });
  // props.items.push({ label: 'five' });

  // props.items.forEach(item => {
  //   console.log(item.label);
  // });

  const spinleft=function(){
    //wheel.spinToItem(0,500,true,1,1,null);
    wheel.spinToItem(winningitemindex,duration,false,revolutions,1,null);
    rightsep.removeEventListener('mouseleave',spinright);
    leftsep.removeEventListener('mouseleave',spinleft);
    wheelstart=1;
  }
  const spinright=function(){
    wheel.spinToItem(winningitemindex,duration,false,revolutions,-1,null);
    leftsep.removeEventListener('mouseleave',spinleft);
    rightsep.removeEventListener('mouseleave',spinright);
    wheelstart=1;
  }
  leftsep.addEventListener('mouseleave',spinleft);
  rightsep.addEventListener('mouseleave',spinright);

  function onwheelstop(){
    changepageononwheelstop();
    displayprize();
  }
  function changepageononwheelstop() {
    setTimeout(function() {
      if(inactivitychangedelay!=0)
        window.location.href = url;
    }, onstopchangedelay);
  }
  function changepageinactivity() {
    setTimeout(function() {
      if((wheelstart==0)&&(inactivitychangedelay!=0)){
        window.location.href = url;
      }
    }, inactivitychangedelay);
  }
  function displayprize(){
    prizeimage.src=winningitemimage;
    text1.innerHTML="Συγχαρητήρια κέρδισες έκπτωση "+props.items[0].label+" για το :";
    text2.innerHTML="Φωτογράφισε τον κωδικό και εξαργύρωσε τον εντός του καταστήματος!";
    text3.innerHTML=promocode;
  }
};



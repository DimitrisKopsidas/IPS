//TO-DO
//1)FUNCTION TO APPEND ITEMS
//2)FUNCTION TO ADD IMAGES


  // props.items.push({ label: 'four' });
  // props.items.push({ label: 'five' });

  // props.items.forEach(item => {
  //   console.log(item.label);
  // });



import {Wheel} from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';
//USER DEFINED VARIABLES
var winningitemindex=1;//BACKEND
var revolutions=4;//DB
var spinduration=3000;//DB
var onstopchangedelay=3000;//DB
var inactivitychangedelay=0;//DB
var promocode=123456;//BACKEND


//PROGRAM VARIABLES
var leftsep=document.getElementById('leftsep');
var rightsep=document.getElementById('rightsep');
var wheelstartbyseparator=0;
var text1=document.getElementById('text1');
var text2=document.getElementById('text2');
var text3=document.getElementById('text3');
var prizeimage=document.getElementById('prizeimage');
var winningitemimage="media/"+winningitemindex+".png";
var carouselurl="carousel.html";


window.onload = () => {
  var overlay=new Image();
  overlay.src='media/overlay.svg';//INITIALIZE OVERLAY AS IMAGE
  const props = {//INITIALIZE WHEEL
    items: //BACKEND FUNCTION NEEDED HERE
    [        
      {label: '10%'},
      {label: '20%'},
      {label: '30%'},
    ],
    onRest: onwheelstop,
    overlayImage: overlay,
  };
  const container = document.querySelector('.wheel-wrapper');
  window.wheel = new Wheel(container, props);
  changepageoninactivity();
  const spinleft=function(){//SPIN WHEEL AND DISABLE ITSELF AND OTHER SEPARATOR ACTIVATION
    wheel.spinToItem(winningitemindex,spinduration,false,revolutions,1,null);
    rightsep.removeEventListener('mouseover',spinright);
    leftsep.removeEventListener('mouseover',spinleft);
    wheelstartbyseparator=1;
    console.log("left");
  }
  const spinright=function(){//SPIN WHEEL AND DISABLE ITSELF AND OTHER SEPARATOR ACTIVATION
    wheel.spinToItem(winningitemindex,spinduration,false,revolutions,-1,null);
    leftsep.removeEventListener('mouseover',spinleft);
    rightsep.removeEventListener('mouseover',spinright);
    wheelstartbyseparator=1;
    console.log("right");
  }
  leftsep.addEventListener('mouseover',spinleft);
  rightsep.addEventListener('mouseover',spinright);

  function onwheelstop(){
    if(wheelstartbyseparator==1){
      changepageononwheelstop();
      displayprize();
    }
  }
  function changepageononwheelstop() {
    setTimeout(function() {
      if(onstopchangedelay!=0)
        window.location.href = carouselurl;
    }, onstopchangedelay);
  }
  function changepageoninactivity() {
    setTimeout(function() {
      if((wheelstartbyseparator==0)&&(inactivitychangedelay!=0)){
        window.location.href = carouselurl;
      }
    }, inactivitychangedelay);
  }
  function displayprize(){
    prizeimage.src=winningitemimage;
    text1.innerHTML="Συγχαρητήρια κέρδισες έκπτωση "+props.items[winningitemindex].label+" για το :";
    text2.innerHTML="Φωτογράφισε τον κωδικό και εξαργύρωσε τον εντός του καταστήματος!";
    text3.innerHTML=promocode;
  }
};



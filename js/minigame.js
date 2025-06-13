//TO-DO
//1)FUNCTION TO APPEND ITEMS
//2)FUNCTION TO ADD IMAGES
//3)SLICE SIZE ACCORDING TO CHANCE
//4)DISPLAY DEATHDATE


  // props.items.push({ label: 'four' });
  // props.items.push({ label: 'five' });

  // props.items.forEach(item => {
  //   console.log(item.label);
  // });



import {Wheel} from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';
//USER DEFINED VARIABLES
var winningItemIndex=1;//BACKEND
var revolutions=4;//DB
var spinDuration=3000;//DB
var onstopchangedelay=3000;//DB
var inactivitychangedelay=0;//DB
var promocode=123456;//BACKEND


//PROGRAM VARIABLES
var leftSep=document.getElementById('leftSep');
var rightSep=document.getElementById('rightSep');
var wheelStartBySeparator=0;
var text1=document.getElementById('text1');
var text2=document.getElementById('text2');
var text3=document.getElementById('text3');
var prizeimage=document.getElementById('prizeimage');
var winningitemimage="media/"+winningItemIndex+".png";
var carouselurl="carousel.html";
var overlay=new Image();
overlay.src='media/overlay.svg';//INITIALIZE OVERLAY AS IMAGE

document.addEventListener('DOMContentLoaded', async () => {
    // Load overlay first
    const overlay = new Image();
    overlay.src = 'media/overlay.svg';

    // Wait for overlay to load before initializing wheel
    await new Promise((resolve, reject) => {
        overlay.onload = resolve;
        overlay.onerror = () => {
            console.error('Failed to load overlay image');
            reject(new Error('Overlay load failed'));
        };
    });

    const props = {
        items: [        
            {label: '10%'},
            {label: '20%'},
            {label: '30%'},
        ],
        onRest: onStop,
        overlayImage: overlay,
    };

    try {
        const container = document.querySelector('.wheel-wrapper');
        window.wheel = new Wheel(container, props);
        changePageOnInactivity();
    } catch (error) {
        console.error('Error initializing wheel:', error);
    }

    const spinLeft=function(){//SPIN WHEEL AND DISABLE ITSELF AND OTHER SEPARATOR ACTIVATION
        wheel.spinToItem(winningItemIndex,spinDuration,false,revolutions,1,null);
        rightSep.removeEventListener('mouseover',spinRight);
        leftSep.removeEventListener('mouseover',spinLeft);
        wheelStartBySeparator=1;
    }
    const spinRight=function(){//SPIN WHEEL AND DISABLE ITSELF AND OTHER SEPARATOR ACTIVATION
        wheel.spinToItem(winningItemIndex,spinDuration,false,revolutions,-1,null);
        leftSep.removeEventListener('mouseover',spinLeft);
        rightSep.removeEventListener('mouseover',spinRight);
        wheelStartBySeparator=1;
        console.log("right");
    }
    leftSep.addEventListener('mouseover',spinLeft);
    rightSep.addEventListener('mouseover',spinRight);

    function onStop(){
        if(wheelStartBySeparator==1){
        changePageOnStop();
        displayPrize();
        }
    }

    function changePageOnStop() {
        setTimeout(function() {
        if(onstopchangedelay!=0)
            window.location.href = carouselurl;
        }, onstopchangedelay);
    }

    function changePageOnInactivity() {
        setTimeout(function() {
        if((wheelStartBySeparator==0)&&(inactivitychangedelay!=0)){
            window.location.href = carouselurl;
        }
        }, inactivitychangedelay);
    }

    function displayPrize(){
        prizeimage.src=winningitemimage;
        text1.innerHTML="Συγχαρητήρια κέρδισες έκπτωση "+props.items[winningItemIndex].label+" για το :";
        text2.innerHTML="Φωτογράφισε τον κωδικό και εξαργύρωσε τον εντός του καταστήματος!";
        text3.innerHTML=promocode;
    }
});



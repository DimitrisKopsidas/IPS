//WISHLIST
//1)WAIT PER IMAGE
//2)TIME OF WATCHING PER ITEM 
//3)VIDEO INSTEAD OF IMAGE

//LOW PRIO
//1)IMPLEMENT BACK SWIPE

import { fetchCarouselProducts, fetchCarouselSettings, updateDeviceLastPing,
  fetchCarouselSettingsCarouselId, fetchCarouselProductsCarouselId,
  fetchMinigamePromos } from './dbService.js';

// #region VARIABLE DECLARATION
var car;
var flkty
var autoplayWait;
var autoplaySpeed;
var countForMinigame;
var prevSlide=0;
var currSlide;
var actionFlag=0;
var actionCount=1;
var timeoutID;
var nextPageUrl;
var actionWindow;
var media = [];
let products = [];
let settings = [];
let minigamePromos = [];
let state;
let carouselId;
let connectkey;
let isPreview = false; 
let carouselSource;
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    connectkey = params.get('connectkey');
    isPreview = params.get('preview');
    carouselSource = params.get('carousel');
    minigamePromos = await fetchMinigamePromos(connectkey);

    if (isPreview != 1) {
      products = await fetchCarouselProducts(connectkey);
      settings = await fetchCarouselSettings(connectkey);
      nextPageUrl = `minigame.html?connectkey=${connectkey}`;
    } else {
      products = await fetchCarouselProductsCarouselId(carouselSource);
      settings = await fetchCarouselSettingsCarouselId(carouselSource);
      nextPageUrl = `carousel.html?id=${carouselSource}`;
    }

    autoplayWait = settings[0].AUTOPLAYWAIT;
    autoplaySpeed = settings[0].SPEED;
    countForMinigame = settings[0].GAMECOUNT;
    actionWindow = autoplayWait + 2000;
    state = settings[0].STATE;
    carouselId = settings[0].ID;
    updateData();
    
    car = document.querySelector('.carousel');
    flkty = new Flickity(car, { 
        wrapAround: true,
        prevNextButtons: false,
        pageDots: false,
        autoPlay: autoplaySpeed,
        pauseAutoPlayOnHover: true
    });

    products.forEach((product) => {
        flkty.insert(createCell(product));
    });

    media = products.map(p => p.PRODUCT); 
    
  } catch (error) {
      console.error('Error loading carousel data:', error);
  }

  car.addEventListener('click', function() {  //RESTART AUTOPLAY AFTER INTERACTION
    flkty.stopPlayer();
    setTimeout(function(){
      flkty.playPlayer();
    },autoplayWait);
    
  });

  car.addEventListener('click',function(){ //SAVE USER INTERACTION TIME FOR MINIGAME START
    actionFlag=1;
    clearTimeout(timeoutID);
    console.log("Action Start Flag:"+actionFlag+" Count:"+actionCount);

    timeoutID = setTimeout(function(){ //RESET
      actionCount=0;
      actionFlag=0;
      console.log("Action End");
    },actionWindow)   
  })

  // Add keyboard event listener for arrow keys
  document.addEventListener('keydown', function(event) {
    // Check if left arrow key is pressed
    if (event.key === 'ArrowLeft' || event.keyCode === 37) {
      event.preventDefault(); // Prevent default scroll behavior
      if (flkty) {
        flkty.previous(); // Go to previous item
        // Restart autoplay after manual navigation
        flkty.stopPlayer();
        setTimeout(function(){
          flkty.playPlayer();
        }, autoplayWait);
        
        // Trigger action tracking for minigame
        triggerActionTracking();
      }
      console.log("Left arrow pressed - Previous item");
    }
    
    // Check if right arrow key is pressed
    if (event.key === 'ArrowRight' || event.keyCode === 39) {
      event.preventDefault(); // Prevent default scroll behavior
      if (flkty) {
        flkty.next(); // Go to next item
        // Restart autoplay after manual navigation
        flkty.stopPlayer();
        setTimeout(function(){
          flkty.playPlayer();
        }, autoplayWait);
        
        // Trigger action tracking for minigame
        triggerActionTracking();
      }
      console.log("Right arrow pressed - Next item");
    }
  });

  flkty.on('change', async function(index) { //LISTENER FOR CELL IN FOCUS
    currSlide=index;
    backSwipeListener(currSlide,prevSlide);
    minigameListener(currSlide,prevSlide);
    prevSlide=index;
  });
});

// #region FUNCTIONS
function createCell(product) {
    var cell = document.createElement('div');
    cell.className = 'carousel-cell';
    
    const imgElement = document.createElement('img');
    imgElement.src = `media/${product.PRODUCT}.png`;
    imgElement.onerror = () => imgElement.src = 'media/404.png';
    
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'product-info-overlay';
    
    const priceDisplay = product.DISCOUNT > 0 
        ? `<div class="product-price">From
             <span class="original-price">$${product.PRICE || '0.00'}</span>
              to
             <span class="final-price">$${product.FINALPRICE || '0.00'}</span>
           </div>`
        : `<div class="product-price">$${product.PRICE || '0.00'}</div>`;
    
    infoOverlay.innerHTML = `
        <div class="product-title">${product.NAME || 'Product Name'}</div>
        ${priceDisplay}
        ${product.DISCOUNT > 0 ? `<div class="product-discount">Discount: -${(product.DISCOUNT * 100)}%</div>` : ''}
    `;
    
    cell.appendChild(imgElement);
    cell.appendChild(infoOverlay);
    
    return cell;
}

function backSwipeListener(current,prev){
  // if((current<prev)&&(current!=0)){
  //   console.log('SWIPE EVENT');
  // }
  // if((current==media.length)&&(prev==0)){
  //   console.log('SWIPE EVENT1');
  // }
  // if((current==0)&&(prev==1)){
  //   console.log('SWIPE EVENT2');
  // }
}

function minigameListener(current,prev){
  if ((actionFlag==1) && (current>prev)) {
      actionCount+=1;
      if((current==media.length) && (prev==0))
      actionCount-=1;
  }
  if ((actionFlag==1) && (current==0) && (prev==media.length)) {
    actionCount+=1;
  }
  
  console.log("Flag:"+actionFlag+" Count:"+actionCount);
  if (actionCount >= countForMinigame) {
    if (minigamePromos.length != 0 && countForMinigame !== 0) {
      console.log("Minigame threshold reached - navigating to minigame");
      window.location.href = nextPageUrl;
    }
  }
}

function triggerActionTracking() {
  // Trigger the same action tracking used for click events
  actionFlag = 1;
  clearTimeout(timeoutID);
  console.log("Keyboard Action Start Flag:" + actionFlag + " Count:" + actionCount);

  timeoutID = setTimeout(function(){ // RESET
    actionCount = 0;
    actionFlag = 0;
    console.log("Keyboard Action End");
  }, actionWindow);
}

async function updateData() {
  setInterval(async () => {
    if (isPreview != 1) {
      try {
        await updateDeviceLastPing(connectkey);
      } catch (error) {
        console.error('Failed to update device ping:', error);
      }
    }
    try {
      if (isPreview != 1) {
        settings = await fetchCarouselSettings(connectkey);
        console.log('Settings fetched for connectkey:', connectkey);
      } else {
        settings = await fetchCarouselSettingsCarouselId(carouselSource);
        console.log('Settings fetched for carousel source:', carouselSource);
      }
      
      if (settings[0].STATE !== state) {
        location.reload();
      };
    } catch (error) {
        console.error('Failed to fetching state:', error);
    }
  }, 1000);
}

// #endregion FUNCTIONS

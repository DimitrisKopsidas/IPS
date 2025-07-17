//WISHLIST
//1)WAIT PER IMAGE
//2)TIME OF WATCHING PER ITEM 
//3)VIDEO INSTEAD OF IMAGE

//LOW PRIO
//1)IMPLEMENT BACK SWIPE

import { fetchCarouselProducts, fetchCarouselSettings, updateDeviceLastPing } from './dbService.js';

// #region VARIABLE DECLARATION
var car;
var flkty
var autoplayWait;
var autoplaySpeed;
var countforminigame;
var prevSlide=0;
var currSlide;
var actionFlag=0;
var actionCount=1;
var timeoutID;
var minigameURL;
var actionWindow;
var media = [];
let products = [];
let settings = [];
let state;
let connectkey;
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        connectkey = params.get('connectkey');

        products = await fetchCarouselProducts(connectkey);
        settings = await fetchCarouselSettings(connectkey);

        minigameURL = `minigame.html?connectkey=${connectkey}`;
        autoplayWait = settings[0].AUTOPLAYWAIT;
        autoplaySpeed = settings[0].SPEED;
        countforminigame = settings[0].GAMECOUNT;
        actionWindow = autoplayWait + 2000;
        state = settings[0].STATE;
        
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

        flkty.on('change', async (index) => {
            try {
                await updateDeviceLastPing(connectkey);
                console.log('Updated device ping on cell change:', index);
            } catch (error) {
                console.error('Failed to update device ping:', error);
            }
        });        
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

  flkty.on('change', async function(index) { //LISTENER FOR CELL IN FOCUS
    currSlide=index;
    backSwipeListener(currSlide,prevSlide);
    minigameListener(currSlide,prevSlide);
    prevSlide=index;
    settings = await fetchCarouselSettings(connectkey);
    if (settings[0].STATE !== state) {
            location.reload();
    };
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
  if (actionCount == (countforminigame)) {
    window.location.href = minigameURL;
  }
}
// #endregion FUNCTIONS

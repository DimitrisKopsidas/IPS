//WISHLIST
//1)WAIT PER IMAGE
//2)HAND GIF "SWIPE ME" THAT APPEARS ON STANDARD INTERVALS
//3)TIME OF WATCHING PER ITEM 

//LOW PRIO
//1)IMPLEMENT BACK SWIPE


import { fetchCarouselProducts, fetchCarouselSettings, updateDeviceLastPing } from './dbService.js';

var car;
var flkty
var autoplaywait;
var autoplayspeed;
var countforminigame;
var prevslide=0;
var currentslide;
var actionflag=0;
var actioncount=1;
var timeoutID;
var minigameURL;
var actionwindow;
var media = [];
let products = [];
let settings = [];
let state;
let connectkey;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        connectkey = params.get('connectkey')/* || 'default'*/;

        products = await fetchCarouselProducts(connectkey);
        settings = await fetchCarouselSettings(connectkey);

        minigameURL = `minigame.html?connectkey=${connectkey}`;
        autoplaywait = settings[0].AUTOPLAYWAIT;
        autoplayspeed = settings[0].SPEED;
        countforminigame = settings[0].GAMECOUNT;
        actionwindow = autoplaywait + 2000;
        state = settings[0].STATE;
        
        car = document.querySelector('.carousel');
        flkty = new Flickity(car, { 
            wrapAround: true,
            prevNextButtons: false,
            pageDots: false,
            autoPlay: autoplayspeed,
            pauseAutoPlayOnHover: true
        });

        products.forEach((product) => {
            flkty.insert(makeCell(product));
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

        // Add change event listener to Flickity
        
    } catch (error) {
        console.error('Error loading carousel data:', error);
    }

  
  
  //RESTART AUTOPLAY AFTER INTERACTION
  car.addEventListener('click', function() {
    flkty.stopPlayer();
    setTimeout(function(){
      flkty.playPlayer();
    },autoplaywait);//WAIT TIME AFTER STARTING AUTOPLAY
    
  });

  //SAVE USER INTERACTION TIME FOR MINIGAME START
  car.addEventListener('click',function(){
    actionflag=1;
    clearTimeout(timeoutID);
    console.log("Action Start Flag:"+actionflag+" Count:"+actioncount);

    timeoutID = setTimeout(function(){//RESET
      actioncount=0;
      actionflag=0;
      console.log("Action End");
    },actionwindow)   
  })

  //LISTENER FOR CELL IN FOCUS
  flkty.on('change', async function(index) {
    currentslide=index;
    backSwipeListener(currentslide,prevslide);
    minigameListener(currentslide,prevslide);
    prevslide=index;
    settings = await fetchCarouselSettings(connectkey);
    if (settings[0].STATE !== state) {
            location.reload();
    };
  });
});

function makeCell(product) {
    var cell = document.createElement('div');
    cell.className = 'carousel-cell';
    
    // Add product image
    const imgElement = document.createElement('img');
    imgElement.src = `media/${product.PRODUCT}.png`;
    imgElement.onerror = () => imgElement.src = 'media/404.png';
    
    // Add product info overlay
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'product-info-overlay';
    
    // Format price display based on discount
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
  if((current<prev)&&(current!=0)){
    //console.log('SWIPE EVENT');
  }
  if((current==media.length)&&(prev==0)){
    //console.log('SWIPE EVENT1');
  }
  if((current==0)&&(prev==1)){
    //console.log('SWIPE EVENT2');
  }
}

function minigameListener(current,prev){
  if((actionflag==1)&&(current>prev)){
      actioncount+=1;
      if((current==media.length)&&(prev==0))
      actioncount-=1;
  }
  if((actionflag==1)&&(current==0)&&(prev==media.length)){
    actioncount+=1;
  }
  
  console.log("Flag:"+actionflag+" Count:"+actioncount);
  if(actioncount==(countforminigame)){
    window.location.href = minigameURL;
  }
}

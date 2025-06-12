//WISHLIST
//1)WAIT PER IMAGE
//2)HAND GIF "SWIPE ME" THAT APPEARS ON STANDARD INTERVALS
//3)TIME OF WATCHING PER ITEM 
//4)IMPLIMENT LASTPING

//TO DO
//1)DIV TO DISPLAY PRICE AND DISCOUNT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//2)IMPLIMENT WAIT TIME TO PREVENT ABUSE


import { fetchProducts, fetchMakers, fetchTypes, fetchCarouselImages } from './dbService.js';




//USER DEFINED VARIABLES
var autoplaywait =1000;//DB
var autoplayspeed = 3000;//DB
var media = [];//BACKEND
var countforminigame=4;//DB

//PROGRAM VARIABLES
var prevslide=0;
var currentslide;
var actionflag=0;
var actioncount=1;
var timeoutID;
var minigameURL;
var actionwindow=autoplaywait+2000;
let products = [];

//CAROUSEL CREATION AND ATTRIBUTES
document.addEventListener('DOMContentLoaded', async () => {
    
    try {
        // Get storefront from URL parameters
        const params = new URLSearchParams(window.location.search);
        const connectkey = params.get('connectkey')/* || 'default'*/;
        minigameURL = `minigame.html?connectkey=${connectkey}`;
        
        // Fetch carousel images using storefront parameter
        products = await fetchCarouselImages(connectkey);
        
        var car = document.querySelector('.carousel');
        var flkty = new Flickity(car, { 
            wrapAround: true,
            prevNextButtons: false,
            pageDots: false,
            autoPlay: autoplayspeed,
            pauseAutoPlayOnHover: true
        });
        
        // Append cells using products from database
        products.forEach((product) => {
            flkty.insert(makeCell(product));
        });

        // Update media length for minigame logic
        media = products.map(p => p.PRODUCT);

    } catch (error) {
        console.error('Error loading carousel images:', error);
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
  flkty.on('change', function(index) {
    currentslide=index;
    swipeListener(currentslide,prevslide);
    minigameListener(currentslide,prevslide);
    prevslide=index;
  });
});

// Update makeCell function to handle product data
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
    
    infoOverlay.innerHTML = `
        <div class="product-title">${product.NAME || 'Product Name'}</div>
        <div class="product-price">Price: $${product.PRICE || '0.00'}</div>
        <div class="product-discount">Discount: ${(product.DISCOUNT * 100) || '0'}%</div>
    `;
    
    cell.appendChild(imgElement);
    cell.appendChild(infoOverlay);
    
    return cell;
}

//LISTEN FOR BACK SWIPES
function swipeListener(current,prev){
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

//COUNT ACTIONS TO START MINIGAME
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

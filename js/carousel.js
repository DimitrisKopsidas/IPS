//WISHLIST
//1)WAIT PER IMAGE
//2)HAND GIF "SWIPE ME" THAT APPEARS ON STANDARD INTERVALS
//3)TIME OF WATCHING PER ITEM 

//TO DO
//1)DIV TO DISPLAY PRICE AND DISCOUNT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//2)IMPLEMENT WAIT TIME TO PREVENT ABUSE

//USER DEFINED VARIABLES
var autoplaywait =1000;//DB
var autoplayspeed = 3000;//DB
var media = ["media/2.png","media/3.png","media/4.png"];//BACKEND
var countforminigame=5;//DB

//PROGRAM VARIABLES
var prevslide=0;
var currentslide;
var onclickindex;
var actionflag=0;
var actioncount=1;
var timeoutID;
var url="minigame.html";
var actionwindow=autoplaywait+2000;

//CAROUSEL CREATION AND ATTRIBUTES
document.addEventListener('DOMContentLoaded', function() {
  var car = document.querySelector('.carousel');
  var flkty = new Flickity(car, { 
      wrapAround: true, //ENDLESS LOOP
      prevNextButtons: false, //LEFT-RIGHT BUTTONS
      pageDots: false, //BOTTOM CELL DOTS 
      autoPlay: autoplayspeed, //AUTOPLAY SCROLLING
      pauseAutoPlayOnHover: true //STOP AUTOPLAY ON MOUSE HOVER
  });
  
  //APPEND CELLS TO CAROUSEL
  for (let i = 0; i< media.length;i++){
    var imgpath = media[i];
    flkty.insert(makeCell(imgpath,i))
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

//CREATE CELLS
function makeCell(img){
  var cell = document.createElement('div');
  cell.className='carousel-cell';
  cell.innerHTML = '<img src="'+img+'">';
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
    window.location.href = url;
  }
}

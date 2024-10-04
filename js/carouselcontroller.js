
var myTimeout;
var timetostart=3000;//time to start the carousel after the arrow button event

//FUNCTION TO CYCLE THE CAROUSEL TO PREVIOUS ON LEFT ARROW BUTTON AND NEXT ON RIGHT ARROW BUTTON PRESS
$(document).keydown(function(event) {
    if (event.key == 'ArrowLeft') {
        $('#myCarousel').carousel('prev');
    } else if (event.key == 'ArrowRight') {
        $('#myCarousel').carousel('next');
    }
}); 

//FUNCTION TO STOP THE CAROUSEL ON ARROW PRESS AND TO START IT AFTER timetostart MILLISECONDS
$(document).ready(function() {
    $(document).keydown(function(event) {
        if (event.key == 'ArrowLeft' || event.key == 'ArrowRight') {
            $('#myCarousel').carousel('pause');//stop the carousel
            ClearTimeout();
            myTimeout = setTimeout(StartCarousel, timetostart);
            console.log("Carousel paused. Will start in "+timetostart/1000+" seconds");
        }
    });
});

//FUNCTION TO START THE CAROUSEL
function StartCarousel(){
    console.log("Carousel started after "+timetostart/1000+" seconds");
    $('#myCarousel').carousel('cycle');//start the carousel
}

//FUNCTION TO CLEAR THE TIMEOUT
function ClearTimeout() {
    clearTimeout(myTimeout);
  }
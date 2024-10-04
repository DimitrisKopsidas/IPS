//STATISTICS LISTENERS

//TO DO: Add php parameters
//       Understand on which image the arrow was pressed

let leftcounter = 0;
let rightcounter = 0;

//FUNCTION TO COUNT THE NUMBER OF LEFT AND RIGHT ARROW BUTTON PRESSES
function handleButtonPress(event) {
    if (event.key === "ArrowLeft") {
        leftcounter++;
        console.log("Left Counter:", leftcounter);
    }else if(event.key === "ArrowRight"){
        rightcounter++;
        console.log("Right Counter:", rightcounter);
    }
}

// Add event listener to the document for keydown event
document.addEventListener("keydown", handleButtonPress);

//test
 

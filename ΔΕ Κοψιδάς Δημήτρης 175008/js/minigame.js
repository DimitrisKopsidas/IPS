//TO-DO
//1)FUNCTION TO APPEND ITEMS
//2)FUNCTION TO ADD IMAGES
//3)SLICE SIZE ACCORDING TO CHANCE
//4)DISPLAY DEATHDATE

import {Wheel} from 'https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js';
import { fetchMinigameSettings, fetchMinigamePromos, insertIssuedPromo,
    fetchMinigamePromosCarousel, fetchMinigameSettingsCarousel
 } from './dbService.js';

// #region VARIABLE DECLARATION
//DEFAULT SETTINGS
var winningItemIndex=1;
var revolutions=5;
var spinDuration=3000;
var onStopChangeDelay=30000;
var inactivityChangeDelay=20000;

//PROGRAM VARIABLES
let connectkey;
let settings = [];
let promos = [];
var redeemCode = redeemCodeGenerator();
var leftSep=document.getElementById('leftSep');
var rightSep=document.getElementById('rightSep');
var wheelStartBySeparator=0;
var nextPageUrl;
var overlay=new Image();
overlay.src='media/overlay.svg';// Initialize overlay as image
let isPreview = false;
let carouselSource;

// Timer variables
let countdownInterval;
let currentTimeout;
let timeRemaining;
let timerElement;
let isInactivityTimer = true;
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    connectkey = params.get('connectkey');
    isPreview = params.get('preview');
    carouselSource = params.get('carousel');

    // Initialize timer element FIRST - after DOM is loaded
    timerElement = document.getElementById('countdownTimer');
    if (!timerElement) {
        console.error('Timer element not found!');
    }

    if (isPreview != 1) {
        settings = await fetchMinigameSettings(connectkey);
        promos = await fetchMinigamePromos(connectkey);
        nextPageUrl = `activeCarousel.html?connectkey=${connectkey}`;
    } else {
        settings = await fetchMinigameSettingsCarousel(carouselSource);
        promos = await fetchMinigamePromosCarousel(carouselSource);
        nextPageUrl = `carousel.html?id=${carouselSource}`;
    }

    revolutions = settings[0].revolutions;
    spinDuration = settings[0].spinduration;
    onStopChangeDelay = settings[0].onstoptime;
    inactivityChangeDelay = settings[0].inactivitytime;

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

    // Validate that chances sum to 1
    const totalChance = promos.reduce((sum, promo) => sum + (promo.CHANCE || 0), 0);
    if (Math.abs(totalChance - 1) > 0.001) { // Allow for small floating point errors
        console.warn(`Total chance is ${totalChance}, expected 1.0. This may affect visual distribution.`);
    }

    // Define props for the wheel
    const props = {
        items: promos.map(promo => ({
                label: `-${promo.DISCOUNT * 100}%`,
                weight: promo.CHANCE, // This will determine the visual size of each slice
                id: promo.ID 
            })),
            onRest: onStop,
            overlayImage: overlay,
    };

    // Initialize wheel
    try {
        const container = document.querySelector('.wheel-wrapper');
        window.wheel = new Wheel(container, props);
        
        // Start inactivity countdown when page loads - AFTER timerElement is set
        startInactivityCountdown();
    } catch (error) {
        console.error('Error initializing wheel:', error);
    }

    // Consolidated spin function
    function triggerSpin(direction) {
        if (wheelStartBySeparator === 0 && wheel) {
            // Stop the inactivity countdown when spinning starts
            stopCountdown();
            
            wheel.spinToItem(winningItemIndex, spinDuration, false, revolutions, direction, null);
            // Disable all spin triggers after any spin starts
            rightSep.removeEventListener('mouseover', spinRight);
            leftSep.removeEventListener('mouseover', spinLeft);
            wheelStartBySeparator = 1;
            return true;
        }
        return false;
    }

    const spinLeft = function() {
        if (triggerSpin(1)) {
            console.log("Mouse spin left triggered");
        }
    }
    
    const spinRight = function() {
        if (triggerSpin(-1)) {
            console.log("Mouse spin right triggered");
        }
    }

    //leftSep.addEventListener('mouseover', spinLeft);
    //rightSep.addEventListener('mouseover', spinRight);

    // Add keyboard event listener for arrow keys
    document.addEventListener('keydown', function(event) {
        // Check if left arrow key is pressed
        if (event.key === 'ArrowLeft' || event.keyCode === 37) {
            event.preventDefault();
            if (triggerSpin(-1)) {
                console.log("Left arrow pressed - Spinning left");
            }
        }
        
        // Check if right arrow key is pressed
        if (event.key === 'ArrowRight' || event.keyCode === 39) {
            event.preventDefault();
            if (triggerSpin(1)) {
                console.log("Right arrow pressed - Spinning right");
            }
        }
    });
    
    winningItemCalc();
});

// #region FUNCTIONS
async function onStop(){
    if(wheelStartBySeparator==1){
        // Start result countdown when wheel stops
        startResultCountdown();
        displayPrize();
    }

    if (isPreview != 1) {
        await insertIssuedPromo(connectkey,redeemCode,promos[winningItemIndex].PROMO);
    }
}

function changePageOnStop() {
    // This function is now handled by startResultCountdown()
    // Keep it for compatibility but functionality moved to countdown system
}

function changePageOnInactivity() {
    // This function is now handled by startInactivityCountdown()
    // Keep it for compatibility but functionality moved to countdown system
}

function displayPrize() {
    const contentWrapper = document.querySelector('.content-wrapper');
    const winningPromo = promos[winningItemIndex];

    const prizeDisplay = document.createElement('div');
    prizeDisplay.className = 'prize-display';
    
    let prizeImage = '';
    let prizeText = '';
    
    if (winningPromo.PRODUCT && winningPromo.PRODUCTNAME) {
        prizeImage = `<img src="media/${winningPromo.PRODUCT}.png" alt="Prize" onerror="this.src='media/404.png'" class="prize-image">`;
        prizeText = winningPromo.PRODUCTNAME;
    } else if (winningPromo.TYPENAME) {
        prizeImage = `<img src="media/9998.jpg" alt="Prize" onerror="this.src='media/404.png'" class="prize-image">`;
        prizeText = `All ${winningPromo.TYPENAME} products`;
        console.log('Type prize:', winningPromo.TYPENAME);
    } else if (winningPromo.MAKERNAME) {
        prizeImage = `<img src="media/9998.jpg" alt="Prize" onerror="this.src='media/404.png'" class="prize-image">`;
        prizeText = `All products made by ${winningPromo.MAKERNAME}`;
        console.log('Maker prize:', winningPromo.MAKERNAME);
    } else if (winningPromo.MAKERNAME && winningPromo.TYPENAME) {
        prizeImage = `<img src="media/9998.jpg" alt="Prize" onerror="this.src='media/404.png'" class="prize-image">`;
        prizeText = `All products made by ${winningPromo.MAKERNAME} in the ${winningPromo.TYPENAME} category.`;
        console.log('Maker prize:', winningPromo.MAKERNAME);
    }
    
    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + winningPromo.DAYSTOLIVE);
    const formattedExpirationDate = expirationDate.toLocaleDateString();
    
    // Create expiration message
    const daysText = winningPromo.DAYSTOLIVE === 1 ? 'day' : 'days';
    const expirationMessage = `Valid for ${winningPromo.DAYSTOLIVE} ${daysText} (expires on ${formattedExpirationDate})`;
    
    prizeDisplay.innerHTML = `
        <div class="prize-container">
            ${prizeImage}
            <div class="prize-info">
                <h2>Congratulations!</h2>
                <p class="discount-text">You won a ${winningPromo.DISCOUNT * 100}% discount for:</p>
                <p class="prize-text">${prizeText}</p>
                <p class="code-text">Redeem code: ${redeemCode}</p>
                <p class="expiration-text">${expirationMessage}</p>
                <p class="redeem-instruction">Photograph this code and redeem it at the register</p>
            </div>
        </div>
    `;

    contentWrapper.innerHTML = '';
    contentWrapper.appendChild(prizeDisplay);
}

function winningItemCalc() {
    if (!Array.isArray(promos) || promos.length === 0) {
        console.error('No valid promos available for calculation');
        return 0; // Default to first item
    }

    try {
        // Since total chance equals 1, we can use the chances directly
        const random = Math.random(); // Random number between 0 and 1

        // Find winning item based on cumulative probability
        let cumulative = 0;
        for (let i = 0; i < promos.length; i++) {
            cumulative += promos[i].CHANCE || 0;
            if (random <= cumulative) {
                winningItemIndex = i;
                console.log(`Selected winning item index: ${i}`, promos[i]);
                console.log(`Random value: ${random}, Cumulative: ${cumulative}`);
                return i;
            }
        }

        // Fallback to last item if rounding errors occur
        winningItemIndex = promos.length - 1;
        console.log(`Fallback to last item: ${winningItemIndex}`);
        return promos.length - 1;

    } catch (error) {
        console.error('Error calculating winning item:', error);
        winningItemIndex = 0;
        return 0; 
    }
}

function redeemCodeGenerator() {
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return code;
}

function startInactivityCountdown() {
    console.log('Starting inactivity countdown with delay:', inactivityChangeDelay);
    
    if (inactivityChangeDelay === 0) {
        console.log('Inactivity delay is 0, skipping countdown');
        return;
    }
    
    isInactivityTimer = true;
    timeRemaining = Math.ceil(inactivityChangeDelay / 1000);
    
    if (timerElement) {
        timerElement.className = 'countdown-timer inactivity';
        timerElement.style.display = 'flex';
    }
    
    // Start visual countdown
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Start actual timeout with navigation
    currentTimeout = setTimeout(function() {
        console.log('Inactivity timeout reached, navigating to:', nextPageUrl);
        if (wheelStartBySeparator === 0 && inactivityChangeDelay !== 0) {
            navigateToNextPage();
        } else {
            console.log('Navigation blocked - wheelStartBySeparator:', wheelStartBySeparator);
        }
    }, inactivityChangeDelay);
    
    console.log(`Started inactivity countdown: ${timeRemaining} seconds`);
}

function startResultCountdown() {
    console.log('Starting result countdown with delay:', onStopChangeDelay);
    
    if (onStopChangeDelay === 0) {
        console.log('Result delay is 0, skipping countdown');
        return;
    }
    
    isInactivityTimer = false;
    timeRemaining = Math.ceil(onStopChangeDelay / 1000);
    
    if (timerElement) {
        timerElement.className = 'countdown-timer result';
        timerElement.style.display = 'flex';
    }
    
    // Start visual countdown
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Start actual timeout with navigation
    currentTimeout = setTimeout(function() {
        console.log('Result timeout reached, navigating to:', nextPageUrl);
        navigateToNextPage();
    }, onStopChangeDelay);
    
    console.log(`Started result countdown: ${timeRemaining} seconds`);
}

function updateCountdown() {
    if (!timerElement || timeRemaining <= 0) {
        console.log('Countdown finished, navigating...');
        stopCountdown();
        // Navigate immediately when countdown reaches zero
        navigateToNextPage();
        return;
    }
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerText = document.getElementById('timerText');
    
    if (timerText) {
        timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Add warning classes based on time remaining
    let baseClass = isInactivityTimer ? 'countdown-timer inactivity' : 'countdown-timer result';
    
    if (timeRemaining <= 3) {
        timerElement.className = baseClass + ' critical';
    } else if (timeRemaining <= 10) {
        timerElement.className = baseClass + ' warning';
    } else {
        timerElement.className = baseClass;
    }
    
    timeRemaining--;
}


// Add a dedicated navigation function
function navigateToNextPage() {
    console.log('Attempting navigation to:', nextPageUrl);
    
    if (!nextPageUrl) {
        console.error('nextPageUrl is not set!');
        return;
    }
    
    // Clear any existing timers before navigation
    stopCountdown();
    
    // Add a small delay to ensure any ongoing processes complete
    setTimeout(() => {
        console.log('Navigating now to:', nextPageUrl);
        window.location.href = nextPageUrl;
    }, 100);
}

function stopCountdown() {
    console.log('Stopping countdown...');
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        console.log('Cleared countdown interval');
    }
    
    if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
        console.log('Cleared current timeout');
    }
    
    if (timerElement) {
        timerElement.style.display = 'none';
    }
}
//#endregion FUNCTIONS
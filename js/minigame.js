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
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    connectkey = params.get('connectkey');
    isPreview = params.get('preview');
    carouselSource = params.get('carousel');

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

    // Define props for the wheel
    const props = {
        items: promos.map(promo => ({
                label: `${promo.DISCOUNT * 100}%`,
                chance: promo.CHANCE || 1, 
                id: promo.ID 
            })),
            onRest: onStop,
            overlayImage: overlay,
    };

    // Initialize wheel
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
    }
    leftSep.addEventListener('mouseover',spinLeft);
    rightSep.addEventListener('mouseover',spinRight);
    
    winningItemCalc();
});

// #region FUNCTIONS
async function onStop(){
    if(wheelStartBySeparator==1){
    changePageOnStop();
    displayPrize();
    }

    if (isPreview != 1) {
        await insertIssuedPromo(connectkey,redeemCode,promos[winningItemIndex].PROMO);
    }
}

function changePageOnStop() {
    setTimeout(function() {
        if (onStopChangeDelay!=0) {
            window.location.href = nextPageUrl;
        }
    }, onStopChangeDelay);
}

function changePageOnInactivity() {
    setTimeout(function() {
        if ((wheelStartBySeparator==0)&&(inactivityChangeDelay!=0)) {
            window.location.href = nextPageUrl;
        }
    }, inactivityChangeDelay);
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
    
    prizeDisplay.innerHTML = `
        <div class="prize-container">
            ${prizeImage}
            <div class="prize-info">
                <h2>Congratulations!</h2>
                <p class="discount-text">You won a ${winningPromo.DISCOUNT * 100}% discount for:</p>
                <p class="prize-text">${prizeText}</p>
                <p class="code-text">Redeem code: ${redeemCode}</p>
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
        // Calculate total chance
        const totalChance = promos.reduce((sum, promo) => sum + (promo.CHANCE || 1), 0);
        
        // Generate random number between 0 and total chance
        const random = Math.random() * totalChance;

        // Find winning item based on cumulative probability
        let cumulative = 0;
        for (let i = 0; i < promos.length; i++) {
            cumulative += promos[i].CHANCE || 1;
            if (random <= cumulative) {
                winningItemIndex = i;
                console.log(`Selected winning item index: ${i}`, promos[i]);
                return i;
            }
        }

        winningItemIndex = promos.length - 1;
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
//#endregion FUNCTIONS
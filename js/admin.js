import { fetchIndexPromoInfo, fetchIndexDeviceInfo } from './dbService.js';


// #region VARIABLE DECLARATION
let promoInfo;
let deviceInfo;
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
    try {
        promoInfo = await fetchIndexPromoInfo();
        deviceInfo = await fetchIndexDeviceInfo();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
});

// #region FUNCTIONS
 
// #endregion FUNCTIONS

// #region EVENT LISTENERS

// #endregion EVENT LISTENERS
import { getItemCardHtml } from './common.js';
import { getPromoStatus, getPromoData, updateRedeemed } from './dbService.js';

// #region VARIABLE DECLARATION
const promoForm = document.getElementById('promoForm');
const resultContainer = document.getElementById('resultContainer');
const statusIcon = document.getElementById('statusIcon');
const resultMessage = document.getElementById('resultMessage');
const discountDetails = document.getElementById('discountDetails');
const applyCodeBtn = document.getElementById('applyCodeBtn');
const verificationModal = document.getElementById('verificationModal');
let issueDate;
let expiryDate;
let redeemDate;
let formatedIssueDate;
let formatedExpiryDate;
let formatedRedeemDate;
let promoCode;
let promoData;
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
    promoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        promoCode = document.getElementById('promoCode').value.trim();
        
        // Reset previous result
        resultContainer.classList.add('hidden');
        if (!promoCode) {
            showError('Please enter a promo code');
            return;
        }
        verifyPromoCode(promoCode);
    });
});

// #region FUNCTIONS
async function verifyPromoCode(promoCode) {// PROMO CHECK
    try {
        const status = await getPromoStatus(promoCode);
        if (status !== 0) {
            promoData = await getPromoData(promoCode);
            issueDate = new Date(promoData.ISSUEDATE);
            expiryDate = new Date(issueDate.getTime() + (promoData.DAYSTOLIVE * 24 * 60 * 60 * 1000));
            redeemDate = new Date(promoData.REDEEMDATE);
            formatedExpiryDate = formatDate(expiryDate);
            formatedIssueDate = formatDate(issueDate);
            formatedRedeemDate = formatDate(redeemDate);
        }
        
        switch (status) {
            case 0:
                showError('This promo code does not exist');
                break;
            case 1:
                if (promoData) {
                    showSuccess(promoData, promoCode);
                } else {
                    showError('Error fetching promotion details');
                }
                break;
            case 2:
                showError('This promo code expired on ' + formatedExpiryDate);
                break;
            case 3:
                showError('This promo code has already been redeemed on ' + formatedRedeemDate);
                break;
            default:
                showError('Error checking promo code');
        }
    } catch (error) {
        console.error('Error verifying promo code:', error);
        showError('Error checking promo code');
    }
}

function showSuccess(promoData) {// DISPLAY INFO ON SUCCESS
    // Reset button state for new promo code
    applyCodeBtn.style.display = 'block';
    applyCodeBtn.disabled = false;
    applyCodeBtn.textContent = 'Apply to Cart';

    applyCodeBtn.style.display = 'block';
    statusIcon.className = 'status-icon success';
    statusIcon.innerHTML = '✓';
    resultMessage.textContent = 'Valid Promo Code!';
    
    if (promoData.PRODUCT) {
        discountDetails.innerHTML = getItemCardHtml("promoProduct", promoData, formatedExpiryDate, formatedIssueDate);
    } else if (promoData.TYPE && promoData.MAKER) {
        discountDetails.innerHTML = getItemCardHtml("promoTypeMaker", promoData, formatedExpiryDate, formatedIssueDate);
    } else if (promoData.TYPE) {
        discountDetails.innerHTML = getItemCardHtml("promoType", promoData, formatedExpiryDate, formatedIssueDate);
    } else if (promoData.MAKER) {
        discountDetails.innerHTML = getItemCardHtml("promoMaker", promoData, formatedExpiryDate, formatedIssueDate);
    }

    applyPromoCode();
}

async function applyPromoCode() {
    resultContainer.classList.remove('hidden');        
    applyCodeBtn.onclick = function() {
        verificationModal.style.display = 'flex';
        
        document.getElementById('confirmApplyBtn').onclick = async function() {
            try {
                const response = await updateRedeemed(promoCode);
                if (response.success) {
                    verificationModal.style.display = 'none';
                    statusIcon.className = 'status-icon applied';
                    resultMessage.textContent = 'Promo Code Applied!';
                    applyCodeBtn.disabled = true;
                    applyCodeBtn.textContent = 'Applied to Cart';
                } else {
                    showError('Failed to apply promo code');
                }
            } catch (error) {
                console.error('Error applying promo code:', error);
                showError('Failed to apply promo code');
            }
        };
        document.getElementById('cancelApplyBtn').onclick = function() {
            verificationModal.style.display = 'none';
        };
    };
}

function showError(message) {
    statusIcon.className = 'status-icon error';
    statusIcon.innerHTML = '✕';
    resultMessage.textContent = 'Invalid Promo Code';
    discountDetails.innerHTML = `<p>${message}</p>`;
    resultContainer.classList.remove('hidden');
    applyCodeBtn.style.display = 'none';
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    };
    return date.toLocaleDateString('en-GB', options);
}

document.addEventListener('click', function(event) {// Close modal when clicking outside
    const verificationModal = document.getElementById('verificationModal');
    if (event.target === verificationModal) {
        verificationModal.style.display = 'none';
    }
});
// #endregion FUNCTIONS
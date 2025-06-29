import { getPromoStatus, getPromoData, updateRedeemed } from './dbService.js';

const promoForm = document.getElementById('promoForm');
    const resultContainer = document.getElementById('resultContainer');
    const statusIcon = document.getElementById('statusIcon');
    const resultMessage = document.getElementById('resultMessage');
    const discountDetails = document.getElementById('discountDetails');
    const applyCodeBtn = document.getElementById('applyCodeBtn');
    const verificationModal = document.getElementById('verificationModal');
    let promoCode;

document.addEventListener('DOMContentLoaded', async () => {
    // USER INPUT
    promoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        promoCode = document.getElementById('promoCode').value.trim();
        
        // Reset previous result
        resultContainer.classList.add('hidden');
        if (!promoCode) {
            showError('Please enter a promo code');
            return;
        }
        // Simulate server verification with a slight delay
        setTimeout(() => {
            verifyPromoCode(promoCode);
        }, 500);
    });
    
    // PROMO CHECK
    async function verifyPromoCode(promoCode) {
        try {
            const status = await getPromoStatus(promoCode);
            
            switch (status) {
                case 0:
                    showError('This promo code does not exist');
                    break;
                case 1:
                    // Valid and not redeemed - fetch full promo data
                    const promoData = await getPromoData(promoCode);
                    if (promoData) {
                        showSuccess(promoData, promoCode);
                    } else {
                        showError('Error fetching promotion details');
                    }
                    break;
                case 2:
                    showError('This promo code has expired');
                    break;
                case 3:
                    showError('This promo code has already been redeemed');
                    break;
                default:
                    showError('Error checking promo code');
            }
        } catch (error) {
            console.error('Error verifying promo code:', error);
            showError('Error checking promo code');
        }
    }
    
    // DISPLAY INFO ON SUCCESS
    function showSuccess(promoData, code) {
        applyCodeBtn.style.display = 'block';
        statusIcon.className = 'status-icon success';
        statusIcon.innerHTML = '✓';
        resultMessage.textContent = 'Valid Promo Code!';
        
        // Calculate expiry date based on ISSUEDATE and DAYSTOLIVE
        const issueDate = new Date(promoData.ISSUEDATE);
        const expiryDate = new Date(issueDate.getTime() + (promoData.DAYSTOLIVE * 24 * 60 * 60 * 1000));
        const formattedDate = formatDate(expiryDate);
        
        // Display promo details based on type
        if (promoData.PRODUCT) {
            discountDetails.innerHTML = `
            <p><strong>${promoData.DISCOUNT * 100}% Discount</strong></p>
            <p>${promoData.PRODUCT}</p>
            <p>Valid until ${formattedDate}</p>`;
        } else if (promoData.TYPE && promoData.MAKER) {
            discountDetails.innerHTML = `
            <p><strong>${promoData.DISCOUNT * 100}% Discount</strong></p>
            <p>For type: ${promoData.TYPE} and maker: ${promoData.MAKER}</p>
            <p>Valid until ${formattedDate}</p>`;
        } else if (promoData.TYPE) {
            discountDetails.innerHTML = `
            <p><strong>${promoData.DISCOUNT * 100}% Discount</strong></p>
            <p>For type: ${promoData.TYPE}</p>
            <p>Valid until ${formattedDate}</p>`;
        } else if (promoData.MAKER) {
            discountDetails.innerHTML = `
            <p><strong>${promoData.DISCOUNT * 100}% Discount</strong></p>
            <p>For maker: ${promoData.MAKER}</p>
            <p>Valid until ${formattedDate}</p>`;
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
                        resultContainer.classList.add('hidden');
                        showSuccess('Promo code successfully applied!');
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

    
    // Display error message
    function showError(message) {
        statusIcon.className = 'status-icon error';
        statusIcon.innerHTML = '✕';
        resultMessage.textContent = 'Invalid Promo Code';
        discountDetails.innerHTML = `<p>${message}</p>`;
        resultContainer.classList.remove('hidden');
        applyCodeBtn.style.display = 'none';
    }
    
    // Format date to a readable string
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    }
    
    // Add click handler to close modal when clicking outside
    document.addEventListener('click', function(event) {
        const verificationModal = document.getElementById('verificationModal');
        if (event.target === verificationModal) {
            verificationModal.style.display = 'none';
        }
    });


});
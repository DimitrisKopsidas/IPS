document.addEventListener('DOMContentLoaded', function() {
    const promoForm = document.getElementById('promoForm');
    const resultContainer = document.getElementById('resultContainer');
    const statusIcon = document.getElementById('statusIcon');
    const resultMessage = document.getElementById('resultMessage');
    const discountDetails = document.getElementById('discountDetails');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const applyCodeBtn = document.getElementById('applyCodeBtn');
    
    // Sample list of valid promo codes (in a real app, these would be verified server-side)
    const validPromoCodes = {
        'WELCOME25': {
            discount: '25%',
            description: 'Get 25% off on your first purchase.',
            expiry: '2025-12-31'
        },
        'SUMMER2025': {
            discount: '15%',
            description: 'Summer sale: 15% off on all products.',
            expiry: '2025-08-31'
        },
        'FREESHIP': {
            discount: 'Free Shipping',
            description: 'Free standard shipping on orders over $50.',
            expiry: '2025-06-30'
        },
        'LOYALTY10': {
            discount: '10%',
            description: 'Special 10% discount for loyal customers.',
            expiry: '2025-10-15'
        }
    };
    
    // Handle promo code verification
    promoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const promoCode = document.getElementById('promoCode').value.trim();
        
        // Reset previous result
        resultContainer.classList.add('hidden');
        
        // Simple validation - ensure code is not empty
        if (!promoCode) {
            showError('Please enter a promo code');
            return;
        }
        
        // Simulate server verification with a slight delay
        setTimeout(() => {
            verifyPromoCode(promoCode);
        }, 800);
    });
    
    // Verify the promo code against our sample list
    function verifyPromoCode(code) {
        const promoInfo = validPromoCodes[code];
        
        if (promoInfo) {
            // Valid promo code
            const currentDate = new Date();
            const expiryDate = new Date(promoInfo.expiry);
            
            if (currentDate > expiryDate) {
                showError(`This promo code expired on ${formatDate(expiryDate)}`);
            } else {
                showSuccess(promoInfo, code);
            }
        } else {
            // Invalid promo code
            showError('This promo code is invalid or has already been used');
        }
    }
    
    // Display success message and discount details
    function showSuccess(promoInfo, code) {
        statusIcon.className = 'status-icon success';
        statusIcon.innerHTML = '✓';
        resultMessage.textContent = 'Valid Promo Code!';
        
        // Format expiry date
        const expiryDate = new Date(promoInfo.expiry);
        const formattedDate = formatDate(expiryDate);
        
        discountDetails.innerHTML = `
            <p><strong>${promoInfo.discount} Discount</strong></p>
            <p>${promoInfo.description}</p>
            <p>Valid until ${formattedDate}</p>
        `;
        
        resultContainer.classList.remove('hidden');
        
        // Enable action buttons
        copyCodeBtn.disabled = false;
        applyCodeBtn.disabled = false;
        
        // Set up button handlers
        copyCodeBtn.onclick = function() {
            navigator.clipboard.writeText(code)
                .then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                });
        };
        
        applyCodeBtn.onclick = function() {
            alert(`Promo code ${code} applied to your cart! You will receive ${promoInfo.discount} off.`);
            // In a real app: Would redirect to cart or apply via AJAX
        };
    }
    
    // Display error message
    function showError(message) {
        statusIcon.className = 'status-icon error';
        statusIcon.innerHTML = '✕';
        resultMessage.textContent = 'Invalid Promo Code';
        discountDetails.innerHTML = `<p>${message}</p>`;
        resultContainer.classList.remove('hidden');
        
        // Disable action buttons
        copyCodeBtn.disabled = true;
        applyCodeBtn.disabled = true;
    }
    
    // Format date to a readable string
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
});
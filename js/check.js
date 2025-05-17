document.addEventListener('DOMContentLoaded', function() {
    const promoForm = document.getElementById('promoForm');
    const resultContainer = document.getElementById('resultContainer');
    const statusIcon = document.getElementById('statusIcon');
    const resultMessage = document.getElementById('resultMessage');
    const discountDetails = document.getElementById('discountDetails');
    const applyCodeBtn = document.getElementById('applyCodeBtn');
    const verificationModal = document.getElementById('verificationModal');
    
    // Sample list of valid promo codes (in a real app, these would be verified server-side)
    const validPromoCodes = {
        'q1': {
            product: 'Playstation 2',
            group: 'Gaming',
            maker: 'Sony',
            discount: '25%',
            expiry: '2025-12-31'
        },
        'q2': {
            product: '',
            group: 'Handheld',
            maker: 'Sony',
            discount: '25%',
            expiry: '2025-12-31'
        },
        'q3': {
            product: '',
            group: '',
            maker: 'Nintendo',
            discount: '25%',
            expiry: '2025-12-31'
        },
        'q4': {
            product: '',
            group: 'Console',
            maker: '',
            discount: '25%',
            expiry: '2025-12-31'
        },
        'q5': {
            product: '',
            group: 'Console',
            maker: '',
            discount: '25%',
            expiry: '2025-1-1'
        },
    };
    
    // Handle promo code verification
    promoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const promoCode = document.getElementById('promoCode').value.trim();
        
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
        
        if(promoInfo.product!=''){
            discountDetails.innerHTML = `
            <p><strong>${promoInfo.discount} Discount</strong></p>
            <p>${promoInfo.product}</p>
            <p>Valid until ${formattedDate}</p>`;
        }else if ((promoInfo.group!='')&&(promoInfo.product=='')&&(promoInfo.maker!='')){
            discountDetails.innerHTML = `
            <p><strong>${promoInfo.discount} Discount</strong></p>
            <p>For group: ${promoInfo.group} and maker: ${promoInfo.maker}</p>
            <p>Valid until ${formattedDate}</p>`;
        }else if ((promoInfo.group!='')&&(promoInfo.product=='')){
            discountDetails.innerHTML = `
            <p><strong>${promoInfo.discount} Discount</strong></p>
            <p>For group: ${promoInfo.group}</p>
            <p>Valid until ${formattedDate}</p>`;
        }else if (promoInfo.maker!=''&&(promoInfo.product=='')){
            discountDetails.innerHTML = `
            <p><strong>${promoInfo.discount} Discount</strong></p>
            <p>For maker: ${promoInfo.maker}</p>
            <p>Valid until ${formattedDate}</p>`;
        }

        resultContainer.classList.remove('hidden');        
        applyCodeBtn.onclick = function() {
            verificationModal.style.display = 'flex';
            
            document.getElementById('confirmApplyBtn').onclick = function() {//APPLY
                verificationModal.style.display = 'none';
                // Here you would make the API call to apply the code and remove it from database
                delete validPromoCodes[code]; // Remove code from valid codes
                resultContainer.classList.add('hidden');
            };
            
            document.getElementById('cancelApplyBtn').onclick = function() {//CANCEL
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
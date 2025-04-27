document.addEventListener('DOMContentLoaded', function() {
    // Form reference
    const productForm = document.getElementById('productForm');
    
    // Modal elements
    const saveConfirmation = document.getElementById('saveConfirmation');
    const closeBtn = document.querySelector('.close-btn');
    const unsavedChangesModal = document.getElementById('unsavedChangesModal');
    
    // Navigation buttons
    const prevBtn = document.getElementById('prevProductBtn');
    const nextBtn = document.getElementById('nextProductBtn');
    
    // State variables
    let currentProductId = 1;
    let formChanged = false;
    let pendingNavigationDirection = null;

    // Predefined options (replace with API/database call in a real app)
    const groups = ["Audio", "Electronics", "Photography", "Home Appliances"];
    const makers = ["SoundTech", "VisionTech", "OptikPro", "HomeEase"];
  
    const products = [  // Sample product data (would come from API in real app)
        {
            id: 1,
            name: "Premium Wireless Headphones",
            code: "WH-2023-PRO",
            group: "Audio",
            maker: "SoundTech",
            price: 199.99,
            discount: 0,
            carousels: [
                "Featured Products",
                "New Arrivals"
            ],
            promos: [
                "SUMMER25 - 25% off",
                "FREESHIP - Free shipping"
            ]
        },
        {
            id: 2,
            name: "Ultra HD Smart TV",
            code: "TV-4K-65",
            group: "Electronics",
            maker: "VisionTech",
            price: 899.99,
            discount: 10,
            carousels: [
                "Featured Products",
                "Best Sellers"
            ],
            promos: [
                "BUNDLE10 - 10% off bundle"
            ]
        },
        {
            id: 3,
            name: "Professional DSLR Camera",
            code: "CAM-PRO-X1",
            group: "Photography",
            maker: "OptikPro",
            price: 1299.99,
            discount: 5,
            carousels: [
                "New Arrivals",
                "Premium Products"
            ],
            promos: [
                "FREESHIP - Free shipping",
                "PHOTO25 - 25% off accessories"
            ]
        }
    ];
    
    const groupSelect = document.getElementById('productGroup');
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
    });

    // Populate the Maker dropdown
    const makerSelect = document.getElementById('productMaker');
    makers.forEach(maker => {
        const option = document.createElement('option');
        option.value = maker;
        option.textContent = maker;
        makerSelect.appendChild(option);
    });

    loadProductData(currentProductId);  // Load initial product data
    updateNavigationState();
    
    productForm.addEventListener('input', function() {  // Form change detection
        formChanged = true;
    });
    
    productForm.addEventListener('submit', function(e) {    // Form submission handler
        e.preventDefault();
        saveProductData();
        formChanged = false;
        
        if (pendingNavigationDirection) {
            navigateProduct(pendingNavigationDirection);
            pendingNavigationDirection = null;
        } else {
            showConfirmation();
        }
    });
    
    document.getElementById('cancelBtn').addEventListener('click', function() {// Cancel button handler
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            loadProductData(currentProductId); // Reload original data
            formChanged = false;
        }
    });
     
    prevBtn.addEventListener('click', function() {    // Navigation button handlers
        handleNavigation('prev');
    });
    nextBtn.addEventListener('click', function() {
        handleNavigation('next');
    });
    
    
    function handleNavigation(direction) {// Handle navigation with unsaved changes check
        if (formChanged) {
            pendingNavigationDirection = direction;
            showUnsavedChangesModal();
        } else {
            navigateProduct(direction);
        }
    }
    
    
    function navigateProduct(direction) {// Navigate to next or previous product
        if (direction === 'next' && currentProductId < products.length) {
            currentProductId++;
            loadProductData(currentProductId);
        } else if (direction === 'prev' && currentProductId > 1) {
            currentProductId--;
            loadProductData(currentProductId);
        }
        updateNavigationState();
    }
    

    function updateNavigationState() {    // Update navigation buttons state
        prevBtn.disabled = currentProductId <= 1;
        nextBtn.disabled = currentProductId >= products.length;
        
        prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
        nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
    }
    
    // Close confirmation modal
    closeBtn.addEventListener('click', function() {
        saveConfirmation.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === saveConfirmation) {
            saveConfirmation.style.display = 'none';
        }
    });
    
    // Unsaved changes modal handlers
    document.getElementById('saveAndContinueBtn').addEventListener('click', function() {
        saveProductData();
        formChanged = false;
        navigateProduct(pendingNavigationDirection);
        pendingNavigationDirection = null;
        unsavedChangesModal.style.display = 'none';
    });
    
    document.getElementById('discardAndContinueBtn').addEventListener('click', function() {
        formChanged = false;
        navigateProduct(pendingNavigationDirection);
        pendingNavigationDirection = null;
        unsavedChangesModal.style.display = 'none';
    });
    
    document.getElementById('cancelNavigationBtn').addEventListener('click', function() {
        pendingNavigationDirection = null;
        unsavedChangesModal.style.display = 'none';
    });
    
    // Function to load product data
    function loadProductData(productId) {
        // Find the product in our sample data
        const productData = products.find(p => p.id === productId) || products[0];
        
        // Populate form fields
        document.getElementById('productName').value = productData.name;
        document.getElementById('productCode').value = productData.code;
        // document.getElementById('productGroup').value = productData.group;
        // document.getElementById('productMaker').value = productData.maker;
        document.getElementById('productPrice').value = productData.price;
        document.getElementById('productDiscount').value = productData.discount;
        groupSelect.value = productData.group;
        makerSelect.value = productData.maker;
        
        // Display carousels
        const carouselList = document.getElementById('carouselList');
        carouselList.innerHTML = '';
        productData.carousels.forEach(carousel => {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = carousel;
            carouselList.appendChild(div);
        });
        
        // Display promo codes
        const promoList = document.getElementById('promoList');
        promoList.innerHTML = '';
        productData.promos.forEach(promo => {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = promo;
            promoList.appendChild(div);
        });
        
        // Update the product image (in a real app, this would be dynamic)
        //document.getElementById('mainProductImage').src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(productData.name)}`;
    }
    
    // Function to save product data
    function saveProductData() {
        // Collect form data (would be sent to an API in a real application)
        const formData = {
            id: currentProductId,
            name: document.getElementById('productName').value,
            code: document.getElementById('productCode').value,
            group: groupSelect.value,
            maker: makerSelect.value,
            price: document.getElementById('productPrice').value,
            discount: parseInt(document.getElementById('productDiscount').value)
        };
        
        console.log('Saving product data:', formData);
        
        // In a real app, this would be sent to the server
        // Update our local sample data for demonstration purposes
        const productIndex = products.findIndex(p => p.id === currentProductId);
        if (productIndex !== -1) {
            // Keep carousels and promos the same in our demo
            formData.carousels = products[productIndex].carousels;
            formData.promos = products[productIndex].promos;
            
            // Update the product in our sample array
            products[productIndex] = formData;
        }
    }
    
    // Function to show confirmation modal
    function showConfirmation() {
        saveConfirmation.style.display = 'flex';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            saveConfirmation.style.display = 'none';
        }, 3000);
    }
    
    // Function to show unsaved changes modal
    function showUnsavedChangesModal() {
        unsavedChangesModal.style.display = 'flex';
    }
    // References to price, discount, and final price fields
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const finalPriceInput = document.getElementById('productFinalPrice');

    // Event listeners for discount and final price inputs
    discountInput.addEventListener('input', function() {
        const price = parseFloat(priceInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;

        if (price > 0 && discount >= 0 && discount <= 100) {
            const finalPrice = price - (price * (discount / 100));
            finalPriceInput.value = finalPrice.toFixed(2);
        }
    });

    finalPriceInput.addEventListener('input', function() {
        const price = parseFloat(priceInput.value) || 0;
        const finalPrice = parseFloat(finalPriceInput.value) || 0;

        if (price > 0 && finalPrice >= 0 && finalPrice <= price) {
            const discount = ((price - finalPrice) / price) * 100;
            discountInput.value = discount.toFixed(2);
        }
    });
});
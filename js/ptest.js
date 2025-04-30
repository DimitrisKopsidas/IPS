document.addEventListener('DOMContentLoaded', function() {
    // Form references
    const productForm = document.getElementById('productForm');
    const groupSelect = document.getElementById('productGroup');
    const makerSelect = document.getElementById('productMaker');
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const finalPriceInput = document.getElementById('productFinalPrice');

    // Modal elements
    const saveConfirmation = document.getElementById('saveConfirmation');
    const closeBtn = document.querySelector('.close-btn');
    const unsavedChangesModal = document.getElementById('unsavedChangesModal');
    const cancelConfirmationModal = document.getElementById('cancelConfirmationModal');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');

    // Button elements
    const sidePrevBtn = document.getElementById('sidePrevBtn');
    const sideNextBtn = document.getElementById('sideNextBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const cancelRevertBtn = document.getElementById('cancelRevertBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    // Image elements
    const imageInput = document.getElementById('imageInput');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const mainProductImage = document.getElementById('mainProductImage');

    // State variables
    let currentProductId = 1;
    let formChanged = false;
    let pendingNavigationDirection = null;

    // Predefined data arrays
    const groups = ["Audio", "Electronics", "Photography", "Home Appliances"];
    const makers = ["SoundTech", "VisionTech", "OptikPro", "HomeEase"];
    const products = [
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

    // Populate the Group and Maker dropdowns
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
    });

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

    // Show cancel confirmation modal when cancel button is clicked
    cancelBtn.addEventListener('click', function() {
        cancelConfirmationModal.style.display = 'flex';
    });

    // Handle cancel confirmation
    confirmCancelBtn.addEventListener('click', function() {
        // Reload the current product data to revert changes
        loadProductData(currentProductId);
        cancelConfirmationModal.style.display = 'none';
    });

    // Handle cancel reverting
    cancelRevertBtn.addEventListener('click', function() {
        cancelConfirmationModal.style.display = 'none';
    });

    // Add cancel modal to the window click handler
    window.addEventListener('click', function(e) {
        if (e.target === cancelConfirmationModal) {
            cancelConfirmationModal.style.display = 'none';
        }
    });

    // Add event listeners for side navigation buttons
    sidePrevBtn.addEventListener('click', function() {
        handleNavigation('prev');
    });

    sideNextBtn.addEventListener('click', function() {
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
        const isFirst = currentProductId <= 1;
        const isLast = currentProductId >= products.length;

        // Update existing buttons
        sidePrevBtn.disabled = isFirst;
        sideNextBtn.disabled = isLast;
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
        const productData = products.find(p => p.id === productId) || products[0];

        // Update header inputs
        document.getElementById('headerProductCode').value = productData.code;
        document.getElementById('headerProductName').value = productData.name;

        // Add form changed detection for header inputs
        document.getElementById('headerProductCode').addEventListener('input', function() {
            formChanged = true;
        });

        document.getElementById('headerProductName').addEventListener('input', function() {
            formChanged = true;
        });

        // Populate form fields
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
        const formData = {
            id: currentProductId,
            // Update these to use header inputs instead
            name: document.getElementById('headerProductName').value,
            code: document.getElementById('headerProductCode').value,
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

    // Add event listener for save button
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default form submission
        saveProductData();
        formChanged = false;
        showConfirmation();
    });

    // Update showConfirmation function to ensure modal is visible
    function showConfirmation() {
        const saveConfirmation = document.getElementById('saveConfirmation');
        saveConfirmation.style.display = 'flex';

        // Auto-hide after 2 seconds
        setTimeout(() => {
            saveConfirmation.style.display = 'none';
        }, 2000);
    }

    // Function to show unsaved changes modal
    function showUnsavedChangesModal() {
        unsavedChangesModal.style.display = 'flex';
    }

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

    // Show delete confirmation modal when delete button is clicked
    deleteBtn.addEventListener('click', function() {
        deleteConfirmationModal.style.display = 'flex';
    });

    // Handle delete confirmation
    confirmDeleteBtn.addEventListener('click', function() {
        // Here you would typically make an API call to delete the product
        const productIndex = products.findIndex(p => p.id === currentProductId);
        if (productIndex !== -1) {
            products.splice(productIndex, 1); // Remove product from array

            // Navigate to the previous product if available, otherwise next
            if (currentProductId > 1) {
                currentProductId--;
                loadProductData(currentProductId);
            } else if (products.length > 0) {
                loadProductData(products[0].id);
            }

            updateNavigationState();
        }

        deleteConfirmationModal.style.display = 'none';
    });

    // Handle delete cancellation
    cancelDeleteBtn.addEventListener('click', function() {
        deleteConfirmationModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === deleteConfirmationModal) {
            deleteConfirmationModal.style.display = 'none';
        }
    });

    // Image upload handling
    changeImageBtn.addEventListener('click', function() {
        imageInput.click();
    });

    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();

            reader.onload = function(event) {
                mainProductImage.src = event.target.result;
                formChanged = true;
            };

            reader.readAsDataURL(e.target.files[0]);
        }
    });
});
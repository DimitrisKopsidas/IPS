import {fillDropdown,initiateHotkeys} from "./common.js";


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
    const saveAndContinueBtn = document.getElementById('saveAndContinueBtn');
    const discardAndContinueBtn = document.getElementById('discardAndContinueBtn');
    const cancelNavigationBtn = document.getElementById('cancelNavigationBtn');
    const createNewProductBtn = document.getElementById('createNewProductBtn');

    // Image elements
    const imageInput = document.getElementById('imageInput');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const mainProductImage = document.getElementById('mainProductImage');

    // Headers
    const headerProductCode = document.getElementById('headerProductCode');
    const headerProductName = document.getElementById('headerProductName');

    //Carousel and promo lists
    const carouselList = document.getElementById('carouselList');
    const promoList = document.getElementById('promoList');

    // Image Preview Modal functionality
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const previewImage = document.getElementById('previewImage');
    const closeModal = document.querySelector('.preview-close-modal');

    // Notes
    const productNotes = document.getElementById('productNotes');

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
            code: 100,
            group: "Audio",
            maker: "SoundTech",
            price: 199.99,
            discount: 0,
            notes: "10 left",
            carousels: [
                "101 - Featured Products",
                "102 - New Arrivals",
                "103 - Best Sellers",
                "104 - On Sale"
            ],
            promos: [
                "200 - SUMMER25 - 25% off",
                "100 - FREESHIP - Free shipping"
            ]
        },
        {
            id: 2,
            name: "Ultra HD Smart TV",
            code: 200,
            group: "Electronics",
            maker: "VisionTech",
            price: 899.99,
            discount: 10,
            notes: "In stock",
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
            code: 201,
            group: "Photography",
            maker: "OptikPro",
            price: 1299.99,
            discount: 5,
            notes: "2 left",
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

    fillDropdown(groups,groupSelect);
    fillDropdown(makers,makerSelect);
    initiateHotkeys(navigateProduct);

    loadProductData(currentProductId);  // Load initial product data
    updateNavigationState();
    
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

    function updateNavigationState() {// Update navigation buttons state
        const isFirst = currentProductId <= 1;
        const isLast = currentProductId >= products.length;

        sidePrevBtn.disabled = isFirst;
        sideNextBtn.disabled = isLast;
    }
    
    function loadProductData(productId) {// Function to load product data
        const productData = products.find(p => p.id === productId) || products[0];

        headerProductCode.value = productData.code;
        headerProductName.value = productData.name;
        priceInput.value = productData.price;
        discountInput.value = productData.discount;
        groupSelect.value = productData.group;
        makerSelect.value = productData.maker;
        productNotes.value = productData.notes; 
        mainProductImage.src = `media/`+productData.id+`.png`;
        
        carouselList.innerHTML = '';
        productData.carousels.forEach(carousel => {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = carousel;
            carouselList.appendChild(div);
        });
        promoList.innerHTML = '';
        productData.promos.forEach(promo => {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = promo;
            promoList.appendChild(div);
        });

        productNotes.style.height = 'auto';
        productNotes.style.height = (productNotes.scrollHeight) + 'px';

        document.querySelectorAll('.info-promo .info-item').forEach(item => {
            item.addEventListener('click', function() {
                const code = this.textContent.substring(0, 3);
                window.location.href = `promo/${code}.html`;
            });
        });
        document.querySelectorAll('.info-carousel .info-item').forEach(item => {
            item.addEventListener('click', function() {
                const code = this.textContent.substring(0, 3);
                window.location.href = `carousel/${code}.html`;
            });
        });
    }

    function saveProductData() {// Function to save product data
        // Add validation
        if (!headerProductCode.value.trim()) {
            alert('Product Code is required');
            headerProductCode.focus();
            return;
        }

        if (!headerProductName.value.trim()) {
            alert('Product Name is required');
            headerProductName.focus();
            return;
        }

        const formData = {
            id: currentProductId,
            name: headerProductName.value.trim(),
            code: headerProductCode.value.trim(),
            group: groupSelect.value,
            maker: makerSelect.value,
            price: parseFloat(priceInput.value) || 0,
            discount: parseInt(discountInput.value) || 0,
            notes: productNotes.value.trim(),
            carousels: [],
            promos: []
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

    function showConfirmation() {// Update showConfirmation function to ensure modal is visible
        const saveConfirmation = document.getElementById('saveConfirmation');
        saveConfirmation.style.display = 'flex';

        setTimeout(() => {// Auto-hide after 2 seconds
            saveConfirmation.style.display = 'none';
        }, 2000);
    }
    
    function showUnsavedChangesModal() {// Function to show unsaved changes modal
        unsavedChangesModal.style.display = 'flex';
    }

    function createNewProduct() {
        headerProductCode.value = "";
        headerProductName.value = "New Product";
        priceInput.value = "0";
        discountInput.value = "0";
        finalPriceInput.value = "0";
        groupSelect.value = groups[0];
        makerSelect.value = makers[0];
        productNotes.value = "";
        mainProductImage.src = "media/98.png";
        
        // Clear carousel and promo lists
        carouselList.innerHTML = '';
        promoList.innerHTML = '';
    
        // Update navigation state
        updateNavigationState();
        
        // Set focus to product code
        headerProductCode.focus();
        
        // Reset form changed flag
        formChanged = false;
    }

//HOTKEYS------------------------------------------------------------------------------------------------
    document.addEventListener('keydown', function(event) {//SAVE HOTKEY
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault(); // Prevent browser "Save" dialog
            saveProductData();
            formChanged = false;
            showConfirmation();
        }
    });
    
//EVENT LISTENERS------------------------------------------------------------------------------------------------
    headerProductCode.addEventListener('input', function() {
        formChanged = true;
    });

    headerProductName.addEventListener('input', function() {
        formChanged = true;
    });

    sidePrevBtn.addEventListener('click', function() {
        handleNavigation('prev');
    });

    sideNextBtn.addEventListener('click', function() {
        handleNavigation('next');
    });

    productForm.addEventListener('input', function() {
        formChanged = true;
    });

    productForm.addEventListener('submit', function(e) {
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

    cancelBtn.addEventListener('click', function() {
        cancelConfirmationModal.style.display = 'flex';
    });

    confirmCancelBtn.addEventListener('click', function() {
        loadProductData(currentProductId);
        cancelConfirmationModal.style.display = 'none';
    });

    cancelRevertBtn.addEventListener('click', function() {
        cancelConfirmationModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === cancelConfirmationModal) {
            cancelConfirmationModal.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', function() {
        saveConfirmation.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === saveConfirmation) {
            saveConfirmation.style.display = 'none';
        }
    });

    saveAndContinueBtn.addEventListener('click', function() {
        saveProductData();
        formChanged = false;
        if (pendingNavigationDirection === 'new') {
            createNewProduct();
        } else {
            navigateProduct(pendingNavigationDirection);
        }
        pendingNavigationDirection = null;
        unsavedChangesModal.style.display = 'none';
    });

    discardAndContinueBtn.addEventListener('click', function() {
        formChanged = false;
        navigateProduct(pendingNavigationDirection);
        pendingNavigationDirection = null;
        unsavedChangesModal.style.display = 'none';
    });

    cancelNavigationBtn.addEventListener('click', function() {
        pendingNavigationDirection = null;
        unsavedChangesModal.style.display = 'none';
    });

    saveBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default form submission
        saveProductData();
        formChanged = false;
        showConfirmation();
    });

    discountInput.addEventListener('input', function() {
        const price = parseFloat(priceInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;
        if (price > 0 && discount >= 0 && discount <= 100) {
            finalPriceInput.value = (price - (price * (discount / 100))).toFixed(2);
        }
    });


    finalPriceInput.addEventListener('input', function() {
        const price = parseFloat(priceInput.value) || 0;
        const finalPrice = parseFloat(finalPriceInput.value) || 0;
        if (price > 0 && finalPrice >= 0 && finalPrice <= price) {
            discountInput.value = (((price - finalPrice) / price) * 100).toFixed(2);
        }
    });

    deleteBtn.addEventListener('click', function() {
        deleteConfirmationModal.style.display = 'flex';
    });

    confirmDeleteBtn.addEventListener('click', function() {
        const productIndex = products.findIndex(p => p.id === currentProductId);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
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

    cancelDeleteBtn.addEventListener('click', function() {
        deleteConfirmationModal.style.display = 'none';
    });

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

    mainProductImage.addEventListener('click', function() {
        imagePreviewModal.style.display = 'flex';
        previewImage.src = this.src;
    });

    closeModal.addEventListener('click', function() {
        imagePreviewModal.style.display = 'none';
    });

    imagePreviewModal.addEventListener('click', function(e) {
        if (e.target === this) {
            imagePreviewModal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imagePreviewModal.style.display === 'flex') {
            imagePreviewModal.style.display = 'none';
        }
    });

    productNotes.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    createNewBtn.addEventListener('click', function() {
        if (formChanged) {
            pendingNavigationDirection = 'new';
            showUnsavedChangesModal();
        } else {
            createNewProduct();
        }
    });
});
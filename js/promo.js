import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchFilteredPromos, getAssociatedCarouselForPromo, getIssuedCount,
    insertPromoLines, deletePromoLines, updatePromoLines, updatePromo, 
    insertPromo, deletePromo } from './dbService.js';

// #region VARIABLE DECLARATION
    // Form references
    const productForm = document.getElementById('productForm');
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const finalPriceInput = document.getElementById('productFinalPrice');
    const totalIssuedInput = document.getElementById('totalIssued');
    const daysToLiveInput = document.getElementById('daysToLive');

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

    // Image elements
    const imageInput = document.getElementById('imageInput');
    const mainProductImage = document.getElementById('mainProductImage');

    // Headers
    const headerProductCode = document.getElementById('headerProductCode');
    const headerProductName = document.getElementById('headerProductName');
    const productDropdown = document.getElementById('productDropdown');

    //Carousel and promo lists
    const carouselList = document.getElementById('carouselList');

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
    let validForInsert = true;
    let pendingImageFile = null;
    let selectedProductData = null;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const promoID = urlParams.get('id');
    const selectedMaker = urlParams.get('maker');
    const selectedType = urlParams.get('type');

    // Data tables
    let promos = [];
    let allProducts = [];
    let totalIssued;
    let associatedCarousels = [];
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {
    // Load all products for the dropdown
    allProducts = await fetchFilteredProducts('All', 'All');
    
    // Load filtered products for navigation
    promos = await fetchFilteredPromos(selectedType, selectedMaker);
    
    // Only load associated carousels if we have a valid promo ID
    if (promoID && promoID !== 'new') {
        totalIssued = await getIssuedCount(promoID);
        associatedCarousels = await getAssociatedCarouselForPromo(promoID);
    } else {
        totalIssued = 0;
        associatedCarousels = [];
    }

    const promoData = promos.find(p => p.ID.toString() === promoID);
    
    if (promoData) {
        loadPromoData(promoData);
    } else if (promoID === 'new') {
        createNewPromo();
    } else {
        showWarningModal('Promo not found');
    }

    setupProductDropdown();

    window.addEventListener('popstate', async function() {
        const params = new URLSearchParams(window.location.search);
        const newPromoId = params.get('id');
        
        // Refresh associated carousels for the new promo
        if (newPromoId && newPromoId !== 'new') {
            associatedCarousels = await getAssociatedCarouselForPromo(newPromoId);
        } else {
            associatedCarousels = [];
        }
        
        const promoData = promos.find(p => p.ID.toString() === newPromoId);
        
        if (promoData) {
            loadPromoData(promoData);
        } else if (newPromoId === 'new') {
            createNewPromo();
        } else {
            showWarningModal('Promo not found');
        }
    });
    
// #region EVENT LISTENERS
    headerProductCode.addEventListener('input', function() {
        formChanged = true;
    });

    headerProductName.addEventListener('input', function() {
        formChanged = true;
        filterProductDropdown(this.value);
    });

    headerProductName.addEventListener('focus', function() {
        productDropdown.classList.add('active');
        filterProductDropdown(this.value);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!headerProductName.contains(e.target) && !productDropdown.contains(e.target)) {
            productDropdown.classList.remove('active');
        }
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
        loadPromoData(selectedProductData);
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
            const params = new URLSearchParams(window.location.search);
            params.set('id', 'new');
            window.location.href = `${window.location.pathname}?${params.toString()}`;
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
        if (validForInsert){
            showConfirmation();
        }
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

    confirmDeleteBtn.addEventListener('click', async function() {//IMAGE AND DB DELETION
        try {
            const imageResult = await deleteImage(currentProductId);
            if (!imageResult.success) {
                throw new Error(`Failed to delete image: ${imageResult.error}`);
            }

            const result = await deleteProduct(currentProductId);
            
            if (result.success) {
                const productIndex = promos.findIndex(p => p.ID === currentProductId);
                if (productIndex !== -1) {
                    promos.splice(productIndex, 1);
                    
                    if (promos.length > 0) {
                        let nextProduct;
                        if (productIndex >= promos.length) {
                            nextProduct = promos[promos.length - 1];
                        } else {
                            nextProduct = promos[productIndex];
                        }
                        
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', nextProduct.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        loadPromoData(nextProduct);
                    } else {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', 'new');
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        createNewPromo();
                    }
                }
                
                deleteConfirmationModal.style.display = 'none';
                showWarningModal('Product and associated image deleted successfully');
            } else {
                throw new Error('Product deletion failed');
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            showWarningModal(`Deletion failed: ${error.message}`);
            deleteConfirmationModal.style.display = 'none';
        }
    });

    cancelDeleteBtn.addEventListener('click', function() {
        deleteConfirmationModal.style.display = 'none';
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
            const params = new URLSearchParams(window.location.search);
            params.set('id', 'new');
            
            window.location.href = `${window.location.pathname}?${params.toString()}`;
        }
    });

    document.getElementById('warningOkBtn').addEventListener('click', function() {
        document.getElementById('warningModal').style.display = 'none';
    });

    document.querySelector('#warningModal .close-btn').addEventListener('click', function() {
        document.getElementById('warningModal').style.display = 'none';
    });

    document.getElementById('warningModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('groupsModal');
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        }
    });
    // #endregion
});

// #region FUNCTIONS
    // #region DROPDOWN FUNCTIONS
    function setupProductDropdown() {
        populateProductDropdown(allProducts);
    }

    function populateProductDropdown(products) {
        productDropdown.innerHTML = '';
        
        products.forEach(product => {
            const option = document.createElement('div');
            option.className = 'product-option';
            option.dataset.promoID = product.ID;
            
            const makerName = product.MAKERNAME || 'Unknown';
            const typeName = product.TYPENAME || 'Unknown';
            
            option.innerHTML = `
                <span class="product-code">${product.CODE}</span>
                <span class="product-name">${product.NAME}</span>
                <span class="product-details">(${makerName}, ${typeName})</span>
            `;
            
            option.addEventListener('click', function() {
                selectProduct(product);
            });
            
            productDropdown.appendChild(option);
        });
    }

    function filterProductDropdown(searchText) {
        if (!searchText.trim()) {
            populateProductDropdown(allProducts);
            return;
        }

        const filtered = allProducts.filter(product => {
            const makerName = product.MAKERNAME || 'Unknown';
            const typeName = product.TYPENAME || 'Unknown';
            const searchString = `${product.CODE} ${product.NAME} ${makerName} ${typeName}`.toLowerCase();
            return searchString.includes(searchText.toLowerCase());
        });

        populateProductDropdown(filtered);
        
        if (!productDropdown.classList.contains('active')) {
            productDropdown.classList.add('active');
        }
    }

    async function selectProduct(product) {
        selectedProductData = product;
        headerProductCode.value = product.CODE;
        headerProductName.value = product.NAME;
        
        // Refresh totalIssued and associated carousels for the selected product/promo
        totalIssued = await getIssuedCount(product.ID);
        associatedCarousels = await getAssociatedCarouselForPromo(product.ID);
        
        // Update URL and load product data
        const params = new URLSearchParams(window.location.search);
        params.set('id', product.ID);
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        
        loadPromoData(product);
        productDropdown.classList.remove('active');
        formChanged = true;
    }
    // #endregion
    // #region PRODUCT FUNCTIONS
    function loadPromoData(promoData) {
        selectedProductData = promoData;
        headerProductCode.value = promoData.CODE;
        headerProductName.value = promoData.PRODUCTNAME;
        priceInput.value = promoData.PRICE;
        discountInput.value = promoData.DISCOUNT * 100;
        // Fix: Calculate final price correctly by applying discount to price
        finalPriceInput.value = (promoData.PRICE - (promoData.PRICE * promoData.DISCOUNT)).toFixed(2);
        totalIssuedInput.value = totalIssued || 0;
        daysToLiveInput.value = promoData.DAYSTOLIVE || 30;
        productNotes.value = promoData.NOTES || '';
        mainProductImage.src = `media/${promoData.PRODUCTID}.png`;

        // Highlight selected product in dropdown
        updateDropdownSelection(promoData.ID);

        // Populate carousel list with associated carousels
        carouselList.innerHTML = '';
        if (associatedCarousels && associatedCarousels.length > 0) {
            associatedCarousels.forEach(carousel => {
                const div = document.createElement('div');
                div.className = 'info-item';
                div.innerHTML = `
                    <span class="carousel-info">${carousel.CAROUSELCODE} - ${carousel.CAROUSELNAME}</span>
                    <span class="carousel-chance">(${(carousel.CHANCE * 100).toFixed(0)}% chance)</span>
                `;
                div.addEventListener('click', function() {
                    window.location.href = `carousel.html?id=${carousel.CAROUSELID}`;
                });
                carouselList.appendChild(div);
            });
        } else {
            carouselList.innerHTML = '<div class="no-data">No associated carousels found</div>';
        }

        // Adjust text area height
        productNotes.style.height = 'auto';
        productNotes.style.height = (productNotes.scrollHeight) + 'px';

        currentProductId = promoData.ID;
        formChanged = false;
        updateNavigationState();
    }

    function updateDropdownSelection(promoID) {
        // Remove previous selection
        const previouslySelected = productDropdown.querySelector('.product-option.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        
        // Add selection to current product
        const currentOption = productDropdown.querySelector(`[data-product-id="${promoID}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }

    async function saveProductData() {
        if (!headerProductCode.value.trim()) {
            showWarningModal('Product Code is required');
            headerProductCode.focus();
            validForInsert = false;
            return;
        }

        if (!headerProductName.value.trim()) {
            showWarningModal('Product Name is required');
            headerProductName.focus();
            validForInsert = false;
            return;
        }

        if (priceInput.value == 0) {
            showWarningModal('Product Price is required');
            priceInput.focus();
            validForInsert = false;
            return;
        }

        if (!daysToLiveInput.value || daysToLiveInput.value <= 0) {
            showWarningModal('Days to Live must be greater than 0');
            daysToLiveInput.focus();
            validForInsert = false;
            return;
        }

        try {
            // If we have selectedProductData, use it; otherwise create new product data
            const promoData = selectedProductData ? {
                id: selectedProductData.ID,
                code: parseInt(headerProductCode.value),
                product: selectedProductData.PRODUCTID,
                type: selectedProductData.TYPEID,
                maker: selectedProductData.MAKERID,
                discount: parseFloat(discountInput.value) / 100,
                daysToLive: parseInt(daysToLiveInput.value),
                notes: productNotes.value
            } : {
                code: parseInt(headerProductCode.value),
                product: null, // Will need to be set when linking to a product
                type: null,
                maker: null,
                discount: parseFloat(discountInput.value) / 100,
                daysToLive: parseInt(daysToLiveInput.value),
                notes: productNotes.value
            };

            const result = promoID === 'new' 
                ? await insertPromo(promoData)
                : await updatePromo(promoData);

            if (result.success) {
                validForInsert = true;
                formChanged = false;
                
                // Reload data
                promos = await fetchFilteredPromos(selectedType, selectedMaker);
                
                // Refresh totalIssued count if we have a saved promo
                if (promoID !== 'new') {
                    totalIssued = await getIssuedCount(currentProductId);
                    totalIssuedInput.value = totalIssued || 0;
                }
                
                // Refresh associated carousels
                if (currentProductId !== 'new') {
                    associatedCarousels = await getAssociatedCarouselForPromo(currentProductId);
                }
                
                const savedPromo = promos.find(p => p.CODE === promoData.code);
                
                if (savedPromo) {
                    if (promoID === 'new') {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', savedPromo.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        currentProductId = savedPromo.ID;
                    }
                    
                    setupProductDropdown(); // Refresh dropdown
                    loadPromoData(savedPromo);
                    showConfirmation();
                } else {
                    throw new Error('Saved promo not found in results');
                }
            } else {
                if (result.isDuplicateCode) {
                    showWarningModal(result.error);
                    headerProductCode.focus();
                    headerProductCode.select();
                } else {
                    throw new Error(result.error);
                }
                validForInsert = false;
            }
        } catch (error) {
            console.error('Error saving promo:', error);
            showWarningModal(`Failed to save changes: ${error.message}`);
            validForInsert = false;
        }
    }

    function createNewPromo() {
        selectedProductData = null;
        headerProductCode.value = "";
        headerProductName.value = "";
        priceInput.value = "0";
        discountInput.value = "0";
        finalPriceInput.value = "0";
        totalIssuedInput.value = "0";
        daysToLiveInput.value = "30";
        productNotes.value = "";
        mainProductImage.src = "media/9997.png";
        
        pendingImageFile = null;
        carouselList.innerHTML = '';

        // Clear dropdown selection
        const previouslySelected = productDropdown.querySelector('.product-option.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        headerProductCode.focus();
        updateNavigationState();

        formChanged = true;
        currentProductId = 'new';
        totalIssued = 0;
        associatedCarousels = [];
    }

    // #endregion
    // #region NAVIGATION FUNCTIONS
    function handleNavigation(direction) {// Handle navigation with unsaved changes check
        if (formChanged) {
            pendingNavigationDirection = direction;
            showUnsavedChangesModal();
        } else {
            navigateProduct(direction);
        }
    }

    async function navigateProduct(direction) {
        try {
            const currentIndex = promos.findIndex(p => p.ID === currentProductId);
            if (currentIndex === -1) {
                console.error('Current promo not found in dataset');
                return;
            }

            let targetProduct = null;
            
            if (direction === 'next') {
                targetProduct = promos[currentIndex + 1];
            } else if (direction === 'prev') {
                targetProduct = promos[currentIndex - 1];
            }

            if (targetProduct) {
                // Refresh totalIssued and associated carousels for the target promo
                totalIssued = await getIssuedCount(targetProduct.ID);
                associatedCarousels = await getAssociatedCarouselForPromo(targetProduct.ID);
                
                loadPromoData(targetProduct);
                const params = new URLSearchParams(window.location.search);
                params.set('id', targetProduct.ID);
                const newUrl = `${window.location.pathname}?${params.toString()}`;
                window.history.pushState({}, '', newUrl);
            }
        } catch (error) {
            console.error('Navigation error:', error);
            showWarningModal('Failed to navigate between promos');
        }
    }

    function updateNavigationState() {
        const currentIndex = promos.findIndex(p => p.ID === currentProductId);

        sidePrevBtn.disabled = currentIndex <= 0;
        sideNextBtn.disabled = currentIndex >= promos.length - 1;
        
        sidePrevBtn.style.opacity = sidePrevBtn.disabled ? '0.5' : '1';
        sideNextBtn.style.opacity = sideNextBtn.disabled ? '0.5' : '1';
    }

    // #endregion
    // #region MODAL FUNCTIONS
    function showWarningModal(message) {
        const warningModal = document.getElementById('warningModal');
        const warningMessage = document.getElementById('warningMessage');
        warningMessage.textContent = message;
        warningModal.style.display = 'flex';
    }

    function showConfirmation() {// Update showConfirmation function to ensure modal is visible
        const saveConfirmation = document.getElementById('saveConfirmation');
        saveConfirmation.style.display = 'flex';

        setTimeout(() => {// Auto-hide after 2 seconds
            saveConfirmation.style.display = 'none';
        }, 2000);
    }
    
    function showUnsavedChangesModal() {
        unsavedChangesModal.style.display = 'flex';
    }
    // #endregion
    // #endregion
import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchFilteredPromos, getAssociatedCarouselForPromo, 
    getIssuedCount, updatePromo, insertPromo, deletePromo, } from './dbService.js';

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
    const mainProductImage = document.getElementById('mainProductImage');

    // Headers
    const headerProductCode = document.getElementById('headerProductCode');
    const headerProductName = document.getElementById('headerProductName');
    const productDropdown = document.getElementById('productDropdown');

    //Carousel list
    const carouselList = document.getElementById('carouselList');

    // Image Preview Modal functionality
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const previewImage = document.getElementById('previewImage');
    const closeModal = document.querySelector('.preview-close-modal');

    // Notes
    const productNotes = document.getElementById('productNotes');

    // State variables
    let currentPromoId = 1;
    let formChanged = false;
    let pendingNavigationDirection = null;
    let validForInsert = true;
    let selectedProductData = null;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let promoID = urlParams.get('id');
    const selectedMaker = urlParams.get('maker');
    const selectedType = urlParams.get('type');

    // Data tables
    let promos = [];
    let allProducts = [];
    let totalIssued;
    let associatedCarousels = [];
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {

    promos = await fetchFilteredPromos(selectedType, selectedMaker);
    
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
        allProducts = await fetchFilteredProducts('All', 'All');
    } else {
        showWarningModal('Promo not found');
    }

    setupProductDropdown();
    updateButtonVisibility();

    window.addEventListener('popstate', async function() {
        const params = new URLSearchParams(window.location.search);
        const newPromoId = params.get('id');

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
        updateButtonVisibility();
    });
    
// #region EVENT LISTENERS
    headerProductCode.addEventListener('input', function() {
        formChanged = true;
        
        // Real-time duplicate code checking (debounced)
        clearTimeout(this.duplicateCheckTimeout);
        this.duplicateCheckTimeout = setTimeout(async () => {
            const enteredCode = parseInt(this.value);
            if (!isNaN(enteredCode)) {
                const allPromos = await fetchFilteredPromos('All', 'All');
                const existingPromo = allPromos.find(p => 
                    p.CODE === enteredCode && 
                    (promoID === 'new' || p.ID !== currentPromoId)
                );
                
                if (existingPromo) {
                    this.style.borderColor = '#dc3545';
                    this.title = `Code ${enteredCode} is already in use by "${existingPromo.PRODUCTNAME}"`;
                } else {
                    this.style.borderColor = '';
                    this.title = '';
                }
            }
        }, 500); // 500ms delay for debouncing
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

        // Only navigate if save was successful and there's a pending navigation
        if (validForInsert && pendingNavigationDirection) {
            navigateProduct(pendingNavigationDirection);
            pendingNavigationDirection = null;
        }
        // Remove the else showConfirmation() call since it's handled in saveProductData()
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
        
        // Only navigate if save was successful
        if (validForInsert) {
            if (pendingNavigationDirection === 'new') {
                const params = new URLSearchParams(window.location.search);
                params.set('id', 'new');
                window.location.href = `${window.location.pathname}?${params.toString()}`;
            } else {
                navigateProduct(pendingNavigationDirection);
            }
            pendingNavigationDirection = null;
            unsavedChangesModal.style.display = 'none';
        }
        // If save failed, don't navigate and keep the modal open for user to see the error
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
        // Remove the automatic showConfirmation() call:
        // if (validForInsert){
        //     showConfirmation();
        // }
        // The showConfirmation() should only be called from within saveProductData() upon successful save
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
        // Check if promo has associated carousels
        if (associatedCarousels && associatedCarousels.length > 0) {
            deleteConfirmationModal.style.display = 'none';
            showWarningModal('This promo cannot be deleted because it is used in carousel(s). Remove it from the carousel(s) and then delete it');
            return;
        }
    });

    confirmDeleteBtn.addEventListener('click', async function() {
        try {
            const result = await deletePromo(currentPromoId);
            
            if (result.success) {
                const promoIndex = promos.findIndex(p => p.ID === currentPromoId);
                if (promoIndex !== -1) {
                    promos.splice(promoIndex, 1);
                    
                    if (promos.length > 0) {
                        let nextProduct;
                        if (promoIndex >= promos.length) {
                            nextProduct = promos[promos.length - 1];
                        } else {
                            nextProduct = promos[promoIndex];
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

        // For new promos, keep the user-entered promo code and fill product details
        if (promoID === 'new') {
            headerProductName.value = product.NAME || '';
            priceInput.value = product.PRICE || 0;
            if (product.ID) {
                mainProductImage.src = `media/${product.ID}.png`;
            } else {
                mainProductImage.src = "media/9997.png";
            }
            totalIssued = 0;
            associatedCarousels = [];
            totalIssuedInput.value = 0;
            carouselList.innerHTML = '<div class="no-data">No associated carousels found</div>';
            
            // Don't navigate away from new promo page - just close dropdown
            productDropdown.classList.remove('active');
            formChanged = true;
            return; // Exit here - don't run the existing promo navigation code
        }
        
        headerProductCode.value = product.CODE || '';
        headerProductName.value = product.NAME || '';
        totalIssued = await getIssuedCount(product.ID);
        associatedCarousels = await getAssociatedCarouselForPromo(product.ID);
        const params = new URLSearchParams(window.location.search);
        params.set('id', product.ID);
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        
        loadPromoData(product);
        productDropdown.classList.remove('active');
        updateButtonVisibility();
        formChanged = true;
    }
    // #endregion
    // #region PRODUCT FUNCTIONS
    function loadPromoData(promoData) {
        selectedProductData = promoData;
        headerProductCode.value = promoData.CODE;
        headerProductName.value = promoData.PRODUCTNAME;
        priceInput.value = promoData.PRICE;
        discountInput.value = (promoData.DISCOUNT * 100).toFixed(0);
        finalPriceInput.value = (promoData.PRICE - (promoData.PRICE * promoData.DISCOUNT)).toFixed(2);
        totalIssuedInput.value = totalIssued || 0;
        daysToLiveInput.value = promoData.DAYSTOLIVE;
        productNotes.value = promoData.NOTES || '';
        
        if (promoData.PRODUCTID) {
            mainProductImage.src = `media/${promoData.PRODUCTID}.png`;
        } else {
            mainProductImage.src = "media/9997.png";
        }

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

        currentPromoId = promoData.ID;
        formChanged = false;
        updateNavigationState();
        updateButtonVisibility(); // Add this line
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
        showWarningModal('Promo Code is required');
        headerProductCode.focus();
        validForInsert = false;
        return;
    }

    if (!headerProductName.value.trim()) {
        showWarningModal('Product is required');
        headerProductName.focus();
        validForInsert = false;
        return;
    }

    if (discountInput.value == 0) {
        showWarningModal('Promo discount is required');
        discountInput.focus();
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
        // Fetch all promos to check for duplicates
        const allPromos = await fetchFilteredPromos('All', 'All');
        
        // Check for duplicate code using the isDuplicateCode function
        if (isDuplicateCode(allPromos, headerProductCode)) {
            const enteredCode = parseInt(headerProductCode.value);
            const duplicatePromo = allPromos.find(p => p.CODE === enteredCode);
            
            // If we're editing an existing promo, exclude it from duplicate check
            if (promoID === 'new' || (duplicatePromo && duplicatePromo.ID !== currentPromoId)) {
                showWarningModal(`Promo code ${enteredCode} already exists${duplicatePromo ? ` (used by "${duplicatePromo.PRODUCTNAME}")` : ''}. Please use a different code.`);
                headerProductCode.focus();
                headerProductCode.select();
                validForInsert = false;
                return;
            }
        }

        // Build promo data based on whether we're creating new or updating existing
        const promoData = {
            code: parseInt(headerProductCode.value),
            product: selectedProductData ? selectedProductData.ID : null,
            type: selectedProductData ? selectedProductData.TYPEID : null,
            maker: selectedProductData ? selectedProductData.MAKERID : null,
            discount: parseFloat(discountInput.value) / 100,
            daysToLive: parseInt(daysToLiveInput.value),
            notes: productNotes.value
        };

        // Add ID for updates
        if (promoID !== 'new' && selectedProductData) {
            promoData.id = selectedProductData.ID;
        }

        const result = promoID === 'new' 
            ? await insertPromo(promoData)
            : await updatePromo(promoData);

        if (result.success) {
            validForInsert = true;
            formChanged = false;
            
            if (promoID === 'new') {
                // Try multiple properties for the returned ID
                const newPromoId = result.id || result.insertId || result.promoId || result.newId;
                
                if (newPromoId) {
                    // Update URL to show the saved promo
                    const params = new URLSearchParams(window.location.search);
                    params.set('id', newPromoId);
                    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                    currentPromoId = newPromoId;
                    
                    // Update the global promoID variable
                    promoID = newPromoId.toString();
                    
                    // Refresh associated data for the saved promo
                    totalIssued = await getIssuedCount(newPromoId);
                    associatedCarousels = await getAssociatedCarouselForPromo(newPromoId);
                    
                    // Reload the promos list - use 'All' for type/maker if they're null/undefined
                    const filterType = selectedType || 'All';
                    const filterMaker = selectedMaker || 'All';
                    promos = await fetchFilteredPromos(filterType, filterMaker);
                    
                    // Find the saved promo in the refreshed list by code
                    const savedPromo = promos.find(p => p.CODE === parseInt(headerProductCode.value));
                    
                    if (savedPromo) {
                        // Update with the actual promo ID from the database
                        currentPromoId = savedPromo.ID;
                        promoID = savedPromo.ID.toString();
                        
                        // Update URL with correct ID
                        const updatedParams = new URLSearchParams(window.location.search);
                        updatedParams.set('id', savedPromo.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${updatedParams.toString()}`);
                        
                        setupProductDropdown(); // Refresh dropdown
                        loadPromoData(savedPromo);
                        showConfirmation(); // Only show confirmation here when actually successful
                    } else {
                        // If we can't find by code, show success but warn about data
                        showConfirmation();
                        console.log('Promo saved but not found in filtered results. This may be due to filtering constraints.');
                    }
                } else {
                    // If no ID returned, try to find the promo by code with broader search
                    const filterType = selectedType || 'All';
                    const filterMaker = selectedMaker || 'All';
                    promos = await fetchFilteredPromos(filterType, filterMaker);
                    const savedPromo = promos.find(p => p.CODE === parseInt(headerProductCode.value));
                    
                    if (savedPromo) {
                        // Update URL to show the saved promo
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', savedPromo.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        currentPromoId = savedPromo.ID;
                        promoID = savedPromo.ID.toString();
                        
                        // Refresh associated data
                        totalIssued = await getIssuedCount(savedPromo.ID);
                        associatedCarousels = await getAssociatedCarouselForPromo(savedPromo.ID);
                        
                        setupProductDropdown(); // Refresh dropdown
                        loadPromoData(savedPromo);
                        showConfirmation(); // Only show confirmation here when actually successful
                    } else {
                        // Promo saved but can't be found - likely due to filtering
                        showConfirmation();
                        console.log('Promo saved successfully but may not match current filter criteria.');
                    }
                }
            } else {
                // For existing promos, reload data normally
                const filterType = selectedType || 'All';
                const filterMaker = selectedMaker || 'All';
                promos = await fetchFilteredPromos(filterType, filterMaker);
                const savedPromo = promos.find(p => p.CODE === parseInt(headerProductCode.value));
                
                if (savedPromo) {
                    totalIssued = await getIssuedCount(savedPromo.ID);
                    associatedCarousels = await getAssociatedCarouselForPromo(savedPromo.ID);
                    
                    setupProductDropdown(); // Refresh dropdown
                    loadPromoData(savedPromo);
                    showConfirmation(); // Only show confirmation here when actually successful
                } else {
                    throw new Error('Updated promo not found in results');
                }
            }
        } else {
            // Enhanced error handling for different types of failures
            if (result.isDuplicateCode || (result.error && result.error.toLowerCase().includes('duplicate'))) {
                const enteredCode = parseInt(headerProductCode.value);
                showWarningModal(`Promo code ${enteredCode} already exists. Please use a different code.`);
                headerProductCode.focus();
                headerProductCode.select();
            } else if (result.error && result.error.toLowerCase().includes('constraint')) {
                showWarningModal('A promo with this information already exists. Please check your entries.');
                headerProductCode.focus();
            } else {
                showWarningModal(`Failed to save promo: ${result.error || 'Unknown error occurred'}`);
            }
            validForInsert = false;
            return; // Exit early - no success actions
        }
    } catch (error) {
        console.error('Error saving promo:', error);
        
        // Handle different types of errors
        if (error.message.toLowerCase().includes('duplicate') || 
            error.message.toLowerCase().includes('constraint')) {
            const enteredCode = parseInt(headerProductCode.value);
            showWarningModal(`Promo code ${enteredCode} already exists. Please use a different code.`);
            headerProductCode.focus();
            headerProductCode.select();
        } else {
            showWarningModal(`Failed to save changes: ${error.message}`);
        }
        validForInsert = false;
        return; // Exit early - no success actions
    }
}

    function isDuplicateCode(array, input) {
        const enteredCode = parseInt(input.value);
        
        return array.some(promo => 
        promo.CODE === enteredCode && 
        (promoID === 'new' || promo.ID !== currentPromoId));
    }

    function createNewPromo() {
        selectedProductData = null;
        headerProductCode.value = "";
        headerProductName.value = "";
        priceInput.value = "";
        discountInput.value = "";
        finalPriceInput.value = "";
        totalIssuedInput.value = "";
        daysToLiveInput.value = "";
        productNotes.value = "";
        mainProductImage.src = "media/9997.png";
        
        carouselList.innerHTML = '';

        // Clear dropdown selection
        const previouslySelected = productDropdown.querySelector('.product-option.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        headerProductCode.focus();
        updateNavigationState();
        updateButtonVisibility(); // Add this line

        formChanged = true;
        currentPromoId = 'new';
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
            const currentIndex = promos.findIndex(p => p.ID === currentPromoId);
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
                updateButtonVisibility(); // Add this line
            }
        } catch (error) {
            console.error('Navigation error:', error);
            showWarningModal('Failed to navigate between promos');
        }
    }

    function updateNavigationState() {
        if (promoID === 'new') {
            sidePrevBtn.style.display = 'none';
            sideNextBtn.style.display = 'none';
            return; // Exit early
        }
    
        sidePrevBtn.style.display = 'flex';
        sideNextBtn.style.display = 'flex';

        const currentIndex = promos.findIndex(p => p.ID === currentPromoId);

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

    function updateButtonVisibility() {
        const currentParams = new URLSearchParams(window.location.search);
        const currentPromoID = currentParams.get('id');
        const isNewPromo = currentPromoID === 'new';
        
        // Show/hide Save and Cancel buttons based on whether it's a new promo
        saveBtn.style.display = isNewPromo ? 'inline-block' : 'none';
        cancelBtn.style.display = isNewPromo ? 'inline-block' : 'none';
        
        // Make all form fields readonly if not a new promo
        const formInputs = productForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            if (!isNewPromo) {
                input.setAttribute('readonly', true);
                input.classList.add('readonly-mode');
            } else {
                input.removeAttribute('readonly');
                input.classList.remove('readonly-mode');
                // Exception: totalIssued should always be readonly
                if (input.id === 'totalIssued') {
                    input.setAttribute('readonly', true);
                    input.classList.add('readonly-mode');
                }
            }
        });
        
        // Special handling for dropdown - disable in readonly mode
        headerProductName.disabled = !isNewPromo;
        if (!isNewPromo) {
            productDropdown.style.display = 'none';
        } else {
            productDropdown.style.display = '';
        }
    }
    // #endregion
    // #endregion
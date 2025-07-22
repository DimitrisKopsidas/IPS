import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchFilteredPromos, fetchFilteredCarousels,
    updatePromoLines, insertPromoLines, deletePromoLines, getAllDevices, 
    getProductLinesByCarousel, getPromoLinesByCarousel,
    updateProductLines, insertProductLines, deleteProductLines } from './dbService.js';

// #region VARIABLE DECLARATION
    // Form references
    const productForm = document.getElementById('productForm');

    // Carousel Settings Inputs
    const deviceSelect = document.getElementById('device');
    const autoplayWaitInput = document.getElementById('autoplaywait');
    const speedInput = document.getElementById('speed');
    const gameCountInput = document.getElementById('gamecount');

    // Minigame Settings Inputs
    const revolutionsInput = document.getElementById('revolutions');
    const spinDurationInput = document.getElementById('spinduration');
    const onStopTimeInput = document.getElementById('onstoptime');
    const inactivityTimeInput = document.getElementById('inactivitytime');

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
    const associatedProducts = document.getElementById('associatedProducts');
    const associatedPromos = document.getElementById('associatedPromos');

    // State variables
    let currentCarouselId = 1;
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
    let products = [];
    let carousels = [];
    let productlines = [];
    let promolines = [];
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {
    products = await fetchFilteredProducts('All', 'All');
    promos = await fetchFilteredPromos('All', 'All');
    carousels = await fetchFilteredCarousels(true);

    const data = carousels.find(p => p.ID.toString() === promoID);
    
    if (data) {
        loadCarouselData(data);
    } else if (promoID === 'new') {
        createNewCarousel();
    } else {
        showWarningModal('Promo not found');
    }

    setupProductDropdown();
    await populateDeviceDropdown();

    window.addEventListener('popstate', async function() {
        const params = new URLSearchParams(window.location.search);
        const newCarouselId = params.get('id');

        if (newCarouselId && newCarouselId !== 'new') {
            associatedCarousels = await getAssociatedCarouselForPromo(newCarouselId);
        } else {
            associatedCarousels = [];
        }
        
        const data = promos.find(p => p.ID.toString() === newCarouselId);
        
        if (data) {
            loadCarouselData(data);
        } else if (newCarouselId === 'new') {
            createNewCarousel();
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
        loadCarouselData(selectedProductData);
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

    deleteBtn.addEventListener('click', function() {
        deleteConfirmationModal.style.display = 'flex';
    });

    confirmDeleteBtn.addEventListener('click', async function() {//IMAGE AND DB DELETION
        try {
            const imageResult = await deleteImage(currentCarouselId);
            if (!imageResult.success) {
                throw new Error(`Failed to delete image: ${imageResult.error}`);
            }

            const result = await deletePromo(currentCarouselId);
            
            if (result.success) {
                const promoIndex = promos.findIndex(p => p.ID === currentCarouselId);
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
                        loadCarouselData(nextProduct);
                    } else {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', 'new');
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        createNewCarousel();
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
        populateProductDropdown(products);
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
            populateProductDropdown(products);
            return;
        }

        const filtered = products.filter(product => {
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
        
    }
    // #endregion
    // #region PRODUCT FUNCTIONS
    async function loadCarouselData(data) {
        headerProductCode.value = data.CODE || '';
        headerProductName.value = data.NAME || '';

        // Populate carousel and minigame settings
        deviceSelect.value = data.DEVICEID || '';
        autoplayWaitInput.value = data.AUTOPLAYWAIT || 0;
        speedInput.value = data.SPEED || 0;
        gameCountInput.value = data.GAMECOUNT || 0;
        revolutionsInput.value = data.REVOLUTIONS || 0;
        spinDurationInput.value = data.SPINDURATION || 0;
        onStopTimeInput.value = data.ONSTOPTIME || 0;
        inactivityTimeInput.value = data.INACTIVITYTIME || 0;

        // Highlight selected product in dropdown
        updateDropdownSelection(data.ID);

        // --- Associated Products ---
        if (associatedProducts) {
            associatedProducts.innerHTML = '<div class="no-data">Loading associated products...</div>';
            try {
                const productLines = await getProductLinesByCarousel(data.ID);
                if (productLines && productLines.length > 0) {
                    associatedProducts.innerHTML = '';

                    // Helper to update queue values after drag
                    function updateQueueInputs() {
                        const items = associatedProducts.querySelectorAll('.info-item');
                        items.forEach((item, idx) => {
                            const input = item.querySelector('.queue-input');
                            if (input) input.value = (idx + 1).toString().padStart(2, '0');
                        });
                    }

                    // Drag and drop handlers
                    let dragSrcEl = null;

                    function handleDragStart(e) {
                        dragSrcEl = this;
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/html', this.outerHTML);
                        this.classList.add('dragElem');
                    }

                    function handleDragOver(e) {
                        if (e.preventDefault) e.preventDefault();
                        this.classList.add('over');
                        e.dataTransfer.dropEffect = 'move';
                        return false;
                    }

                    function handleDragLeave(e) {
                        this.classList.remove('over');
                    }

                    function handleDrop(e) {
                        if (e.stopPropagation) e.stopPropagation();
                        if (dragSrcEl !== this) {
                            this.parentNode.removeChild(dragSrcEl);
                            const dropHTML = e.dataTransfer.getData('text/html');
                            this.insertAdjacentHTML('beforebegin', dropHTML);
                            const droppedElem = this.previousSibling;
                            addDnDEvents(droppedElem);
                            updateQueueInputs();
                        }
                        this.classList.remove('over');
                        return false;
                    }

                    function handleDragEnd(e) {
                        this.classList.remove('dragElem');
                        const items = associatedProducts.querySelectorAll('.info-item');
                        items.forEach(item => item.classList.remove('over'));
                    }

                    function addDnDEvents(elem) {
                        elem.setAttribute('draggable', 'true');
                        elem.addEventListener('dragstart', handleDragStart, false);
                        elem.addEventListener('dragover', handleDragOver, false);
                        elem.addEventListener('dragleave', handleDragLeave, false);
                        elem.addEventListener('drop', handleDrop, false);
                        elem.addEventListener('dragend', handleDragEnd, false);

                        // Restrict queue-input to 2 digits
                        const queueInput = elem.querySelector('.queue-input');
                        if (queueInput) {
                            queueInput.addEventListener('input', function() {
                                if (this.value.length > 2) {
                                    this.value = this.value.slice(0, 2);
                                }
                            });
                            queueInput.addEventListener('keypress', function(e) {
                                if (this.value.length >= 2 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            });
                        }
                    }

                    productLines.forEach((product, idx) => {
                        const div = document.createElement('div');
                        div.className = 'info-item';
                        div.setAttribute('draggable', 'true');
                        div.innerHTML = `
                            <span class="product-info">${product.PRODUCTCODE} - ${product.PRODUCTNAME}</span>
                            <input type="number" class="queue-input" value="${(idx + 1).toString().padStart(2, '0')}" min="0" max="99" style="width:2.5em; margin-left:10px;" title="Queue">
                        `;
                        div.addEventListener('click', function(e) {
                            if (e.target.tagName.toLowerCase() === 'input') return;
                            window.location.href = `product.html?id=${product.PRODUCTID}&type=All&maker=All`;
                        });
                        addDnDEvents(div);
                        associatedProducts.appendChild(div);
                    });

                    updateQueueInputs();
                } else {
                    associatedProducts.innerHTML = '<div class="no-data">No associated products found</div>';
                }
            } catch (err) {
                associatedProducts.innerHTML = '<div class="no-data">Failed to load associated products</div>';
            }
        }

        currentCarouselId = data.ID;
        formChanged = false;
        updateNavigationState();
    }

    function updateDropdownSelection(carouselID) {
        // Remove previous selection
        const previouslySelected = productDropdown.querySelector('.product-option.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        
        // Add selection to current product
        const currentOption = productDropdown.querySelector(`[data-product-id="${carouselID}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }

    async function saveProductData() {
        // if (!headerProductCode.value.trim()) {
        //     showWarningModal('Product Code is required');
        //     headerProductCode.focus();
        //     validForInsert = false;
        //     return;
        // }

        // if (!headerProductName.value.trim()) {
        //     showWarningModal('Product Name is required');
        //     headerProductName.focus();
        //     validForInsert = false;
        //     return;
        // }

        // if (priceInput.value == 0) {
        //     showWarningModal('Product Price is required');
        //     priceInput.focus();
        //     validForInsert = false;
        //     return;
        // }

        // if (!daysToLiveInput.value || daysToLiveInput.value <= 0) {
        //     showWarningModal('Days to Live must be greater than 0');
        //     daysToLiveInput.focus();
        //     validForInsert = false;
        //     return;
        // }

        try {
            // Build promo data based on whether we're creating new or updating existing
            const data = {
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
                data.id = selectedProductData.ID;
            }

            const result = promoID === 'new' 
                ? await insertPromo(data)
                : await updatePromo(data);

            if (result.success) {
                validForInsert = true;
                formChanged = false;
                
                if (promoID === 'new') {
                    // Try multiple properties for the returned ID
                    const newCarouselId = result.id || result.insertId || result.promoId || result.newId;
                    
                    if (newCarouselId) {
                        // Update URL to show the saved promo
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', newCarouselId);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        currentCarouselId = newCarouselId;
                        
                        // Update the global promoID variable
                        promoID = newCarouselId.toString();
                        
                        // Reload the promos list - use 'All' for type/maker if they're null/undefined
                        const filterType = selectedType || 'All';
                        const filterMaker = selectedMaker || 'All';
                        promos = await fetchFilteredPromos(filterType, filterMaker);
                        
                        // Find the saved promo in the refreshed list by code
                        const savedPromo = promos.find(p => p.CODE === parseInt(headerProductCode.value));
                        
                        if (savedPromo) {
                            // Update with the actual promo ID from the database
                            currentCarouselId = savedPromo.ID;
                            promoID = savedPromo.ID.toString();
                            
                            // Update URL with correct ID
                            const updatedParams = new URLSearchParams(window.location.search);
                            updatedParams.set('id', savedPromo.ID);
                            window.history.pushState({}, '', `${window.location.pathname}?${updatedParams.toString()}`);
                            
                            setupProductDropdown(); // Refresh dropdown
                            loadCarouselData(savedPromo);
                            showConfirmation();
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
                            currentCarouselId = savedPromo.ID;
                            promoID = savedPromo.ID.toString();
                            
                            setupProductDropdown(); // Refresh dropdown
                            loadCarouselData(savedPromo);
                            showConfirmation();
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
                        setupProductDropdown(); // Refresh dropdown
                        loadCarouselData(savedPromo);
                        showConfirmation();
                    } else {
                        throw new Error('Updated promo not found in results');
                    }
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

    function createNewCarousel() {
        selectedProductData = null;
        headerProductCode.value = "";
        headerProductName.value = "";
        priceInput.value = "0";
        discountInput.value = "0";
        finalPriceInput.value = "0";
        totalIssuedInput.value = "0";
        daysToLiveInput.value = "0";
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

        formChanged = true;
        currentCarouselId = 'new';
        totalIssued = 0;
        associatedCarousels = [];
    }

    async function populateDeviceDropdown() {
        try {
            const response = await fetch('http://localhost:3000/api/getAllDevices');
            if (!response.ok) throw new Error('Failed to fetch devices');
            const devices = await response.json();
            deviceSelect.innerHTML = '<option value="">-- Select a Device --</option>';
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.ID;
                option.textContent = `${device.NAME} (${device.CONNECTKEY})`;
                deviceSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error populating devices:', error);
            deviceSelect.innerHTML = '<option value="">Error loading devices</option>';
        }
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
            const currentIndex = promos.findIndex(p => p.ID === currentCarouselId);
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
                loadCarouselData(targetProduct);
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
        if (promoID === 'new') {
            sidePrevBtn.style.display = 'none';
            sideNextBtn.style.display = 'none';
            return; // Exit early
        }
    
        sidePrevBtn.style.display = 'flex';
        sideNextBtn.style.display = 'flex';

        const currentIndex = promos.findIndex(p => p.ID === currentCarouselId);

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
import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchFilteredPromos, fetchFilteredCarousels,
    updatePromoLines, insertPromoLines, deletePromoLines, getAllDevices, 
    getProductLinesByCarousel, getPromoLinesByCarousel,
    updateProductLines, insertProductLines, deleteProductLines } from './dbService.js';

// #region VARIABLE DECLARATION
    // Form references
    const minigameSettingsForm = document.getElementById('MinigameSettingsForm');
    const carouselSettingsForm = document.getElementById('CarouselSettingsForm');
    const associatedProductSearch = document.getElementById('associatedProductSearch');
    const associatedProductDropdown = document.getElementById('associatedProductDropdown');


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

    // Headers
    const headerCarouselCode = document.getElementById('headerCarouselCode');
    const headerCarouselName = document.getElementById('headerCarouselName');

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
    let carouselId = urlParams.get('id');

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
    await populateDeviceDropdown();

    const data = carousels.find(p => p.ID.toString() === carouselId);
    
    if (data) {
        loadCarouselData(data);
    } else if (carouselId === 'new') {
        createNewCarousel();
    } else {
        showWarningModal('Carousel not found');
    }

    window.addEventListener('popstate', async function() {
        const params = new URLSearchParams(window.location.search);
        const newCarouselId = params.get('id');
        
        const data = carousels.find(p => p.ID.toString() === newCarouselId);
        
        if (data) {
            loadCarouselData(data);
        } else if (newCarouselId === 'new') {
            createNewCarousel();
        } else {
            showWarningModal('Carousel not found');
        }
    });
    
// #region EVENT LISTENERS
    headerCarouselCode.addEventListener('input', function() {
        formChanged = true;
    });

    headerCarouselName.addEventListener('input', function() {
        formChanged = true;
        filterProductDropdown(this.value);
    });

    sidePrevBtn.addEventListener('click', function() {
        handleNavigation('prev');
    });

    sideNextBtn.addEventListener('click', function() {
        handleNavigation('next');
    });

    minigameSettingsForm.addEventListener('input', function() {
        formChanged = true;
    });

    carouselSettingsForm.addEventListener('input', function() {
        formChanged = true;
    });

    minigameSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCarouselData();
        formChanged = false;

        if (pendingNavigationDirection) {
            navigateProduct(pendingNavigationDirection);
            pendingNavigationDirection = null;
        } else {
            showConfirmation();
        }
    });

    carouselSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCarouselData();
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
        saveCarouselData();
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
        saveCarouselData();
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

    if (associatedProductSearch && associatedProductDropdown) {
    associatedProductSearch.addEventListener('input', function() {
        filterAssociatedProductDropdown(this.value);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!associatedProductSearch.contains(e.target) && !associatedProductDropdown.contains(e.target)) {
            associatedProductDropdown.classList.remove('active');
        }
    });
}
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
            option.dataset.carouselId = product.ID;
            
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

    function populateAssociatedProductDropdown(products) {
    associatedProductDropdown.innerHTML = '';
    
    products.forEach(product => {
        const option = document.createElement('div');
        option.className = 'product-option';
        option.dataset.productId = product.ID;
        
        const makerName = product.MAKERNAME || 'Unknown';
        const typeName = product.TYPENAME || 'Unknown';
        
        option.innerHTML = `
            <span class="product-code">${product.CODE}</span>
            <span class="product-name">${product.NAME}</span>
            <span class="product-details">(${makerName}, ${typeName})</span>
        `;
        
        option.addEventListener('click', function() {
            selectAssociatedProduct(product);
        });
        
        associatedProductDropdown.appendChild(option);
    });
}

function filterAssociatedProductDropdown(searchText) {
    if (!searchText.trim()) {
        associatedProductDropdown.innerHTML = '';
        associatedProductDropdown.classList.remove('active');
        return;
    }

    const filtered = products.filter(product => {
        const makerName = product.MAKERNAME || 'Unknown';
        const typeName = product.TYPENAME || 'Unknown';
        const searchString = `${product.CODE} ${product.NAME} ${makerName} ${typeName}`.toLowerCase();
        return searchString.includes(searchText.toLowerCase());
    });

    if (filtered.length === 0) {
        associatedProductDropdown.innerHTML = '<div class="product-option">No products found</div>';
        associatedProductDropdown.classList.add('active');
        return;
    }

    populateAssociatedProductDropdown(filtered);
    
    if (!associatedProductDropdown.classList.contains('active')) {
        associatedProductDropdown.classList.add('active');
    }
}

function selectAssociatedProduct(product) {
    // Check if product is already in the list
    const existingItems = associatedProducts.querySelectorAll('.info-item');
    for (let item of existingItems) {
        const productInfo = item.querySelector('.product-info').textContent;
        if (productInfo.includes(product.CODE)) {
            showWarningModal('Product is already in the carousel');
            associatedProductSearch.value = '';
            associatedProductDropdown.classList.remove('active');
            return;
        }
    }

    // Clear "no data" message if it exists
    if (associatedProducts.querySelector('.no-data')) {
        associatedProducts.innerHTML = '';
    }

    // Create new product item
    const div = document.createElement('div');
    div.className = 'info-item';
    div.setAttribute('draggable', 'true');
    
    // Get the next queue number
    const currentItems = associatedProducts.querySelectorAll('.info-item');
    const nextQueueNum = (currentItems.length + 1).toString().padStart(2, '0');
    
    div.innerHTML = `
        <span class="product-info">${product.CODE} - ${product.NAME}</span>
        <div style="display: flex; align-items: center; margin-left: auto;">
            <input type="number" class="queue-input" value="${nextQueueNum}" min="0" max="99" style="width:2.5em; margin-right:10px;" title="Queue">
            <button class="delete-product-btn" title="Remove Product" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#dc3545;">✕</button>
        </div>
    `;
    
    // Add click handler for navigation
    div.addEventListener('click', function(e) {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.classList.contains('delete-product-btn')) return;
        window.location.href = `product.html?id=${product.ID}&type=All&maker=All`;
    });
    
    // Add delete handler
    const deleteBtn = div.querySelector('.delete-product-btn');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Remove this product from the carousel?')) {
            div.remove();
            updateQueueNumbers();
            formChanged = true;
        }
    });

    // Add drag and drop events using existing functions
    addDnDEventsToNewItem(div);
    
    associatedProducts.appendChild(div);
    updateQueueNumbers();
    formChanged = true;

    // Clear search and hide dropdown
    associatedProductSearch.value = '';
    associatedProductDropdown.classList.remove('active');
}

// Add these global drag and drop variables after your existing variable declarations
let dragSrcEl = null;

// Move all drag and drop functions to global scope, outside of loadCarouselData
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
        updateQueueNumbers();
        formChanged = true; // Mark form as changed when items are reordered
    }
    this.classList.remove('over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragElem');
    const items = associatedProducts.querySelectorAll('.info-item');
    items.forEach(item => item.classList.remove('over'));
}

// Global function to add drag and drop events
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
            formChanged = true;
        });
        queueInput.addEventListener('keypress', function(e) {
            if (this.value.length >= 2 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
}

// Update your addDnDEventsToNewItem function to use the global function
function addDnDEventsToNewItem(elem) {
    addDnDEvents(elem);
}

// Update your loadCarouselData function to remove the local drag and drop functions
async function loadCarouselData(data) {
    headerCarouselCode.value = data.CODE || '';
    headerCarouselName.value = data.NAME || '';

    // Populate carousel and minigame settings
    deviceSelect.value = data.DEVICE || '';
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

                productLines.forEach((product, idx) => {
                    const div = document.createElement('div');
                    div.className = 'info-item';
                    div.setAttribute('draggable', 'true');
                    div.innerHTML = `
                        <span class="product-info">${product.PRODUCTCODE} - ${product.PRODUCTNAME}</span>
                        <div style="display: flex; align-items: center; margin-left: auto;">
                            <input type="number" class="queue-input" value="${(idx + 1).toString().padStart(2, '0')}" min="0" max="99" style="width:2.5em; margin-right:10px;" title="Queue">
                            <button class="delete-product-btn" title="Remove Product" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#dc3545;">✕</button>
                        </div>
                    `;
                    
                    // Add click handler for navigation
                    div.addEventListener('click', function(e) {
                        if (e.target.tagName.toLowerCase() === 'input' || e.target.classList.contains('delete-product-btn')) return;
                        window.location.href = `product.html?id=${product.PRODUCTID}&type=All&maker=All`;
                    });
                    
                    // Add delete handler
                    const deleteBtn = div.querySelector('.delete-product-btn');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (confirm('Remove this product from the carousel?')) {
                            div.remove();
                            updateQueueNumbers();
                            formChanged = true;
                        }
                    });
                    
                    addDnDEvents(div);
                    associatedProducts.appendChild(div);
                });

                updateQueueNumbers();
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
    // #endregion
    // #region CAROUSEL FUNCTIONS
    

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

    async function saveCarouselData() {
        // if (!headerProductCode.value.trim()) {
        //     showWarningModal('Product Code is required');
        //     headerProductCode.focus();
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
        } catch (error) {
            console.error('Error saving carousel:', error);
            showWarningModal(`Failed to save changes: ${error.message}`);
            validForInsert = false;
        }
    }

    function createNewCarousel() {
        // Header fields
        if (headerCarouselCode) headerCarouselCode.value = "";
        if (headerCarouselName) headerCarouselName.value = "";

        // Carousel settings
        if (deviceSelect) deviceSelect.value = "";
        if (autoplayWaitInput) autoplayWaitInput.value = "0";
        if (speedInput) speedInput.value = "0";
        if (gameCountInput) gameCountInput.value = "0";

        // Minigame settings
        if (revolutionsInput) revolutionsInput.value = "0";
        if (spinDurationInput) spinDurationInput.value = "0";
        if (onStopTimeInput) onStopTimeInput.value = "0";
        if (inactivityTimeInput) inactivityTimeInput.value = "0";

        // Associated lists
        if (associatedProducts) associatedProducts.innerHTML = '';
        if (associatedPromos) associatedPromos.innerHTML = '';

        // Reset navigation and state
        updateNavigationState();
        formChanged = true;
        currentCarouselId = 'new';
        // Focus first field
        if (headerCarouselCode) headerCarouselCode.focus();
    }

    async function populateDeviceDropdown() {
        try {
            const response = await fetch('http://localhost:3000/api/getAllDevices');
            if (!response.ok) throw new Error('Failed to fetch devices');
            const devices = await response.json();
            deviceSelect.innerHTML = '<option value="">-- No device selected --</option>';
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.DEVICE;
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
            const currentIndex = carousels.findIndex(p => p.ID === currentCarouselId);
            if (currentIndex === -1) {
                console.error('Current promo not found in dataset');
                return;
            }

            let targetProduct = null;
            
            if (direction === 'next') {
                targetProduct = carousels[currentIndex + 1];
            } else if (direction === 'prev') {
                targetProduct = carousels[currentIndex - 1];
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
            showWarningModal('Failed to navigate between carousels');
        }
    }

    function updateNavigationState() {
        if (carouselId === 'new') {
            sidePrevBtn.style.display = 'none';
            sideNextBtn.style.display = 'none';
            return; // Exit early
        }
    
        sidePrevBtn.style.display = 'flex';
        sideNextBtn.style.display = 'flex';

        const currentIndex = carousels.findIndex(p => p.ID === currentCarouselId);

        sidePrevBtn.disabled = currentIndex <= 0;
        sideNextBtn.disabled = currentIndex >= carousels.length - 1;
        
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

// Add this function after your other helper functions
function updateQueueNumbers() {
    const items = associatedProducts.querySelectorAll('.info-item');
    items.forEach((item, idx) => {
        const queueInput = item.querySelector('.queue-input');
        if (queueInput) {
            queueInput.value = (idx + 1).toString().padStart(2, '0');
        }
    });
}
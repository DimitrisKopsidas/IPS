import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchFilteredPromos, fetchFilteredCarousels,
    insertPromoLines, deletePromoLines, getAllDevices, 
    getProductLinesByCarousel, getPromoLinesByCarousel,
    insertProductLines, deleteProductLines, fetchNextCarouselId, 
    DeleteCarouselAndMinigame, UpdateCarouselAndMinigame, InsertCarouselAndMinigame } from './dbService.js';

// #region VARIABLE DECLARATION
    // Form references
    const minigameSettingsForm = document.getElementById('MinigameSettingsForm');
    const carouselSettingsForm = document.getElementById('CarouselSettingsForm');
    const associatedProductSearch = document.getElementById('associatedProductSearch');
    const associatedProductDropdown = document.getElementById('associatedProductDropdown');
    const associatedPromoSearch = document.getElementById('associatedPromoSearch');
    const associatedPromoDropdown = document.getElementById('associatedPromoDropdown');


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
    let nextCarouselId;
    
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {
    products = await fetchFilteredProducts('All', 'All');
    promos = await fetchFilteredPromos('All', 'All');
    carousels = await fetchFilteredCarousels(true);
    await populateDeviceDropdown();
    nextCarouselId = await fetchNextCarouselId();

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

    confirmDeleteBtn.addEventListener('click', async function() {
        try {
            // Use the correct function to delete carousel and minigame
            const result = await DeleteCarouselAndMinigame(currentCarouselId);
            
            if (result.success) {
                // Find and remove the deleted carousel from the carousels array
                const carouselIndex = carousels.findIndex(c => c.ID === currentCarouselId);
                if (carouselIndex !== -1) {
                    carousels.splice(carouselIndex, 1);
                    
                    // Navigate to next available carousel or create new one
                    if (carousels.length > 0) {
                        let nextCarousel;
                        if (carouselIndex >= carousels.length) {
                            // If we deleted the last one, go to the previous
                            nextCarousel = carousels[carousels.length - 1];
                        } else {
                            // Otherwise go to the one that took this position
                            nextCarousel = carousels[carouselIndex];
                        }
                        
                        // Update URL and load the next carousel
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', nextCarousel.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        carouselId = nextCarousel.ID.toString(); // Update global carouselId
                        loadCarouselData(nextCarousel);
                    } else {
                        // No more carousels, create a new one
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', 'new');
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        carouselId = 'new'; // Update global carouselId
                        createNewCarousel();
                    }
                }
                
                // Close the modal and show success message
                deleteConfirmationModal.style.display = 'none';
                showWarningModal('Carousel and associated data deleted successfully');
            } else {
                throw new Error(result.error || 'Carousel deletion failed');
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

if (associatedPromoSearch && associatedPromoDropdown) {
    associatedPromoSearch.addEventListener('input', function() {
        filterAssociatedPromoDropdown(this.value);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!associatedPromoSearch.contains(e.target) && !associatedPromoDropdown.contains(e.target)) {
            associatedPromoDropdown.classList.remove('active');
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
    <span class="product-info" style="cursor:pointer; text-decoration:underline; color:#007bff;">${product.CODE} - ${product.NAME}</span>
    <div style="display: flex; align-items: center; margin-left: auto;">
        <input type="number" class="queue-input" value="${nextQueueNum}" min="0" max="99" style="width:2.5em; margin-right:10px;" title="Queue">
        <button class="delete-product-btn" title="Remove Product" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#dc3545;">✕</button>
    </div>
`;

// Add click handler for navigation only on the text
const productInfo = div.querySelector('.product-info');
productInfo.addEventListener('click', function(e) {
    e.stopPropagation();
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

// Add these variables to your VARIABLE DECLARATION section (after associatedProductDropdown)
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

// Update the loadCarouselData function to convert milliseconds to seconds for display
async function loadCarouselData(data) {
    headerCarouselCode.value = data.CODE || '';
    headerCarouselName.value = data.NAME || '';

    // Populate device dropdown and set current device
    await populateDeviceDropdown();

    // Set device selection - check if device data exists in current carousel data
    if (data.DEVICE) {
        // If carousel has a device assigned, add it to dropdown if not already there
        const existingOption = deviceSelect.querySelector(`option[value="${data.DEVICE}"]`);
        if (!existingOption && data.DEVICENAME) {
            // Add the current device to dropdown (it's assigned but not in available devices)
            const currentDeviceOption = document.createElement('option');
            currentDeviceOption.value = data.DEVICE;
            currentDeviceOption.textContent = `${data.DEVICENAME} (${data.DEVICECONNECTKEY})`;
            deviceSelect.appendChild(currentDeviceOption);
        }
        deviceSelect.value = data.DEVICE;
    } else {
        deviceSelect.value = '';
    }

    // Populate carousel and minigame settings - convert milliseconds to seconds for display
    autoplayWaitInput.value = (data.AUTOPLAYWAIT || 0) / 1000;
    speedInput.value = (data.SPEED || 0) / 1000;
    gameCountInput.value = data.GAMECOUNT || 0;
    revolutionsInput.value = data.REVOLUTIONS || 0;
    spinDurationInput.value = (data.SPINDURATION || 0) / 1000;
    onStopTimeInput.value = (data.ONSTOPTIME || 0) / 1000;
    inactivityTimeInput.value = (data.INACTIVITYTIME || 0) / 1000;

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
                        <span class="product-info" style="cursor:pointer; text-decoration:underline; color:#007bff;">${product.PRODUCTCODE} - ${product.PRODUCTNAME}</span>
                        <div style="display: flex; align-items: center; margin-left: auto;">
                            <input type="number" class="queue-input" value="${(idx + 1).toString().padStart(2, '0')}" min="0" max="99" style="width:2.5em; margin-right:10px;" title="Queue">
                            <button class="delete-product-btn" title="Remove Product" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#dc3545;">✕</button>
                        </div>
                    `;
                    
                    // Add click handler for navigation only on the text
                    const productInfo = div.querySelector('.product-info');
                    productInfo.addEventListener('click', function(e) {
                        e.stopPropagation();
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

    // --- Associated Promos ---
    if (associatedPromos) {
        associatedPromos.innerHTML = '<div class="no-data">Loading associated promos...</div>';
        try {
            const promoLines = await getPromoLinesByCarousel(data.ID);
            if (promoLines && promoLines.length > 0) {
                associatedPromos.innerHTML = '';

                promoLines.forEach((promo, idx) => {
                    const div = document.createElement('div');
                    div.className = 'info-item';
                    div.innerHTML = `
                        <span class="product-info" style="cursor:pointer; text-decoration:underline; color:#007bff;">${promo.PROMOCODE} - ${promo.PRODUCTNAME || 'Unknown Product'} (-${promo.DISCOUNT * 100}%)</span>
                        <div style="display: flex; align-items: center; margin-left: auto;">
                            <input type="number" class="chance-input" value="${promo.CHANCE *100 || 0}" min="0" max="100" style="width:3em; margin-right:5px;" title="Chance %">
                            <span style="margin-right:10px;">%</span>
                            <button class="delete-promo-btn" title="Remove Promo" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#dc3545;">✕</button>
                        </div>
                    `;
                    
                    // Add click handler for navigation only on the text
                    const productInfo = div.querySelector('.product-info');
                    productInfo.addEventListener('click', function(e) {
                        e.stopPropagation();
                        window.location.href = `promo.html?id=${promo.PROMOID}&type=All&maker=All`;
                    });
                    
                    // Add delete handler
                    const deleteBtn = div.querySelector('.delete-promo-btn');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (confirm('Remove this promo from the carousel?')) {
                            div.remove();
                            redistributePromoChances();
                            formChanged = true;
                        }
                    });

                    // Add chance input event listeners
                    const chanceInput = div.querySelector('.chance-input');
                    if (chanceInput) {
                        addChanceInputEvents(chanceInput);
                    }
                    
                    associatedPromos.appendChild(div);
                });

                updatePromoChanceTotal();
            } else {
                associatedPromos.innerHTML = '<div class="no-data">No associated promos found</div>';
            }
        } catch (err) {
            associatedPromos.innerHTML = '<div class="no-data">Failed to load associated promos</div>';
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
    // const previouslySelected = productDropdown.querySelector('.product-option.selected');
    // if (previouslySelected) {
    //     previouslySelected.classList.remove('selected');
    // }
    
    // Add selection to current product
    // const currentOption = productDropdown.querySelector(`[data-product-id="${carouselID}"]`);
    // if (currentOption) {
    //     currentOption.classList.add('selected');
    // }
}



function createNewCarousel() {
    // Header fields
    if (headerCarouselCode) headerCarouselCode.value = "";
    if (headerCarouselName) headerCarouselName.value = "";

    // Carousel settings - set device to "null" to match the default option value
    if (deviceSelect) deviceSelect.value = "null";
    if (autoplayWaitInput) autoplayWaitInput.value = "0";
    if (speedInput) speedInput.value = "0";
    if (gameCountInput) gameCountInput.value = "0";

    // Minigame settings - values shown in seconds to user
    if (revolutionsInput) revolutionsInput.value = "0";
    if (spinDurationInput) spinDurationInput.value = "0";
    if (onStopTimeInput) onStopTimeInput.value = "0";
    if (inactivityTimeInput) inactivityTimeInput.value = "0";

    // Associated lists
    if (associatedProducts) associatedProducts.innerHTML = '<div class="no-data">No associated products found</div>';
    if (associatedPromos) associatedPromos.innerHTML = '<div class="no-data">No associated promos found</div>';

    // Clear any promo chance total display
    const totalDisplay = document.getElementById('promoChanceTotal');
    if (totalDisplay) {
        totalDisplay.remove();
    }

    // Reset navigation and state
    currentCarouselId = 'new';
    updateNavigationState();
    formChanged = false; // Reset form changed state
    
    // Focus first field
    if (headerCarouselCode) headerCarouselCode.focus();
}

// Update the populateDeviceDropdown function
async function populateDeviceDropdown() {
    try {
        const devices = await getAllDevices();
        deviceSelect.innerHTML = '<option value=null>-- No device selected --</option>';
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

function populateAssociatedPromoDropdown(promos) {
    associatedPromoDropdown.innerHTML = '';
    
    promos.forEach(promo => {
        const option = document.createElement('div');
        option.className = 'product-option';
        option.dataset.promoId = promo.ID;
        
        option.innerHTML = `
            <span class="product-code">${promo.CODE}</span>
            <span class="product-name">${promo.PRODUCTNAME || 'Unknown Product'}</span>
            <span class="product-details">(${promo.DISCOUNT}% off, ${promo.DAYSTOLIVE} days)</span>
        `;
        
        option.addEventListener('click', function() {
            selectAssociatedPromo(promo);
        });
        
        associatedPromoDropdown.appendChild(option);
    });
}

function filterAssociatedPromoDropdown(searchText) {
    if (!searchText.trim()) {
        associatedPromoDropdown.innerHTML = '';
        associatedPromoDropdown.classList.remove('active');
        return;
    }

    const filtered = promos.filter(promo => {
        const productName = promo.PRODUCTNAME || 'Unknown';
        const searchString = `${promo.CODE} ${productName}`.toLowerCase();
        return searchString.includes(searchText.toLowerCase());
    });

    if (filtered.length === 0) {
        associatedPromoDropdown.innerHTML = '<div class="product-option">No promos found</div>';
        associatedPromoDropdown.classList.add('active');
        return;
    }

    populateAssociatedPromoDropdown(filtered);
    
    if (!associatedPromoDropdown.classList.contains('active')) {
        associatedPromoDropdown.classList.add('active');
    }
}

function selectAssociatedPromo(promo) {
    // Check if promo is already in the list
    const existingItems = associatedPromos.querySelectorAll('.info-item');
    for (let item of existingItems) {
        const promoInfo = item.querySelector('.product-info').textContent;
        if (promoInfo.includes(promo.CODE)) {
            showWarningModal('Promo is already in the carousel');
            associatedPromoSearch.value = '';
            associatedPromoDropdown.classList.remove('active');
            return;
        }
    }

    // Clear "no data" message if it exists
    if (associatedPromos.querySelector('.no-data')) {
        associatedPromos.innerHTML = '';
    }

    // Create new promo item
    const div = document.createElement('div');
    div.className = 'info-item';
    
    // Calculate default chance
    const currentItems = associatedPromos.querySelectorAll('.info-item');
    const defaultChance = currentItems.length === 0 ? 100 : Math.floor(100 / (currentItems.length + 1));
    
    div.innerHTML = `
        <span class="product-info" style="cursor:pointer; text-decoration:underline; color:#007bff;">${promo.CODE} - ${promo.PRODUCTNAME || 'Unknown Product'}</span>
        <div style="display: flex; align-items: center; margin-left: auto;">
            <input type="number" class="chance-input" value="${defaultChance}" min="0" max="100" style="width:3em; margin-right:5px;" title="Chance %">
            <span style="margin-right:10px;">%</span>
            <button class="delete-promo-btn" title="Remove Promo" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#dc3545;">✕</button>
        </div>
    `;
    
    // Add click handler for navigation only on the text
    const productInfo = div.querySelector('.product-info');
    productInfo.addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = `promo.html?id=${promo.ID}&type=All&maker=All`;
    });
    
    // Add delete handler
    const deleteBtn = div.querySelector('.delete-promo-btn');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Remove this promo from the carousel?')) {
            div.remove();
            redistributePromoChances();
            formChanged = true;
        }
    });

    // Add chance input event listeners
    const chanceInput = div.querySelector('.chance-input');
    if (chanceInput) {
        addChanceInputEvents(chanceInput);
    }
    
    associatedPromos.appendChild(div);
    redistributePromoChances();
    formChanged = true;

    // Clear search and hide dropdown
    associatedPromoSearch.value = '';
    associatedPromoDropdown.classList.remove('active');
}

// Add new functions for chance management
function redistributePromoChances() {
    const items = associatedPromos.querySelectorAll('.info-item');
    if (items.length === 0) return;
    
    const equalChance = Math.floor(100 / items.length);
    const remainder = 100 % items.length;
    
    items.forEach((item, idx) => {
        const chanceInput = item.querySelector('.chance-input');
        if (chanceInput) {
            const chance = equalChance + (idx < remainder ? 1 : 0);
            chanceInput.value = chance;
        }
    });
    
    updatePromoChanceTotal();
}

function updatePromoChanceTotal() {
    const items = associatedPromos.querySelectorAll('.info-item');
    let total = 0;
    
    items.forEach(item => {
        const chanceInput = item.querySelector('.chance-input');
        if (chanceInput) {
            total += parseInt(chanceInput.value) || 0;
        }
    });
    
    updatePromoChanceTotalDisplay(total);
    return total;
}

function updatePromoChanceTotalDisplay(total) {
    let totalDisplay = document.getElementById('promoChanceTotal');
    if (!totalDisplay) {
        totalDisplay = document.createElement('div');
        totalDisplay.id = 'promoChanceTotal';
        totalDisplay.style.cssText = 'margin-top: 10px; padding: 8px; border-radius: 4px; font-weight: bold; text-align: center;';
        associatedPromos.parentNode.appendChild(totalDisplay);
    }
    
    if (total === 100) {
        totalDisplay.textContent = `Total Chance: ${total}% ✓`;
        totalDisplay.style.backgroundColor = '#d4edda';
        totalDisplay.style.color = '#155724';
        totalDisplay.style.border = '1px solid #c3e6cb';
    } else {
        totalDisplay.textContent = `Total Chance: ${total}% (Must equal 100%)`;
        totalDisplay.style.backgroundColor = '#f8d7da';
        totalDisplay.style.color = '#721c24';
        totalDisplay.style.border = '1px solid #f5c6cb';
    }
}

// Update the saveCarouselData function to convert seconds to milliseconds for database
async function saveCarouselData() {
    // Validate promo chances
    const items = associatedPromos.querySelectorAll('.info-item');
    if (items.length > 0) {
        const total = updatePromoChanceTotal();
        if (total !== 100) {
            showWarningModal('Promo chances must total exactly 100% before saving.');
            validForInsert = false;
            return;
        }
    }

    try {
        // Validate required fields
        if (!headerCarouselCode.value || !headerCarouselCode.value.trim()) {
            throw new Error('Carousel Code is required');
        }

        if (!headerCarouselName.value || !headerCarouselName.value.trim()) {
            throw new Error('Carousel Name is required');
        }

        // Validate numeric settings and convert seconds to milliseconds
        const code = parseInt(headerCarouselCode.value);
        const autoplayWait = parseFloat(autoplayWaitInput.value) * 1000; // Convert to milliseconds
        const speed = parseFloat(speedInput.value) * 1000; // Convert to milliseconds
        const gameCount = parseInt(gameCountInput.value);
        const revolutions = parseInt(revolutionsInput.value);
        const spinDuration = parseFloat(spinDurationInput.value) * 1000; // Convert to milliseconds
        const onStopTime = parseFloat(onStopTimeInput.value) * 1000; // Convert to milliseconds
        const inactivityTime = parseFloat(inactivityTimeInput.value) * 1000; // Convert to milliseconds

        if (isNaN(code) || code <= 0) {
            throw new Error('Carousel Code must be a valid number greater than 0');
        }

        if (isNaN(autoplayWait) || autoplayWait < 0) {
            throw new Error('Autoplay Wait must be a valid number (0 or greater)');
        }

        if (isNaN(speed) || speed < 0) {
            throw new Error('Speed must be a valid number (0 or greater)');
        }

        if (isNaN(gameCount) || gameCount < 0) {
            throw new Error('Game Count must be a valid number (0 or greater)');
        }

        if (isNaN(revolutions) || revolutions < 0) {
            throw new Error('Revolutions must be a valid number (0 or greater)');
        }

        if (isNaN(spinDuration) || spinDuration < 0) {
            throw new Error('Spin Duration must be a valid number (0 or greater)');
        }

        if (isNaN(onStopTime) || onStopTime < 0) {
            throw new Error('On Stop Time must be a valid number (0 or greater)');
        }

        if (isNaN(inactivityTime) || inactivityTime < 0) {
            throw new Error('Inactivity Time must be a valid number (0 or greater)');
        }

        // Get current state and increment by 1
        let currentState = 1; // Default for new carousels
        if (currentCarouselId !== 'new') {
            const currentCarousel = carousels.find(c => c.ID === currentCarouselId);
            currentState = (currentCarousel && currentCarousel.STATE) ? currentCarousel.STATE + 1 : 1;
        }

        // Build carousel data with values in milliseconds for database
        const carouselData = {
            code: code,
            name: headerCarouselName.value.trim(),
            device: parseInt(deviceSelect.value),
            autoplayWait: autoplayWait, // Now in milliseconds
            speed: speed, // Now in milliseconds
            gameCount: gameCount,
            state: currentState,
            revolutions: revolutions,
            spinDuration: spinDuration, // Now in milliseconds
            onStopTime: onStopTime, // Now in milliseconds
            inactivityTime: inactivityTime // Now in milliseconds
        };

        console.log('Saving carousel data with time values in milliseconds:', carouselData);

        // Determine if we're creating new or updating existing
        let result;
        let savedCarouselId;
        
        if (currentCarouselId === 'new') {
            // Create new carousel
            result = await InsertCarouselAndMinigame(carouselData);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to create carousel');
            }

            savedCarouselId = result.carouselId;
            currentCarouselId = result.carouselId;
            
            // Update current ID and add to carousels array
            const newCarousel = {
                ID: result.carouselId,
                CODE: carouselData.code,
                NAME: carouselData.name,
                DEVICE: carouselData.device,
                AUTOPLAYWAIT: carouselData.autoplayWait,
                SPEED: carouselData.speed,
                GAMECOUNT: carouselData.gameCount,
                STATE: carouselData.state, // Include state in local data
                REVOLUTIONS: carouselData.revolutions,
                SPINDURATION: carouselData.spinDuration,
                ONSTOPTIME: carouselData.onStopTime,
                INACTIVITYTIME: carouselData.inactivityTime
            };
            carousels.push(newCarousel);

            // Update URL
            const params = new URLSearchParams(window.location.search);
            params.set('id', result.carouselId);
            window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
            
        } else {
            // Update existing carousel
            carouselData.id = currentCarouselId;
            savedCarouselId = currentCarouselId;
            
            result = await UpdateCarouselAndMinigame(carouselData);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to update carousel');
            }

            // Update carousels array
            const carouselIndex = carousels.findIndex(c => c.ID === currentCarouselId);
            if (carouselIndex !== -1) {
                carousels[carouselIndex] = {
                    ...carousels[carouselIndex],
                    CODE: carouselData.code,
                    NAME: carouselData.name,
                    DEVICE: carouselData.device,
                    AUTOPLAYWAIT: carouselData.autoplayWait,
                    SPEED: carouselData.speed,
                    GAMECOUNT: carouselData.gameCount,
                    STATE: carouselData.state, // Update state in local data
                    REVOLUTIONS: carouselData.revolutions,
                    SPINDURATION: carouselData.spinDuration,
                    ONSTOPTIME: carouselData.onStopTime,
                    INACTIVITYTIME: carouselData.inactivityTime
                };
            }
        }

        console.log('Carousel saved successfully, now saving associated items for carousel ID:', savedCarouselId);

        // ASSOCIATED -------------------------------------------------------------------------------------------
        try {
            // 1. Delete all existing product lines for this carousel
            const existingProductLines = await getProductLinesByCarousel(savedCarouselId);

            for (const productLine of existingProductLines) {
                await deleteProductLines(productLine.ID); // Use ID instead of PRODUCTLINES
                console.log(`PRODUCTLINE ID IS ->  ${productLine.ID}`);
            }

            // 2. Insert current product lines
            const currentProductItems = associatedProducts.querySelectorAll('.info-item');
            for (const item of currentProductItems) {
                const productInfo = item.querySelector('.product-info').textContent;
                const queueInput = item.querySelector('.queue-input');
                
                // Extract product code from the text (format: "CODE - NAME")
                const productCode = productInfo.split(' - ')[0];
                
                // Find the product in our products array to get the ID
                const product = products.find(p => p.CODE.toString() === productCode);
                if (product && carouselId !== 'new') {
                    await insertProductLines({
                        product: product.ID,
                        carousel: savedCarouselId,
                        queue: parseInt(queueInput.value)
                    });
                }else if (product && carouselId === 'new') {
                    await insertProductLines({
                        product: product.ID,
                        carousel: nextCarouselId,
                        queue: parseInt(queueInput.value)
                    });
                    console.log(`Inserted product line: Product ${product.ID}, Carousel ${nextCarouselId}, Queue ${queueInput.value}`);
                }
            }
            } catch (associatedError) {
            console.warn('Error saving associated products:', associatedError);
            // Don't throw here - carousel was saved successfully
            showWarningModal('Carousel saved but there was an issue saving associated products. Please refresh and try again.');
            }   



        try{
            // 3. Delete all existing promo lines for this carousel
            const existingPromoLines = await getPromoLinesByCarousel(savedCarouselId);
            for (const promoLine of existingPromoLines) {
                await deletePromoLines(promoLine.ID); // Use ID instead of PROMOLINES
                console.log(`PROMOLINE ID IS ->  ${promoLine.ID}`);
            }

            // 4. Insert current promo lines
            const currentPromoItems = associatedPromos.querySelectorAll('.info-item');
            for (const item of currentPromoItems) {
                const promoInfo = item.querySelector('.product-info').textContent;
                const chanceInput = item.querySelector('.chance-input');
                
                // Extract promo code from the text (format: "CODE - NAME")
                const promoCode = promoInfo.split(' - ')[0];
                
                // Find the promo in our promos array to get the ID
                const promo = promos.find(p => p.CODE.toString() === promoCode);
                if (promo && carouselId !== 'new') {
                    await insertPromoLines({
                        promo: promo.ID,
                        minigame: savedCarouselId,
                        chance: parseFloat(chanceInput.value) / 100 // Convert percentage to decimal
                    });
                    console.log(`Inserted promo line: Promo ${promo.ID}, Minigame ${savedCarouselId}, Chance ${chanceInput.value}%`);
                }else if (promo && carouselId === 'new') {
                    await insertPromoLines({
                        promo: promo.ID,
                        minigame: nextCarouselId,
                        chance: parseFloat(chanceInput.value) / 100 // Convert percentage to decimal
                    });
                    console.log(`Inserted promo line: Promo ${promo.ID}, Minigame ${nextCarouselId}, Chance ${chanceInput.value}%`);
                }
            }

            console.log('Successfully saved all associated products and promos');

        } catch (associatedError) {
            console.warn('Error saving associated promos:', associatedError);
            // Don't throw here - carousel was saved successfully
            showWarningModal('Carousel saved but there was an issue saving associated promos. Please refresh and try again.');
        }

        validForInsert = true;
        formChanged = false;
        updateNavigationState();
        
        console.log('Carousel and associated items saved successfully with state:', currentState);
        
    } catch (error) {
        console.error('Error saving carousel:', error);
        showWarningModal(error.message);
        validForInsert = false;
        throw error; // Re-throw to prevent success actions
    }
}

// Update updatePromoQueueNumbers to work with chances
function updatePromoQueueNumbers() {
    updatePromoChanceTotal();
}

function addChanceInputEvents(chanceInput) {
    let originalValue = chanceInput.value;
    
    // Store original value when input gains focus (clicked)
    chanceInput.addEventListener('focus', function() {
        originalValue = this.value;
        this.value = '';
    });
    
    // Revert to original value if input is empty when losing focus
    chanceInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.value = originalValue;
        } else {
            // Validate and update
            if (this.value.length > 3) {
                this.value = this.value.slice(0, 3);
            }
            if (parseInt(this.value) > 100) {
                this.value = 100;
            }
            originalValue = this.value; // Update original value
        }
        formChanged = true;
        updatePromoChanceTotal();
    });
    
    // Handle input validation during typing
    chanceInput.addEventListener('input', function() {
        if (this.value.length > 3) {
            this.value = this.value.slice(0, 3);
        }
        if (parseInt(this.value) > 100) {
            this.value = 100;
        }
    });
    
    // Handle Enter key to confirm input without triggering parent events
    chanceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.stopPropagation(); // Prevent event from bubbling up
            e.preventDefault(); // Prevent any default behavior
            this.blur(); // Trigger blur event to validate and save
        }
    });
}
// #endregion
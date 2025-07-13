import {fillDropdown,initiateHotkeys} from "./common.js";
import { fetchFilteredProducts, fetchMakers, fetchTypes, deleteProduct, 
    deleteMaker, deleteType, deleteImage, updateProduct, insertProduct } from './dbService.js';

// #region VARIABLE DECLARATION
    // Form references
    const productForm = document.getElementById('productForm');
    const groupSelect = document.getElementById('productGroup');
    const makerSelect = document.getElementById('productMaker');
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const finalPriceInput = document.getElementById('productFinalPrice');
    const groupCodeInput = document.getElementById('groupCodeInput');
    const makerCodeInput = document.getElementById('makerCodeInput');
    const productGroup = document.getElementById('productGroup');
    const productMaker = document.getElementById('productMaker');

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
    let validForInsert = true;
    let currentSort = { field: 'code', direction: 'asc' };
    let makerSort = { field: 'code', direction: 'asc' };
    let isNew = false;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const selectedMaker = urlParams.get('maker');
    const selectedType = urlParams.get('type');

    // Data tables
    let products = [];
    let makers = [];
    let types = [];
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {
    // Update initial data loading
    products = await fetchFilteredProducts(selectedType, selectedMaker);
    makers = await fetchMakers();
    types = await fetchTypes();

    populateSelectFields(makers, types);

    // After loading data, find the specific product
    const productData = products.find(p => p.ID.toString() === productId);
    
    if (productData) {
        loadProductData(productData);
    }else if (productId === 'new') {
        createNewProduct();
    } else {
        showWarningModal('Product not found');
    }

    window.addEventListener('popstate', async function() {
        // Get current URL parameters after navigation
        const params = new URLSearchParams(window.location.search);
        const newProductId = params.get('id');
        
        // Find product in current products array
        const productData = products.find(p => p.ID.toString() === newProductId);
        
        if (productData) {
            loadProductData(productData);
        } else if (newProductId === 'new') {
            createNewProduct();
        } else {
            showWarningModal('Product not found');
        }
    });

// #region EVENT LISTENERS
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
        loadProductData(productData);
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
            // Delete product image first
            const imageResult = await deleteImage(currentProductId);
            if (!imageResult.success) {
                throw new Error(`Failed to delete image: ${imageResult.error}`);
            }

            // Only proceed with product deletion if image deletion succeeded
            const result = await deleteProduct(currentProductId);
            
            if (result.success) {
                // Remove from local array
                const productIndex = products.findIndex(p => p.ID === currentProductId);
                if (productIndex !== -1) {
                    products.splice(productIndex, 1);
                    
                    // Navigate to another product
                    if (products.length > 0) {
                        let nextProduct;
                        if (productIndex >= products.length) {
                            // If we deleted the last product, go to the new last product
                            nextProduct = products[products.length - 1];
                        } else {
                            // Otherwise go to the next product in line
                            nextProduct = products[productIndex];
                        }
                        
                        // Update URL and load the next product
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', nextProduct.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        loadProductData(nextProduct);
                    } else {
                        // No products left, create new and update URL
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', 'new');
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        createNewProduct();
                    }
                }
                
                // Close modal and show confirmation
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
            // Preserve existing URL parameters except 'id'
            const params = new URLSearchParams(window.location.search);
            params.set('id', 'new');
            
            // Navigate to new URL while maintaining other parameters
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

    document.querySelector('label[for="productMaker"]').addEventListener('click', function(e) {
        e.preventDefault();
        showMakersModal();
    });
    
    makerCodeInput.addEventListener('input', function() {
        // Limit to 3 digits and numbers only
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
        
        const enteredCode = this.value;
        
        // Find matching maker that starts with entered code
        const matchingMaker = makers.find(maker => 
            maker.CODE.toString().startsWith(enteredCode)
        );

        // Update dropdown selection if match found
        if (matchingMaker) {
            productMaker.value = matchingMaker.NAME;
        }
    });
    
    document.getElementById('productGroup').addEventListener('change', function() {
        const selectedType = types.find(t => t.NAME === this.value);
        if (selectedType) {
            groupCodeInput.value = selectedType.CODE; // Using ID from database
        }
    });

    document.getElementById('productMaker').addEventListener('change', function() {
        const selectedMaker = makers.find(m => m.NAME === this.value);
        if (selectedMaker) {
            makerCodeInput.value = selectedMaker.CODE; // Using ID from database
        }
    });

    document.getElementById('addGroupBtn').addEventListener('click', function() {
        const code = document.getElementById('newGroupCode').value.trim();
        const name = document.getElementById('newGroupName').value.trim();
        
        if (!code || !name) {
            showWarningModal('Both code and name are required');
            return;
        }

        // Create new group object
        const newGroup = {
            id: groups.length + 1,
            code: parseInt(code),
            name: name
        };

        // Add to beginning of groups array
        groups.unshift(newGroup);
        
        // Add the new item to the top of the list
        const groupsList = document.getElementById('groupsList');
        const item = document.createElement('div');
        item.className = 'group-item new-group';
        item.innerHTML = `
            <input type="number" 
                   class="groups-input code" 
                   value="${newGroup.code}"
                   data-original-code="${newGroup.code}">
            <input type="text" 
                   class="groups-input name" 
                   value="${newGroup.name}"
                   data-original-name="${newGroup.name}">
            <button class="groups-btn-delete-item" title="Delete group">🗑️</button>
        `;

        // Insert at the beginning of the list
        if (groupsList.firstChild) {
            groupsList.insertBefore(item, groupsList.firstChild);
        } else {
            groupsList.appendChild(item);
        }

        // Clear input fields
        document.getElementById('newGroupCode').value = '';
        document.getElementById('newGroupName').value = '';

        // Update dropdown
        fillDropdown(groups, groupSelect);

        // Remove highlight after animation
        setTimeout(() => {
            item.classList.remove('new-group');
        }, 5000);

        // Attach delete handler to new item
        item.querySelector('.groups-btn-delete-item').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this group?')) {
                const code = item.querySelector('.groups-input.code').value;
                const groupIndex = groups.findIndex(g => g.code.toString() === code);
                if (groupIndex !== -1) {
                    groups.splice(groupIndex, 1);
                    item.remove();
                    fillDropdown(groups, groupSelect);
                }
            }
        });
    });

    document.getElementById('groupCodeInput').addEventListener('input', function() {
        // Limit to 3 digits and numbers only
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
        
        const enteredCode = this.value;
        
        // Find matching type that starts with entered code
        const matchingType = types.find(type => 
            type.CODE.toString().startsWith(enteredCode)
        );

        // Update dropdown selection if match found
        if (matchingType) {
            productGroup.value = matchingType.NAME;
        }
    });

    document.querySelector('label[for="productGroup"]').addEventListener('click', function(e) {
        e.preventDefault();
        showGroupsModal();
    });

    document.querySelector('.groups-close').addEventListener('click', function() {
        document.getElementById('groupsModal').style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    document.getElementById('saveGroupBtn').addEventListener('click', function() {
        // Show save notification
        showSaveNotification();
        const modal = document.getElementById('groupsModal');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
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

    document.getElementById('sortByCode').addEventListener('click', function() {
        sortGroups('code');
    });

    document.getElementById('sortByName').addEventListener('click', function() {
        sortGroups('name');
    });
    // #endregion
});

// #region FUNCTIONS
    function loadProductData(productData) {
        // Basic product information
        headerProductCode.value = productData.CODE;
        headerProductName.value = productData.NAME;
        priceInput.value = productData.PRICE;
        discountInput.value = productData.DISCOUNT * 100; // Convert to percentage
        finalPriceInput.value = productData.FINALPRICE;
        
        // Handle type/group selection
        productGroup.value = productData.TYPENAME;
        const selectedType = types.find(t => t.ID === productData.TYPEID);
        groupCodeInput.value = selectedType ? selectedType.CODE : '';
        
        // Handle maker selection
        productMaker.value = productData.MAKERNAME;
        const selectedMaker = makers.find(m => m.ID === productData.MAKERID);
        makerCodeInput.value = selectedMaker ? selectedMaker.CODE : '';
        
        // Other fields
        productNotes.value = productData.NOTES || '';
        mainProductImage.src = `media/${productData.ID}.png`;

        // Handle carousel data
        carouselList.innerHTML = '';
        if (productData.CAROUSELCODE && productData.CAROUSELNAME) {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = `${productData.CAROUSELCODE} - ${productData.CAROUSELNAME}`;
            div.addEventListener('click', function() {
                window.location.href = `carousel.html?id=${productData.CAROUSELID}`;
            });
            carouselList.appendChild(div);
        } else {
            carouselList.innerHTML = '<div class="no-data">No carousel assigned</div>';
        }

        // Handle promo data
        promoList.innerHTML = '';
        if (productData.PROMOCODE && productData.PROMODISCOUNT !== null) {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = `${productData.PROMOCODE} - ${(productData.PROMODISCOUNT * 100).toFixed(0)}% OFF`;
            div.addEventListener('click', function() {
                window.location.href = `promo.html?id=${productData.PROMOID}`;
            });
            promoList.appendChild(div);
        } else {
            promoList.innerHTML = '<div class="no-data">No promotions available</div>';
        }

        // Adjust text area height
        productNotes.style.height = 'auto';
        productNotes.style.height = (productNotes.scrollHeight) + 'px';

        // Update current product ID for navigation
        currentProductId = productData.ID;
        
        // Reset form changed flag
        formChanged = false;

        // Update navigation state
        updateNavigationState();
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

        try {
            const selectedType = types.find(t => t.NAME === productGroup.value);
            const selectedMaker = makers.find(m => m.NAME === productMaker.value);

            const productData = {
                code: parseInt(headerProductCode.value),
                name: headerProductName.value,
                type: selectedType ? selectedType.ID : null,
                maker: selectedMaker ? selectedMaker.ID : null,
                price: parseFloat(priceInput.value),
                discount: parseFloat(discountInput.value) / 100,
                finalPrice: parseFloat(finalPriceInput.value),
                notes: productNotes.value
            };

            const result = productId === 'new' 
                ? await insertProduct(productData)
                : await updateProduct({ id: currentProductId, ...productData });

            if (result.success) {
                validForInsert = true;
                formChanged = false;
                
                // Refresh the products list
                products = await fetchFilteredProducts('All', 'All');
                
                // Find the updated/inserted product
                const savedProduct = products.find(p => p.CODE === productData.code);
                
                if (savedProduct) {
                    if (productId === 'new') {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', savedProduct.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                    }
                    
                    loadProductData(savedProduct);
                    showConfirmation();
                } else {
                    throw new Error('Saved product not found in results');
                }
            } else {
                // Check if it's a duplicate code error
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
            console.error('Error saving product:', error);
            showWarningModal(`Failed to save changes: ${error.message}`);
            validForInsert = false;
        }
    }

    function createNewProduct() {
        headerProductCode.value = "";
        headerProductName.value = "";
        priceInput.value = "0";
        discountInput.value = "0";
        finalPriceInput.value = "0";
        groupSelect.value = '';
        makerSelect.value = '';
        productNotes.value = "";
        mainProductImage.src = "media/9997.png";
        groupCodeInput.value = "";
        makerCodeInput.value = "";
        
        // Clear carousel and promo lists
        carouselList.innerHTML = '';
        promoList.innerHTML = '';
    
        // Update navigation state
        updateNavigationState();
        
        headerProductCode.focus();
        
        // Reset form changed flag
        formChanged = true;
    }

    function updateGroupsList() {
        const groupsList = document.getElementById('groupsList');
        groupsList.innerHTML = '';
        
        groups.forEach((group) => {
            const item = document.createElement('div');
            item.className = 'group-item';
            item.innerHTML = `
                <input type="number" 
                       class="groups-input code" 
                       value="${group.code}"
                       data-original-code="${group.code}">
                <input type="text" 
                       class="groups-input name" 
                       value="${group.name}"
                       data-original-name="${group.name}">
                <button class="groups-btn-delete-item" title="Delete group">🗑️</button>
            `;
            groupsList.appendChild(item);
        });

        // Add delete functionality
        document.querySelectorAll('.groups-btn-delete-item').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this group?')) {
                    groups.splice(index, 1);
                    fillDropdown(groups, groupSelect);
                    updateGroupsList();
                }
            });
        });
    }

    function sortGroups(field) {
        const direction = field === currentSort.field && currentSort.direction === 'asc' ? 'desc' : 'asc';
        currentSort = { field, direction };

        groups.sort((a, b) => {
            let compareA = field === 'code' ? parseInt(a.code) : a.name.toLowerCase();
            let compareB = field === 'code' ? parseInt(b.code) : b.name.toLowerCase();

            if (direction === 'asc') {
                return compareA > compareB ? 1 : -1;
            } else {
                return compareA < compareB ? 1 : -1;
            }
        });

        updateGroupsList();
        updateSortButtons();
    }

    function filterGroups() {
        const codeFilter = document.getElementById('searchGroupCode').value.toLowerCase();
        const nameFilter = document.getElementById('searchGroupName').value.toLowerCase();
        
        const filteredGroups = groups.filter(group => {
            const matchesCode = group.code.toString().includes(codeFilter);
            const matchesName = group.name.toLowerCase().includes(nameFilter);
            return matchesCode && matchesName;
        });
        
        displayFilteredGroups(filteredGroups);
    }

    function populateSelectFields(makers, types) {
    
        // Add makers to select
        makers.forEach(maker => {
            const option = document.createElement('option');
            option.value = maker.NAME;
            option.textContent = maker.NAME;
            productMaker.appendChild(option);
        });

        // Add types to select
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.NAME;
            option.textContent = type.NAME;
            productGroup.appendChild(option);
        });
    }
    
    function displayFilteredGroups(filteredGroups) {
        const groupsList = document.getElementById('groupsList');
        groupsList.innerHTML = '';
        
        filteredGroups.forEach(group => {
            const item = document.createElement('div');
            item.className = 'group-item';
            item.innerHTML = `
                <input type="number" 
                       class="groups-input code" 
                       value="${group.code}"
                       data-original-code="${group.code}">
                <input type="text" 
                       class="groups-input name" 
                       value="${group.name}"
                       data-original-name="${group.name}">
                <button class="groups-btn-delete-item" title="Delete group">🗑️</button>
            `;
            groupsList.appendChild(item);
        });

        // Reattach delete handlers
        attachDeleteHandlers();
    }
    //------------------------VISUAL FUNCTIONS--------------------------------
    function attachDeleteHandlers() {
        document.querySelectorAll('.groups-btn-delete-item').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this group?')) {
                    const groupItem = this.closest('.group-item');
                    const code = groupItem.querySelector('.groups-input.code').value;
                    const groupIndex = groups.findIndex(g => g.code.toString() === code);
                    if (groupIndex !== -1) {
                        groups.splice(groupIndex, 1);
                        fillDropdown(groups, groupSelect);
                        filterGroups(); // Refresh the filtered list
                    }
                }
            });
        });
    }

    function showGroupsModal() {
        const modal = document.getElementById('groupsModal');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Clear search fields
        document.getElementById('searchGroupCode').value = '';
        document.getElementById('searchGroupName').value = '';
        
        updateGroupsList();
    }

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
            const currentIndex = products.findIndex(p => p.ID === currentProductId);
            if (currentIndex === -1) {
                console.error('Current product not found in dataset');
                return;
            }

            let targetProduct = null;
            
            if (direction === 'next') {
                // Get next product from array
                targetProduct = products[currentIndex + 1];
            } else if (direction === 'prev') {
                // Get previous product from array
                targetProduct = products[currentIndex - 1];
            }

            if (targetProduct) {
                loadProductData(targetProduct);
                // Update URL to reflect new product ID while keeping filters
                const params = new URLSearchParams(window.location.search);
                params.set('id', targetProduct.ID);
                const newUrl = `${window.location.pathname}?${params.toString()}`;
                window.history.pushState({}, '', newUrl);
            }
        } catch (error) {
            console.error('Navigation error:', error);
            showWarningModal('Failed to navigate between products');
        }
    }

    function updateNavigationState() {
        // Find current product's index in filtered list
        const currentIndex = products.findIndex(p => p.ID === currentProductId);
        
        // Disable prev button if we're at start of list
        sidePrevBtn.disabled = currentIndex <= 0;
        
        // Disable next button if we're at end of list
        sideNextBtn.disabled = currentIndex >= products.length - 1;
        
        // Update button styles
        sidePrevBtn.style.opacity = sidePrevBtn.disabled ? '0.5' : '1';
        sideNextBtn.style.opacity = sideNextBtn.disabled ? '0.5' : '1';
    }

    function showWarningModal(message) {
        const warningModal = document.getElementById('warningModal');
        const warningMessage = document.getElementById('warningMessage');
        warningMessage.textContent = message;
        warningModal.style.display = 'flex';
    }

    function showSaveNotification() {
        const notification = document.querySelector('.groups-save-notification');
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 1000);
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

    function updateSortButtons() {
        const codeBtn = document.getElementById('sortByCode');
        const nameBtn = document.getElementById('sortByName');
        
        codeBtn.classList.remove('active');
        nameBtn.classList.remove('active');
        
        const activeBtn = currentSort.field === 'code' ? codeBtn : nameBtn;
        activeBtn.classList.add('active');
        
        codeBtn.textContent = `Sort by Code ${currentSort.field === 'code' ? 
            (currentSort.direction === 'asc' ? '↓' : '↑') : '↓'}`;
        nameBtn.textContent = `Sort by Name ${currentSort.field === 'name' ? 
            (currentSort.direction === 'asc' ? '↓' : '↑') : '↓'}`;
    }
    // #endregion
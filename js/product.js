import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchMakers, fetchTypes, deleteProduct, 
    deleteMaker, deleteType, deleteImage, updateProduct, insertProduct, 
    fetchNextProductId, updateMaker, updateType, insertMaker, insertType } from './dbService.js';

// #region VARIABLE DECLARATION
    // Form references
    const productForm = document.getElementById('productForm');
    const groupSelect = document.getElementById('productType');
    const makerSelect = document.getElementById('productMaker');
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const finalPriceInput = document.getElementById('productFinalPrice');
    const groupCodeInput = document.getElementById('groupCodeInput');
    const makerCodeInput = document.getElementById('makerCodeInput');
    const productType = document.getElementById('productType');
    const productMaker = document.getElementById('productMaker');
    const changeImageTxt = document.getElementById('changeImageTxt');

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
    let pendingImageFile = null;
    let currentModalType = null; // 'types' or 'makers'
    let isNew = false;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');
    const selectedMaker = urlParams.get('maker');
    const selectedType = urlParams.get('type');

    // Data tables
    let products = [];
    let makers = [];
    let types = [];
    let nextProductId;
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {
    products = await fetchFilteredProducts(selectedType, selectedMaker);
    makers = await fetchMakers();
    types = await fetchTypes();
    nextProductId = await fetchNextProductId();

    populateGroupFilters(makers, types);

    const productData = products.find(p => p.ID.toString() === productId);
    
    if (productData) {
        loadProductData(productData);
    }else if (productId === 'new') {
        createNewProduct();
    } else {
        showWarningModal('Product not found');
    }

    window.addEventListener('popstate', async function() {// Reload the page correctly when navigating back
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
            const imageResult = await deleteImage(currentProductId);
            if (!imageResult.success) {
                throw new Error(`Failed to delete image: ${imageResult.error}`);
            }

            const result = await deleteProduct(currentProductId);
            
            if (result.success) {
                const productIndex = products.findIndex(p => p.ID === currentProductId);
                if (productIndex !== -1) {
                    products.splice(productIndex, 1);
                    
                    if (products.length > 0) {
                        let nextProduct;
                        if (productIndex >= products.length) {
                            nextProduct = products[products.length - 1];
                        } else {
                            nextProduct = products[productIndex];
                        }
                        
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', nextProduct.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        loadProductData(nextProduct);
                    } else {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', 'new');
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        createNewProduct();
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

    changeImageBtn.addEventListener('click', function() {
        imageInput.click();
    });

    imageInput.addEventListener('change', async function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
                showWarningModal('Please select an image file (JPG, PNG, or GIF)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {//Change 5 to any MB desired
                showWarningModal('Image file size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                mainProductImage.src = event.target.result;
                formChanged = true;
            };
            reader.readAsDataURL(file);

            if (currentProductId && currentProductId !== 'new') {
                try {
                    console.log('Deleting existing image for product:', currentProductId);
                    const deleteResult = await deleteImage(currentProductId);
                    
                    if (!deleteResult.success) {
                        console.warn('Warning: Could not delete existing image:', deleteResult.error);
                    }
                    const uploadResult = await uploadNewProductImage(file);
                    
                    if (uploadResult.success) {
                        mainProductImage.src = `http://localhost:3000/media/${currentProductId}.png?t=${Date.now()}`;
                        console.log('Image updated successfully for existing product');
                    } else {
                        throw new Error(uploadResult.error);
                    }
                } catch (error) {
                    console.error('Error updating image:', error);
                    showWarningModal(`Image update failed: ${error.message}`);
                }
            } else {
                pendingImageFile = file;
            }
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

    document.querySelector('label[for="productMaker"]').addEventListener('click', function(e) {
        e.preventDefault();
        currentModalType = 'makers';
        showGroupsModal();
    });
    
    makerCodeInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
        
        const enteredCode = this.value;
        
        const matchingMaker = makers.find(maker => 
            maker.CODE.toString().startsWith(enteredCode)
        );

        if (matchingMaker) {
            productMaker.value = matchingMaker.NAME;
        }
    });
    
    document.getElementById('productType').addEventListener('change', function() {
        const selectedType = types.find(t => t.NAME === this.value);
        if (selectedType) {
            groupCodeInput.value = selectedType.CODE;
        }
    });

    document.getElementById('productMaker').addEventListener('change', function() {
        const selectedMaker = makers.find(m => m.NAME === this.value);
        if (selectedMaker) {
            makerCodeInput.value = selectedMaker.CODE;
        }
    });

    document.getElementById('addGroupBtn').addEventListener('click', function() {
        const code = document.getElementById('newGroupCode').value.trim();
        const name = document.getElementById('newGroupName').value.trim();
        
        if (!code || !name) {
            showWarningModal('Both code and name are required');
            return;
        }

        const newGroup = {
            ID: null, 
            CODE: parseInt(code),
            NAME: name
        };

        if (currentModalType === 'types') {
            types.unshift(newGroup);
        } else {
            makers.unshift(newGroup);
        }
        
        const groupsList = document.getElementById('groupsList');
        const item = document.createElement('div');
        item.className = 'group-item new-group';
        item.innerHTML = getItemCardHtml("group", newGroup);

        if (groupsList.firstChild) {
            groupsList.insertBefore(item, groupsList.firstChild);
        } else {
            groupsList.appendChild(item);
        }

        document.getElementById('newGroupCode').value = '';
        document.getElementById('newGroupName').value = '';

        if (currentModalType === 'types') {
            fillDropdown(types, productType);
        } else {
            fillDropdown(makers, productMaker);
        }

        attachDeleteHandlers();
    });

    document.getElementById('groupCodeInput').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
        
        const enteredCode = this.value;
        
        const matchingType = types.find(type => 
            type.CODE.toString().startsWith(enteredCode)
        );

        if (matchingType) {
            productType.value = matchingType.NAME;
        }
    });

    document.querySelector('label[for="productType"]').addEventListener('click', function(e) {
        e.preventDefault();
        currentModalType = 'types';
        showGroupsModal();
    });

    document.querySelector('.groups-close').addEventListener('click', function() {
        document.getElementById('groupsModal').style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    document.getElementById('saveGroupBtn').addEventListener('click', async function() {
        try {
            await saveGroupsData();
            
            showSaveNotification();
            const modal = document.getElementById('groupsModal');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
        } catch (error) {
            console.error('Error saving groups data:', error);
            showWarningModal(`Failed to save changes: ${error.message}`);
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

    document.getElementById('sortByCode').addEventListener('click', function() {
        sortGroups('code');
    });

    document.getElementById('sortByName').addEventListener('click', function() {
        sortGroups('name');
    });

    document.getElementById('searchGroupCode').addEventListener('input', function() {
        filterGroups();
    });

    document.getElementById('searchGroupName').addEventListener('input', function() {
        filterGroups();
    });
    // #endregion
});

// #region FUNCTIONS
    // #region PRODUCT FUNCTIONS
    function loadProductData(productData) {
        headerProductCode.value = productData.CODE;
        headerProductName.value = productData.NAME;
        priceInput.value = productData.PRICE;
        discountInput.value = productData.DISCOUNT * 100;
        finalPriceInput.value = productData.FINALPRICE;
        productType.value = productData.TYPENAME;
        const selectedType = types.find(t => t.ID === productData.TYPEID);
        groupCodeInput.value = selectedType ? selectedType.CODE : '';
        productMaker.value = productData.MAKERNAME;
        const selectedMaker = makers.find(m => m.ID === productData.MAKERID);
        makerCodeInput.value = selectedMaker ? selectedMaker.CODE : '';
        productNotes.value = productData.NOTES || '';
        mainProductImage.src = `media/${productData.ID}.png`;

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

        promoList.innerHTML = '';
        if (productData.PROMOCODE && productData.PROMODISCOUNT !== null) {
            const div = document.createElement('div');
            div.className = 'info-item';
            div.textContent = `${productData.PROMOCODE} - ${(productData.PROMODISCOUNT * 100).toFixed(0)}% OFF`;
            div.addEventListener('click', function() {
                window.location.href = `promo.html?id=${productData.PROMOID}&type=All&maker=All`;
            });
            promoList.appendChild(div);
        } else {
            promoList.innerHTML = '<div class="no-data">No promotions available</div>';
        }

        // Adjust text area height
        productNotes.style.height = 'auto';
        productNotes.style.height = (productNotes.scrollHeight) + 'px';

        currentProductId = productData.ID;
        formChanged = false;
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
            const selectedType = types.find(t => t.NAME === productType.value);
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
                
                products = await fetchFilteredProducts('All', 'All');
                const savedProduct = products.find(p => p.CODE === productData.code);
                
                if (savedProduct) {
                    if (productId === 'new') {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', savedProduct.ID);
                        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                        currentProductId = savedProduct.ID;
                        
                        if (pendingImageFile) {
                            try {
                                const imageResult = await uploadNewProductImage(pendingImageFile);
                                
                                if (imageResult.success) {
                                    mainProductImage.src = `http://localhost:3000/media/${savedProduct.ID}.png?t=${Date.now()}`;
                                    pendingImageFile = null;
                                    console.log('Image uploaded successfully for new product');
                                } else {
                                    console.error('Image upload failed:', imageResult.error);
                                    showWarningModal(`Product saved but image upload failed: ${imageResult.error}`);
                                }
                            } catch (imageError) {
                                console.error('Error uploading image:', imageError);
                                showWarningModal(`Product saved but image upload failed: ${imageError.message}`);
                            }
                        }
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
        changeImageTxt.innerText = 'Upload Image';
        
        pendingImageFile = null;
        carouselList.innerHTML = '';
        promoList.innerHTML = '';

        headerProductCode.focus()
        updateNavigationState();

        formChanged = true;
        currentProductId = 'new';
    }

    async function uploadNewProductImage(imageFile) {
        try {
            if (!imageFile) {
                throw new Error('No image file provided');
            }

            if (!currentProductId || currentProductId === 'new') {
                throw new Error('Product must be saved before uploading image');
            }

            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`http://localhost:3000/api/uploadNewProductImage/${currentProductId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: 'Image uploaded successfully',
                productId: currentProductId
            };
        } catch (error) {
            console.error('Error uploading new product image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // #endregion
    // #region GROUPS FUNCTIONS
    function displayGroups() {
        const groupsList = document.getElementById('groupsList');
        groupsList.innerHTML = '';
        
        const groups = currentModalType === 'types' ? types : makers;
        
        groups.forEach((group) => {
            const item = document.createElement('div');
            item.className = 'group-item';
            item.innerHTML = getItemCardHtml("group", group);
            groupsList.appendChild(item);
        });

        attachDeleteHandlers();
    }

    function displayFilteredGroups(filteredGroups) {
        const groupsList = document.getElementById('groupsList');
        groupsList.innerHTML = '';
        
        filteredGroups.forEach(group => {
            const item = document.createElement('div');
            item.className = 'group-item';
            item.innerHTML = getItemCardHtml("group", group);
            groupsList.appendChild(item);
        });

        attachDeleteHandlers();
    }

    function attachDeleteHandlers() {
        document.querySelectorAll('.groups-btn-delete-item').forEach((btn, index) => {
            btn.addEventListener('click', async function() {
                if (confirm(`Are you sure you want to delete this ${currentModalType === 'types' ? 'type' : 'maker'}?`)) {
                    try {
                        const groupItem = this.closest('.group-item');
                        const code = groupItem.querySelector('.groups-input.code').value;
                        const name = groupItem.querySelector('.groups-input.name').value;
                        
                        const groups = currentModalType === 'types' ? types : makers;
                        const itemToDelete = groups.find(g => g.CODE.toString() === code && g.NAME === name);
                        
                        if (!itemToDelete) {
                            throw new Error('Item not found');
                        }
                        
                        if (groupItem.classList.contains('new-group')) {
                            const groupIndex = groups.findIndex(g => g.CODE.toString() === code);
                            if (groupIndex !== -1) {
                                groups.splice(groupIndex, 1);
                            }
                            groupItem.remove();
                            
                            if (currentModalType === 'types') {
                                fillDropdown(types, productType);
                            } else {
                                fillDropdown(makers, productMaker);
                            }
                            return;
                        }
                        
                        let deleteResult;
                        if (currentModalType === 'types') {
                            deleteResult = await deleteType(itemToDelete.ID);
                        } else {
                            deleteResult = await deleteMaker(itemToDelete.ID);
                        }
                        
                        if (deleteResult.success) {
                            const groupIndex = groups.findIndex(g => g.ID === itemToDelete.ID);
                            if (groupIndex !== -1) {
                                groups.splice(groupIndex, 1);
                            }
                            
                            if (currentModalType === 'types') {
                                fillDropdown(types, productType);
                            } else {
                                fillDropdown(makers, productMaker);
                            }
                            
                            filterGroups();
                            showWarningModal(`${currentModalType === 'types' ? 'Type' : 'Maker'} deleted successfully`);
                        } else {
                            throw new Error(deleteResult.error);
                        }
                    } catch (error) {
                        console.error('Error deleting item:', error);
                        showWarningModal(`Error deleting ${currentModalType === 'types' ? 'type' : 'maker'}: ${error.message}`);
                    }
                }
            });
        });
    }

    function sortGroups(field) {
        const direction = field === currentSort.field && currentSort.direction === 'asc' ? 'desc' : 'asc';
        currentSort = { field, direction };

        const groups = currentModalType === 'types' ? types : makers;

        groups.sort((a, b) => {
            let compareA = field === 'code' ? parseInt(a.CODE) : a.NAME.toLowerCase();
            let compareB = field === 'code' ? parseInt(b.CODE) : b.NAME.toLowerCase();

            if (direction === 'asc') {
                return compareA > compareB ? 1 : -1;
            } else {
                return compareA < compareB ? 1 : -1;
            }
        });

        if (currentModalType === 'types') {
            types = groups;
        } else {
            makers = groups;
        }

        displayGroups();
        updateSortButtons();
    }

    function filterGroups() {
        const codeFilter = document.getElementById('searchGroupCode').value.toLowerCase();
        const nameFilter = document.getElementById('searchGroupName').value.toLowerCase();
        
        const groups = currentModalType === 'types' ? types : makers;
        
        const filteredGroups = groups.filter(group => {
            const matchesCode = group.CODE.toString().includes(codeFilter);
            const matchesName = group.NAME.toLowerCase().includes(nameFilter);
            return matchesCode && matchesName;
        });
        
        displayFilteredGroups(filteredGroups);
    }

    function populateGroupFilters(makers, types) {
        makers.forEach(maker => {
            const option = document.createElement('option');
            option.value = maker.NAME;
            option.textContent = maker.NAME;
            productMaker.appendChild(option);
        });

        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.NAME;
            option.textContent = type.NAME;
            productType.appendChild(option);
        });
    }

    function showGroupsModal() {
        const modal = document.getElementById('groupsModal');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        document.getElementById('searchGroupCode').value = '';
        document.getElementById('searchGroupName').value = '';
        
        if (currentModalType === 'types') {
            fetchTypes().then(data => {
                types = data;
                displayGroups();
            });
        } else if (currentModalType === 'makers') {
            fetchMakers().then(data => {
                makers = data;
                displayGroups();
            });
        }
    }

    async function saveGroupsData() {
        const groupItems = document.querySelectorAll('.group-item');
        
        const promises = [];
        const itemsToUpdate = [];
        
        for (const item of groupItems) {
            const codeInput = item.querySelector('.groups-input.code');
            const nameInput = item.querySelector('.groups-input.name');
            
            const currentCode = parseInt(codeInput.value);
            const currentName = nameInput.value.trim();
            const originalCode = parseInt(codeInput.dataset.originalCode);
            const originalName = nameInput.dataset.originalName;
            
            if (item.classList.contains('new-group')) {
                const insertData = {
                    code: currentCode,
                    name: currentName
                };
                
                if (currentModalType === 'types') {
                    promises.push(insertType(insertData));
                } else {
                    promises.push(insertMaker(insertData));
                }
                
                itemsToUpdate.push({ item, isNew: true });
            } else {
                if (currentCode === originalCode && currentName === originalName) {
                    continue;
                }
                
                const groups = currentModalType === 'types' ? types : makers;
                const existingItem = groups.find(g => g.CODE === originalCode && g.NAME === originalName);
                
                if (existingItem) {
                    const updateData = {
                        id: existingItem.ID,
                        code: currentCode,
                        name: currentName
                    };
                    
                    if (currentModalType === 'types') {
                        promises.push(updateType(updateData));
                    } else {
                        promises.push(updateMaker(updateData));
                    }
                    
                    itemsToUpdate.push({ item, isNew: false, updateData });
                }
            }
        }
        
        if (promises.length > 0) {
            const results = await Promise.all(promises);
            
            const failures = results.filter(result => !result.success);
            if (failures.length > 0) {
                throw new Error(`Some operations failed: ${failures.map(f => f.error).join(', ')}`);
            }
            
            itemsToUpdate.forEach(({ item, isNew, updateData }) => {
                if (isNew) {
                    item.classList.remove('new-group');
                }
                
                if (updateData) {
                    const codeInput = item.querySelector('.groups-input.code');
                    const nameInput = item.querySelector('.groups-input.name');
                    codeInput.dataset.originalCode = updateData.code;
                    nameInput.dataset.originalName = updateData.name;
                }
            });
            
            if (currentModalType === 'types') {
                types = await fetchTypes();
                productType.innerHTML = '<option value="">Select Type</option>';
                types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.NAME;
                    option.textContent = type.NAME;
                    productType.appendChild(option);
                });
            } else {
                makers = await fetchMakers();
                // Update the productMaker dropdown
                productMaker.innerHTML = '<option value="">Select Maker</option>';
                makers.forEach(maker => {
                    const option = document.createElement('option');
                    option.value = maker.NAME;
                    option.textContent = maker.NAME;
                    productMaker.appendChild(option);
                });
            }
            
            displayGroups();
            console.log(`Successfully saved ${promises.length} items to database`);
        }
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
            const currentIndex = products.findIndex(p => p.ID === currentProductId);
            if (currentIndex === -1) {
                console.error('Current product not found in dataset');
                return;
            }

            let targetProduct = null;
            
            if (direction === 'next') {
                targetProduct = products[currentIndex + 1];
            } else if (direction === 'prev') {
                targetProduct = products[currentIndex - 1];
            }

            if (targetProduct) {
                loadProductData(targetProduct);
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
        if (productId === 'new') {
            sidePrevBtn.style.display = 'none';
            sideNextBtn.style.display = 'none';
            return; // Exit early
        }
    
        sidePrevBtn.style.display = 'flex';
        sideNextBtn.style.display = 'flex';

        const currentIndex = products.findIndex(p => p.ID === currentProductId);

        sidePrevBtn.disabled = currentIndex <= 0;
        sideNextBtn.disabled = currentIndex >= products.length - 1;
        
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
    
    function showUnsavedChangesModal() {
        unsavedChangesModal.style.display = 'flex';
    }
    // #endregion
    // #endregion
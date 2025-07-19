import {fillDropdown, getItemCardHtml} from "./common.js";
import { fetchFilteredProducts, fetchFilteredPromos, getAssociatedCarouselForPromo, getIssuedCount,
    insertPromoLines, deletePromoLines, updatePromoLines, updatePromo, 
    insertPromo, deletePromo } from './dbService.js';

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
    let pendingImageFile = null;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const selectedMaker = urlParams.get('maker');
    const selectedType = urlParams.get('type');

    // Data tables
    let promos = [];
    let totalIssued;
    let associatedCarousels;
    // #endregion

document.addEventListener('DOMContentLoaded', async () => {
    promos = await fetchFilteredProducts(selectedType, selectedMaker);

    const productData = promos.find(p => p.ID.toString() === productId);
    
    if (productData) {
        loadPromoData(productData);
    }else if (productId === 'new') {
        createNewPromo();
    } else {
        showWarningModal('Product not found');
    }

    window.addEventListener('popstate', async function() {// Reload the page correctly when navigating back
        const params = new URLSearchParams(window.location.search);
        const newProductId = params.get('id');
        
        // Find product in current promos array
        const productData = promos.find(p => p.ID.toString() === newProductId);
        
        if (productData) {
            loadPromoData(productData);
        } else if (newProductId === 'new') {
            createNewPromo();
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
        loadPromoData(productData);
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
    // #region PRODUCT FUNCTIONS
    function loadPromoData(productData) {
        headerProductCode.value = productData.CODE;
        headerProductName.value = productData.NAME;
        priceInput.value = productData.PRICE;
        discountInput.value = productData.DISCOUNT * 100;
        finalPriceInput.value = productData.FINALPRICE;
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
                
                promos = await fetchFilteredProducts('All', 'All');
                const savedProduct = promos.find(p => p.CODE === productData.code);
                
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
                    
                    loadPromoData(savedProduct);
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

    function createNewPromo() {
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
                console.error('Current product not found in dataset');
                return;
            }

            let targetProduct = null;
            
            if (direction === 'next') {
                targetProduct = promos[currentIndex + 1];
            } else if (direction === 'prev') {
                targetProduct = promos[currentIndex - 1];
            }

            if (targetProduct) {
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
/*TO DO
1)DISABLE BUTTON ON CREATE NEW
2)COPY GROUPS FUNCTIONALITY FOR MAKERS
*/

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
    let validForInsert = true;
    let currentSort = { field: 'code', direction: 'asc' };

    // Predefined data arrays
    const groups = [
        {
            id: 1,
            name: "Audio",
            code: 100
        },
        {
            id: 2,
            name: "Electronics",
            code: 200
        },
        {
            id: 3,
            name: "Photography",
            code: 201
        },
        {
            id: 4,
            name: "Home Appliances",
            code: 300
        },
        {
            id: 5,
            name: "Accessories",
            code: 400
        },
        {
            id: 5,
            name: "Accessories",
            code: 401
        },{
            id: 5,
            name: "Accessories",
            code: 402
        },{
            id: 5,
            name: "Accessories",
            code: 403
        },{
            id: 5,
            name: "Accessories",
            code: 404
        },{
            id: 5,
            name: "Accessories",
            code: 405
        },{
            id: 5,
            name: "Accessories",
            code: 406
        },{
            id: 5,
            name: "Accessories",
            code: 407
        },{
            id: 5,
            name: "Accessories",
            code: 408
        },{
            id: 5,
            name: "Accessories",
            code: 409
        },
    ];
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

        const groupData = groups.find(g => g.name === productData.group);
        if (groupData) {
            document.getElementById('groupSearch').value = 
                `${groupData.code} - ${groupData.name}`;
            document.getElementById('productGroup').value = groupData.name;
        }
    }

    function showWarningModal(message) {
        const warningModal = document.getElementById('warningModal');
        const warningMessage = document.getElementById('warningMessage');
        warningMessage.textContent = message;
        warningModal.style.display = 'flex';
    }

    function saveProductData() {
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

        if (priceInput.value==0) {
            showWarningModal('Product Price is required');
            priceInput.focus();
            validForInsert = false;
            return;
        }
        validForInsert = true;
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
        headerProductName.value = "";
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
        formChanged = true;
    }

//HOTKEYS------------------------------------------------------------------------------------------------
    document.addEventListener('keydown', function(event) {//SAVE HOTKEY
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault(); // Prevent browser "Save" dialog
            saveProductData();
            formChanged = false;
            if (validForInsert){
                showConfirmation();
            }
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

    // Add event listeners for the warning modal
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









    
    // Add to your initialization code
    document.querySelector('label[for="productGroup"]').addEventListener('click', function(e) {
        e.preventDefault();
        showGroupsModal();
    });

    // Add these functions
    function showGroupsModal() {
        const modal = document.getElementById('groupsModal');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        sortGroups('code'); // Initial sort by code
        updateGroupsList();
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

    // Add these event listeners
    document.querySelector('.groups-close').addEventListener('click', function() {
        document.getElementById('groupsModal').style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    document.getElementById('saveGroupBtn').addEventListener('click', function() {
        showSaveNotification(); 
    });

    // Add this function
    function showSaveNotification() {
        const notification = document.querySelector('.groups-save-notification');
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Add escape key handler if not already present
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('groupsModal');
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        }
    });

    // Add these functions
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

    // Add these event listeners
    document.getElementById('sortByCode').addEventListener('click', function() {
        sortGroups('code');
    });

    document.getElementById('sortByName').addEventListener('click', function() {
        sortGroups('name');
    });

    // Add to your initialization section
    function initializeSearch() {
        const searchCode = document.getElementById('searchGroupCode');
        const searchName = document.getElementById('searchGroupName');

        searchCode.addEventListener('input', filterGroups);
        searchName.addEventListener('input', filterGroups);
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

    // Update showGroupsModal to initialize search
    function showGroupsModal() {
        const modal = document.getElementById('groupsModal');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Clear search fields
        document.getElementById('searchGroupCode').value = '';
        document.getElementById('searchGroupName').value = '';
        
        updateGroupsList();
    }

    // Call initialization
    initializeSearch();

    // Modify or add this event listener
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

    // Add to your initialization section
    function initializeGroupSearch() {
        const groupSearch = document.getElementById('groupSearch');
        const groupDropdown = document.getElementById('groupDropdown');
        const productGroup = document.getElementById('productGroup');

        // Initial population of dropdown
        updateGroupDropdown(groups);

        // Show dropdown on focus
        groupSearch.addEventListener('focus', () => {
            groupDropdown.classList.add('active');
            updateGroupDropdown(groups);
        });

        // Filter as user types
        groupSearch.addEventListener('input', () => {
            const searchValue = groupSearch.value.trim();
            const filteredGroups = groups.filter(group => 
                group.code.toString().includes(searchValue)
            );
            updateGroupDropdown(filteredGroups);
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!groupSearch.contains(e.target) && !groupDropdown.contains(e.target)) {
                groupDropdown.classList.remove('active');
            }
        });

        function updateGroupDropdown(filteredGroups) {
            groupDropdown.innerHTML = '';
            
            filteredGroups.forEach(group => {
                const option = document.createElement('div');
                option.className = 'group-option';
                option.innerHTML = `
                    <span class="code">${group.code}</span>
                    <span class="name">${group.name}</span>
                `;
                
                option.addEventListener('click', () => {
                    groupSearch.value = `${group.code} - ${group.name}`;
                    productGroup.value = group.name;
                    groupDropdown.classList.remove('active');
                });
                
                groupDropdown.appendChild(option);
            });
            
            groupDropdown.classList.add('active');
        }
    }

    // Call initialization
    initializeGroupSearch();
});
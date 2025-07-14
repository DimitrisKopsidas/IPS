//TODO : FIX PAGE OVERFLOW BUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


import { fetchFilteredProducts, fetchMakers, fetchTypes } from './dbService.js';


const itemList = document.getElementById('productList');

let items;
let types;
let makers;
let navigation;
const state = {
    currentPage: 1,
    filteredItems: [],
    itemsPerPage: 20 
};

document.addEventListener('DOMContentLoaded', async () => {
    navigation = initializeNavigation(state, displayItems, state.itemsPerPage);
    try {
        items = await fetchFilteredProducts('All', 'All');
        types = await fetchTypes();
        makers = await fetchMakers();
        
        populateFilters();
        displayItems(items);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
});

function displayItems(filteredItems = items) {
    state.filteredItems = filteredItems;
    state.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value) || 5;
    
    // Calculate total pages and adjust current page if needed
    const totalPages = Math.ceil(filteredItems.length / state.itemsPerPage);
    if (state.currentPage > totalPages) {
        state.currentPage = Math.max(1, totalPages);
    }
    
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = Math.min(startIndex + state.itemsPerPage, filteredItems.length);
    
    
    itemList.innerHTML = '';

    // Only process items if we have any
    if (filteredItems.length > 0) {
        filteredItems.slice(startIndex, endIndex).forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.cursor = 'pointer';
            productCard.addEventListener('click', () => {
                // Get current filter values
                const selectedType = document.getElementById('groupFilter').value;
                const selectedMaker = document.getElementById('makerFilter').value;
                
                // Build query parameters
                const params = new URLSearchParams({
                    id: product.ID,
                    maker: selectedMaker,
                    type: selectedType,
                });
                
                // Navigate with parameters
                window.location.href = `product.html?${params.toString()}`;
            });
            
            productCard.innerHTML = `
                <div class="product-layout">
                    <div class="product-image">
                        <img src="media/${product.ID}.png" alt="${product.NAME}" onerror="this.src='media/404.png'">
                    </div>
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${product.CODE}</span>
                            <h2 class="product-name">${product.NAME}</h2>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-group">Type: ${product.TYPECODE} - ${product.TYPENAME}</span>
                                <span class="product-maker">Maker: ${product.MAKERCODE} - ${product.MAKERNAME}</span>
                            </div>
                            <div class="info-row">
                                <span class="product-price">Price: $${product.PRICE}</span>
                                <span class="product-discount">Discount: ${product.DISCOUNT*100}%</span>
                                <span class="product-final-price">Final: $${product.FINALPRICE}</span>
                            </div>
                            <p class="product-note">${product.NOTES}</p>
                        </div>
                    </div>
                </div>
            `;
            itemList.appendChild(productCard);
        });
    } else {
        itemList.innerHTML = '<div class="no-results">No items found</div>';
    }

    // Update navigation after processing items
    navigation.updateNavigation();
}

async function filterItems() {
    try {
        const searchCode = document.getElementById('codeFilter').value.toLowerCase();
        const searchName = document.getElementById('nameFilter').value.toLowerCase();
        const selectedType = document.getElementById('groupFilter').value;
        const selectedMaker = document.getElementById('makerFilter').value;

        state.currentPage = 1; // Reset to first page when filtering
        
        // First get filtered items from server based on type and maker
        const serverFilteredProducts = await fetchFilteredProducts(selectedType, selectedMaker);
        
        // Then apply client-side filtering for code and name
        const finalFiltered = serverFilteredProducts.filter(product => {
            const matchesCode = searchCode === '' || 
                                product.CODE.toString().toLowerCase().includes(searchCode);
            const matchesName = searchName === '' || 
                                product.NAME.toLowerCase().includes(searchName);
            
            return matchesCode && matchesName;
        });

        displayItems(finalFiltered);
    } catch (error) {
        console.error('Error applying filters:', error);
        itemList.innerHTML = `
            <div class="error-message">
                <p>Failed to load filtered items. Please try again.</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}

function populateFilters() {
    const groupFilter = document.getElementById('groupFilter');
    const makerFilter = document.getElementById('makerFilter');

    // Clear existing options except "All"
    groupFilter.innerHTML = '<option value="All">All</option>';
    makerFilter.innerHTML = '<option value="All">All</option>';

    // Add type options
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.NAME;  // Changed from type.TYPE to type.NAME
        option.textContent = `${type.CODE} - ${type.NAME}`;
        groupFilter.appendChild(option);
    });

    // Add maker options
    makers.forEach(maker => {
        const option = document.createElement('option');
        option.value = maker.NAME;  // Changed from maker.MAKER to maker.NAME
        option.textContent = `${maker.CODE} - ${maker.NAME}`;
        makerFilter.appendChild(option);
    });
}    

document.getElementById('itemsPerPage').addEventListener('change', () => {
    state.currentPage = 1; // Reset to first page when changing items per page
    filterItems();
});

document.getElementById('createNewButton').addEventListener('click', () => {
    // Navigate to product.html with new flag
    const params = new URLSearchParams({
        id: 'new'
    });
    window.location.href = `product.html?id=new`;
});

document.getElementById('groupFilter').addEventListener('change', filterItems);
document.getElementById('makerFilter').addEventListener('change', filterItems);
document.getElementById('codeFilter').addEventListener('input', filterItems);
document.getElementById('nameFilter').addEventListener('input', filterItems);  
//TODO : FIX PAGE OVERFLOW BUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


import { fetchFilteredProducts, fetchMakers, fetchTypes } from './dbService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const state = {
        currentPage: 1,
        filteredProducts: [],
        itemsPerPage: 20 // Default items per page
    };
    
    let products = fetchFilteredProducts('All', 'All'); // Initial fetch with default filters
    let types = fetchTypes(); 
    let makers = fetchMakers(); 
    let navigation;

    // Define display function first
    function displayProducts(filteredProducts = products) {
        state.filteredProducts = filteredProducts;
        state.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value) || 5;
        
        // Calculate total pages and adjust current page if needed
        const totalPages = Math.ceil(filteredProducts.length / state.itemsPerPage);
        if (state.currentPage > totalPages) {
            state.currentPage = Math.max(1, totalPages);
        }
        
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = Math.min(startIndex + state.itemsPerPage, filteredProducts.length);
        const productList = document.getElementById('productList');
        
        productList.innerHTML = '';

        // Only process items if we have any
        if (filteredProducts.length > 0) {
            filteredProducts.slice(startIndex, endIndex).forEach(product => {
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
                productList.appendChild(productCard);
            });
        } else {
            productList.innerHTML = '<div class="no-results">No products found</div>';
        }

        // Update navigation after processing items
        navigation.updateNavigation();
    }

    // Initialize navigation before using it
    navigation = initializeNavigation(state, displayProducts, state.itemsPerPage);

    async function filterProducts() {
        try {
            const searchCode = document.getElementById('codeFilter').value.toLowerCase();
            const searchName = document.getElementById('nameFilter').value.toLowerCase();
            const selectedType = document.getElementById('groupFilter').value;
            const selectedMaker = document.getElementById('makerFilter').value;

            state.currentPage = 1; // Reset to first page when filtering
            
            // First get filtered products from server based on type and maker
            const serverFilteredProducts = await fetchFilteredProducts(selectedType, selectedMaker);
            
            // Then apply client-side filtering for code and name
            const finalFiltered = serverFilteredProducts.filter(product => {
                const matchesCode = searchCode === '' || 
                                  product.CODE.toString().toLowerCase().includes(searchCode);
                const matchesName = searchName === '' || 
                                  product.NAME.toLowerCase().includes(searchName);
                
                return matchesCode && matchesName;
            });

            displayProducts(finalFiltered);
        } catch (error) {
            console.error('Error applying filters:', error);
            const productList = document.getElementById('productList');
            productList.innerHTML = `
                <div class="error-message">
                    <p>Failed to load filtered products. Please try again.</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }

    try {
        // Get initial products without filters
        products = await fetchFilteredProducts('All', 'All');
        // Get types and makers for dropdowns
        types = await fetchTypes();
        makers = await fetchMakers();
        
        console.log('Loaded data:', { 
            productsCount: products.length,
            typesCount: types.length,
            makersCount: makers.length 
        });
        
        // Populate filters after data is loaded
        populateFilters();
        // Initial display showing all products
        displayProducts(products);
    } catch (error) {
        console.error('Error loading initial data:', error);
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
   
    // Update itemsPerPage event listener
    document.getElementById('itemsPerPage').addEventListener('change', () => {
        state.currentPage = 1; // Reset to first page when changing items per page
        filterProducts();
    });

    // Add event listeners for filters
    document.getElementById('groupFilter').addEventListener('change', filterProducts);
    document.getElementById('makerFilter').addEventListener('change', filterProducts);
    document.getElementById('codeFilter').addEventListener('input', filterProducts);
    document.getElementById('nameFilter').addEventListener('input', filterProducts);   

    // Add click handler for Create New button
    document.getElementById('createNewButton').addEventListener('click', () => {
        // Navigate to product.html with new flag
        const params = new URLSearchParams({
            id: 'new'
        });
        window.location.href = `product.html?id=new`;
    });
});
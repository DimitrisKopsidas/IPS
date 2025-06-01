//TODO : FIX PAGE OVERFLOW BUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


import { fetchProducts, fetchMakers, fetchTypes } from './dbService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const state = {
        currentPage: 1,
        filteredProducts: [],
        itemsPerPage: 5 // Default items per page
    };
    
    let products = [];
    let types = [];
    let makers = [];
    let navigation;

    // Define display function first
    function displayProducts(filteredProducts = products) {
        state.filteredProducts = filteredProducts;
        state.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value) || 5;
        
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const productList = document.getElementById('productList');
        
        productList.innerHTML = '';

        filteredProducts.slice(startIndex, endIndex).forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.cursor = 'pointer';
            productCard.addEventListener('click', () => {
                window.location.href = `product.html?get=${product.PRODUCT}`;
            });
            
            productCard.innerHTML = `
                <div class="product-layout">
                    <div class="product-image">
                        <img src="media/${product.PRODUCT}.png" alt="${product.NAME}" onerror="this.src='media/404.png'">
                    </div>
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${product.CODE}</span>
                            <h2 class="product-name">${product.NAME}</h2>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-group">Group: ${product.TYPE}</span>
                                <span class="product-maker">Maker: ${product.MAKER}</span>
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
        navigation.updateNavigation();
    }

    // Initialize navigation before using it
    navigation = initializeNavigation(state, displayProducts, state.itemsPerPage);

    function filterProducts() {
        const searchCode = document.getElementById('codeFilter').value.toLowerCase();
        const searchName = document.getElementById('nameFilter').value.toLowerCase();
        const selectedGroup = document.getElementById('groupFilter').value;
        const selectedMaker = document.getElementById('makerFilter').value;

        state.currentPage = 1; // Reset to first page when filtering
        
        const filteredProducts = products.filter(product => {
            const matchesGroup = selectedGroup === 'All' || product.TYPE.toString() === selectedGroup;
            const matchesMaker = selectedMaker === 'All' || product.MAKER.toString() === selectedMaker;
            const matchesCode = searchCode === '' || product.CODE.toString().toLowerCase().includes(searchCode);
            const matchesName = searchName === '' || product.NAME.toLowerCase().includes(searchName);
            
            return matchesGroup && matchesMaker && matchesCode && matchesName;
        });

        displayProducts(filteredProducts);
    }

    try {
        products = await fetchProducts();
        types = await fetchTypes();
        makers = await fetchMakers();
        console.log('Loaded data:', { products, types, makers });
        
        // Populate filters after data is loaded
        populateFilters();
        // Initial display after everything is set up
        filterProducts();
    } catch (error) {
        console.error('Error loading tables: ', error);
    }

    function populateFilters() {
        const groupFilter = document.getElementById('groupFilter');
        const makerFilter = document.getElementById('makerFilter');

        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.TYPE;
            option.textContent = type.CODE +" - "+type.NAME;
            groupFilter.appendChild(option);
        });
        makers.forEach(maker => {
            const option = document.createElement('option');
            option.value = maker.MAKER;
            option.textContent = maker.CODE +" - "+maker.NAME;
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
});
document.addEventListener('DOMContentLoaded', function() {
    const promos = [
        {
            id: 1,
            code: 100,
            productName: "Playstation 2",
            productGroup: "Modern",
            productMaker: "Sony",
            discount: 25,
            notes: "The PS2 is the best-selling video game console of all time with over 155 million units sold worldwide!",
            issuedCount: 2,
            carouselCount: 0
        },
        {
            id: 2,
            code: 101,
            productName: "Atari 2600",
            productGroup: "Old School",
            productMaker: "Atari",
            discount: 15,
            notes: "The famous 'E.T.' game for Atari 2600 was so bad that thousands of cartridges were buried in a New Mexico landfill!",
            issuedCount: 1,
            carouselCount: 2
        },
        {
            id: 3,
            code: 102,
            productName: "Sega Genesis",
            productGroup: "Retro",
            productMaker: "Sega",
            discount: 20,
            notes: "Sonic the Hedgehog was created because Sega wanted a mascot that could run fast to show off the Genesis's processing power!",
            issuedCount: 3,
            carouselCount: 1
        },
        {
            id: 4,
            code: 103,
            productName: "Nintendo 64",
            productGroup: "Retro",
            productMaker: "Nintendo",
            discount: 10,
            notes: "The N64's controller was the first to feature an analog stick as standard, revolutionizing 3D gaming!",
            issuedCount: 4,
            carouselCount: 2
        },
        {
            id: 5,
            code: 104,
            productName: "Nintendo Entertainment System",
            productGroup: "Old School",
            productMaker: "Nintendo",
            discount: 5,
            notes: "The NES was originally released as the 'Famicom' in Japan, and the cartridges were a different shape!",
            issuedCount: 2,
            carouselCount: 1
        },
        {
            id: 6,
            code: 105,
            productName: "PlayStation",
            productGroup: "Retro",
            productMaker: "Sony",
            discount: 30,
            notes: "The PlayStation was originally meant to be a Nintendo CD add-on until Sony and Nintendo's partnership fell apart!",
            issuedCount: 3,
            carouselCount: 0
        },
        {
            id: 7,
            code: 106,
            productName: "Super Nintendo Entertainment System",
            productGroup: "Retro",
            productMaker: "Nintendo",
            discount: 20,
            notes: "The SNES's grey color in North America was changed because the Japanese Super Famicom's plastic would turn yellow over time!",
            issuedCount: 5,
            carouselCount: 3
        }
    ];
    const state = {
        currentPage: 1,
        filteredProducts: []
    };

    let navigation;

    // Update display function to use fixed number of items
    function displayProducts(filteredProducts = promos) {
        state.filteredProducts = filteredProducts;
        const itemsPerPage = navigation.getItemsPerPage();
        
        const startIndex = (state.currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const productList = document.getElementById('productList');
        
        productList.innerHTML = '';

        filteredProducts.slice(startIndex, endIndex).forEach(promo => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.cursor = 'pointer';
            productCard.addEventListener('click', () => {
                window.location.href = `product.html?get=${promo.id}`;
            });
            
            productCard.innerHTML = `
                <div class="product-layout">
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${promo.code}</span>
                            <h2 class="product-name">${promo.productName}</h2>
                            <span class="product-discount">Discount: ${promo.discount}%</span>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-group">Group: ${promo.productGroup}</span>
                                <span class="product-maker">Maker: ${promo.productMaker}</span>
                            </div>
                            <div class="info-row">
                                
                                <span>Active in carousels: ${promo.carouselCount}</span>
                                <span>Promos issued: ${promo.issuedCount}</span>
                            </div>
                            <p class="product-note">${promo.notes}</p>
                            <div class="product-stats">
                                
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });

        navigation.updateNavigation();
    }

    // Initialize navigation
    navigation = initializeNavigation(state, displayProducts);

    // Update filter function
    function filterProducts() {
        const selectedGroup = document.getElementById('groupFilter').value;
        const selectedMaker = document.getElementById('makerFilter').value;
        const searchCode = document.getElementById('codeFilter').value.toLowerCase();
        const searchName = document.getElementById('productNameFilter').value.toLowerCase();
        const promoType = document.getElementById('promoTypeFilter').value;
        
        state.currentPage = 1; // Reset to first page when filtering
        
        const filteredProducts = promos.filter(promo => {
            const matchesGroup = selectedGroup === 'Unknown' || promo.productGroup === selectedGroup;
            const matchesMaker = selectedMaker === 'Unknown' || promo.productMaker === selectedMaker;
            const matchesCode = searchCode === '' || promo.code.toString().includes(searchCode);
            const matchesName = searchName === '' || promo.productName.toLowerCase().includes(searchName);
            const matchesType = promoType === 'All' || 
                (promoType === 'Product' && promo.productName) ||
                (promoType === 'Group' && promo.productGroup && !promo.productName) ||
                (promoType === 'Maker' && promo.productMaker && !promo.productName && !promo.productGroup);
            
            return matchesGroup && matchesMaker && matchesCode && matchesName && matchesType;
        });

        displayProducts(filteredProducts);
    }

    // Add event listeners for filters
    document.getElementById('groupFilter').addEventListener('change', filterProducts);
    document.getElementById('makerFilter').addEventListener('change', filterProducts);
    document.getElementById('codeFilter').addEventListener('input', filterProducts);
    document.getElementById('productNameFilter').addEventListener('input', filterProducts);
    document.getElementById('promoTypeFilter').addEventListener('change', filterProducts);

    // Initial display
    filterProducts();
});
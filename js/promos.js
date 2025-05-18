document.addEventListener('DOMContentLoaded', function() {
    const products = [
        {
            id: 1,
            code: 100,
            productName: "Playstation 2",
            productGroup: "Modern",
            productMaker: "Sony",
            discount: 0,
            notes: "The PS2 is the best-selling video game console of all time with over 155 million units sold worldwide!",
            promosIssued: 2,
            promosCount: 0,
        },
        {
            id: 2,
            code: 101,
            name: "Atari 2600",
            group: "Old School",
            maker: "Atari",
            price: 299.99,
            discount: 15,
            finalprice: 254.99,
            notes: "The famous 'E.T.' game for Atari 2600 was so bad that thousands of cartridges were buried in a New Mexico landfill!",
            imageUrl: "media/2.png",
            carouselCount: 1,
            promosCount: 2,
        },
        {
            id: 3,
            code: 102,
            name: "Sega Genesis",
            group: "Retro",
            maker: "Sega",
            price: 189.99,
            discount: 0,
            finalprice: 189.99,
            notes: "Sonic the Hedgehog was created because Sega wanted a mascot that could run fast to show off the Genesis's processing power!",
            imageUrl: "media/3.png",
            carouselCount: 3,
            promosCount: 1,
        },
        {
            id: 4,
            code: 103,
            name: "Nintendo 64",
            group: "Retro",
            maker: "Nintendo",
            price: 249.99,
            discount: 10,
            finalprice: 224.99,
            notes: "The N64's controller was the first to feature an analog stick as standard, revolutionizing 3D gaming!",
            imageUrl: "media/4.png",
            carouselCount: 4,
            promosCount: 2,
        },
        {
            id: 5,
            code: 104,
            name: "Nintendo Entertainment System",
            group: "Old School",
            maker: "Nintendo",
            price: 179.99,
            discount: 5,
            finalprice: 170.99,
            notes: "The NES was originally released as the 'Famicom' in Japan, and the cartridges were a different shape!",
            imageUrl: "media/5.png",
            carouselCount: 2,
            promosCount: 1,
        },
        {
            id: 6,
            code: 105,
            name: "PlayStation",
            group: "Retro",
            maker: "Sony",
            price: 159.99,
            discount: 0,
            finalprice: 159.99,
            notes: "The PlayStation was originally meant to be a Nintendo CD add-on until Sony and Nintendo's partnership fell apart!",
            imageUrl: "media/6.png",
            carouselCount: 3,
            promosCount: 0,
        },
        {
            id: 7,
            code: 106,
            name: "Super Nintendo Entertainment System",
            group: "Gaming",
            maker: "Retro",
            price: 199.99,
            discount: 20,
            finalprice: 159.99,
            notes: "The SNES's grey color in North America was changed because the Japanese Super Famicom's plastic would turn yellow over time!",
            imageUrl: "media/7.png",
            carouselCount: 5,
            promosCount: 3,
        }
    ];
    
    // Add pagination state
    const state = {
        currentPage: 1,
        itemsPerPage: 2,
        filteredProducts: []
    };

    // Update display products function to handle pagination
    function displayProducts(filteredProducts = products) {
        state.filteredProducts = filteredProducts;
        state.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value) || 2;
        
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const productList = document.getElementById('productList');
        
        productList.innerHTML = '';

        filteredProducts.slice(startIndex, endIndex).forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.cursor = 'pointer';
            productCard.addEventListener('click', () => {
                window.location.href = `product.html?get=${product.id}`;
            });
            
            productCard.innerHTML = `
                <div class="product-layout">
                    <div class="product-image">
                        <img src="media/${product.id-1}.png" alt="${product.name}" onerror="this.src='media/404.png'">
                    </div>
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${product.code}</span>
                            <h2 class="product-name">${product.name}</h2>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-group">Group: ${product.group}</span>
                                <span class="product-maker">Maker: ${product.maker}</span>
                            </div>
                            <div class="info-row">
                                <span class="product-price">Price: $${product.price}</span>
                                <span class="product-discount">Discount: ${product.discount}%</span>
                                <span class="product-final-price">Final: $${product.finalprice}</span>
                            </div>
                            <p class="product-note">${product.notes}</p>
                            <div class="product-stats">
                                <span>Carousels: ${product.carouselCount}</span>
                                <span>Promos: ${product.promosCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });

        updateNavigationButtons();
    }

    // Add navigation function
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('sidePrevBtn');
        const nextBtn = document.getElementById('sideNextBtn');
        
        const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
        
        // Update button visibility
        if (totalPages <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        
        // Update button states
        prevBtn.disabled = state.currentPage === 1;
        nextBtn.disabled = state.currentPage === totalPages;
    }

    // Add navigation event handlers
    document.getElementById('sidePrevBtn').addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayProducts(state.filteredProducts);
        }
    });

    document.getElementById('sideNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            displayProducts(state.filteredProducts);
        }
    });

    // Update filter function
    function filterProducts() {
        const selectedGroup = document.getElementById('groupFilter').value;
        const selectedMaker = document.getElementById('makerFilter').value;
        const searchCode = document.getElementById('codeFilter').value.toLowerCase();
        const searchName = document.getElementById('nameFilter').value.toLowerCase();
        
        state.currentPage = 1; // Reset to first page when filtering
        
        const filteredProducts = products.filter(product => {
            const matchesGroup = selectedGroup === 'Unknown' || product.group === selectedGroup;
            const matchesMaker = selectedMaker === 'Unknown' || product.maker === selectedMaker;
            const matchesCode = searchCode === '' || product.code.toString().includes(searchCode);
            const matchesName = searchName === '' || product.name.toLowerCase().includes(searchName);
            
            return matchesGroup && matchesMaker && matchesCode && matchesName;
        });

        displayProducts(filteredProducts);
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

    // Initial display
    filterProducts();
});
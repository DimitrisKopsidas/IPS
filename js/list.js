document.addEventListener('DOMContentLoaded', function() {
    const products = [
        {
            id: 1,
            code: 100,
            name: "Playstation 2",
            group: "Gaming",
            maker: "Sony",
            price: 199.99,
            discount: 0,
            finalprice: 199.99,
            notes: "The PS2 is the best-selling video game console of all time with over 155 million units sold worldwide!",
            carouselCount: 2,
            promosCount: 0,
        },
        {
            id: 2,
            code: 101,
            name: "Atari 2600",
            group: "Gaming",
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
            group: "Gaming",
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
            group: "Gaming",
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
            group: "Gaming",
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
            group: "Gaming",
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
            maker: "Nintendo",
            price: 199.99,
            discount: 20,
            finalprice: 159.99,
            notes: "The SNES's grey color in North America was changed because the Japanese Super Famicom's plastic would turn yellow over time!",
            imageUrl: "media/7.png",
            carouselCount: 5,
            promosCount: 3,
        }
    ];
    
    // Display products with pagination and images
    function displayProducts(filteredProducts = products) {
        const itemsPerPage = parseInt(document.getElementById('itemsPerPage').value) || 2;
        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        filteredProducts.slice(0, itemsPerPage).forEach(product => {
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
    }

    // Add event listener for items per page change
    document.getElementById('itemsPerPage').addEventListener('change', () => {
        displayProducts();
    });

    // Initial display
    displayProducts();
});
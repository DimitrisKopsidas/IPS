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
            imageUrl: "media/1.png",
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
    
    // Function to display products
    function displayProducts(productList) {
        const productListContainer = document.getElementById('productList');
        productListContainer.innerHTML = '';
        
        productList.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            
            // Generate stars based on rating
            const stars = '★'.repeat(Math.floor(product.rating)) + 
                          (product.rating % 1 >= 0.5 ? '½' : '') + 
                          '☆'.repeat(5 - Math.ceil(product.rating));
            
            // Different layout for computer products
            if (product.category === 'computers') {
                productCard.classList.add('with-image');
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.imageUrl}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">${stars} (${product.rating})</div>
                        <div class="product-description">${product.description}</div>
                    </div>
                `;
            } else {
                // Standard layout for non-computer products
                productCard.innerHTML = `
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">${stars} (${product.rating})</div>
                        <div class="product-description">${product.description}</div>
                    </div>
                `;
            }
            
            productCard.addEventListener('click', function() {
                // In a real app, this would navigate to the product detail page
                window.location.href = `product-details.html?id=${product.id}`;
            });
            
            productListContainer.appendChild(productCard);
        });
    }
    
    // Initial display of all products
    displayProducts(products);
    
    // Filter functionality
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('sortFilter').addEventListener('change', filterProducts);
    
    function filterProducts() {
        const categoryValue = document.getElementById('categoryFilter').value;
        const searchValue = document.getElementById('searchInput').value.toLowerCase();
        const sortValue = document.getElementById('sortFilter').value;
        
        // Filter products by category and search term
        let filteredProducts = products.filter(product => {
            const matchesCategory = categoryValue === '' || product.category === categoryValue;
            const matchesSearch = searchValue === '' || 
                                 product.name.toLowerCase().includes(searchValue) || 
                                 product.description.toLowerCase().includes(searchValue);
            
            return matchesCategory && matchesSearch;
        });
        
        // Sort products
        switch(sortValue) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                // In a real app, you would sort by date
                break;
            case 'popular':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
        }
        
        displayProducts(filteredProducts);
    }
    
    // Pagination functionality (simplified)
    const pageBtns = document.querySelectorAll('.page-btn');
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            pageBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // In a real app, this would fetch the appropriate page of products
        });
    });
});
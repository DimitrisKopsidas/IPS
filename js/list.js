document.addEventListener('DOMContentLoaded', function() {
    // Sample product data - in a real app, this would come from an API
    const products = [
        {
            id: 1,
            name: "Premium Wireless Headphones",
            price: 199.99,
            description: "High-quality wireless headphones with active noise cancellation and premium sound quality. Features 30-hour battery life and comfortable ear cups for extended listening sessions.",
            category: "audio",
            rating: 4.8,
            imageUrl: "https://via.placeholder.com/300x200?text=Headphones"
        },
        {
            id: 2,
            name: "Ultra-Slim Laptop",
            price: 1299.99,
            description: "Powerful and portable laptop with 14-inch display and all-day battery life. Includes 16GB RAM, 512GB SSD, and the latest processor for smooth multitasking and productivity.",
            category: "computers",
            rating: 4.5,
            imageUrl: "https://via.placeholder.com/300x200?text=Laptop"
        },
        {
            id: 3,
            name: "Ergonomic Mouse",
            price: 59.99,
            description: "Comfortable ergonomic mouse designed for long hours of use without strain. Features customizable buttons and adjustable DPI settings for precise control.",
            category: "accessories",
            rating: 4.6,
            imageUrl: "https://via.placeholder.com/300x200?text=Mouse"
        },
        {
            id: 4,
            name: "Bluetooth Speaker",
            price: 89.99,
            description: "Portable Bluetooth speaker with rich sound and waterproof design. Perfect for outdoor activities with 12-hour battery life and durable construction.",
            category: "audio",
            rating: 4.3,
            imageUrl: "https://via.placeholder.com/300x200?text=Speaker"
        },
        {
            id: 5,
            name: "Smart Watch",
            price: 249.99,
            description: "Feature-rich smartwatch with health tracking and notification support. Monitors heart rate, sleep patterns, and activity levels while keeping you connected.",
            category: "wearables",
            rating: 4.7,
            imageUrl: "https://via.placeholder.com/300x200?text=Smartwatch"
        },
        {
            id: 6,
            name: "Gaming Desktop Computer",
            price: 1799.99,
            description: "High-performance gaming desktop with RGB lighting and liquid cooling. Equipped with top-tier graphics card and processor for smooth gameplay at maximum settings.",
            category: "computers",
            rating: 4.9,
            imageUrl: "https://via.placeholder.com/300x200?text=Gaming+PC"
        },
        {
            id: 7,
            name: "External SSD Drive",
            price: 149.99,
            description: "Fast and reliable external SSD with 1TB storage capacity. Transfer files quickly with USB 3.2 connectivity and compact, portable design.",
            category: "accessories",
            rating: 4.9,
            imageUrl: "https://via.placeholder.com/300x200?text=SSD"
        },
        {
            id: 8,
            name: "Gaming Monitor",
            price: 349.99,
            description: "27-inch gaming monitor with high refresh rate and low response time. Features adaptive sync technology and HDR support for immersive gaming experiences.",
            category: "computers",
            rating: 4.6,
            imageUrl: "https://via.placeholder.com/300x200?text=Monitor"
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
Function to display products
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
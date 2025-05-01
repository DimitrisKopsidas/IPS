// In a real app, you would fetch this data from an API
document.addEventListener('DOMContentLoaded', function() {
    // Example of dynamic data loading
    const product = {
        name: "Premium Wireless Headphones",
        price: 199.99,
        description: "High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals alike.",
        sku: "WH-2023-PRO",
        availability: "In Stock (25 units)",
        specs: [
            "Bluetooth 5.0",
            "40mm dynamic drivers",
            "IPX4 water resistance",
            "Built-in microphone",
            "Touch controls"
        ],
        imageUrl: "https://via.placeholder.com/600x400?text=Premium+Headphones"
    };
    
    // Populate the product data
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productSKU').textContent = product.sku;
    document.getElementById('productAvailability').textContent = product.availability;
    
    const specsList = document.querySelector('#productSpecs ul');
    specsList.innerHTML = product.specs.map(spec => `<li>${spec}</li>`).join('');
    
    document.getElementById('mainProductImage').src = product.imageUrl;
    document.getElementById('mainProductImage').alt = product.name;
    
    // Button event handlers
    document.getElementById('addToCartBtn').addEventListener('click', function() {
        alert(`${product.name} added to cart!`);
        // In a real app: Add to cart logic
    });
    
    document.getElementById('wishlistBtn').addEventListener('click', function() {
        alert(`${product.name} added to wishlist!`);
        // In a real app: Add to wishlist logic
    });
});
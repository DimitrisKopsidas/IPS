document.addEventListener('DOMContentLoaded', function() {
    // Image preview functionality
    const imageInput = document.getElementById('productImage');
    const previewImage = document.getElementById('previewImage');
    const uploadPreview = document.getElementById('imagePreview');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // File type validation
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // File size validation (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size should be less than 2MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                uploadPreview.classList.add('has-image');
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Handle adding specifications
    const specsContainer = document.getElementById('specsContainer');
    const addSpecBtn = document.getElementById('addSpecBtn');
    
    // Function to create a new specification input
    function createSpecInput() {
        const specItem = document.createElement('div');
        specItem.className = 'spec-item';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'spec-input';
        input.placeholder = 'e.g. Bluetooth 5.0';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove-spec';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', function() {
            specItem.remove();
        });
        
        specItem.appendChild(input);
        specItem.appendChild(removeBtn);
        
        return specItem;
    }
    
    // Add remove functionality to the initial spec item
    document.querySelector('.btn-remove-spec').addEventListener('click', function() {
        if (specsContainer.children.length > 1) {
            this.parentElement.remove();
        } else {
            // If it's the last one, just clear the input
            this.previousElementSibling.value = '';
        }
    });
    
    // Add new specification input
    addSpecBtn.addEventListener('click', function() {
        specsContainer.appendChild(createSpecInput());
    });
    
    // Form submission
    const productForm = document.getElementById('productUploadForm');
    
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Gather specifications
        const specs = [];
        document.querySelectorAll('.spec-input').forEach(input => {
            if (input.value.trim()) {
                specs.push(input.value.trim());
            }
        });
        
        // Create product object
        const product = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            sku: document.getElementById('productSKU').value,
            inventory: parseInt(document.getElementById('productInventory').value),
            specs: specs,
            imageFile: document.getElementById('productImage').files[0]
            // In a real app, you would upload the image separately
        };
        
        // For demo purposes - show the collected data
        console.log('Product data to be submitted:', product);
        alert(`Product "${product.name}" has been published!`);
        
        // In a real app: API call to save the product
        // saveProduct(product).then(response => {
        //     window.location.href = 'product-list.html';
        // });
    });
    
    // Save as draft functionality
    document.getElementById('saveAsDraftBtn').addEventListener('click', function() {
        // For demo purposes
        const productName = document.getElementById('productName').value || 'Unnamed product';
        alert(`Draft of "${productName}" has been saved!`);
        
        // In a real app: API call to save draft
    });
});
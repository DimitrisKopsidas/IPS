document.addEventListener('DOMContentLoaded', function() {
    const carousels = [
        {
            id: 1,
            code: 100,
            name: "Consoles",
            device: "Counter",
            notes: "Did you know? The first home video game console was the Magnavox Odyssey, released in 1972!"
        },
        {
            id: 2,
            code: 200,
            name: "Handhelds",
            device: "Front",
            notes: "The Nintendo Game & Watch series, launched in 1980, was inspired by a businessman playing with a calculator!"
        },
        {
            id: 3,
            code: 301,
            name: "Retro2",
            device: "Shelf",
            notes: "The term 'Retro Gaming' became popular in the 1990s as players began collecting older consoles and games!"
        },
        {
            id: 4,
            code: 300,
            name: "Retro",
            device: "",
            notes: "The golden age of arcade video games was from 1978 to 1982, with classics like Space Invaders and Pac-Man!"
        },
        {
            id: 5,
            code: 500,
            name: "VR",
            device: "Stand",
            notes: "The first VR headset was created in 1968 by Ivan Sutherland and was so heavy it had to be suspended from the ceiling!"
        }
    ]
    // Add pagination state
    const state = {
        currentPage: 1,
        itemsPerPage: 2,
        filteredCarousels: []
    };

    // Display carousels with visual device status and pagination
    function displayCarousels(filteredCarousels = carousels) {
        state.filteredCarousels = filteredCarousels;
        state.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value) || 2;
        
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const productList = document.getElementById('productList');
        
        productList.innerHTML = '';

        filteredCarousels.slice(startIndex, endIndex).forEach(carousel => {
            const hasDevice = carousel.device && carousel.device.trim() !== '';
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.cursor = 'pointer';
            if (hasDevice) {
                productCard.classList.add('has-device');
            }
            productCard.addEventListener('click', () => {
                window.location.href = `carousel.html?get=${carousel.id}`;
            });
            
            productCard.innerHTML = `
                <div class="product-layout">
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${carousel.code}</span>
                            <h2 class="product-name">${carousel.name}</h2>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-device">
                                    ${hasDevice ? '🖥️' : '❌'} Device: ${carousel.device || 'Not Assigned'}
                                </span>
                            </div>
                            <div class="carousel-stats">
                                <p class="product-note">${carousel.notes}</p>
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
        
        const totalPages = Math.ceil(state.filteredCarousels.length / state.itemsPerPage);
        
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
            displayCarousels(state.filteredCarousels);
        }
    });

    document.getElementById('sideNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredCarousels.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            displayCarousels(state.filteredCarousels);
        }
    });

    // Update filter function
    function filterCarousels() {
        const searchCode = document.getElementById('codeFilter').value.toLowerCase();
        const searchName = document.getElementById('nameFilter').value.toLowerCase();
        const activeFilter = document.getElementById('activeFilter').value;
        
        state.currentPage = 1; // Reset to first page when filtering
        
        const filteredCarousels = carousels.filter(carousel => {
            const matchesCode = searchCode === '' || carousel.code.toString().includes(searchCode);
            const matchesName = searchName === '' || carousel.name.toLowerCase().includes(searchName);
            const matchesActive = activeFilter === 'No' || 
                (activeFilter === 'Yes' && carousel.device && carousel.device.trim() !== '');
            
            return matchesCode && matchesName && matchesActive;
        });

        displayCarousels(filteredCarousels);
    }

    // Add event listener for active filter
    document.getElementById('activeFilter').addEventListener('change', filterCarousels);

    // Update itemsPerPage event listener
    document.getElementById('itemsPerPage').addEventListener('change', () => {
        state.currentPage = 1; // Reset to first page when changing items per page
        filterCarousels();
    });

    // Add event listeners for filters
    document.getElementById('codeFilter').addEventListener('input', filterCarousels);
    document.getElementById('nameFilter').addEventListener('input', filterCarousels);

    // Initial display
    filterCarousels();
});

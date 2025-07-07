function initializeNavigation(state, displayCallback, itemsPerPage) {
    // Update navigation function
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('sidePrevBtn');
        const nextBtn = document.getElementById('sideNextBtn');
        
        const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
        
        // Hide both buttons if there's only one page or no items
        if (totalPages <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        // Show buttons and update their state
        prevBtn.style.display = state.currentPage > 1 ? 'flex' : 'none';
        nextBtn.style.display = state.currentPage < totalPages ? 'flex' : 'none';
    }

    // Add navigation event handlers
    document.getElementById('sidePrevBtn').addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayCallback(state.filteredProducts);
        }
    });

    document.getElementById('sideNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            displayCallback(state.filteredProducts);
        }
    });

    return {
        updateNavigation: updateNavigationButtons,
        getItemsPerPage: () => itemsPerPage
    };
}
function initializeNavigation(state, displayCallback, itemsPerPage) {
    // Update navigation function
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('sidePrevBtn');
        const nextBtn = document.getElementById('sideNextBtn');
        
        const totalPages = Math.ceil(state.filteredProducts.length / itemsPerPage);
        
        if (totalPages <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        
        prevBtn.disabled = state.currentPage === 1;
        nextBtn.disabled = state.currentPage === totalPages;
    }

    // Add navigation event handlers
    document.getElementById('sidePrevBtn').addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayCallback(state.filteredProducts);
        }
    });

    document.getElementById('sideNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredProducts.length / itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            displayCallback(state.filteredProducts);
        }
    });

    return {
        updateNavigation: updateNavigationButtons,
        getItemsPerPage: () => 5
    };
}
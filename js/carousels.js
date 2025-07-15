import { fetchFilteredCarousels } from './dbService.js';
import { getItemCardHtml } from './common.js';

const itemList = document.getElementById('productList');

let items;
let navigation;
const state = {
    currentPage: 1,
    filteredItems: [],
    itemsPerPage: 50 
};

document.addEventListener('DOMContentLoaded', async () => {
    navigation = initializeNavigation(state, displayItems, state.itemsPerPage);
    try {
        items = await fetchFilteredCarousels(true);
        
        displayItems(items);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
});

function displayItems(filteredItems = items) {//Append items according to filters by reloading page
    state.filteredItems = filteredItems;
    state.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    
    // Calculate total pages and adjust current page if needed
    const totalPages = Math.ceil(filteredItems.length / state.itemsPerPage);
    if (state.currentPage > totalPages) {
        state.currentPage = Math.max(1, totalPages);
    }
    
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = Math.min(startIndex + state.itemsPerPage, filteredItems.length);
    
    itemList.innerHTML = '';

    if (filteredItems.length > 0) {
        filteredItems.slice(startIndex, endIndex).forEach(carousel => {
            const itemCard = document.createElement('div');
            itemCard.className = 'product-card';
            itemCard.style.cursor = 'pointer';

            if (carousel.DEVICE) {
                itemCard.classList.add('has-device');
            }
            itemCard.addEventListener('click', () => {
                window.location.href = `carousel.html?get=${carousel.id}`;
            });

            itemCard.addEventListener('click', () => {

                const params = new URLSearchParams({
                    id: carousel.ID,
                });

                window.location.href = `carousel.html?${params.toString()}`;
            });
            
            itemCard.innerHTML = getItemCardHtml("carousel",carousel);
            itemList.appendChild(itemCard);
        });
    } else {
        itemList.innerHTML = '<div class="no-results">No items found</div>';
    }

    navigation.updateNavigation();
}

async function filterItems() {//Display items accodrding to filters
    try {
        const searchCode = document.getElementById('codeFilter').value.toLowerCase();
        const searchName = document.getElementById('nameFilter').value.toLowerCase();
        const selectedActive = document.getElementById('activeFilter').value;

        state.currentPage = 1; 
        
        const serverFilteredCarousels = await fetchFilteredCarousels(selectedActive);
        console.log('Server filtered carousels:', serverFilteredCarousels);

        const finalFiltered = serverFilteredCarousels.filter(carousel => {
            const matchesCode = searchCode === '' || 
                                carousel.CODE.toString().toLowerCase().includes(searchCode);
            const matchesName = searchName === '' || 
                                carousel.NAME.toLowerCase().includes(searchName);
            
            return matchesCode && matchesName;
        });

        displayItems(finalFiltered);
    } catch (error) {
        console.error('Error applying filters:', error);
    }
}

document.getElementById('itemsPerPage').addEventListener('change', () => {// Reset to first page when changing itemsPerPage
    state.currentPage = 1; 
    filterItems();
});

document.getElementById('createNewButton').addEventListener('click', () => {//Go to create new carousel page
    window.location.href = `carousel.html?id=new`;
});

document.getElementById('codeFilter').addEventListener('input', filterItems);
document.getElementById('nameFilter').addEventListener('input', filterItems);  
document.getElementById('activeFilter').addEventListener('change', filterItems);
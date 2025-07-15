import { fetchFilteredProducts, fetchMakers, fetchTypes } from './dbService.js';
import { getItemCardHtml } from './common.js';

const itemList = document.getElementById('productList');

let items;
let types;
let makers;
let navigation;
const state = {
    currentPage: 1,
    filteredItems: [],
    itemsPerPage: 50 
};

document.addEventListener('DOMContentLoaded', async () => {
    navigation = initializeNavigation(state, displayItems, state.itemsPerPage);
    try {
        items = await fetchFilteredProducts('All', 'All');
        types = await fetchTypes();
        makers = await fetchMakers();
        
        populateFilters();
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
        const selectedType = document.getElementById('groupFilter').value;
        const selectedMaker = document.getElementById('makerFilter').value;
        filteredItems.slice(startIndex, endIndex).forEach(product => {
            const itemCard = document.createElement('div');
            itemCard.className = 'product-card';
            itemCard.style.cursor = 'pointer';
            itemCard.addEventListener('click', () => {

                const params = new URLSearchParams({
                    id: product.ID,
                    type: selectedType,
                    maker: selectedMaker,
                });

                window.location.href = `product.html?${params.toString()}`;
            });
            
            itemCard.innerHTML = getItemCardHtml("product",product);
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
        const selectedType = document.getElementById('groupFilter').value;
        const selectedMaker = document.getElementById('makerFilter').value;

        state.currentPage = 1; 
        
        // First get filtered items from server based on type and maker
        const serverFilteredProducts = await fetchFilteredProducts(selectedType, selectedMaker);
        
        // Then apply client-side filtering for code and name
        const finalFiltered = serverFilteredProducts.filter(product => {
            const matchesCode = searchCode === '' || 
                                product.CODE.toString().toLowerCase().includes(searchCode);
            const matchesName = searchName === '' || 
                                product.NAME.toLowerCase().includes(searchName);
            
            return matchesCode && matchesName;
        });

        displayItems(finalFiltered);
    } catch (error) {
        console.error('Error applying filters:', error);
    }
}

function populateFilters() {//Insert groups into the filters
    const groupFilter = document.getElementById('groupFilter');
    const makerFilter = document.getElementById('makerFilter');

    groupFilter.innerHTML = '<option value="All">All</option>';
    makerFilter.innerHTML = '<option value="All">All</option>';

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.NAME;
        option.textContent = `${type.CODE} - ${type.NAME}`;
        groupFilter.appendChild(option);
    });

    makers.forEach(maker => {
        const option = document.createElement('option');
        option.value = maker.NAME;
        option.textContent = `${maker.CODE} - ${maker.NAME}`;
        makerFilter.appendChild(option);
    });
}    

document.getElementById('itemsPerPage').addEventListener('change', () => {// Reset to first page when changing itemsPerPage
    state.currentPage = 1; 
    filterItems();
});

document.getElementById('createNewButton').addEventListener('click', () => {//Go to create new product page
    window.location.href = `product.html?id=new`;
});

document.getElementById('groupFilter').addEventListener('change', filterItems);//When value changes -> filter items
document.getElementById('makerFilter').addEventListener('change', filterItems);
document.getElementById('codeFilter').addEventListener('input', filterItems);
document.getElementById('nameFilter').addEventListener('input', filterItems);  
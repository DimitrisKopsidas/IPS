export function fillDropdown(array, selectid) {
    // Clear existing options first
    selectid.innerHTML = '';
    
    // Handle groups array with objects
    if (array && array.length > 0 && array[0].hasOwnProperty('name')) {
        array.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = `${item.code} - ${item.name}`;
            selectid.appendChild(option);
        });
    } else {
        // Fallback for simple arrays (like makers)
        array.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectid.appendChild(option);
        });
    }
}

export function initiateHotkeys(onDirection){
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'ArrowRight') {
            onDirection('next');
        }
        if (event.ctrlKey && event.key === 'ArrowLeft') {
            onDirection('prev');
        }
    });
}


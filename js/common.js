export function fillDropdown(array,selectid){// From products
    array.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        selectid.appendChild(option);
    });
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


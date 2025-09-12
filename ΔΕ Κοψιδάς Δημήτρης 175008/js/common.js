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

export function getItemCardHtml(choice, item, date, date2) {
    if (choice === "product") {
        return `<div class="product-layout">
                    <div class="product-image">
                        <img src="media/${item.ID}.png" alt="${item.NAME}" onerror="this.src='media/404.png'">
                    </div>
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${item.CODE}</span>
                            <h2 class="product-name">${item.NAME}</h2>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-group">Type: ${item.TYPECODE} - ${item.TYPENAME}</span>
                                <span class="product-maker">Maker: ${item.MAKERCODE} - ${item.MAKERNAME}</span>
                            </div>
                            <div class="info-row">
                                <span class="product-price">Price: $${item.PRICE}</span>
                                <span class="product-discount">Discount: ${item.DISCOUNT*100}%</span>
                                <span class="product-final-price">Final: $${item.FINALPRICE}</span>
                            </div>
                            <p class="product-note">${item.NOTES}</p>
                        </div>
                    </div>
                </div>`;
    } else if (choice === "carousel") {
        return `<div class="product-layout">
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${item.CODE}</span>
                            <h2 class="product-name">${item.NAME}</h2>
                            <span class="product-device">
                                ${item.DEVICE ? '🖥️' : '❌'} Device: <strong>${item.DEVICENAME || 'Not Assigned'}</strong>
                            </span>
                        </div>
                        <!--<div class="product-info">
                            <div class="info-row">
                                
                            </div>
                            <div class="carousel-stats">
                                <p class="product-note">${item.NOTES}</p>
                            </div>-->
                        </div>
                    </div>
                </div>`;
    } else if (choice === "group") {
        return `<input type="number" 
                       class="groups-input code" 
                       value="${item.CODE}"
                       data-original-code="${item.CODE}">
                <input type="text" 
                       class="groups-input name" 
                       value="${item.NAME}"
                       data-original-name="${item.NAME}">
                <button class="groups-btn-delete-item" title="Delete group">🗑️</button>`;
    } else if (choice === "promoProduct") {
        return `<p><strong>${item.DISCOUNT * 100}%</strong> discount for <strong>${item.PRODUCT}</strong></p>
    <p>Created on ${date2}</p>
    <p>Valid until ${date}</p>
    <div class="promo-source-info">
        <p><strong>Carousel:</strong> ${item.CAROUSELNAME || 'Unknown'}</p>
        <p><strong>Device:</strong> ${item.DEVICENAME || 'Unknown'}</p>
        <p><strong>Chance:</strong> ${item.CHANCE * 100 || 'Unknown'}%</p>
    </div>`;
    } else if (choice === "promoTypeMaker") {
        return `<p><strong>${item.DISCOUNT * 100}% Discount</strong></p>
    <p>For type: ${item.TYPE} and maker: ${item.MAKER}</p>
    <p>Valid until ${date}</p>
    <div class="promo-source-info">
        <p><strong>Carousel:</strong> ${item.CAROUSELNAME || 'Unknown'}</p>
        <p><strong>Device:</strong> ${item.DEVICENAME || 'Unknown'}</p>
        <p><strong>Chance:</strong> ${item.CHANCE * 100 || 'Unknown'}%</p>
    </div>`;
    } else if (choice === "promoType") {
        return `<p><strong>${item.DISCOUNT * 100}% Discount</strong></p>
    <p>For type: ${item.TYPE}</p>
    <p>Valid until ${date}</p>
    <div class="promo-source-info">
        <p><strong>Carousel:</strong> ${item.CAROUSELNAME || 'Unknown'}</p>
        <p><strong>Device:</strong> ${item.DEVICENAME || 'Unknown'}</p>
        <p><strong>Chance:</strong> ${item.CHANCE * 100 || 'Unknown'}%</p>
    </div>`;
    } else if (choice === "promoMaker") {
        return `<p><strong>${item.DISCOUNT * 100}% Discount</strong></p>
    <p>For maker: ${item.MAKER}</p>
    <p>Valid until ${date}</p>
    <div class="promo-source-info">
        <p><strong>Carousel:</strong> ${item.CAROUSELNAME || 'Unknown'}</p>
        <p><strong>Device:</strong> ${item.DEVICENAME || 'Unknown'}</p>
        <p><strong>Chance:</strong> ${item.CHANCE * 100 || 'Unknown'}%</p>
    </div>`;
    } else if (choice === "promo") {
        return `<div class="product-layout">
                    <div class="product-details">
                        <div class="product-header">
                            <span class="product-code">${item.CODE}</span>
                            <h2 class="product-name">${item.PRODUCTNAME}</h2>
                            <span class="product-discount"><b>Discount: ${(item.DISCOUNT * 100).toFixed(0)}%</b></span>
                        </div>
                        <div class="product-info">
                            <div class="info-row">
                                <span class="product-group">Type: ${item.TYPENAME}</span>
                                <span class="product-maker">Maker: ${item.MAKERNAME}</span>
                            </div><!--
                            <div class="info-row">
                                
                                <span>Active in carousels: ${item.carouselCount}</span>
                                <span>Promos issued: ${item.issuedCount}</span>
                            </div>-->
                        </div>
                    </div>
                </div>`;
    }
}



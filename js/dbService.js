// #region ACTIVECAROUSEL
async function fetchCarouselProducts(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/GetCarouselProductsConnect/${connectkey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Carousel products:', {
            connectkey: connectkey,
            productsCount: data.length,
            products: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching carousel images:', error);
        return [];
    }
}

async function fetchCarouselSettings(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCarouselSettingsConnect/${connectkey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Carousel settings:', {
            connectkey: connectkey,
            settings: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching carousel settings:', error);
        return [];
    }
}

async function updateDeviceLastPing(connectKey) {
    try {
        console.log('Updating last ping for device:', connectKey);
        const response = await fetch(`http://localhost:3000/api/updateDeviceLastPing/${connectKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error updating device last ping:', error);
        return { success: false, error: error.message };
    }
}
// #endregion ACTIVECAROUSEL

// #region MINIGAME
async function fetchMinigameSettings(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/GetMinigameSettingsConnect/${connectkey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Minigame settings:', {
            connectkey: connectkey,
            settings: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching minigame settings:', error);
        return [];
    }
}

async function fetchMinigamePromos(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/GetMinigamePromosConnect/${connectkey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Minigame promos:', {
            connectkey: connectkey,
            promos: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching minigame promos:', error);
        return [];
    }
}

async function insertIssuedPromo(connectKey, redeemCode, promoId) {
    try {
        console.log('Inserting issued promo:', {
            connectKey,
            redeemCode,
            promoId
        });

        const response = await fetch(
            `http://localhost:3000/api/insertIssuedPromo/${connectKey}/${redeemCode}/${promoId}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Promo insertion result:', data);
        return data;
    } catch (error) {
        console.error('Error inserting issued promo:', error);
        return { success: false, error: error.message };
    }
}
// #endregion MINIGAME

// #region CHECK
async function updateRedeemed(redeemCode) {
    try {
        console.log('Updating redeem code:', redeemCode);
        const response = await fetch(`http://localhost:3000/api/updateRedeemed/${redeemCode}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Redeem code update result:', data);
        return data;
    } catch (error) {
        console.error('Error updating redeem code:', error);
        return { success: false, error: error.message };
    }
}

async function getPromoStatus(codeToCheck) {
    try {
        console.log('Checking promo status for code:', codeToCheck);
        const response = await fetch(`http://localhost:3000/api/getPromoStatus/${codeToCheck}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Promo status result:', data);
        return data.status;
    } catch (error) {
        console.error('Error checking promo status:', error);
        return -1; // Error state
    }
}

async function getPromoData(code) {
    try {
        console.log('Fetching promo data for code:', code);
        const response = await fetch(`http://localhost:3000/api/getPromoData/${code}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Promo data result:', data);
        return data;
    } catch (error) {
        console.error('Error fetching promo data:', error);
        return null;
    }
}
// #endregion CHECK

// #region PRODUCTS
async function fetchFilteredProducts(type = 'All', maker = 'All') {
    try {
        // Encode parameters to handle special characters
        const encodedType = encodeURIComponent(type);
        const encodedMaker = encodeURIComponent(maker);
        
        const response = await fetch(`http://localhost:3000/api/getFilteredProducts/${encodedType}/${encodedMaker}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Filtered products:', {
            type,
            maker,
            count: data.length,
            products: data
        });
        
        return data;
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        return [];
    }
}

async function fetchFilteredPromos(type = 'All', maker = 'All') {
    try {
        // Encode parameters to handle special characters
        const encodedType = encodeURIComponent(type);
        const encodedMaker = encodeURIComponent(maker);
        
        const response = await fetch(`http://localhost:3000/api/getFilteredPromos/${encodedType}/${encodedMaker}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Filtered promos:', {
            type,
            maker,
            count: data.length,
            promos: data
        });
        
        return data;
    } catch (error) {
        console.error('Error fetching filtered promos:', error);
        return [];
    }
}

async function fetchTypes() {
    try {
        const response = await fetch('http://localhost:3000/api/getTypes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Types data:', {
            count: data.length,
            types: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching types:', error);
        return [];
    }
}

async function fetchMakers() {
    try {
        const response = await fetch('http://localhost:3000/api/getMakers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Makers data:', {
            count: data.length,
            makers: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching makers:', error);
        return [];
    }
}
// #endregion PRODUCTS

// #region PRODUCT
async function fetchNextProductId() {
    try {
        const response = await fetch('http://localhost:3000/api/getNextProductId');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Next product ID:', data);
        return data.NEXTID;
    } catch (error) {
        console.error('Error fetching next product ID:', error);
        return null;
    }
}

async function fetchNextCarouselId() {
    try {
        const response = await fetch('http://localhost:3000/api/getNextCarouselId');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Next carousel ID:', data);
        return data.NEXTID;
    } catch (error) {
        console.error('Error fetching next carousel ID:', error);
        return null;
    }
}

async function fetchNextPromoId() {
    try {
        const response = await fetch('http://localhost:3000/api/getNextPromoId');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Next promo ID:', data);
        return data.NEXTID;
    } catch (error) {
        console.error('Error fetching next promo ID:', error);
        return null;
    }
}

async function deleteProduct(productId) {
    try {
        console.log('Deleting product:', productId);
        const response = await fetch(`http://localhost:3000/api/deleteProduct/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Product deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
}

async function deleteMaker(makerId) {
    try {
        console.log('Deleting maker:', makerId);
        const response = await fetch(`http://localhost:3000/api/deleteMaker/${makerId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Maker deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting maker:', error);
        return { success: false, error: error.message };
    }
}

async function deleteType(typeId) {
    try {
        console.log('Deleting type:', typeId);
        const response = await fetch(`http://localhost:3000/api/deleteType/${typeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Type deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting type:', error);
        return { success: false, error: error.message };
    }
}

async function deleteImage(imageId) {
    try {
        console.log('Deleting image:', imageId);
        const response = await fetch(`http://localhost:3000/api/deleteImage/${imageId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Image deletion result:', result);
        return result;
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: error.message };
    }
}

async function updateProduct(productData) {
    try {
        console.log('Updating product:', productData);
        const response = await fetch(`http://localhost:3000/api/updateProduct/${productData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: productData.code,
                name: productData.name,
                type: productData.type,
                maker: productData.maker,
                price: productData.price,
                discount: productData.discount,
                finalPrice: productData.finalPrice,
                notes: productData.notes
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Product update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}

async function insertProduct(productData) {
    try {
        console.log('Inserting product:', productData);
        const response = await fetch('http://localhost:3000/api/insertProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: productData.code,
                name: productData.name,
                type: productData.type,
                maker: productData.maker,
                price: productData.price,
                discount: productData.discount,
                finalPrice: productData.finalPrice,
                notes: productData.notes
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Product insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting product:', error);
        return { success: false, error: error.message };
    }
}

async function insertMaker(makerData) {
    try {
        console.log('Inserting maker:', makerData);
        const response = await fetch('http://localhost:3000/api/insertMaker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: makerData.code,
                name: makerData.name
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Maker insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting maker:', error);
        return { success: false, error: error.message };
    }
}

async function insertType(typeData) {
    try {
        console.log('Inserting type:', typeData);
        const response = await fetch('http://localhost:3000/api/insertType', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: typeData.code,
                name: typeData.name
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Type insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting type:', error);
        return { success: false, error: error.message };
    }
}

async function updateMaker(makerData) {
    try {
        console.log('Updating maker:', makerData);
        const response = await fetch(`http://localhost:3000/api/updateMaker/${makerData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: makerData.code,
                name: makerData.name
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Maker update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating maker:', error);
        return { success: false, error: error.message };
    }
}

async function updateType(typeData) {
    try {
        console.log('Updating type:', typeData);
        const response = await fetch(`http://localhost:3000/api/updateType/${typeData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: typeData.code,
                name: typeData.name
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Type update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating type:', error);
        return { success: false, error: error.message };
    }
}
// #endregion PRODUCT

// #region CAROUSEL
async function fetchCarouselMinigame(carousel) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCarouselMinigame/${carousel}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Carousel minigame data:', {
            carousel,
            minigameData: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching carousel minigame:', error);
        return [];
    }
}

async function fetchCarouselProductsList(carousel) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCarouselProducts/${carousel}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Carousel products list:', {
            carousel,
            productsCount: data.length,
            products: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching carousel products list:', error);
        return [];
    }
}

async function fetchFilteredCarousels(filterParam) {
    try {
        const response = await fetch(`http://localhost:3000/api/GetFilteredCarousels/${filterParam}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Filtered carousel data:', {
            filter: filterParam,
            carouselCount: data.length,
            carousels: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching filtered carousel:', error);
        return [];
    }
}

async function fetchMinigamePromosList(carousel) {
    try {
        const response = await fetch(`http://localhost:3000/api/getMinigamePromos/${carousel}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Minigame promos list:', {
            carousel,
            promosCount: data.length,
            promos: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching minigame promos list:', error);
        return [];
    }
}

async function getAllDevices() {
    try {
        const response = await fetch('http://localhost:3000/api/getAllDevices');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('All devices data:', {
            count: data.length,
            devices: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching all devices:', error);
        return [];
    }
}

async function updateProductLines(productLinesData) {
    try {
        console.log('Updating product lines:', productLinesData);
        const response = await fetch(`http://localhost:3000/api/updateProductLines/${productLinesData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                carousel: productLinesData.carousel,
                product: productLinesData.product,
                queue: productLinesData.queue
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Product lines update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating product lines:', error);
        return { success: false, error: error.message };
    }
}

async function deleteProductLines(productLinesData) {
    try {
        console.log('Deleting product lines:', productLinesData);
        const response = await fetch(`http://localhost:3000/api/deleteProductLines/${productLinesData.carousel}/${productLinesData.product}/${productLinesData.queue}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Product lines deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting product lines:', error);
        return { success: false, error: error.message };
    }
}

async function insertProductLines(productLinesData) {
    try {
        console.log('Inserting product lines:', productLinesData);
        const response = await fetch('http://localhost:3000/api/insertProductLines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                carousel: productLinesData.carousel,
                product: productLinesData.product,
                queue: productLinesData.queue
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Product lines insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting product lines:', error);
        return { success: false, error: error.message };
    }
}

async function getProductLinesByCarousel(carouselId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getProductLinesByCarousel/${carouselId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Product lines by carousel:', {
            carouselId,
            count: data.length,
            productLines: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching product lines by carousel:', error);
        return [];
    }
}

async function getPromoLinesByCarousel(carouselId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getPromoLinesByCarousel/${carouselId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Promo lines by carousel:', {
            carouselId,
            count: data.length,
            promoLines: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching promo lines by carousel:', error);
        return [];
    }
}

async function DeleteCarouselAndMinigame(carouselId) {
    try {
        console.log('Deleting carousel and minigame:', carouselId);
        const response = await fetch(`http://localhost:3000/api/carousel/${carouselId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Carousel and minigame deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting carousel and minigame:', error);
        return { success: false, error: error.message };
    }
}

async function UpdateCarouselAndMinigame(carouselData) {
    try {
        console.log('Updating carousel and minigame:', carouselData);
        const response = await fetch(`http://localhost:3000/api/carousel/${carouselData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: carouselData.code,
                name: carouselData.name,
                device: carouselData.device,
                autoplayWait: carouselData.autoplayWait,
                speed: carouselData.speed,
                gameCount: carouselData.gameCount,
                state: carouselData.state,
                revolutions: carouselData.revolutions,
                spinDuration: carouselData.spinDuration,
                onStopTime: carouselData.onStopTime,
                inactivityTime: carouselData.inactivityTime
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Carousel and minigame update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating carousel and minigame:', error);
        return { success: false, error: error.message };
    }
}

async function InsertCarouselAndMinigame(carouselData) {
    try {
        console.log('Inserting carousel and minigame:', carouselData);
        const response = await fetch('http://localhost:3000/api/carousel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: carouselData.code,
                name: carouselData.name,
                device: carouselData.device,
                autoplayWait: carouselData.autoplayWait,
                speed: carouselData.speed,
                gameCount: carouselData.gameCount,
                state: carouselData.state || 1,
                revolutions: carouselData.revolutions,
                spinDuration: carouselData.spinDuration,
                onStopTime: carouselData.onStopTime,
                inactivityTime: carouselData.inactivityTime
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Carousel and minigame insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting carousel and minigame:', error);
        return { success: false, error: error.message };
    }
}
// #endregion CAROUSEL

// #region PROMOS
async function deletePromo(promoId) {
    try {
        console.log('Deleting promo:', promoId);
        const response = await fetch(`http://localhost:3000/api/deletePromo/${promoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Promo deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting promo:', error);
        return { success: false, error: error.message };
    }
}

async function insertPromo(promoData) {
    try {
        console.log('Inserting promo:', promoData);
        const response = await fetch('http://localhost:3000/api/insertPromo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: promoData.code,
                product: promoData.product,
                type: promoData.type,
                maker: promoData.maker,
                notes: promoData.notes,
                discount: promoData.discount,
                daysToLive: promoData.daysToLive
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Promo insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting promo:', error);
        return { success: false, error: error.message };
    }
}

async function updatePromo(promoData) {
    try {
        console.log('Updating promo:', promoData);
        const response = await fetch(`http://localhost:3000/api/updatePromo/${promoData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: promoData.code,
                product: promoData.product,
                type: promoData.type,
                maker: promoData.maker,
                notes: promoData.notes,
                discount: promoData.discount,
                daysToLive: promoData.daysToLive
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Promo update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating promo:', error);
        return { success: false, error: error.message };
    }
}

async function updatePromoLines(promoLinesData) {
    try {
        console.log('Updating promo lines:', promoLinesData);
        const response = await fetch(`http://localhost:3000/api/updatePromoLines/${promoLinesData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                promo: promoLinesData.promo,
                minigame: promoLinesData.minigame,
                chance: promoLinesData.chance
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Promo lines update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating promo lines:', error);
        return { success: false, error: error.message };
    }
}

async function deletePromoLines(promoLinesId) {
    try {
        console.log('Deleting promo lines:', promoLinesId);
        const response = await fetch(`http://localhost:3000/api/deletePromoLines/${promoLinesId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Promo lines deletion result:', result);
        return { success: true };
    } catch (error) {
        console.error('Error deleting promo lines:', error);
        return { success: false, error: error.message };
    }
}

async function insertPromoLines(promoLinesData) {
    try {
        console.log('Inserting promo lines:', promoLinesData);
        const response = await fetch('http://localhost:3000/api/insertPromoLines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                promo: promoLinesData.promo,
                minigame: promoLinesData.minigame,
                chance: promoLinesData.chance
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Promo lines insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting promo lines:', error);
        return { success: false, error: error.message };
    }
}

async function getIssuedCount(promoId) {
    try {
        console.log('Fetching issued count for promo:', promoId);
        const response = await fetch(`http://localhost:3000/api/getIssuedCount/${promoId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Issued count result:', data);
        return data.TOTALISSUED || 0;
    } catch (error) {
        console.error('Error fetching issued count:', error);
        return 0;
    }
}

async function getAssociatedCarouselForPromo(promoId) {
    try {
        console.log('Fetching associated carousel for promo:', promoId);
        const response = await fetch(`http://localhost:3000/api/getAssociatedCarouselForPromo/${promoId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Associated carousel result:', {
            promoId,
            carousels: data
        });
        return data;
    } catch (error) {
        console.error('Error fetching associated carousel for promo:', error);
        return [];
    }
}
// #endregion PROMOS

// #region ADMIN
async function fetchIndexPromoInfo() {
    try {
        const response = await fetch('http://localhost:3000/api/getIndexPromoInfo');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Index promo info:', {
            count: data.length,
            promos: data
        });
        
        return data;
    } catch (error) {
        console.error('Error fetching index promo info:', error);
        return [];
    }
}

async function fetchIndexDeviceInfo(device = null) {
    try {
        const deviceParam = device || 'null';
        const response = await fetch(`http://localhost:3000/api/getIndexDeviceInfo/${deviceParam}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Index device info:', {
            deviceFilter: device || 'ALL',
            count: data.length,
            devices: data
        });
        
        return data;
    } catch (error) {
        console.error('Error fetching index device info:', error);
        return [];
    }
}
// #endregion ADMIN

export { 
    fetchCarouselProducts,
    fetchCarouselSettings,
    updateDeviceLastPing,
    fetchMinigameSettings,
    fetchMinigamePromos,
    insertIssuedPromo,
    updateRedeemed,
    getPromoStatus,
    getPromoData,
    fetchFilteredProducts,
    fetchTypes,
    fetchMakers,
    fetchNextProductId,
    fetchNextCarouselId,
    fetchNextPromoId,
    deleteProduct,
    deleteMaker,
    deleteType,
    deleteImage,
    updateProduct,
    insertProduct,
    insertMaker,
    insertType,
    updateMaker,
    updateType,
    fetchCarouselMinigame,
    fetchCarouselProductsList,
    fetchFilteredCarousels,
    fetchMinigamePromosList,
    fetchFilteredPromos,
    fetchIndexPromoInfo,
    fetchIndexDeviceInfo,
    deletePromo,
    insertPromo,
    updatePromo,
    updatePromoLines,
    deletePromoLines,
    insertPromoLines,
    getIssuedCount,
    getAssociatedCarouselForPromo,
    getAllDevices,
    updateProductLines,
    deleteProductLines,
    insertProductLines,
    getProductLinesByCarousel,
    getPromoLinesByCarousel,
    DeleteCarouselAndMinigame,
    UpdateCarouselAndMinigame,
    InsertCarouselAndMinigame
};
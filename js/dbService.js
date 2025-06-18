async function fetchTypes() {
    try {
        const response = await fetch('http://localhost:3000/api/getTypes');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching types:', error);
        return [];
    }
}

async function fetchMakers() {
    try {
        const response = await fetch('http://localhost:3000/api/getMakers');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching makers:', error);
        return [];
    }
}

async function fetchAllProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/getAllProducts');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function fetchCarouselProducts(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/GetCarouselProducts/${connectkey}`);
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
        const response = await fetch(`http://localhost:3000/api/getCarouselSettings/${connectkey}`);
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

async function fetchMinigameSettings(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/getMinigameSettings/${connectkey}`);
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
        const response = await fetch(`http://localhost:3000/api/getMinigamePromos/${connectkey}`);
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

export { 
    fetchTypes,
    fetchMakers, 
    fetchAllProducts,
    fetchCarouselProducts,
    fetchCarouselSettings,
    updateDeviceLastPing,
    fetchMinigameSettings,
    fetchMinigamePromos,
    insertIssuedPromo
};
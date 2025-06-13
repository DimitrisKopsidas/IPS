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

async function fetchCarouselImages(connectkey) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCarouselImages/${connectkey}`);
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

export { 
    fetchTypes,
    fetchMakers, 
    fetchAllProducts,
    fetchCarouselImages,
    fetchCarouselSettings,
    updateDeviceLastPing
};
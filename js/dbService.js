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
    fetchMinigamePromosList
};
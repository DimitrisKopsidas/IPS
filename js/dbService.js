//CAROUSEL
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
//MINIGAME
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
//CHECK
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
    insertProduct
};
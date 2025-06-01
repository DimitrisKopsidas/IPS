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
export { fetchTypes };

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
export { fetchMakers };

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/getAllProducts');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}
export { fetchProducts };

async function fetchProductsParts() {
    try {
        const response = await fetch('http://localhost:3000/api/getParts');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products parts:', error);
        return [];
    }
}
export { fetchProductsParts };
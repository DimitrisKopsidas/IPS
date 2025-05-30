async function fetchTypes() {
    try {
        const response = await fetch('http://localhost:3000/api/types');  // Changed to Express server port
        const data = await response.json();
        console.log('Types from database:', data);
        return data;
    } catch (error) {
        console.error('Error fetching types:', error);
        return [];
    }
}

export { fetchTypes };
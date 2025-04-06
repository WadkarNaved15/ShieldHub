 const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1]; // Get the payload part
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Fix base64 for decoding

        // Add padding if the base64 string is not a multiple of 4
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }
        const decoded = JSON.parse(window.atob(base64)); // Decode the Base64 string
        return decoded;
    } catch (error) {
        console.error('Invalid token format:', error);
        return null;
    }
};

module.exports = { decodeToken };

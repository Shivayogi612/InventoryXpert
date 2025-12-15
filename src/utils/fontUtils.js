// Utility to load font files and convert them to base64 for use with jsPDF

/**
 * Converts an ArrayBuffer to a base64 string
 * @param {ArrayBuffer} buffer 
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Loads a font file and returns it as a base64 string
 * @param {string} fontPath 
 * @returns {Promise<string>}
 */
export async function loadFontAsBase64(fontPath) {
    try {
        const response = await fetch(fontPath);
        if (!response.ok) {
            throw new Error(`Failed to load font: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return arrayBufferToBase64(arrayBuffer);
    } catch (error) {
        console.error('Error loading font:', error);
        throw error;
    }
}
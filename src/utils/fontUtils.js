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
        // Try multiple approaches for font loading
        const response = await fetch(fontPath);
        if (!response.ok) {
            // Try alternative paths for different environments
            const pathsToTry = [
                fontPath,
                fontPath.replace('/src/', '/'),
                `/src${fontPath}`,
                fontPath.startsWith('/') ? fontPath.substring(1) : `/${fontPath}`
            ];
            
            for (const path of pathsToTry) {
                try {
                    const altResponse = await fetch(path);
                    if (altResponse.ok) {
                        const arrayBuffer = await altResponse.arrayBuffer();
                        return arrayBufferToBase64(arrayBuffer);
                    }
                } catch (e) {
                    // Continue to next path
                }
            }
            
            throw new Error(`Failed to load font from any of the attempted paths: ${pathsToTry.join(', ')}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return arrayBufferToBase64(arrayBuffer);
    } catch (error) {
        console.error('Error loading font:', error);
        // As a last resort, we'll use the helvetica font with a manual glyph for Rupee symbol
        // This is not ideal but will prevent the app from crashing
        throw error;
    }
}
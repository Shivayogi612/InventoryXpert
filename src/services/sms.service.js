export const smsService = {
    /**
     * Send SMS notification using the proxy endpoint
     * @param {string} message - The message to send
     * @returns {Promise<Object>} - The result of the SMS sending operation
     */
    async sendSMS(message) {
        try {
            const phoneNumber = import.meta.env.VITE_OWNER_PHONE_NUMBER;
            if (!phoneNumber) {
                console.warn('SMS skipped: VITE_OWNER_PHONE_NUMBER not set');
                return { success: false, message: 'Phone number not configured' };
            }

            console.log(`Payload being sent:`, { message, phoneNumber });
            console.log('Using endpoint: /api/send-sms');

            const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    phoneNumber: phoneNumber
                })
            });

            console.log(`Response status: ${response.status}`);
            const result = await response.json();
            console.log(`Response body:`, result);

            if (!result.success) {
                throw new Error(`SMS API error: ${result.message}`);
            }

            console.log('SMS sent successfully:', result);

            return {
                success: true,
                messageId: result.messageId,
                timestamp: new Date().toISOString(),
                recipient: phoneNumber
            };
        } catch (err) {
            console.error('SMS notification error:', err);
            throw err;
        }
    },

    /**
     * Format a stock alert message for SMS
     * @param {Object} alert - The alert object
     * @param {Object} product - Optional product details
     * @returns {string} - Formatted message
     */
    formatStockAlert(alert, product = null) {
        let productInfo = '';
        if (product) {
            productInfo = ` Product: ${product.name} (SKU: ${product.sku}).`;
        } else if (alert.product_name) {
            productInfo = ` Product: ${alert.product_name}.`;
        }

        return `STOCK ALERT: ${alert.title}.${productInfo} Please reorder soon.`;
    }
};

export default smsService;

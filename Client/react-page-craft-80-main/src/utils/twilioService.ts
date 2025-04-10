// This is a placeholder for the actual SMS sending implementation
// In a real offline UPI app, you would use a native SMS API or service

const TWILIO_PHONE_NUMBER = '+19152683408';

export const sendTransactionSMS = async (
  encryptedData: string
): Promise<void> => {
  try {
    // Use the encrypted data directly as the message
    const message = encryptedData;
    
    // Create the SMS URL with the phone number and message
    const smsUrl = `sms:${TWILIO_PHONE_NUMBER}?body=${encodeURIComponent(message)}`;
    
    // Log what would be sent (for debugging)
    console.log(`Opening SMS app with URL: ${smsUrl}`);
    
    // Open the SMS app with the pre-filled message
    window.location.href = smsUrl;
    
    // Return a resolved promise since we can't wait for the user to send the SMS
    return Promise.resolve();
  } catch (error) {
    console.error('Error preparing SMS:', error);
    throw error;
  }
}; 
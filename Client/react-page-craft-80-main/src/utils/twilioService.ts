import { createSecureSmsPayload } from './encryption';

const TWILIO_PHONE_NUMBER = '+19152683408';

export const sendTransactionSMS = async (
  payload: string,
  alreadyEncrypted: boolean = false
): Promise<void> => {
  try {
    // If not already encrypted, create secure SMS payload
    const message = alreadyEncrypted ? payload : createSecureSmsPayload(payload);
    
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
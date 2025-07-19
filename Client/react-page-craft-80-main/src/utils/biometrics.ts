export const isBiometricSupported = () => {
  return window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
    window.navigator.credentials;
};

export const createPasskey = async (upiId: string): Promise<boolean> => {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Offline UPI',
        id: window.location.hostname
      },
      user: {
        id: Uint8Array.from(upiId, c => c.charCodeAt(0)),
        name: upiId,
        displayName: upiId
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential) {
      // Store credential ID in localStorage
      localStorage.setItem(`passkey_${upiId}`, 'true');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error creating passkey:', error);
    return false;
  }
};

export const authenticateWithBiometric = async (upiId: string): Promise<boolean> => {
  try {
    // Check if passkey exists
    const hasPasskey = localStorage.getItem(`passkey_${upiId}`);
    if (!hasPasskey) {
      // Create passkey if it doesn't exist
      const created = await createPasskey(upiId);
      if (!created) {
        throw new Error('Failed to create passkey');
      }
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname,
      userVerification: 'required',
      timeout: 60000
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    return assertion !== null;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    throw error;
  }
};
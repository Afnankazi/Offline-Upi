export const isBiometricSupported = () => {
  return window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
    window.navigator.credentials;
};

export const authenticateWithBiometric = async (upiId: string): Promise<boolean> => {
  try {
    // Create challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [],
      userVerification: 'required',
      timeout: 60000
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    return assertion !== null;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};
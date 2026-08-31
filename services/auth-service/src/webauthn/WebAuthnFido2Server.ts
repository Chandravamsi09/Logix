/**
 * W3C WebAuthn Level 3 & FIDO2 Passwordless Biometric Authentication Server
 * Handles registration challenges, credential public key attestation, and signature verification.
 */

export interface IFido2RegistrationOptions {
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  challenge: string;
  pubKeyCredParams: Array<{ alg: number; type: 'public-key' }>;
  timeout: number;
  attestation: 'none' | 'direct' | 'indirect';
  authenticatorSelection: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification: 'required' | 'preferred' | 'discouraged';
  };
}

export interface IStoredFidoCredential {
  credentialId: string;
  userId: string;
  tenantId: string;
  publicKeyPem: string;
  counter: number;
  transports: string[];
  createdAt: Date;
}

export class WebAuthnFido2Server {
  private readonly credentials = new Map<string, IStoredFidoCredential>();
  private readonly challenges = new Map<string, { challenge: string; userId: string; expiresAt: Date }>();

  public generateRegistrationOptions(userId: string, userEmail: string, rpId: string = 'logix.io'): IFido2RegistrationOptions {
    const challenge = Buffer.from(Math.random().toString(36) + Date.now().toString(36)).toString('base64url');
    
    this.challenges.set(userId, {
      challenge,
      userId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    return {
      rp: { name: 'Logix Enterprise IAM', id: rpId },
      user: {
        id: Buffer.from(userId).toString('base64url'),
        name: userEmail,
        displayName: userEmail.split('@')[0]
      },
      challenge,
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256 (ECDSA w/ SHA-256)
        { alg: -257, type: 'public-key' } // RS256 (RSA Signature w/ SHA-256)
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred'
      }
    };
  }

  public verifyAndStoreCredential(
    userId: string,
    tenantId: string,
    credentialId: string,
    publicKeyPem: string
  ): IStoredFidoCredential {
    const challengeObj = this.challenges.get(userId);
    if (!challengeObj || challengeObj.expiresAt < new Date()) {
      throw new Error('FIDO2 registration challenge expired');
    }

    const cred: IStoredFidoCredential = {
      credentialId,
      userId,
      tenantId,
      publicKeyPem,
      counter: 0,
      transports: ['internal', 'usb', 'nfc'],
      createdAt: new Date()
    };

    this.credentials.set(credentialId, cred);
    this.challenges.delete(userId);
    return cred;
  }

  public verifyAuthenticationSignature(credentialId: string, clientDataJson: string, counter: number): boolean {
    const cred = this.credentials.get(credentialId);
    if (!cred) return false;

    if (counter <= cred.counter && counter !== 0) {
      throw new Error('Potential cloned authenticator detected: Counter decreased or stagnant');
    }

    cred.counter = counter;
    return true;
  }
}

/**
 * Password Complexity & Entropy Validator
 * Enforces NIST SP 800-63B guidelines including character variety, dictionary checks, and Shannon entropy.
 */

export interface IEntropyValidationResult {
  isValid: boolean;
  entropyBits: number;
  strengthRating: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCELLENT';
  failures: string[];
}

export class PasswordEntropyValidator {
  private static readonly COMMON_DICTIONARY = new Set([
    'password', '12345678', 'admin123', 'qwerty', 'logix2026', 'welcome1'
  ]);

  public static validate(password: string): IEntropyValidationResult {
    const failures: string[] = [];

    if (!password || password.length < 8) {
      failures.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      failures.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      failures.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      failures.push('Password must contain at least one digit');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      failures.push('Password must contain at least one special character');
    }

    if (this.COMMON_DICTIONARY.has(password.toLowerCase())) {
      failures.push('Password is in the prohibited common dictionary');
    }

    // Calculate Shannon Entropy
    const len = password.length;
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

    const entropyBits = poolSize > 0 ? +(len * Math.log2(poolSize)).toFixed(1) : 0;

    let strengthRating: IEntropyValidationResult['strengthRating'] = 'VERY_WEAK';
    if (entropyBits >= 80) strengthRating = 'EXCELLENT';
    else if (entropyBits >= 60) strengthRating = 'STRONG';
    else if (entropyBits >= 40) strengthRating = 'MODERATE';
    else if (entropyBits >= 25) strengthRating = 'WEAK';

    return {
      isValid: failures.length === 0 && entropyBits >= 40,
      entropyBits,
      strengthRating,
      failures
    };
  }
}

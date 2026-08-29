import crypto from 'crypto';

export class PasswordHasher {
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 64;
  private static readonly DIGEST = 'sha512';

  static async hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(this.SALT_LENGTH).toString('hex');
      crypto.pbkdf2(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.DIGEST, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  static async verify(password: string, combinedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = combinedHash.split(':');
      if (!salt || !key) return resolve(false);

      crypto.pbkdf2(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.DIGEST, (err, derivedKey) => {
        if (err) return reject(err);
        const keyBuffer = Buffer.from(key, 'hex');
        if (keyBuffer.length !== derivedKey.length) {
          return resolve(false);
        }
        resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
      });
    });
  }
}

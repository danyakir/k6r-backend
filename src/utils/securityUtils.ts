import configuration from 'configuration';
import crypto, { createDecipheriv } from 'crypto';

import { ServiceError } from '@errors';
import logger from '@logger';

class Security {
    private readonly key: Buffer;

    constructor(keyString: string) {
        if (!keyString || keyString.length !== 32) {
            throw new ServiceError('Crypto key should be a 32-byte string');
        }

        this.key = Buffer.from(keyString);
    }

    encrypt(text: string): string {
        try {
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

            const encrypted = Buffer.concat([
                cipher.update(text, 'utf-8'),
                cipher.final(),
            ]);
            const authTag = cipher.getAuthTag();

            return `${iv.toString('hex')}:${encrypted.toString(
                'hex',
            )}:${authTag.toString('hex')}`;
        } catch (error) {
            logger.error('Error encrypting', { error });

            throw new ServiceError('Encryption failed');
        }
    }

    decrypt(cipherText: string): string {
        try {
            const [ivHex, encryptedHex, tagHex] = cipherText.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encrypted = Buffer.from(encryptedHex, 'hex');
            const authTag = Buffer.from(tagHex, 'hex');

            const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
            decipher.setAuthTag(authTag);

            const decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final(),
            ]);
            return decrypted.toString();
        } catch (error) {
            logger.error('Error decrypting', { error });

            throw new ServiceError('Decryption failed');
        }
    }
}

const CRYPTO_KEY = configuration.SECURITY.KEY;
const security = new Security(CRYPTO_KEY);

export default security;

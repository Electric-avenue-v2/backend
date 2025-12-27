import * as crypto from 'crypto';

export const generateOtp = (): number => crypto.randomInt(100000, 999999);
import config from "config";
import * as AES from 'crypto-js/aes';
import * as Utf8 from 'crypto-js/enc-utf8';

export const encrypt = (text: string): Promise<string> => {
    let encrypted: any = AES.encrypt(text, config.get('encryptionKey')).toString();
    return encrypted;
}

export const decrypt = (text: string): Promise<string> => {
    let decrypted: any = AES.decrypt(text, config.get('encryptionKey')).toString(Utf8);
    return decrypted;
}
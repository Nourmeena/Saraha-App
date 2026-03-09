import cryptoJS from 'crypto-js'

export const encryption = async({text='',secretKey=process.env.ENC_SECRET}={}) => {
    return await cryptoJS.AES.encrypt(text,secretKey).toString()
}

export const decryption = async ({ text = "", secretKey =process.env.ENC_SECRET } = {}) => {
    return await cryptoJS.AES.decrypt(text,secretKey).toString(cryptoJS.enc.Utf8)
};

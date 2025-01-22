const crypto = require('crypto');

const encrypt = (data) => {
    if (process.env.ENCRYPTION == 'true') {
        const cipher = crypto.createCipheriv(process.env.CIPHERALGORITHM, process.env.CIPHERSKEY, process.env.CIPHERVIKEY);
        let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
        encryptedData += cipher.final('hex');
        return { data: encryptedData };
    } else {
        return { data }
    }
};

const decrypt = (encryptedData) => {
    if (process.env.DECEYPTION == 'true') {
        const decipher = crypto.createDecipheriv(process.env.CIPHERALGORITHM, process.env.CIPHERSKEY, process.env.CIPHERVIKEY);
        let decryptedData = decipher.update(encryptedData.data, 'hex', 'utf-8');
        decryptedData += decipher.final('utf-8');
        return {data : JSON.parse(decryptedData)};
    } else {
        return encryptedData;
    }
};

module.exports = {
    encrypt,
    decrypt
}
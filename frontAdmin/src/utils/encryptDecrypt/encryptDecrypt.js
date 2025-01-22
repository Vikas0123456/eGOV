import CryptoJS from "crypto-js";

const encrypt = (plainData) => {
    if (process.env.REACT_APP_ENCRYPTION === "true") {
        try {
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify(plainData),
                CryptoJS.enc.Utf8.parse(process.env.REACT_APP_CIPHERSKEY),
                {
                    iv: CryptoJS.enc.Utf8.parse(
                        process.env.REACT_APP_CIPHERVIKEY
                    ),
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7, // Ensure consistent padding
                }
            ).ciphertext.toString(CryptoJS.enc.Hex); // Convert ciphertext to hexadecimal string
            return { data: encryptedData };
        } catch (error) {
            console.error("Encryption error:", error);
            return { error: "Encryption failed" };
        }
    } else {
        return { plainData };
    }
};

const decrypt = (encryptedData) => {
    if (process.env.REACT_APP_DECRYPTION === "true") {
        const bytes = CryptoJS.AES.decrypt(
            {
                ciphertext: CryptoJS.enc.Hex.parse(encryptedData.data),
            },
            CryptoJS.enc.Utf8.parse(process.env.REACT_APP_CIPHERSKEY),
            {
                iv: CryptoJS.enc.Utf8.parse(process.env.REACT_APP_CIPHERVIKEY),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        );
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedData) {
            return JSON.parse(decryptedData);
        } else {
            return null;
        }
    } else {
        return encryptedData;
    }
};

export { encrypt, decrypt };

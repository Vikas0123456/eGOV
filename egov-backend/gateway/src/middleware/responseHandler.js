const { encrypt, decrypt } = require("../middleware/encryptDecrypt");

const reqDecrypt = (req, res, next) => {
    if (req.body && Object.keys(req.body).length != 0) {
        req.body = decrypt(req.body);
    }
    next();
};

const resDecorator = (proxyRes, proxyResData, userReq, userRes) => {
    let data = JSON.parse(proxyResData.toString('utf8'));
    return encrypt(data);
};

const resEncrypt = (proxyRes, req, res) => {
    var body = [];
    proxyRes.on('data', function (chunk) {
        body.push(chunk);
    });
    proxyRes.on('end', function () {
        body = Buffer.concat(body).toString();
        let jsonObject = JSON.parse(body);
        res.send(encrypt(jsonObject))
    });
};

module.exports = {
    reqDecrypt,
    resDecorator,
    resEncrypt
}
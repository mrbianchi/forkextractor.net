const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');
const forksAddrVersions = {
    BTG:  { p2pkh: 38, p2sh: 23 },
    BTP:  { p2pkh: 56, p2sh: 58 },
    BCI:  { p2pkh: 102, p2sh: 23 },
    BTV:  { p2pkh: 0, p2sh: 5 },
    BCH:  { p2pkh: 0, p2sh: 5 },
    BTX:  { p2pkh: 0, p2sh: 5 },
    SBTC:  { p2pkh: 0, p2sh: 5 },
    BCA:  { p2pkh: 0, p2sh: 5 },
    BCK:  { p2pkh: 0, p2sh: 5 },
    B2X:  { p2pkh: 0, p2sh: 5 },
    BTCP:  { p2pkh: 0, p2sh: 5 },
    BCX:  { p2pkh: 75, p2sh: 63 },
    UBTC: { p2pkh: 54, p2sh: 8 }
}
const hash256 = function(data) { return crypto.createHash('sha256').update(data).digest(); },
    convertAddr = function(forkName,address) {
        let decoded = bitcoin.address.fromBase58Check(address);
        switch(coin) {
            case 'BTCP':
                switch(decoded['version']) {
                    case 0:
                        var prefix = Buffer.from(['0x13','0x25']);
                        break;
                    case 5:
                        var prefix = Buffer.from(['0x13','0xaf']);
                        break;
                    default:
                        throw "btcp address to btc address not implemented";
                }
                var withPrefix = Buffer.concat([prefix,decoded['hash']]),
                    hash = hash256(hash256(withPrefix)),
                    checksum = hash.slice(0,4),
                    address = Buffer.concat([withPrefix,checksum]);
                return bs58.encode(address);
                break;
            default:
                version = decoded['version'];
                switch (version) {
                    case 0:
                        version = forksAddrVersions[forkName].p2pkh;
                        break;
                    case forksAddrVersions[forkName].p2pkh:
                        version = 0;
                        break;
                    case 5:
                        version = forksAddrVersions[forkName].p2sh;
                        break;
                    case forksAddrVersions[forkName].p2sh:
                        version = 5;
                        break;
                    default:
                        throw "unknown";
                }
                return bitcoin.address.toBase58Check(decoded['hash'], version);
        }
}

module.exports = function(forkName,addresses) {
    return addresses.map((address) => {
        return convertAddr(forkName,address);
    });
};
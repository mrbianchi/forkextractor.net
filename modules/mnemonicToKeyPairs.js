const bip39 = require('bip39'), bitcoin = require('bitcoinjs-lib'),
    getExtended = (bip39root) => {
        var path = "m/44'/0'/0'/";
        var pathBits = path.split("/");
        var extendedKey = bip39root;
        for (var i=0; i<pathBits.length; i++) {
            var bit = pathBits[i];
            var index = parseInt(bit);
            if (isNaN(index)) {
                continue;
            }
            var hardened = bit[bit.length-1] == "'";
            var isPriv = !(extendedKey.isNeutered());
            var invalidDerivationPath = hardened && !isPriv;
            if (invalidDerivationPath) {
                extendedKey = null;
            }
            else if (hardened) {
                extendedKey = extendedKey.deriveHardened(index);
            }
            else {
                extendedKey = extendedKey.derive(index);
            }
        }
        return extendedKey;
},
    getKeyPair = (extendedKey,path) => {
        var extendedKey = extendedKey.derivePath(path);
        var keyPair = extendedKey.keyPair;
        var address = keyPair.getAddress().toString();
        var WIF = keyPair.toWIF();
        return { address,WIF };
    }
module.exports = (seed,fromIndex) => {
    var buffer = bip39.mnemonicToSeed(seed);
    var bip39root = bitcoin.HDNode.fromSeedBuffer(buffer);
    
    var extendedKey = getExtended(bip39root);
    var keyPairs = [
        {},
        {}
    ];
    for(let rORc=0;rORc<2;rORc++)
        for(let i=fromIndex;i<20;i++) {
            let keyPair = getKeyPair(extendedKey,`${rORc}/${i}`);
            keyPairs[rORc][keyPair.address] = keyPair.WIF;
        }
    return keyPairs;
}
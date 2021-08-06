BigNumber.config({ DECIMAL_PLACES: 8 });
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});
function hex2uI8Array(string){
    var bytes = new Uint8Array(Math.ceil(string.length / 2));
    for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(string.substr(i * 2, 2), 16);
    return bytes;
}
function uI8Array2hex(bytes){
    var convertedBack = '';
    for (var i = 0; i < bytes.length; i++) {
      if (bytes[i] < 16) convertedBack += '0';
      convertedBack += bytes[i].toString(16);
    }
    return convertedBack;
}
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
  });
var to_b58 = function(B,A){var d=[],s="",i,j,c,n;for(i in B){j=0,c=B[i];s+=c||s.length^i?"":1;while(j in d||c){n=d[j];n=n?n*256+c:c;c=n/58|0;d[j]=n%58;j++}}while(j--)s+=A[d[j]];return s};
var from_b58 = function(S,A){var d=[],b=[],i,j,c,n;for(i in S){j=0,c=A.indexOf(S[i]);if(c<0)return undefined;c||b.length^i?i:b.push(0);while(j in d||c){n=d[j];n=n?n*58+c:c;c=n>>8;d[j]=n%256;j++}}while(j--)b.push(d[j]);return new Uint8Array(b)};
var MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var convertAddr = function(forkName,address) {
    if(forkName == 'BTCP') {
        var version = uI8Array2hex(from_b58(address,MAP).slice(0,1));
        if(version == "00") {
            var prefix = forksAddrVersions[forkName].p2pkh;
            bitcoinjs.bitcoin.address.fromBase58Check(address);
        }
        else if(version == "05") {
            var prefix = forksAddrVersions[forkName].p2sh;
            bitcoinjs.bitcoin.address.fromBase58Check(address);
        }
        else if(uI8Array2hex(from_b58(address,MAP).slice(0,2)) == "1325") var prefix = "00";
        else if(uI8Array2hex(from_b58(address,MAP).slice(0,2)) == "13af") var prefix = "05";
        else throw "unknown";
        
        if(prefix == "00" || prefix == "05") var hash = from_b58(address,MAP).slice(2,-4);
        else if(prefix == "1325" || prefix == "13af") var hash = from_b58(address,MAP).slice(1,-4);
        else throw "unknown";

        let withPrefix = prefix + uI8Array2hex(hash);
        let rehash = uI8Array2hex(bitcoinjs.bitcoin.crypto.sha256(bitcoinjs.bitcoin.crypto.sha256(hex2uI8Array(withPrefix))));
        let checksum = rehash.slice(0,8);
        address = to_b58(hex2uI8Array(withPrefix + checksum),MAP);
        if(prefix == "00" || prefix == "05") bitcoinjs.bitcoin.address.fromBase58Check(address);
        return address;
    }else{
        var decoded = bitcoinjs.bitcoin.address.fromBase58Check(address);
        switch (decoded["version"]) {
            case 0:
                var version = forksAddrVersions[forkName].p2pkh;
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
        return bitcoinjs.bitcoin.address.toBase58Check(decoded["hash"], version);
    }
}
var convertAddrs = function(forkName,addresses) {
    return addresses.map((address)=>{
        return convertAddr(forkName,address);
    });
}
var validAddr = function(forkName,address) {
    try{
        if(forkName == "BTCP") {
            var version = uI8Array2hex(from_b58(address,MAP).slice(0,2));
            if(version == "1325" || version == "13af") {
                convertAddr(forkName,address);
                return true;
            }else{
                return false;
            }
        } else if(forkName == "BCH") {
            bchaddr.toLegacyAddress(address);
            return true;
        } else {
            var version = bitcoinjs.bitcoin.address.fromBase58Check(address)['version'];
            if(version == forksAddrVersions[forkName].p2pkh || version == forksAddrVersions[forkName].p2sh) {
                convertAddr(forkName,address);
                return true;
            }else{
                return false;
            }
        }
    }catch(e){
        return false;
    }
}
var mnemonics = { "english": new Mnemonic("english") };
var mnemonic = mnemonics["english"];
var forksNames = {
    BCH:'Bitcoin Cash',
    BTG:'Bitcoin Gold',
    BTX:'Bitcore',
    BCD:'Bitcoin Diamond',
    UBTC:'United Bitcoin',
    BCX:'Bitcoin X',
    SBTC:'Super Bitcoin',
    BTP: 'Bitcoin Pay',
    BCK: 'Bitcoin King',
    LBTC: 'Lightning Bitcoin',
    B2X: 'Bitcoin Segwit2x',
    BCI: 'Bitcoin Interest',
    BTV: 'Bitcoin Vote',
    BCA: 'Bitcoin Atom',
    BTCP: 'Bitcoin Private',
    BTW: 'Bitcoin World'
}
var forksHeight = {
    'BCH':478559,
    'BTG':491407,
    //'BTX':492820,
    'BCD':495866,
    'UBTC':498777,
    //'BTH':498848,
    'BCX':498888,
    'SBTC':498888,
    //'BICC':498888,
    'BTP':499345,
    'BTW':499777,
    //'BCK':499999,
    'LBTC':499999,
    //'BTF':500000,
    //'BTN':501000, 
    //'BTT':501118,
    'B2X':501451,
    //'BPA':501888,
    //'WBTC':503888,
    'BCI':505083,
    'BTV':505050,
    'BCA':505888,
    //'BTSQ':506066,
    //'BBC':508888
    'BTCP':511346
}
var insightExplorers = {
    BCH: 'https://blockdozer.com/api/addrs/',
    BTG: 'https://btgexplorer.com/api/addrs/',
    //BTX: 'https://insight.bitcore.cc/api/addrs/', // not working
    BCD: 'http://52.187.7.191:3001/insight-api/addrs/',
    UBTC: '/explorers/ubtc/addrs/',
    BCX: '/explorers/bcx/addrs/',
    SBTC: 'http://block.superbtc.org/insight-api/addrs/',
    //BICC: 'nop',
    BTP:'http://exp.btceasypay.com/insight-api/addrs/',
    //BTW: 'http://no.explorer.com/insight-api/addrs/',
    BCK: 'https://browser.btcking.org/insight-api/addrs/',
    LBTC: '/explorers/lbtc/addrs/',
    //BTF: 'nop',
    //BTN: 'nop',
    //BTT: 'nop',
    B2X: 'https://explorer.b2x-segwit.io/b2x-insight-api/addrs/',
    //BPA: 'nop',
    //WBTC: 'nop',
    BCI:'https://explorer.bitcoininterest.io/api/addrs/',
    BTV: 'https://block.bitvote.one/insight-api/addrs/',
    //BCA: '',
    //BTSQ: 'nop',
    //BBC: 'nop',
    BTCP: 'https://explorer.btcprivate.org/api/addrs/'
}
var explorers = {
    BCH: 'https://blockdozer.com/tx/',
    BTG: 'https://btgexplorer.com/tx/',
    BTX: 'https://chainz.cryptoid.info/btx/tx.dws?',
    BCD: 'http://explorer.btcd.io/#/TX?loading=true&TX=',
    UBTC: 'https://block.bitbank.com/tx/ubtc/',
    BCX: 'https://bcx.info/tx/',
    SBTC: 'http://block.superbtc.org/tx/',
    //BICC: 'nop',
    BTP:'http://exp.btceasypay.com/insight/tx/',
    BTW: '#',
    BCK: 'https://browser.btcking.org/tx/',
    LBTC: 'https://explorer.lbtc.io/transinfo?param=',
    //BTF: 'nop',
    //BTN: 'nop',
    //BTT: 'nop',
    B2X: 'https://explorer.b2x-segwit.io/tx/',
    //BPA: 'nop',
    //WBTC: 'nop',
    BCI:'https://explorer.bitcoininterest.io/tx/',
    BTV: 'https://block.bitvote.one/tx/',
    BCA: 'https://explorer.bitcoinatom.io/tx/',
    //BTSQ: 'nop',
    //BBC: 'nop',
    BTCP: 'https://explorer.btcprivate.org/tx/'
}
var forksAddrVersions = {
    BTG:  { p2pkh: 38, p2sh: 23 },
    BTP:  { p2pkh: 56, p2sh: 58 },
    BCI:  { p2pkh: 102, p2sh: 23 },
    BTV:  { p2pkh: 0, p2sh: 5 },
    BCH:  { p2pkh: 0, p2sh: 5 },
    BTX:  { p2pkh: 0, p2sh: 5 },
    SBTC:  { p2pkh: 0, p2sh: 5 },
    BCA:  { p2pkh: 23, p2sh: 10 },
    BCK:  { p2pkh: 0, p2sh: 5 },
    BTW:  { p2pkh: 73, p2sh: 31 },
    B2X:  { p2pkh: 0, p2sh: 5 },
    BTCP:  { p2pkh: "1325", p2sh: "13af" },
    BCX:  { p2pkh: 75, p2sh: 63 },
    UBTC: { p2pkh: 54, p2sh: 8 },
    LBTC: { p2pkh: 0, p2sh: 5 },
    BCD: { p2pkh: 0, p2sh: 5 }
}
var forksRatio = {
    'BTF':1,
    'BTW':10000,
    'BTG':1,
    'BCX':10000,
    'B2X':1,
    'UBTC':1,
    'SBTC':1,
    'BCD':10,
    'BPA':1,
    'BTN':1,
    'BTH':100,
    'BTV':1,
    'BTT':1,
    'BTX':0.5,
    'BTP':10,
    'BCK':1,
    'CDY':1000,
    'BTSQ':1000,
    'WBTC':100,
    'BCH':1,
    'BCA':1,
    'BICC':1,
    'BTCP':1,
    'BCI':1,
    'BBC':10,
    'LBTC':1
}
var main = new Vue({

    el: 'main',

    data: {
        walletProvider: "",
        seed: "",
        mnemonicError: "",
        keyPairs: "[{},{}]",
        lastIndex: [0,0],
        inputs: null,
        pseudoBalances: {},
        BTCTransactions : [],
        forksUTXOS: {},
        pseudoUTXOS: null,
        forksBalances: null,
        forksNames: forksNames,
        lastRedeemsTXID: "",
        lastRedeemsError: false,
        redeemFork: "",
        explorers: explorers,
        wif: "",
        forksRatio: forksRatio
    },

    watch: {
        walletProvider: function(val,oldVal) {
            switch(val){
                case "coinomi":
                    setTimeout(()=>{
                        $("#seed").parent().find("label").addClass("active");
                        $("#seed").focus();
                    },100);
                    break;
                case "wif":
                    setTimeout(()=>{
                        $("#wif").parent().find("label").addClass("active");
                        $("#wif").focus();
                    },100);
                    break;
                default:
                    break;
            }
        },
        seed: function(val,oldVal) {
            //Reset data
            this.keyPairs = "[{},{}]";
            this.lastIndex = [0,0];
            this.inputs = [{},{}];
            this.pseudoBalances = {};
            this.BTCTransactions  = [];
            this.forksUTXOS = {};
            this.pseudoUTXOS = null;
            this.forksBalances = null;
            this.lastRedeemsTXID = "";
            this.lastRedeemsError = false;
            this.redeemFork = "";
            //
            this.setMnemonicLanguage();
            var errorMsg = this.findPhraseErrors(val);
            if (errorMsg)
                return this.mnemonicError = errorMsg;
            this.mnemonicError = "";
            this.generateAddresses(0);
        },
        wif: function(val,oldVal) {
            this.mnemonicError = "";
            this.inputs = {};
            if(val)
                this.generateAddresses();
        },
        keyPairs: function(val,oldVal) {
            var temp = JSON.parse(val);
            switch(this.walletProvider){
                case "wif":
                    var options = {
                        addresses: Object.keys(temp).join(","),
                        from: -50,
                        to: 0,
                        transactions: []
                    }
                    this.queryBTCBlockahin(options)
                        .then(this.processBTCTransactions)
                        .catch();
                break;
                default:
                    var lastIndex = this.lastIndex[0] > this.lastIndex[1] ? this.lastIndex[0] : this.lastIndex[1];
                    var reciveAddrs = Object.keys(temp[0]).slice(lastIndex,lastIndex+20);
                    var changeAddrs = Object.keys(temp[1]).slice(lastIndex,lastIndex+20);
                    var options = {
                        addresses: reciveAddrs.concat(changeAddrs).join(","),
                        from: -50,
                        to: 0,
                        transactions: []
                    }
                    this.queryBTCBlockahin(options)
                        .then(this.processBTCTransactions)
                        .catch();
                break;
            }
        }
    },
    methods: {
        generateAddresses: function(fromIndex) {
            switch(this.walletProvider){
                case "wif":
                    var wifs = this.wif.split(",");
                    var keyPairs = {};
                    try {
                        wifs.forEach((wif)=>{
                            var keyPair = bitcoinjs.bitcoin.ECPair.fromWIF(wif);
                            var address = keyPair.getAddress();
                            keyPairs[address] = wif;
                        });
                    }catch(e){
                        this.mnemonicError = "Invalid key wif(s)";
                        return;
                    }
                    this.keyPairs = JSON.stringify(keyPairs);
                break;
                default:
                    var seedHex = mnemonic.toSeed(this.seed);
                    var bip39root = bitcoinjs.bitcoin.HDNode.fromSeedHex(seedHex);
                    var extendedKey = this.getExtended(bip39root);
                    var keyPairs = [
                        {},
                        {}
                    ];
                    for(let rORc=0;rORc<2;rORc++)
                        for(let i=fromIndex;i<fromIndex+20;i++) {
                            let keyPair = this.getKeyPair(extendedKey,rORc+"/"+i);
                            keyPairs[rORc][keyPair.address] = keyPair.WIF;
                        }
                    var temp = JSON.parse(this.keyPairs);
                    Object.assign(temp[0],temp[0],keyPairs[0]);
                    Object.assign(temp[1],temp[1],keyPairs[1]);
                    this.keyPairs = JSON.stringify(temp);
                break;
            }
        },
        queryBTCBlockahin: function(options) {
            return new Promise((resolve,reject)=>{
                if(typeof options.resolve === 'undefined') {
                    options.resolve = resolve;
                    options.reject = reject;
                }
                options.from += 50;
                options.to += 50;
                $.get('https://insight.bitpay.com/api/addrs/'+options.addresses+'/txs?from='+options.from+'&to='+options.to)
                .done(( data ) => {
                    options.transactions = options.transactions.concat(data.items);
                    if(data.totalItems != options.transactions.length) {
                        this.queryBTCBlockahin(options)
                    }else{
                        options.resolve(options.transactions);
                    }
                })
                .fail((errordata) => {
                    this.error = "Error getting transaction history";
                    options.reject();
                });;
            });
        },
        processBTCTransactions: function(BTCTransactions) {
            this.BTCTransactions.concat(BTCTransactions);
            if(this.getBTCInputs(BTCTransactions) !== "done")
                return;
            this.getPseudoUTXOSAndPseudoBalances();
            this.queryForksUTXOS();
        },
        getBTCInputs: function(BTCTransactions) {
            var temp = JSON.parse(this.keyPairs);
            switch(this.walletProvider){
                case 'wif':
                    var inputs = {};
                    BTCTransactions.forEach((BTCTransaction)=> {
                        BTCTransaction.vout.forEach((vout)=> {
                            var index = Object.keys(temp).indexOf(vout.scriptPubKey.addresses[0]);
                            if(index > -1) {
                                if(typeof inputs[Object.keys(temp)[index]] === 'undefined')
                                    inputs[Object.keys(temp)[index]] = new Array();
                                inputs[Object.keys(temp)[index]].push(BTCTransaction);
                            }
                        });
                    });
                    Object.assign(this.inputs,this.inputs,inputs);
                    return "done";
                break;
                default:
                    var inputs = [{},{}];
                    var lastIndex = [0,0];
                    BTCTransactions.forEach((BTCTransaction)=>{
                        BTCTransaction.vout.forEach((vout)=>{
                            var indexs = [0,0];
                            for(let i=0;i<2;i++) {
                                indexs[i] = Object.keys(temp[i]).indexOf(vout.scriptPubKey.addresses[0]);
                                if(indexs[i] > -1) {
                                    lastIndex[i] = indexs[i] > lastIndex[i] ? indexs[i] : lastIndex[i];
                                    if(typeof inputs[i][Object.keys(temp[i])[indexs[i]]] === 'undefined')
                                        inputs[i][Object.keys(temp[i])[indexs[i]]] = new Array();
                                    inputs[i][Object.keys(temp[i])[indexs[i]]].push(BTCTransaction);
                                }
                            }
                        });
                    });
                    Object.assign(this.inputs[0],this.inputs[0],inputs[0]);
                    Object.assign(this.inputs[1],this.inputs[1],inputs[1]);
                    if(lastIndex[0] > this.lastIndex[0] || lastIndex[1] > this.lastIndex[1]) {
                        this.lastIndex = lastIndex;
                        if(lastIndex[0] > lastIndex[1])
                            return this.generateAddresses(lastIndex[0]);
                        else
                            return this.generateAddresses(lastIndex[1]);
                    }else{
                        this.lastIndex = lastIndex;
                        return "done";
                    }
                break;
            }
        },
        getPseudoUTXOSAndPseudoBalances: function() {
            switch(this.walletProvider){
                case 'wif':
                    var inputs = this.inputs;
                    var addresses = Object.keys(this.inputs);
                break;
                default:
                    var inputs = this.inputs[0].concat(this.inputs[1]);
                    var addresses = Object.keys(inputs);
                break;
            }
            var pseudoBalances = {};
            var pseudoUTXOS = {};
            Object.keys(forksHeight).forEach((forkName) => {
                addresses.forEach((address) => {
                    inputs[address].forEach((transaction) => {
                        transaction.vout.forEach((vout,index)=>{
                            if(vout.scriptPubKey.addresses[0] === address && (!vout.spentHeight || vout.spentHeight > forksHeight[forkName]) && transaction.blockheight <= forksHeight[forkName]) {
                                if(typeof pseudoBalances[forkName] === 'undefined')
                                    pseudoBalances[forkName] = "0";
                                pseudoBalances[forkName] = BigNumber(pseudoBalances[forkName]).plus( BigNumber(vout.value).times(forksRatio[forkName]) ).toString();
                                if(typeof pseudoUTXOS[forkName] === 'undefined')
                                    pseudoUTXOS[forkName] = [];
                                pseudoUTXOS[forkName].push({
                                    address,
                                    txid: transaction.txid,
                                    vout: index,
                                    scriptPubKey: vout.scriptPubKey.hex,
                                    amount: BigNumber(vout.value).times( BigNumber(this.forksRatio[forkName]) ).toString(),
                                    satoshis: BigNumber(vout.value).times( BigNumber(this.forksRatio[forkName]) ).times(100000000).toString(),
                                    height: transaction.blockheight,
                                    confirmations: transaction.confirmations
                                });
                            }
                        });
                    });
                });
            });
            this.pseudoUTXOS = pseudoUTXOS;
            this.pseudoBalances = pseudoBalances;
        },
        queryForksUTXOS: function() {
            var keyPairs = JSON.parse(this.keyPairs);
            switch(this.walletProvider){
                case 'wif':
                    keyPairs = Object.keys(keyPairs);
                break;
                default:
                    keyPairs = Object.keys(keyPairs[0]).concat(Object.keys(keyPairs[1]));
                break;
            }
            var promises = [];
            Object.keys(this.pseudoBalances).forEach((forkName)=>{
                promises.push(new Promise((resolve,reject)=>{
                    var error = {forkName,forkBalance:null};
                    if(typeof insightExplorers[forkName] == 'undefined') {
                        resolve(error);
                        return;
                    }
                    jQuery.get(insightExplorers[forkName]+convertAddrs(forkName,keyPairs).join(',')+'/utxo')
                    .done((utxos,textStatus)=>{
                        if(textStatus !== "success") return resolve(error);
                        if(utxos.length===0) return resolve({forkName,forkBalance:"0"});
                        var forkBalance = "0";
                        try{
                            utxos.forEach((utxo)=>{
                                forkBalance = BigNumber(forkBalance).plus( BigNumber(utxo.amount) ).toString();
                            });
                        }catch(e){
                            return resolve(error);
                        }
                        this.forksUTXOS[forkName] = utxos;
                        resolve({forkName,forkBalance});
                    })
                    .fail(()=>{
                        console.log('error');
                        resolve(error);
                    });
                    setTimeout(()=>{resolve(error)},5000)
                }));
            });
            Promise.all(promises)
                .then((balances)=>{
                    var forksBalances = {};
                    balances.forEach((balance)=>{
                        if(balance.forkBalance)
                            forksBalances[balance.forkName] = balance.forkBalance;
                        else
                            forksBalances[balance.forkName] = "?";
                    });
                    this.forksBalances = forksBalances;
                })
                .catch(console.log);
        },
        getExtended: function(bip39root) {
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
        getKeyPair: function(extendedKey,path) {
            var extendedKey = extendedKey.derivePath(path);
            var keyPair = extendedKey.keyPair;
            var address = keyPair.getAddress().toString();
            var WIF = keyPair.toWIF();
            return { address,WIF };
        },
        setMnemonicLanguage: function() {
            var language = this.getLanguage();
            // Load the bip39 mnemonic generator for this language if required
            if (!(language in mnemonics)) {
                mnemonics[language] = new Mnemonic(language);
            }
            mnemonic = mnemonics[language];
        },
        getLanguage: function() {
            var defaultLanguage = "english";
            // Try to get from existing phrase
            var language = this.getLanguageFromPhrase();
            // Try to get from url if not from phrase
            if (language.length == 0) {
                language = this.getLanguageFromUrl();
            }
            // Default to English if no other option
            if (language.length == 0) {
                language = defaultLanguage;
            }
            return language;
        },
        getLanguageFromPhrase: function(phrase) {
            // Check if how many words from existing phrase match a language.
            var language = "";
            if (this.seed.length > 0) {
                var words = this.phraseToWordArray(this.seed);
                var languageMatches = {};
                for (l in WORDLISTS) {
                    // Track how many words match in this language
                    languageMatches[l] = 0;
                    for (var i=0; i<words.length; i++) {
                        var wordInLanguage = WORDLISTS[l].indexOf(words[i]) > -1;
                        if (wordInLanguage) {
                            languageMatches[l]++;
                        }
                    }
                    // Find languages with most word matches.
                    // This is made difficult due to commonalities between Chinese
                    // simplified vs traditional.
                    var mostMatches = 0;
                    var mostMatchedLanguages = [];
                    for (var l in languageMatches) {
                        var numMatches = languageMatches[l];
                        if (numMatches > mostMatches) {
                            mostMatches = numMatches;
                            mostMatchedLanguages = [l];
                        }
                        else if (numMatches == mostMatches) {
                            mostMatchedLanguages.push(l);
                        }
                    }
                }
                if (mostMatchedLanguages.length > 0) {
                    // Use first language and warn if multiple detected
                    language = mostMatchedLanguages[0];
                    if (mostMatchedLanguages.length > 1) {
                        console.warn("Multiple possible languages");
                        console.warn(mostMatchedLanguages);
                    }
                }
            }
            return language;
        },
        getLanguageFromUrl: function() {
            for (var language in WORDLISTS) {
                if (window.location.hash.indexOf(language) > -1) {
                    return language;
                }
            }
            return "";
        },
        phraseToWordArray: function(phrase) {
            var words = phrase.split(/\s/g);
            var noBlanks = [];
            for (var i=0; i<words.length; i++) {
                var word = words[i];
                if (word.length > 0) {
                    noBlanks.push(word);
                }
            }
            return noBlanks;
        },
        findPhraseErrors: function(phrase) {
            // Preprocess the words
            phrase = mnemonic.normalizeString(phrase);
            var words = this.phraseToWordArray(phrase);
            // Detect blank phrase
            if (words.length == 0) {
                return "Blank mnemonic";
            }
            // Check each word
            for (var i=0; i<words.length; i++) {
                var word = words[i];
                var language = this.getLanguage();
                if (WORDLISTS[language].indexOf(word) == -1) {
                    //console.log("Finding closest match to " + word);
                    var nearestWord = this.findNearestWord(word);
                    return word + " not in wordlist, did you mean " + nearestWord + "?";
                }
            }
            // Check the words are valid
            var properPhrase = this.wordArrayToPhrase(words);
            var isValid = mnemonic.check(properPhrase);
            if (!isValid) {
                return "Invalid mnemonic";
            }
            return false;
        },
        findNearestWord: function(word) {
            var language = this.getLanguage();
            var words = WORDLISTS[language];
            var minDistance = 99;
            var closestWord = words[0];
            for (var i=0; i<words.length; i++) {
                var comparedTo = words[i];
                if (comparedTo.indexOf(word) == 0) {
                    return comparedTo;
                }
                var distance = Levenshtein.get(word, comparedTo);
                if (distance < minDistance) {
                    closestWord = comparedTo;
                    minDistance = distance;
                }
            }
            return closestWord;
        },
        wordArrayToPhrase: function(words) {
            var phrase = words.join(" ");
            var language = this.getLanguageFromPhrase(phrase);
            if (language == "japanese") {
                phrase = words.join("\u3000");
            }
            return phrase;
        },
        claimFrok: function(forkName) {
            this.lastRedeemsTXID = '';
            this.lastRedeemsError = false;
            if(typeof this.forksUTXOS[forkName] != 'undefined')
                var UTXOS = this.forksUTXOS[forkName];
            else if(typeof this.pseudoUTXOS[forkName] != 'undefined')
                var UTXOS = this.pseudoUTXOS[forkName];
            else return;
            var i=0;
            do {
                if(i==0)
                    var to = window.prompt("Enter "+forkName+" address where you want to receive");
                else
                    var to = window.prompt("Enter a valid "+forkName+" address");
                if(!to) return;
                i++;
            }while(validAddr(forkName,to)==false);
            if(forkName=='BCH') to = bchaddr.toLegacyAddress(to);
            this.redeemFork=forkName;
            var keyPairs = JSON.parse(this.keyPairs);    
            switch(this.walletProvider){
                case "wif":
                    for(var q=0;q<UTXOS.length;q++) {
                        var addresses = typeof this.forksUTXOS[forkName] != 'undefined' ? convertAddrs(forkName,Object.keys(keyPairs)) : Object.keys(keyPairs);
                        addresses.forEach((address,index)=>{
                            if(address === UTXOS[q].address) {
                                UTXOS[q].address = Object.keys(keyPairs)[index];
                                UTXOS[q].wif = Object.values(keyPairs)[index];
                            }
                        });
                    }
                break;
                default:
                    for(var q=0;q<UTXOS.length;q++)
                        for(var i=0;i<2;i++){
                            var addresses = typeof this.forksUTXOS[forkName] != 'undefined' ? convertAddrs(forkName,Object.keys(keyPairs[i])) : Object.keys(keyPairs[i]);
                            addresses.forEach((address,index)=>{
                                if(address === UTXOS[q].address) {
                                    UTXOS[q].address = Object.keys(keyPairs[i])[index];
                                    UTXOS[q].wif = Object.values(keyPairs[i])[index];
                                }
                            });
                    }
                break;
            }
            var instance = M.Modal.getInstance($(".modal"));
            instance.open();
            $.post("/claim",{forkName,utxos:UTXOS,to},(results)=>{
                results.forEach((result,index)=>{
                    if(!result.txNew)
                        return this.lastRedeemsError = true;
                    var unusedUTXOS = [];
                    UTXOS.forEach((utxo,index)=>{
                        if(utxo.txid !== result.txSpent)
                            unusedUTXOS.push(utxo);
                        else {
                            if(this.forksBalances[forkName] != "?")
                                this.forksBalances[forkName] = BigNumber(this.forksBalances[forkName]).minus(utxo.amount).toString();
                            else
                                if(results.length == UTXOS.length && results.length == index+1)
                                    this.forksBalances[forkName] = "0";
                        }
                    });
                    UTXOS = unusedUTXOS;
                });
                results = results.filter((result)=>{ return result.txNew; });
                this.lastRedeemsTXID = JSON.stringify(results);
            });
        }
    },
    computed: {
        getKeyPairs: function(){
            return JSON.parse(this.keyPairs);
        }
    }
})
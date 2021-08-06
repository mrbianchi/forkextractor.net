const express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    pug = require('pug'),
    explore = require('./modules/explore'),
    mnemonicToKeyPairs = require('./modules/mnemonicToKeyPairs'),
    util = require('util'),
    minify = require('express-minify'),
    compression = require('compression'),
    uglifyEs = require('uglify-es');

/* CONFIG THINGS */
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(minify({
    cache: true,
    uglifyJsModule: uglifyEs,
    jsMatch: /js/,
    cssMatch: /css/,
    errorHandler: console.log
  }));
app.use(express.static(path.join(__dirname, './public')));
var listener = app.listen(80,  ()  => { console.log('Listening on port 80'); });

/* Warning: BTX setted to 1 */
var forksRatio = {'BTF':1,'BTW':10000,'BTG':1,'BCX':10000,'GOD':1,'B2X':1,'UBTC':1,'SBTC':1,'BCD':10,'BPA':1,'BTN':1,'BTH':100,'BTV':1,'BTT':1,'BTX':1,'BTP':10,'BCK':1,'CDY':1000,'BTSQ':1000,'WBTC':100,'BCH':1,'BCA':1,'BICC':1,'BTCP':1,'BCI':1,'BBC':10,'LBTC':1 }
var myAddresses = {
    'BTF':'',//bitpie
    'BTW':'',//bitpie
    'BTG':'',//bitfinex, //',//bitpie
    'BCX':'',//aex.com
    'B2X':'',//EXRATES.me
    'UBTC':'',//AEX.com
    'SBTC':'',//aex-global.com '',//bitpie
    'BCD':'',//bitpie
    'BPA':'',//bitpie
    'BTN':'',//bitpie
    'BTH':'',
    'BTV':'',//bitpie
    'BTT':'',
    'BTX':'',//BIT-Z
    'BTP':'',//bitpie
    'BCK':'',
    'CDY':'',
    'BTSQ':'',
    'WBTC':'',
    'BCH':'',//bitfinex
    'BCA':'',//exrates.me
    'BICC':'',//topbtc.com
    'BTCP':'',//hitbtc.com
    'BCI':'',//bitfinex
    'BBC':'',//bitpie
    'GOD': '',//digifinex
    'LBTC': ''//electrum ltc wallet 

}

function sleep(ms){return new Promise(resolve=>{setTimeout(resolve,ms)})}

/* SITE PATHS */
app.get('/', (req, res) => {
    res.render("index");
});


function fillArray(value, len) {
    if (len == 0) return [];
    var a = [value];
    while (a.length * 2 <= len) a = a.concat(a);
    if (a.length < len) a = a.concat(a.slice(0, len - a.length));
    return a;
  }

/* EXPLORER THINGS */
app.get('/explorers/lbtc/addrs/:addrs/utxo',explore.getLBTCUTXOS);
app.get('/explorers/ubtc/addrs/:addrs/utxo',explore.getUBTCUTXOS);
app.get('/explorers/btcp/addrs/:addrs/utxo',explore.getBTCPUTXOS);
app.get('/explorers/bcx/addrs/:addrs/utxo',explore.getBCXUTXOS);
app.post('/claim',(req,res)=>{
    console.log(req.body)
    runPy(req.body.forkName,req.body.utxos,req.body.to)
        .then(function(results) {
            console.log(results)
            res.send(results);
        })
        .catch((error)=>{
            console.log(error);
        })
});

/* PYTHON THINGS */
let runPy = function(forkName,utxos,clientAddress) {
    var promises = [];
    utxos.forEach((utxo,index,array)=>{
        promises.push(new Promise(function(resolve, reject) {
            setTimeout(()=>{
                const { spawn } = require('child_process');
                var paramsToAdd = [];
                if(clientAddress==myAddresses[forkName]) {
                    var outputs = `${myAddresses[forkName]}`;
                    if(parseInt(utxo.satoshis) < 1000) {
                        paramsToAdd = ["--fee",0];
                    }
                } else {
                    if(parseInt(utxo.satoshis) < 1000) {
                        var outputs = `${clientAddress}`;
                    }else{
                        var comission = Math.round(parseInt(utxo.satoshis)/10) - 1000;
                        if( comission < 1000) {
                            var outputs = `${clientAddress}`;
                            paramsToAdd = ["--fee",0];
                        }else{
                            var toClient = parseInt(utxo.satoshis) - comission;
                            var outputs = `${clientAddress}:${toClient},${myAddresses[forkName]}:${comission}`;
                        }
                    }
                }
    
    
                var params = ['./bitcoin_fork_claimer-master/claimer.py',
                forkName,
                utxo.txid,
                utxo.wif,
                utxo.address,
                outputs,
                '--txindex',
                utxo.vout,
                '--satoshis',
                utxo.satoshis
                ].concat(paramsToAdd);
                //console.log(params);
                const pyprog = spawn('python', params);
                pyprog.stdout.on('data', function(data) {
                    console.log(data.toString())
                    resolve({txSpent:utxo.txid,txNew:data.toString().slice(0,-2)});
                });
                pyprog.stderr.on('data', (data) => {
                    console.log('Error claiming '+forkName,data.toString());
                    resolve({txSpent:utxo.txid,txNew:null});
                });
                setTimeout(()=>{
                    pyprog.kill('SIGHUP');
                    console.log('Timeout claiming '+forkName);
                    resolve({txSpent:utxo.txid,txNew:null});
                },15000*2+3000*utxos.length)
            },index*3000);
        }));
    });
    return Promise.all(promises)
}
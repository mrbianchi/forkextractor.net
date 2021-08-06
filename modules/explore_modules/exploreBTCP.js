const utils = require('./exploreUtils'), addrConverter = require('../addrConverter');
module.exports = function(req,res) {
    utils.request('https://explorer.btcprivate.org/api/addrs/'+addrConverter(req.params.addrs.split(',')).join(",")+'/utxo')
        .then((utxos) => {
            res.send(JSON.parse(utxos));
        })
        .catch((err)=>{
            res.send(err);
        });
}
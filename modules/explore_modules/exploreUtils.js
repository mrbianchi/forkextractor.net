module.exports = {
    request: function(url) {
        return new Promise((resolve,reject)=>{
            https.get(url, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                  data += chunk;
                });
                resp.on('end', () => {
                    resolve(data);
                });
              }).on("error", (err) => {
                    reject(err);
              });
        });
    },
    makeId: function() {
        var text = "";var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(var i = 0; i < 15; i++)text += possible.charAt(Math.floor(Math.random() * possible.length));return text;
    },
    IsJsonString: function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    electrumToInsight: function(addresses,electrumResponses) {
        var insightResponses = [];
        electrumResponses.forEach((electrumResponse)=>{
            if(typeof electrumResponse.error !== "undefined")
                throw "error";
                if(electrumResponse.result.length > 0)
                    electrumResponse.result.forEach((tx)=>{
                        insightResponses.push({
                            "address": addresses[electrumResponse.id],
                            "txid": tx.tx_hash,
                            "vout": tx.tx_pos,
                            //"scriptPubKey": false el explorador no lo ofrece
                            "amount": tx.value/100000000,
                            "satoshis": tx.value,
                            "height": tx.height
                            //"confirmations": 1 electrum no lo ofrece
                        });
                    });
        });
        return insightResponses;
    }
}
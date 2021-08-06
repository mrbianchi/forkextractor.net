const net = require('net'), utils = require('./exploreUtils'), addrConverter = require('../addrConverter');

var socket = new net.Socket();
var responsesBuffer = [];
var responsesBufferBuffer = "";

socket.on('data', (data) => {
    responsesBufferBuffer += data.toString().replace(new RegExp("\n", 'g'),"").replace(new RegExp("}{", 'g'),"},{");
    var temp = "["+responsesBufferBuffer+"]";
    if (utils.IsJsonString(temp)) {
        var responses = JSON.parse(temp);
        responsesBuffer = responsesBuffer.concat(responses);
        responsesBufferBuffer = "";
    }
});

socket.on('error', (errorMsg) => {
    console.log(errorMsg)
});

module.exports = function(req,res) {
    try {
        socket.connect({port: 50001, host: "urlelcm6.ub.com"}, function() {
            console.log("The sc ubtcSocket connected. Yay!");
          });
        var id = utils.makeId();
        var addresses = req.params.addrs.split(',');
        //var convertedAddrs = addrConverter("UBTC",addresses);
        addresses.forEach((address,index)=> {
            socket.write('{ "id": "'+id+'-'+index+'", "method": "blockchain.address.listunspent","params": [ "'+address+'" ]}\n');
        });
        var responses = [];
        var interval = setInterval(()=> {
            responsesBuffer.forEach((possibleResponse,index)=>{
                if(possibleResponse !== "" && possibleResponse.id.split("-")[0] === id){
                    possibleResponse.id = parseInt(possibleResponse.id.split("-")[1]);
                    responsesBuffer[index] = "";
                    responses.push(possibleResponse);
                    
                }
            });
            if(responses.length===addresses.length) {
                res.send(utils.electrumToInsight(addresses,responses));
                socket.destroy();
                clearInterval(interval);
            }
        },100);
    }catch(error){
        res.send({error});
        socket.destroy();
    }
}
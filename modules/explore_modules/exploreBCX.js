const utils = require('./exploreUtils'), addrConverter = require('../addrConverter');
var request = require('request');
module.exports = (req, res) => {
    request('https://bcx.info/insight-api/addrs/'+req.params.addrs+'/utxo',function (error, response, body) {
        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
        res.send(JSON.parse(body));
      });
}
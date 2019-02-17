var request = require('request');

const apiKey = process.env.EVENTBRITE_API_KEY;
const apiURL = 'https://www.eventbriteapi.com/v3/events/search/?location.address=';

var eventbrite = {
   grab: function(req, res, next) {
       request(apiURL + req.params.city + '&location.within=' + req.params.radius + 'km&' + 'token=' + apiKey,
       function (error, response, body) {
           if (!error && response.statusCode == 200) {
               response = JSON.parse(body);
               res.send(response);
           } else {
               console.log(response.statusCode + response.body);
               res.send(response);
           }
       });

   }
};

module.exports = eventbrite;
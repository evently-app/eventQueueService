var request = require('request');

const apiKey = process.env.EVENTBRITE_API_KEY;
const apiURL = 'https://www.eventbriteapi.com/v3/events/search/?location.address=';


function formatEventObject(res){
  console.log("yo")
  console.log("INFO PASSED TO THE FUNCTION IS: ", res)

  var formattedEvents = {}
  var size = -1 

  for(var i = 0; i<15; i++){
    var event = {
    event_name: res["events"][i]["name"]["text"],
    start_time: res["events"][i]["start"]["local"],
    end_time: res["events"][i]["end"]["local"],
    ticket_url: res["events"][i]["url"],
    id: res["events"][i]["id"],
    tags: ["hippo", "campus"],
    image_url: res["events"][i]["logo"]["url"]
  }
    formattedEvents[size+1]= event  
    size = Object.keys(formattedEvents).length
  }

 // console.log("The result is: ", formattedEvents)
  return formattedEvents
}

var eventbrite = {
   grab: function(req, res, next) {
       request(apiURL + req.params.city + '&location.within=' + req.params.radius + 'km&' + 'token=' + apiKey,
       function (error, response, body) {
           if (!error && response.statusCode == 200) {
               response = JSON.parse(body);
                object = formatEventObject(response); 
               res.send(object);
           } else {
               console.log(response.statusCode + response.body);
               object = formatEventObject(response); 
               res.send(object);
           }
       });

   }
};

module.exports = eventbrite;
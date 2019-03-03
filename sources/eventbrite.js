var sourceConstructor = require('../service/sourceConstructor');
var eventbrite = new sourceConstructor({
		url : "https://www.eventbriteapi.com/v3/events/search/?", 
		apiTerm: "token", 
	    token: process.env.EVENTBRITE_API_KEY || '5XU2X3GXCDU2MLZ7RZVH', 
	    paramMap: {"city": "location.address"}, 
	    apiName: 'Eventbrite',
	    formatEvents: function(res) {
	    	var formattedEvents = {}
	    	for(var i = 0; i<5; i++) {
		    	var event = {
			    	event_name: res["events"][i]["name"]["text"],
				    start_time: res["events"][i]["start"]["local"],
				    end_time: res["events"][i]["end"]["local"],
				    ticket_url: res["events"][i]["url"],
				    id: res["events"][i]["id"],
				    tags: ["eventbrite"],
				    image_url: res["events"][i]["logo"]["url"]
		    	}
		      	formattedEvents[res["events"][i]["id"]]= event; 
    		}
    		return formattedEvents;
	    }
    });

module.exports = eventbrite;
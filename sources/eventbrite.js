var SourceConstructor = require('../classes/sourceConstructor');
var eventbrite = new SourceConstructor({
		url : "https://www.eventbriteapi.com/v3/events/search/?", 
		apiTerm: "token", 
	    token: process.env.EVENTBRITE_API_KEY || '5XU2X3GXCDU2MLZ7RZVH', 
	    paramMap: {"city": "location.address"}, 
	    apiName: 'Eventbrite',
	    formatEvents: function(res) {
	    	var formattedEvents = [];
	    	for(var i = 0; i<5; i++) {
		    	
		    	// Catch any error caused by their API. 
		    	// For example, an event does not any required field
		    	try{
			    	var event = {
				    	eventName: res["events"][i]["name"]["text"],
					    startTime: res["events"][i]["start"]["local"],
					    endTime: res["events"][i]["end"]["local"],
					    ticketUrl: res["events"][i]["url"],
					    id: res["events"][i]["id"],
					    tags: ["eventbrite"],
					    imageUrl: res["events"][i]["logo"]["url"]
			    	}
			      	// formattedEvents.push(new EventObject(event)); 
			      	formattedEvents.push(event);
		    	}
		    	catch(err){
		    		console.log("An event from eventbrite does not have all required fields.\n"+err.message);
		    	}

    		}
    		return formattedEvents;
	    }
    });

module.exports = eventbrite;
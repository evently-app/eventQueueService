var SourceConstructor = require('../classes/sourceConstructor');
var eventbrite = new SourceConstructor({
		url : "https://www.eventbriteapi.com/v3/events/search/?", 
		apiTerm: "token", 
	    token: process.env.EVENTBRITE_API_KEY || '5XU2X3GXCDU2MLZ7RZVH', 
	    paramMap: {
	    	"latitude": "location.latitude",
	    	"longitude": "location.longitude",
	    	"radius": "location.within",
	    	"venue": "expand"
	    }, 
	    apiName: 'Eventbrite',
	    formatEvents: function(res) {
	    	var formattedEvents = [];
	    	var responseSize = Object.keys(res["events"]).length;
	    	for(var i = 0; i<responseSize; i++) {
		    	
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
					    //imageUrl: res["events"][i]["logo"]["url"],
					    latitude: res["events"][i]["venue"]["address"]["latitude"],
					    longitude: res["events"][i]["venue"]["address"]["longitude"]
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

eventbrite.getRequestUrl = function(req){
		var requestURL = this.url;
		var sourceParams = this.mapToSourceParams(req.params);

		for (const [key, value] of Object.entries(sourceParams)) {
			requestURL += key + "=" + value + '&';
		}
		
		requestURL += "expand=venue&"; 

		requestURL += this.apiTerm + "=" + this.token;

		return requestURL;
}

module.exports = eventbrite;
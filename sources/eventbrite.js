var SourceConstructor = require('../classes/sourceconstructor');
var eventbrite = new SourceConstructor({
		url : "https://www.eventbriteapi.com/v3/events/search/?", 
		apiTerm: "token", 
	    token: process.env.EVENTBRITE_API_KEY, 
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
		    	
		    	var event = {
			    	eventName: res["events"][i]["name"]["text"],
				    startTime: res["events"][i]["start"]["local"],
				    endTime: res["events"][i]["end"]["local"],
				    ticketUrl: res["events"][i]["url"],
				    id: res["events"][i]["id"],
				    tags: ["eventbrite"],
				    latitude: res["events"][i]["venue"]["address"]["latitude"],
				    longitude: res["events"][i]["venue"]["address"]["longitude"]
		    	}

		    	// check if any fields we try to retrieve from data are invalid
		    	for (const [key, value] of Object.entries(event)){
		    		if (value == undefined){ // as opposed to null when the field is valid but has no info
		    			throw "The source field involving " + key + "is invalid";
		    		}
		    	}

			    formattedEvents.push(event);

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
var SourceConstructor = require('../classes/sourceconstructor');
var moment = require('moment')

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
	    apiName: 'Eventbrite', //if edit, edit event's source and id. 
	    formatEvents: function(res) {
	    	var formattedEvents = [];
	    	var responseSize = Object.keys(res["events"]).length;

	    	//temporarily only loading 5 events 
				
	    	for(var i = 0; i<5; i++) {
		    	// Catch any error caused by their API. 
		    	// For example, an event does not any required field
		    	try{
			    	var event = {
				    	eventName: res["events"][i]["name"]["text"],
					    startTime: moment(res["events"][i]["start"]["local"]).format(),
					    endTime: res["events"][i]["end"]["local"],
					    description: res["events"][i]["description"]["text"],
					    ticketUrl: res["events"][i]["url"],
					    sourceId: res["events"][i]["id"],
					    tags: ["eventbrite"],
					    imageUrl: res["events"][i]["logo"]["original"]["url"],
					    latitude: res["events"][i]["venue"]["address"]["latitude"],
						longitude: res["events"][i]["venue"]["address"]["longitude"],
						source:'Eventbrite', //has to be same as super's apiName
						id: 'Eventbrite' + res["events"][i]["id"] //has to be same as this.source + this.sourceId
					}

					var tags = [];
					
					if(!event.startTime || event.startTime === 'Invalid date') {
						console.log('Eventbrite Object\'s date could not be converted to moment format')
						continue;
					}

			    	if(event.description.toLowerCase().includes("free")){
			    		tags.push("Free"); 
			    	}
			    	if(event.description.toLowerCase().includes("party")){
			    		tags.push("Party"); 
			    	}
			    	if(event.description.toLowerCase().includes("show") || event.description.toLowerCase().includes("perform")){
			    		tags.push("Performance"); 
			    	}
			    	if(event.description.toLowerCase().includes("music") || event.description.toLowerCase().includes("dj") || event.description.toLowerCase().includes("hip hop")){
			    		tags.push("Music"); 
			    	}
			    	if(event.description.toLowerCase().includes("bar") || event.description.toLowerCase().includes("lounge")){
			    		tags.push("Bar/Lounge"); 
			    	}
			    	if(event.description.toLowerCase().includes("kids") || event.description.toLowerCase().includes("family")){
			    		tags.push("Family Friendly"); 
			    	}
			    	if(event.description.toLowerCase().includes("expo") || event.description.toLowerCase().includes("conference")){
			    		tags.push("Conference"); 
			    	}
			    	if(event.description.toLowerCase().includes("art") || event.description.toLowerCase().includes("culture")){
			    		tags.push("Art/Culture"); 
			    	}
			    	if(event.description.toLowerCase().includes("festival") || event.description.toLowerCase().includes("fair")){
			    		tags.push("Festival"); 
			    	}
			    	if(event.description.toLowerCase().includes("education") || event.description.toLowerCase().includes("seminar") || event.description.toLowerCase().includes("professor")){
			    		tags.push("Educational"); 
			    	}

			    	event.tags = tags; 
			    }
			    catch(err){
		    		console.log("An event from eventbrite does not have all required fields.\n"+err.message);
				}	
				
				var isValid = true;

			    // check if any fields we try to retrieve from data are invalid
		    	for (const [key, value] of Object.entries(event)){
		    		try {
			    		if (typeof(value) == undefined){ // as opposed to null when the field is valid but has no info
			    			throw "The source field involving " + key + "is invalid";
			    		}
			    	}
			    	catch{
						isValid = false;
			    	}
		    	}

				if (isValid) {
					formattedEvents.push(event);
				}

			}
			console.log("Eventbrite returned and array of size: " + formattedEvents.length)
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


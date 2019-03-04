var SourceConstructor = require('../classes/sourceConstructor');
var ticketmaster = new SourceConstructor({
		url : "https://app.ticketmaster.com/discovery/v2/events.json?", 
		apiTerm: "apikey", 
	    token: process.env.TICKETMASTER_API_KEY, 
	    paramMap: {"city": "city"}, 
	    apiName: 'Ticketmaster',
	    formatEvents: function(res) {
	    	var formattedEvents = []
	    	for(var i = 0; i<5; i++){
	    		try{
				    var event = {
				    	eventName: res["_embedded"]["events"][i]["name"],
				    	startTime: res["_embedded"]["events"][i]["dates"]["dateTime"],
					    endTime: null,
					    ticketUrl: res["_embedded"]["events"][i]["url"],
					    id: res["_embedded"]["events"][i]["id"],
					    tags: ["ticketmaster"],
					    imageUrl: res["_embedded"]["events"][i]["images"]
				    }

				    // formattedEvents.push(new EventObject(event));
				    formatEvents.push(event);
				}
				catch(err){
		    		console.log("An event from ticketmaster does not have all required fields.\n"+err.message);
				}
			    
			}
			return formattedEvents;
	    }
    });
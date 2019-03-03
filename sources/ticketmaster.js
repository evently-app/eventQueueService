var eventbrite = new sourceConstructor({
		url : "https://app.ticketmaster.com/discovery/v2/events.json?", 
		apiTerm: "apikey", 
	    token: process.env.TICKETMASTER_API_KEY, 
	    paramMap: {"city": "city"}, 
	    apiName: 'Ticketmaster',
	    formatEvents: function(res) {
	    	var formattedEvents = []
	    	for(var i = 0; i<5; i++){
			    var event = {
			    	event_name: res["_embedded"]["events"][i]["name"],
			    	start_time: res["_embedded"]["events"][i]["dates"]["dateTime"],
				    end_time: null,
				    ticket_url: res["_embedded"]["events"][i]["url"],
				    id: res["_embedded"]["events"][i]["id"],
				    tags: ["ticketmaster"],
				    image_url: res["_embedded"]["events"][i]["images"]
			    }
			    formattedEvents.push(event);
			}
			return formattedEvents;
	    }
    });
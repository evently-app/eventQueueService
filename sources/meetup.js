var SourceConstructor = require('../classes/sourceconstructor');
var rp = require('request-promise');

var meetup = new SourceConstructor({
		url : "https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&", 
		apiTerm: "access_token", 
	    token: process.env.MEETUP_REFRESH_TOKEN,
	    paramMap: {
	    	"latitude": "lat",
	    	"longitude": "lon",
	    }, 
	    apiName: 'Eventbrite',
	    formatEvents: function(res) {
	    	var formattedEvents = [];
	    	var responseSize = Object.keys(res["events"]).length;
	    	for(var i = 0; i<5; i++) {
		    	// Catch any error caused by their API. 
		    	// For example, an event does not any required field
		    	try{
			    	var event = {
				    	eventName: res["events"][i]["name"],
				    	//we will need to convert it 
					    startTime: res["events"][i]["local_time"],
					    description: res["events"][i]["description"] || null,
					    ticketUrl: res["events"][i]["link"],
					    id: res["events"][i]["id"],
					    //create stock photo for image based on the event tag 
					    imageUrl: null,
					    latitude: res["events"][i]["group"]["lat"],
					    longitude: res["events"][i]["group"]["lon"],
					    source: "meetup"
			    	}

			    	var tags = []; 

			      	formattedEvents.push(event);
		    	}
		    	catch(err){
		    		console.log("An event from meetup does not have all required fields.\n"+err.message);
		    	}

    		}
    		return formattedEvents;
	    }
    });

meetup.getRequestUrl = async function(req){
		var requestURL = this.url;
		var sourceParams = this.mapToSourceParams(req.params);

		for (const [key, value] of Object.entries(sourceParams)) {
			requestURL += key + "=" + value + '&';
		}

		var refreshRequest = "https://secure.meetup.com/oauth2/access?"
		+ "client_id=" + process.env.MEETUP_CLIENT_ID  
		+ "&client_secret=" + process.env.MEETUP_SECRET
		+ "&grant_type=refresh_token&refresh_token=" + process.env.MEETUP_REFRESH_TOKEN

		var options = {
			uri: refreshRequest,
			json: true 
		}

		var refreshResponse = await rp.post(options); 
		var access_token = refreshResponse.access_token

		requestURL += "page=20000&";
        requestURL += this.apiTerm + "=" + access_token;
        return requestURL;
}

meetup.grab = async function(req, res) {
	var requestURL = await this.getRequestUrl(req);
	var options = {
	    uri: requestURL,
	    json: true 
	};

	console.log(requestURL);

	return rp(options)
	    .then(function (data) {
	        return data;
	    })
	    .catch(function (err) {
		    res.send({"error!":err.statusCode + err.body});
	    });
}

module.exports = meetup;


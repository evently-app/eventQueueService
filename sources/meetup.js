var SourceConstructor = require('../classes/sourceconstructor');
var rp = require('request-promise');
var moment = require('moment')
var meetup = new SourceConstructor({
		url : "https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&", 
		apiTerm: "access_token", 
	    token: process.env.MEETUP_REFRESH_TOKEN,
	    paramMap: {
	    	"latitude": "lat",
	    	"longitude": "lon",
	    }, 
	    apiName: 'Meetup', //if edit, edit event's source and id. 
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
					    startTime: moment(res["events"][i]["local_date"] + " " + res["events"][i]["local_time"]).format(),
					    description: res["events"][i]["description"] || null,
					    ticketUrl: res["events"][i]["link"],
					    sourceId: res["events"][i]["id"],
					    //create stock photo for image based on the event tag 
					    imageUrl: null,
					    latitude: res["events"][i]["group"]["lat"],
						longitude: res["events"][i]["group"]["lon"],
						source:'Meetup', //has to be same as super's apiName
						id: 'Meetup' + res["events"][i]["id"] //has to be same as this.source + this.sourceId
					}
					if(!event.startTime || event.startTime === 'Invalid date') {
						console.log(res["events"][i]["local_time"])
						console.log('Meetup Object\'s date could not be converted to moment format')
						continue;
					}

			    	var tags = []; 

			      	formattedEvents.push(event);
		    	}
		    	catch(err){
		    		console.log("An event from meetup does not have all required fields.\n"+err.message);
		    	}

			}
			console.log("Meetup returned and array of size: " + formattedEvents.length)
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

		requestURL += "page=200&";
		requestURL += this.apiTerm + "=" + access_token;
        return requestURL;
}

meetup.grab = async function(req, res) {
	var requestURL = await this.getRequestUrl(req);
	var options = {
	    uri: requestURL,
	    json: true 
	};

	return rp(options)
	    .then(function (data) {
	        return data;
	    })
	    .catch(function (err) {
		    res.send({"error!":err.statusCode + err.body});
	    });
}

module.exports = meetup;

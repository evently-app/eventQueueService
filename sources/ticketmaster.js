const Geohash = require( '@parellin/geohash' );
var zipcodes = require('zipcodes');
var request = require('request');
var SourceConstructor = require('../classes/sourceConstructor');

var ticketmaster = new SourceConstructor({
	url : "https://app.ticketmaster.com/discovery/v2/events.json?", 
	apiTerm: "apikey", 
    token: process.env.TICKETMASTER_API_KEY, 
    paramMap: {"city": "city"}, 
    apiName: 'Ticketmaster',

    formatEvents: function (res){
    	var formattedEvents = []
    	var responseSize = Object.keys(res["_embedded"]["events"]).length;
    	for(var i = 0; i<responseSize; i++){

    		try{
    			var locationInfo = {};
    			locationInfo = zipcodes.lookup(res["_embedded"]["events"][i]["_embedded"]["venues"][0]["postalCode"]);

			    var event = {
			    	eventName: res["_embedded"]["events"][i]["name"],
			    	startTime: res["_embedded"]["events"][i]["dates"]["dateTime"],
				    endTime: null,
				    ticketUrl: res["_embedded"]["events"][i]["url"],
				    id: res["_embedded"]["events"][i]["id"],
				    tags: ["ticketmaster"],
				    imageUrl: res["_embedded"]["events"][i]["images"],
				    latitude: locationInfo.latitude,
				    longitude: locationInfo.longitude
			    }

			    formattedEvents.push(event);
			}
			catch(err){
	    		console.log("An event from ticketmaster does not have all required fields.\n"+err.message);
			}
		}
		return formattedEvents;
    }
  });

ticketmaster.getRequestUrl = function(req) {
	var requestURL = this.url;
	var sourceParams = this.mapToSourceParams(req.params);

	for (const [key, value] of Object.entries(sourceParams)) {
		if(key != longitude && key != latitude){
			requestURL += key + "=" + value + '&';
		}
	}

	//convert to geohash 
	requestURL += 'geoPoint=' + Geohash.encode(req.params.latitude, -req.params.longitude, 7) + '&'
	//add api key 
	requestURL += this.apiTerm + "=" + this.token;

	return requestURL;
}

module.exports = ticketmaster;
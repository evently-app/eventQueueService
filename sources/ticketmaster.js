const Geohash = require( '@parellin/geohash' );
var zipcodes = require('zipcodes');
var request = require('request');
var moment = require('moment')
var SourceConstructor = require('../classes/sourceconstructor');

var ticketmaster = new SourceConstructor({
	url : "https://app.ticketmaster.com/discovery/v2/events.json?", 
	apiTerm: "apikey", 
    token: process.env.TICKETMASTER_API_KEY || "dysge4sSXLgsagQgVKabG3bRcV4qbCrq", 
    paramMap: {"city": "city"}, 
    apiName: 'Ticketmaster',

    formatEvents: function (res){
    	var formattedEvents = []
    	var responseSize = Object.keys(res["_embedded"]["events"]).length;
    	//temporarily only loading 5 events 
    	for(var i = 0; i<5; i++){

    		try{
    			var locationInfo = {};
    			locationInfo = zipcodes.lookup(res["_embedded"]["events"][i]["_embedded"]["venues"][0]["postalCode"]);

    			if(res["_embedded"]["events"][i]["dates"]["start"]["dateTime"]== undefined){
    				console.log("No start time found. Ignoring event.");
    				continue; 
    			}

			    var event = {
			    	eventName: res["_embedded"]["events"][i]["name"],
			    	startTime: moment(res["_embedded"]["events"][i]["dates"]["start"]["dateTime"]).format(),
				    endTime: null,
				    ticketUrl: res["_embedded"]["events"][i]["url"],
				    sourceId: res["_embedded"]["events"][i]["id"],
				    tags: ["ticketmaster"],
				    imageUrl: res["_embedded"]["events"][i]["images"][0]["url"],
				    latitude: locationInfo.latitude,
						longitude: locationInfo.longitude,
						source:'Ticketmaster', //has to be same as super's apiName
						id: 'Ticketmaster' + res["_embedded"]["events"][i]["id"] //has to be same as this.source + this.sourceId
					}
					
					if(!event.startTime || event.startTime === 'Invalid date') {
						console.log('Ticketmaster Object\'s date could not be converted to moment format')
						continue;
					}

			    event.tags = tags; 

			    var tags = []; 
			    tags.push(res["_embedded"]["events"][i]["classifications"][0]["segment"]["name"]);
			    tags.push(res["_embedded"]["events"][i]["classifications"][0]["genre"]["name"]); 
			    tags.push(res["_embedded"]["events"][i]["classifications"][0]["subGenre"]["name"]);

			    event.tags = tags; 
			    formattedEvents.push(event);
				}
				catch(err){
	    		console.log("An event from ticketmaster does not have all required fields.\n"+err.message);
				}
			}
			console.log("Ticketmaster returned and array of size: " + formattedEvents.length)
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
	requestURL += 'geoPoint=' + Geohash.encode(req.params.latitude, req.params.longitude, 7) + '&'
	//add api key 
	requestURL += this.apiTerm + "=" + this.token;

	return requestURL;
}

module.exports = ticketmaster;
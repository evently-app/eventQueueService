var moment = require('moment')
var rp = require('request-promise')

meetup = {}

//returns True if function has no "undefined" value, 
meetup.isValidEvent = function(event) {
    try {
        // check if any fields we try to retrieve from data are invalid
        for (const [key, value] of Object.entries(event)){
            try {
                if (typeof(value) == "undefined"){ // as opposed to null when the field is valid but has no info
                    throw "The source field involving " + key + "is invalid";
                }
            }
            catch (err){
                console.log(err);
                return false;
            }
        }
        return true;
    } catch(err) {
        return false;
    }
}

//function that takes in event of type meetup event object, returns
//a promise that resolves to the same event in the format we want it to be.
//guaranteed to return null or formatted event.
meetup.formatEvent = async function(res) {
    try{
        var event = {
            eventName: res["name"],
            startTime: moment(res["local_date"] + " " + res["local_time"]).format(),
            startTimestamp: moment(res["local_date"] + " " + res["local_time"]).unix(),
            postingTime : moment().format(),
            postingTimestamp: moment().unix(),
            endTime: null,
            description: res["description"] || null,
            ticketUrl: res["link"],
            sourceId: res["id"],
            tags: ["meetup"],
            imageUrl: null, //stock photos.
            latitude: res["venue"]["lat"],
            longitude: res["venue"]["lon"],
            source:'Meetup', //has to be same as super's apiName
            id: 'Meetup' + res["id"], //has to be same as this.source + this.sourceId
            venue: res["venue"]["name"]
        }
        //time check.
        if(!event.startTime || event.startTime === 'Invalid date') {
            console.log('Meetup Object\'s date could not be converted to moment format')
            return null;
        }
    }
    catch(err){
        console.log("An event from meetup does not have all required fields.\n"+err.message);
        return null;
    }	


    if (meetup.isValidEvent(event)) {
        return event;
    }

    console.log("Not a valid event! Undefined properties.") 
    return null;
}

//scrapeUrl is the method that returns a promise that
//resolves to url to get the events from.
meetup.scrapeUrl = async function() {
    var refreshRequest = "https://secure.meetup.com/oauth2/access?"
		+ "client_id=" + process.env.MEETUP_CLIENT_ID  
		+ "&client_secret=" + process.env.MEETUP_SECRET
		+ "&grant_type=refresh_token&refresh_token=" + process.env.MEETUP_REFRESH_TOKEN


	var refreshResponse = await rp.post({uri: refreshRequest, json: true}); 
	var access_token = refreshResponse.access_token

	var url = "https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&";

	// Set to New Haven, Yale area. Can change.
	url += "lat=41.3163&"; 
    url += "lon=-72.9223&"; 
    url += "page=200&";

	url += "access_token=" + access_token;

	console.log("Meetup URL is: " + url) //debugging purpose, comment out.
	return url;
}

//function that takes a url, sends a request, gets events, formats and returns
//them. 
meetup.scrapePage = async function(url) {
	try {
		//get request from the page.
        var response = await rp.get({uri: url, json: true});
		if (response.events == null || response.events.length == 0) {
			console.log("Page <" + url + "> has no events" );
			return [];
		}

		//Format all events in parallel.
        var formattedEventRequests = [];
		for (var i = 0; i < response.events.length; i++) {
			formattedEventRequests.push(meetup.formatEvent(response.events[i]));
		}
		var formattedEventsWithNull = await Promise.all(formattedEventRequests);

		//Remove all nulls.
		var formattedEvents = [];
		for (var i = 0; i < formattedEventsWithNull.length; i++) {
			if (formattedEventsWithNull[i] != null)
			formattedEvents.push(formattedEventsWithNull[i]);
		}

        console.log("Completed page: " + url)
		return formattedEvents;
	} catch(err) {
        console.log("Error occurred in getting url: " + url);
        console.log(err);
		return [];
	}
}

//Function that returns a promise that resolves to a list of all events from meetup.
//Determined by meetup's scrapeUrl - can be set to 
meetup.scrape = async function() { 
	const scrapeUrl = await meetup.scrapeUrl()

    var response = await meetup.scrapePage(scrapeUrl)

	//after all pages are done, flatten them.
    var toReturn = []; //flatten the list.
    for (var i = 0; i < response.length; i++) {
        if (response[i] != null) {
            toReturn.push(response[i]);
        }
    }
    console.log("Meetup scraped " + toReturn.length + " events");
	return toReturn;
}


module.exports = meetup;
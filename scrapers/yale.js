var moment = require('moment')
var rp = require('request-promise')

yale = {}

//returns True if function has no "undefined" value, 
yale.isValidEvent = function(event) {
    try {
        // check if any fields we try to retrieve from data are invalid
        for (const [key, value] of Object.entries(event)){
            try {
                if (typeof(value) == undefined){ // as opposed to null when the field is valid but has no info
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

//function that takes in event of type yale event object, returns
//a promise that resolves to the same event in the format we want it to be.
//guaranteed to return null or formatted event.
yale.formatEvent = async function(res) {
    try{
        var event = {
            eventName: res["summary"],
            startTime: moment(res["start"]["utcdate"]).format(),
            startTimestamp: moment(res["start"]["utcdate"]).unix(),
            postingTime : moment().format(),
            postingTimestamp: moment().unix(),
            endTime: moment(res["end"]["utcdate"]).format(),
            entTimestamp: moment(res["end"]["utcdate"]).unix(),
            description: res["description"] || null,
            ticketUrl: res["eventlink"],
            sourceId: res["name"].substring(4, res["name"].length - 4),
            tags: ["yale"],
            imageUrl: null, //stock photos.
            latitude: "41.3108",
            longitude: "-72.9273",
            source:'Yale', //has to be same as super's apiName
            id: 'Yale' + res["name"].substring(4, res["name"].length - 4), //has to be same as this.source + this.sourceId
            venue: res["location"]["address"]
        }
        //time check.
        if(!event.startTime || event.startTime === 'Invalid date') {
            console.log('Yale Object\'s date could not be converted to moment format')
            return null;
        }

        var hasImg = false;
        for (var i = 0; i < res["xproperties"].length; i++) {
            if ("X-BEDEWORK-IMAGE" in res["xproperties"][i]) {
                event.imageUrl = res["xproperties"][i]["X-BEDEWORK-IMAGE"]["values"]["text"];
                hasImg = true;
                break;
            }
        }
        if (!hasImg)
            return null;
        console.log(event.id);
        console.log(res["name"])
    }
    catch(err){
        console.log("An event from yale does not have all required fields.\n"+err.message);
        return null;
    }	


    if (yale.isValidEvent(event)) {
        return event;
    }

    console.log("Not a valid event! Undefined properties.") 
    return null;
}

//scrapeUrl is the method that returns a promise that
//resolves to url to get the events from.
yale.scrapeUrl = async function() {
    var url = "http://calendar.yale.edu/feeder/main/eventsFeed.do?f=y&sort=dtstart.utc:asc&"
    url += "fexpr=((categories.href!=%22/public/.bedework/categories/_Ongoing%22)%20and%20"
    url += "(categories.href!=%22/public/.bedework/categories/_yale_arts_org_off-calendar%22))%20and%20"
    url += "(entity_type=%22event%22%7Centity_type=%22todo%22)&skinName=list-json&count=500";

	console.log("Yale URL is: " + url) //debugging purpose, comment out.
	return url;
}

//function that takes a url, sends a request, gets events, formats and returns
//them. 
yale.scrapePage = async function(url) {
	try {
		//get request from the page.
        var response = await rp.get({uri: url, json: true});
        response = response.bwEventList;
		if (response.events == null || response.events.length == 0) {
			console.log("Page <" + url + "> has no events" );
			return [];
		}

		//Format all events in parallel.
        var formattedEventRequests = [];
		for (var i = 0; i < response.events.length; i++) {
			formattedEventRequests.push(yale.formatEvent(response.events[i]));
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

//Function that returns a promise that resolves to a list of all events from yale.
//Determined by yale's scrapeUrl - can be set to 
yale.scrape = async function() { 
	const scrapeUrl = await yale.scrapeUrl()

    var response = await yale.scrapePage(scrapeUrl)

	//after all pages are done, flatten them.
    var toReturn = []; //flatten the list.
    for (var i = 0; i < response.length; i++) {
        if (response[i] != null) {
            toReturn.push(response[i]);
        }
    }
    console.log("Yale scraped " + toReturn.length + " events");
	return toReturn;
}


module.exports = yale;
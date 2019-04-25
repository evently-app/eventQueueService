var moment = require('moment')
var rp = require('request-promise')

eventbrite = {}

//takes in a list of lower case strings, and returns a list of tags that description matches with
eventbrite.tag = function(description) {
    if (description == null) {
        return [];
    }
    const tagMap = {
        "free" : "Free",
        "party" : "Party",
        "show" : "Performance", "perform" : "Performance", 
        "music" : "Music", "dj" : "Music", "hip hop" : "Music",
        "bar" : "Bar/Lounge", "lounge" : "Bar/Lounge", 
        "kids" : "Family Friendly", "family" : "Family Friendly",
        "expo" : "Conference", "conference" : "Conference",
        "art" : "Art/Culture", "culture" : "Art/Culture",
        "festival" : "Festival", "fair" : "Festival",
        "education" : "Educational", "seminar" : "Educational", "professor" : "Educational"
    }
    var tags = []
    for (var [key, value] of Object.entries(tagMap)){
        if (description.includes(key)) {
            tags.push(value);
        }
    }
    return tags;
}

//returns True if function has no "undefined" value, 
eventbrite.isValidEvent = function(event) {
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

//function that takes in event of type eventbrite event object, returns
//a promise that resolves to the same event in the format we want it to be.
//guaranteed to return null or formatted event.
eventbrite.formatEvent = async function(res) {
    try{
        var event = {
            eventName: res["name"]["text"],
            startTime: moment(res["start"]["local"]).format(),
            startTimestamp: moment(res["start"]["local"]).unix(),
            postingTime : moment().format(),
            postingTimestamp: moment().unix(),
            endTime: moment(res["end"]["local"]).format(),
            endTimestamp: moment(res["end"]["local"]).unix(),
            description: res["description"]["text"],
            ticketUrl: res["url"],
            sourceId: res["id"],
            tags: ["eventbrite"],
            imageUrl: res["logo"]["original"]["url"],
            latitude: res["venue"]["address"]["latitude"],
            longitude: res["venue"]["address"]["longitude"],
            source:'Eventbrite', //has to be same as super's apiName
            id: 'Eventbrite' + res["id"], //has to be same as this.source + this.sourceId
            venue: res["venue"]["name"]
        }
        //time check.
        if(!event.startTime || event.startTime === 'Invalid date') {
            console.log('Eventbrite Object\'s date could not be converted to moment format')
            return null;
        }

        //set tags.
        event.tags = eventbrite.tag(event.description.toLowerCase()); 
    }
    catch(err){
        console.log("An event from eventbrite does not have all required fields.\n"+err.message);
        return null;
    }	


    if (eventbrite.isValidEvent(event)) {
        return event;
    }

    console.log("Not a valid event! Undefined properties.") 
    return null;
}

//scrapeUrl is the method that returns a promise that
//resolves to url to get the events from.
eventbrite.scrapeUrl = async function() {
	var url = "https://www.eventbriteapi.com/v3/events/search/?";

	// Set to New Haven, Yale area. Can change.
	url += "location.latitude=41.3163&"; 
	url += "location.longitude=-72.9223&"; 

	url += "expand=venue,logo&";
	url += "token=" + process.env.EVENTBRITE_API_KEY;

	console.log("Eventbrite URL is: " + url) //debugging purpose, comment out.
	return url;
}

//function that takes a url, sends a request, gets events, formats and returns
//them. 
eventbrite.scrapePage = async function(url) {
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
			formattedEventRequests.push(eventbrite.formatEvent(response.events[i]));
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

//Function that returns a promise that resolves to a list of all events from eventbrite.
//Determined by eventbrite's scrapeUrl - can be set to 
eventbrite.scrape = async function() { 
	const scrapeUrl = await eventbrite.scrapeUrl()

	//Send first request to eventbrite. Get number of pages.
	var pageSize = 0
	var pageCount = 0
	try {
        var firstResponse = await rp.get({uri: scrapeUrl, json: true})
		pageSize = firstResponse.pagination.page_size;
		pageCount = firstResponse.pagination.page_count;
	} catch(err) {
		console.log("Didn't get first response from eventbrite. Error: " + err)
		return [];
	}
	if (pageSize == null || pageSize === 0 || pageCount == null || pageCount == 0) {
		return [];
	}

    console.log("Eventbrite has " + pageCount + " pages")
	//Get events from all urls.
    var pageRequests = []
    for (var page = 1; page <= pageCount; page++) { //one indexed!
        var pageUrl = scrapeUrl + "&page=" + page;
        pageRequests.push(eventbrite.scrapePage(pageUrl));
    } 
    var pageResponses = await Promise.all(pageRequests); //list of lists.

	//after all pages are done, flatten them.
    var toReturn = []; //flatten the list.
    for (var i = 0; i < pageResponses.length; i++) {
        if (pageResponses[i] == null) {
            continue;
        }
        for (var j = 0; j < pageResponses[i].length; j++) {
            if (pageResponses[i][j] != null) {
                toReturn.push(pageResponses[i][j]);
            }
        }
    }
    console.log("Eventbrite scraped " + toReturn.length + " events");
	return toReturn;
}


module.exports = eventbrite;
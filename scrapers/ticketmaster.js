var moment = require('moment')
var rp = require('request-promise')
const Geohash = require( '@parellin/geohash' );

ticketmaster = {}

//returns True if function has no "undefined" value, 
ticketmaster.isValidEvent = function(event) {
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

//function that takes in event of type ticketmaster event object, returns
//a promise that resolves to the same event in the format we want it to be.
//guaranteed to return null or formatted event.
ticketmaster.formatEvent = async function(res) {
    try{
        var event = { //change this part.
            eventName: res["name"],
            startTime: moment(res["dates"]["start"]["dateTime"]).format(),
            startTimestamp: moment(res["dates"]["start"]["dateTime"]).unix(),
            postingTime : moment().format(),
            postingTimestamp: moment().unix(),
			endTime: null,
			ticketUrl: res["url"],
			sourceId: res["id"],
			tags: ["ticketmaster"],
			imageUrl: res["images"][0]["url"],
			latitude: res['_embedded']['venues'][0]['location']['latitude'],
			longitude: res['_embedded']['venues'][0]['location']['longitude'],
			source:'Ticketmaster', //has to be same as super's apiName
            id: 'Ticketmaster' + res["id"], //has to be same as this.source + this.sourceId
            venue: res['_embedded']['venues'][0]['name'] //might limit events.
        }
        //time check.
        if(!event.startTime || event.startTime === 'Invalid date') {
            console.log('Ticketmaster Object\'s date could not be converted to moment format')
            return null;
        }

    }
    catch(err){
        console.log("An event from ticketmaster does not have all required fields.\n"+err.message);
        return null;
    }	

    if (ticketmaster.isValidEvent(event)) {
        return event;
    }

    console.log("Not a valid event! Undefined properties.") 
    return null;
}

//scrapeUrl is the method that returns a promise that
//resolves to url to get the events from.
ticketmaster.scrapeUrl = async function() {
	var url = "https://app.ticketmaster.com/discovery/v2/events.json?";

    // Set to New Haven, Yale area. Can change.
    url += 'geoPoint=' + Geohash.encode(-72.9, 41.3,  7) + '&';
    url += 'radius=' + '35' + '&';

	url += "apikey=" + process.env.TICKETMASTER_API_KEY; //auth

	console.log("Ticketmaster URL is: " + url) //debugging purpose, comment out.
	return url;
}

//function that takes a url, sends a request, gets events, formats and returns
//them. 
ticketmaster.scrapePage = async function(url) {
	try {
		//get request from the page.
        var response = await rp.get({uri: url, json: true});
		if (response._embedded.events == null || response._embedded.events.length == 0) {
			console.log("Page <" + url + "> has no events" );
			return [];
		}

		//Format all events in parallel.
        var formattedEventRequests = [];
		for (var i = 0; i < response._embedded.events.length; i++) {
			formattedEventRequests.push(ticketmaster.formatEvent(response._embedded.events[i]));
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

ticketmaster.timer =  function(ms) {
    return new Promise(res => setTimeout(res, ms));
}

//Function that returns a promise that resolves to a list of all events from ticketmaster.
//Determined by ticketmaster's scrapeUrl - can be set to 
ticketmaster.scrape = async function() { 
	const scrapeUrl = await ticketmaster.scrapeUrl()

	//Send first request to ticketmaster. Get number of pages.
	var pageSize = 0
	var pageCount = 0
	try {
        var firstResponse = await rp.get({uri: scrapeUrl, json: true})
		pageSize = firstResponse.page.size; //number of elements per page
		pageCount = firstResponse.page.totalPages; //number of pages
	} catch(err) {
		console.log("Didn't get first response from Ticketmaster.")
		return [];
	}
	if (pageSize == null || pageSize === 0 || pageCount == null || pageCount == 0) {
		return [];
	}

	//Get events from all urls.
    var pageRequests = []
    for (var page = 1; page < pageCount; page++) { //one indexed!
        await ticketmaster.timer(3000);
        var pageUrl = scrapeUrl + "&page=" + page;
        pageRequests.push(ticketmaster.scrapePage(pageUrl));
    } 
    var pageResponses = await Promise.all(pageRequests); //list of lists.

	//after all pages are done, flatten them.
    var toReturn = []; //flatten the list.
    for (let i = 0; i < pageResponses.length; i++) {
        if (pageResponses[i] == null) {
            continue;
        }
        for (var j = 0; j < pageResponses[i].length; j++) {
            if (pageResponses[i][j] != null) {
                toReturn.push(pageResponses[i][j]);
            }
        }
    }
    console.log("Ticketmaster scraped " + toReturn.length + " events");
	return toReturn;
}


module.exports = ticketmaster;
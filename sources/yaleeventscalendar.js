var SourceConstructor = require('../classes/sourceconstructor');
var yaleEventsCalendar = new SourceConstructor({
		url : "http://calendar.yale.edu/feeder/main/eventsFeed.do?f=y&sort=dtstart.utc:asc&fexpr=((categories.href!=%22/\
		public/.bedework/categories/_Ongoing%22)%20and%20(categories.href!=%22/public/.bedework/categories/_yale_arts_org\
		_off-calendar%22))%20and%20(entity_type=%22event%22%7Centity_type=%22todo%22)&skinName=list-json&", 
	    apiName: 'YaleEventsCalendar',
	    formatEvents: function(res) {
	    	var formattedEvents = [];
	    	var responseSize = Object.keys(res["events"]).length;
	    	for(var i = 0; i<responseSize; i++) {
		    	
		    	var event = {
			    	eventName: res["events"][i]["summary"],
				    startTime: null,
				    endTime: null,
				    ticketUrl: null,
				    id: res["events"][i]["guid"], // I think this should be the right id?
				    tags: ["yaleEventsCalendar"],
				    latitude: null,
				    longitude: null
		    	}

		    	// check if any fields we try to retrieve from data are invalid
		    	for (const [key, value] of Object.entries(event)){
		    		if (value == undefined){ // as opposed to null when the field is valid but has no info
		    			throw "The source field involving " + key + "is invalid";
		    		}
		    	}

			    formattedEvents.push(event);

    		}
    		return formattedEvents;
	    }
    });
yaleEventsCalendar.getRequestUrl = function(req){
		var requestURL = this.url;

		return requestURL;
}

module.exports = yaleEventsCalendar;
var utils = require('../utils.js')
var sort = require('./sort.js')

//Firebase Initialization
const admin = require('firebase-admin')
const GeoFirestore = require('geofirestore')

var db = admin.firestore()

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore.GeoFirestore(db)


var eventsQueue = {

	/*Parameters:
	  data: Receive this as in a post request from the client.
	  data:  {
			    "coordinates": {
			        "latitude": "41.310726",
			        "longitude": "-72.929916"
			    },
			    "userPreferences": {
			        "lit": 0.3,
			        "Active": 0.5,
			        "relaxing": 0.8,
			        "outdoor": 0.6,
			        "cultural": 0.9
			    },
			    "radius": "20",
			    "eventType": "eventbrite/ticketmaster/...",
			    "userid": "xxxxxxx"
			}
	   This function first queries from eventPool using geofirestore to pull events
	   that are in a specific radium from user's location. Then it adds scores to each 
	   events based on user preference and event distance from user. At last, it uploads
	   those scored event to eventQueue subcollection in firestore.
	*/
	ping: async function(data,res){
		var geoEventData = []
		var eventData = []

		const queue = db.collection('users').doc(data.userid).collection("eventQueue")
		const eventsFromQueue = await queue.get()

		// Create a GeoCollection reference
		const geoEventLocations = geofirestore.collection('eventsLocations')

		// get nearby events
		const query = geoEventLocations.near({ center: new admin.firestore.GeoPoint(parseFloat(data.coordinates.latitude), 
			parseFloat(data.coordinates.longitude)), radius: parseFloat(data.radius)})

		// Get query (as Promise)
		var geoEventData = await query.get()


		for (var i = 0; i < geoEventData.docs.length; i++){
			var eventsColl = db.collection('events')
			await eventsColl.doc(geoEventData.docs[i].id).get()
				.then(function(doc) {
				    if (doc.exists) {
				    	eventData.push(doc.data())
				    } else {
				        // doc.data() will be undefined in this case
				        console.log("No such document!")
				    }
				})
				.catch(function(error) {
				    console.log("Error getting document:", error)
				})
		}
		var scoredEvents = sort.addScore(eventData,data)

		const batch = db.batch()
		for (var i = 0; i < eventData.length; i++){
			batch.set(queue.doc(eventData[i].id), eventData[i])
		}

		await batch.commit()
			.then(function(){console.log("Done")})
		
		res.send(eventData.slice(0,19))
	},
}




module.exports = eventsQueue;


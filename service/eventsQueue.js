var utils = require("../utils.js")
var sort = require("./sort.js")

//Firebase Initialization
const admin = require("firebase-admin")
const GeoFirestore = require("geofirestore")

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
	ping: async function(data, res) {
		// var geoEventData = []
		// var eventData = []

		// temp mock preference
		data.userPreferences = {
			lit: 0.3,
			Active: 0.5,
			relaxing: 0.8,
			outdoor: 0.6,
			cultural: 0.9
		}

		const queue = db
			.collection("users")
			.doc(data.userid)
			.collection("eventQueue")

		// const eventsFromQueue = await queue.get()

		// Create a GeoCollection reference
		const geoEventLocations = geofirestore.collection("eventsLocations")

		// get nearby events
		const query = geoEventLocations.near({
			center: new admin.firestore.GeoPoint(
				parseFloat(data.coordinates.latitude),
				parseFloat(data.coordinates.longitude)
			),
			radius: parseFloat(data.radius)
		})

		// Get query (as Promise)
		// var geoEventData = await query.get()
		let eventsData = []

		const eventsRef = db.collection("events")
		query
			.get()
			.then(snapshot => {
				let promises = []
				snapshot.forEach(doc => {
					promises.push(eventsRef.doc(doc.id).get())
				})

				Promise.all(promises)
					.then(data => {
						data.forEach(doc => {
							if (doc.exists) eventsData.push({ ...doc.data(), swiped: false })
						})

						const scoredEvents = sort.addScore(eventsData, data)

						const batch = db.batch()
						scoredEvents.forEach(event => {
							batch.set(queue.doc(event.id), event)
						})

						batch.commit().then(() => {
							console.log("done")
							res.sendStatus(200)
						})
					})
					.catch(error => console.log("Error getting documents:", error))
			})
			.catch(error => console.log("Error getting documents:", error))
	}
}

module.exports = eventsQueue

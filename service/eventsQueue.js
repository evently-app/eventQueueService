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
			    "radius": "20",
			    "userid": "xxxxxxx"
			}
	   This function first queries from eventPool using geofirestore to pull events
	   that are in a specific radium from user's location. Then it adds scores to each 
	   events based on user preference and event distance from user. At last, it uploads
	   those scored event to eventQueue subcollection in firestore.
	*/
	ping: async function({ uid, coordinates, radius }, res) {

		const defaultPreferences = {
			lit: 1.0,
			Active: 1.0,
			relaxing: 1.0,
			outdoor: 1.0,
			cultural: 1.0
		}

		const userRef = db.collection("users").doc(uid)
		const user = await userRef.get()

		const userPreferences = {
			...defaultPreferences,
			...user.data().preferences
		}

		const queueRef = db
			.collection("users")
			.doc(uid)
			.collection("eventQueue")

		// Create a GeoCollection reference
		const geoEventLocations = geofirestore.collection("eventsLocations")

		// get nearby events
		const { latitude, longitude } = coordinates
		const query = geoEventLocations.near({
			center: new admin.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),
			radius: parseFloat(radius)
		})

		// Get query (as Promise)
		// var geoEventData = await query.get()
		let eventsData = []
		const queue = await queueRef.get()

		let currentQueue = {}
		queue.forEach(doc => (currentQueue[doc.id] = doc))

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

						const scoredEvents = sort.addScore(eventsData, { userPreferences, coordinates })

						var endChunkIdx = 400 // batching in chunks of 400
						var pastPointer = 0
						var batches = []
						while (1){
							endPt = (scoredEvents.length < endChunkIdx) ? scoredEvents.length : endChunkIdx

							let batch = db.batch()
							for (var i = pastPointer; i < endPt; i++){
								if (!(scoredEvents[i].id in currentQueue)) batch.set(queueRef.doc(scoredEvents[i].id), scoredEvents[i])
							}

							batches.push(batch.commit())

							if (endPt == scoredEvents.length){
								break
							}
							pastPointer = endPt
							endChunkIdx = endPt + 400
						}

						Promise.all(batches)
							.then(() => {
							console.log("Event queue data stored for user:", uid)
							res.sendStatus(200)
						})

					})
					.catch(error => console.log("Error getting documents:", error))
			})
			.catch(error => console.log("Error getting documents:", error))
	}
}

module.exports = eventsQueue

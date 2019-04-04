var utils = require('../utils.js')
var sort = require('./sort.js')

//Firebase Initialization
const admin = require('firebase-admin')
const GeoFirestore = require('geofirestore')

var db = admin.firestore()

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore.GeoFirestore(db)


var eventsQueue = {
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

		const batch = db.batch()
		for (var i = 0; i < eventData.length; i++){
			batch.set(queue.doc(eventData[i].id), eventData[i])
		}

		await batch.commit()
			.then(function(){console.log("Done")})

		res.send(eventData.slice(0,19))
		// sortAndSend(eventData.slice(0,19), res, data)
	},
}




module.exports = eventsQueue;


var utils = require('../utils.js')
var sort = require('./sort.js')

//Firebase Initialization
const admin = require('firebase-admin')
const GeoFirestore = require('geofirestore')
// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: "evently-db",
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//     privateKey: process.env.FIREBASE_KEY.replace(/\\n/g, '\n')
//   }),
//   databaseURL: 'https://evently-db.firebaseio.com'
// });
var db = admin.firestore()

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore.GeoFirestore(db)

// Create a GeoCollection reference
const geoEventLocations = geofirestore.collection('eventsLocations')

var events = {
	grab: async function(data,res){
		var geoEventData = []
		var eventData = []

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

		// filter out events by type
		eventData = eventData.filter(function(value){
			return value.tags.includes(data.eventType)
		})
	}
}




module.exports = events;


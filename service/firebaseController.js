//Firebase Controller for all firebase related tasks.
const moment = require('moment')
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "evently-db",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: 'https://evently-db.firebaseio.com'
});
var db = admin.firestore();

// Create a GeoFirestore reference
const GeoFirestore = require('geofirestore')
const geofirestore = new GeoFirestore.GeoFirestore(db);
const geoEventLocations = geofirestore.collection('eventsLocations');

module.exports = {
    db: db, //sends initialized db.
    cleanUpEvents: async function() {
        try {
            var eventsRef = db.collection('events')
            const currentTimestamp = moment().unix()
            var oldEventsQuery = eventsRef.where("startTimestamp", "<", currentTimestamp)
            oldEventsQuery.get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    doc.ref.delete();
                });
            });
        }
        catch (err) {
            console.log(err)
        }
    },
    addEvent: async function(formattedEvent) {
        //events collection addition
        var eventId = formattedEvent.id
        var eventRef = db.collection('events').doc(eventId)
        eventRef.set(formattedEvent); //async set, no await

        //geoFirestore addition
        geoEventLocations.doc(eventId).set({
            coordinates: new admin.firestore.GeoPoint(parseFloat(formattedEvent.latitude), parseFloat(formattedEvent.longitude))
        });
    }
};
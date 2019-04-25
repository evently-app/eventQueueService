# eventQueueService
Deployed Page: http://event-queue-service.herokuapp.com/

1. Clone Repositary.
2. Add environment Variables. Required Env Variables are: 
FIREBASE_KEY
FIREBASE_CLIENT_EMAIL
EVENTBRITE_API_KEY
TICKETMASTER_API_KEY
MEETUP_REFRESH_TOKEN
MEETUP_CLIENT_ID
MEETUP_SECRET
3. Read api/routes for possible routes to call.

## Scraping
Collects data from various APIs, stores in "events" collection (name can be modified in service/events.js).
All scrapers (one per API) are stored in scrapers directory, extendable, add .scrape method to exported api which
returns a promise that resolves to a list of events, formatted according to Database Schema. 

Scraping can be called using scrape route on local host or deployed page.
Automatic cron jobs set on: https://cron-job.org/en/

To see current version running on heroku: 
https://event-queue-service.herokuapp.com/grab_events/40/-74/1000km

## service/eventQueue.js
This is the file that handles populating user's queue of events.
Function ping accepts request from front end and queries from eventPool using geofirestore to pull events that are in a specific radium from user's location. Then it adds scores to each events based on user preference and event distance from user. At last, it uploads those scored event to eventQueue subcollection in firestore. 

## service/sort.js
This is the file that determine the ordering of each user's event card. Function addScore is the main function that takes in a collection of events and user data, returning all events with scores. Right now the score is based on **user's distance to event's location, user's preference, and event's quality(length of description)**. addPreferenceScore, addDistanceScore, and addDescQualityScore are the functions that calculate corresponding scores.

To run locally:
1. Run `yarn install`.
2. Run `yarn start`
3. Call any routes in localhost:3000. (Can go to deployed page.)

To run mocha/chai tests:
    run mocha test.

# eventQueueService

To run locally:
1. Run `npm install`.
2. Set env variables for sources (e.g EVENTBRITE_API_KEY for eventbrite)
3. Ensure that you have the firebase service account key file in the eventQueueService directory.
4. Run `npm start`
5. Go to http://localhost:3000/grab_events/41.310726/-72.929916/5km (params are latitude, longitude, radius respectively)


To run mocha/chai tests (once they're ready):
1. run `./node_modules/mocha/bin/mocha`
2. To run a specific test `./node_modules/mocha/bin/mocha -f [test name]'

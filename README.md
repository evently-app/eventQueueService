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

To run locally:
1. Run `yarn install`.
2. Run `yarn start`
3. Call any routes in localhost:3000. (Can go to deployed page.)

To run mocha/chai tests (once they're ready):
    run mocha test.

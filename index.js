var falcor = require('falcor');
var falcorExpress = require('falcor-express');
var Model = falcor.Model;
var $error = Model.error;

var Router = require('falcor-router');
var request = require('request-promise');

var express = require('express');
var _ = require('lodash');
var app = express();

// Have Express request index.html
app.use(express.static('.'));

var $ref = falcor.Model.ref;

// Same data that was used in the view for our
// events, but this time on a simple object
// and not a Falcor model.
var eventsData = {
    locationsById: {
        1: {
            city: "Salt Lake City",
            state: "Utah"
        },
        2: {
            city: "Las Vegas",
            state: "Nevada"
        },
        3: {
            city: "Minneapolis",
            state: "Minnesota"
        },
        4: {
            city: "Walker Creek Ranch",
            state: "California"
        }
    },
    events: [
        {
            name: "ng-conf",
            description: "The world's best Angular Conference",
            location: $ref('locationsById[1]')
        },
        {
            name: "React Rally",
            description: "Conference focusing on Facebook's React",
            location: $ref('locationsById[1]')
        },
        {
            name: "ng-Vegas",
            description: "Two days jam-packed with Angular goodness with a focus on Angular 2",
            location: $ref('locationsById[2]')
        },
        {
            name: "Midwest JS",
            description: "Midwest JS is a premier technology conference focused on the JavaScript ecosystem.",
            location: $ref('locationsById[3]')
        },
        {
            name: "NodeConf",
            description: "NodeConf is the longest running community driven conference for the Node community.",
            location: $ref('locationsById[4]')
        }
    ]
}

// We setup a model.json endpoint and pass it a dataSourceRoute which
// allows us to serve a router. Various route requests can be sent to the
// router to request whatever data is required
app.use('/model.json', falcorExpress.dataSourceRoute(function(req, res) {
    return new Router([
        {
            route: "forces[{integers:indices}]",
            get: function(pathset) {
                console.log("forces requested");
                console.log("forces pathSet", pathset);
                return request({uri: "http://data.police.uk/api/forces", json: true}).then(function(resp) {
                    console.log('forces response was ', resp);
                    return pathset.indices.map(function(index){
                        var id = resp[index].id;
                        var r =  {
                            path: ['forces', index],
                            value: resp[index] ? $ref(["forcesById", id]): $error("Unknown force index")
                        };
                        console.log("index", index);
                        console.log("index/id is", id);
                        console.log("r is:", r);
                        return r;
                    });
                });
            }
        },
        {
            route: "forcesById[{keys:ids}]['id', 'name']",
            get: function(pathset) {
                console.log("forcesById pathSet", pathset);
                var attributes = pathset[2];
                console.log("attributes", attributes);
                return request({uri: "http://data.police.uk/api/forces", json: true}).then(function(resp) {
                    console.log('forcesById response was ', resp);
                    var forcesById = _.keyBy(resp, 'id');
                    var resultCollection = pathset.ids.map(function(id){
                        console.log('forcesById, looking up', id);
                        console.log('focesById in ', forcesById);
                        var r =  attributes.map(function(attribute) {
                            var myid = id;
                            return {
                                path: ['forcesById', myid, attribute],
                                value: forcesById[myid] ? forcesById[myid][attribute] : $error("Unknown force id: " + myid)
                            };
                        });
                        console.log("r is:", JSON.stringify(r, null, 2));
                        return r;
                    });

                    return _.flatten(resultCollection);
                });
            }
        },
        {
            // Our route needs to match a pattern of integers that
            // are used as eventIds
            route: "events[{integers:eventIds}]['name', 'description', 'location']",
            get: function(pathSet) {

                var results = [];

                // Above we specified an eventIds identifier that is an
                // array of ids which we can loop over
                pathSet.eventIds.forEach(function(eventId) {

                    // Next, an array of key names that map is held at pathSet[2]
                    pathSet[2].map(function(key) {

                        // We find the event the cooresponds to the current eventId
                        var eventRecord = eventsData.events[eventId];

                        // Finally we push a path/value object onto
                        // the results array
                        results.push({
                            path: ['events', eventId, key],
                            value: eventRecord[key]
                        });
                    });
                });

                return results;
            }
        },
        {
            // Our route needs to match a pattern of integers that
            // are used as locationId
            route: "locationsById[{integers:locationId}]['city', 'state']",
            get: function(pathSet) {

                var results = [];

                // Above we specified an locationId identifier that is an
                // array of ids which we can loop over
                pathSet.locationId.forEach(function(locationId) {

                    // Next, an array of key names that map is held at pathSet[2]
                    pathSet[2].map(function(key) {

                        // We find the event the cooresponds to the current locationId
                        var location = eventsData.locationsById[locationId];

                        // Finally we push a path/value object onto
                        // the results array
                        results.push({
                            path: ['locationsById', locationId, key],
                            value: location[key]
                        });
                    });
                });

                return results;
            }
        },
        {
            // The search route will match keys that match the names
            // of our conferences
            route: "events.byName[{keys}]['description']",
            get: function(pathSet) {

                var results = [];
                // We want to loop over each of the conference names provided
                pathSet[2].forEach(function(name) {
                    // We also want to loop over all the events on the data object
                    // and check if conference name is there
                    eventsData.events.forEach(function(event) {
                        if(_.includes(event, name)) {
                            results.push({
                                path: ['events','byName', name, 'description'],
                                value: event.description
                            });
                        }
                    });
                });
                return results;
            }
        }
    ]);
}));

app.listen(3000);
console.log("Listening on http://localhost:3000");

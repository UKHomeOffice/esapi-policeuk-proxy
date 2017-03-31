var falcor = require('falcor');
var falcorExpress = require('falcor-express');
var Model = falcor.Model;
var $error = Model.error;

var Router = require('falcor-router');
var realrequest = require('request-promise');
//var cacherequest = require('request-promise-cache');

var express = require('express');
var _ = require('lodash');
var app = express();

// Have Express request index.html
app.use(express.static('.'));

var $ref = falcor.Model.ref;
var pprint = function(o) { return JSON.stringify(o, null, 2);};

var cache = {};

var request = function(r) {
    if (cache[r.uri]) {
        console.log("found " + r.uri + " in cache");
        return cache[r.uri];
    }
    console.log("Should request " + pprint(r));
    var p = realrequest(r);
    cache[r.uri] = p;
    p.then(function(resp) {
        console.log(r.uri + " resp " + pprint(resp));
    });
    return p;
};

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
                return request({uri: "http://data.police.uk/api/forces", json: true}).then(function(resp) {
                    return pathset.indices.map(function(index){
                        var id = resp[index].id;
                        var r =  {
                            path: ['forces', index],
                            value: resp[index] ? $ref(["forcesById", id]): $error("Unknown force index" + index)
                        };
                        return r;
                    });
                });
            }
        },
        {
            route: "forces.byName[{keys}][\"name\"]",
            get: function(pathset) {
                console.log(pprint(pathset));

                return request({uri: "http://data.police.uk/api/forces", json: true}).then(function(resp) {
                    var searchTerms = pathset[2];
                    var ret = [];
                    searchTerms.forEach(function(searchTerm) {
                        resp.forEach(function(force) {
                            if (force.id.includes(searchTerm))
                            {
                                var path = {
                                    path: ['forces', 'byName', searchTerm, 'name' ],
                                    value: force.name 
                                };
                                ret.push(path);
                                var path2 = {
                                    path: ['forces', 'byName', searchTerm, 'id' ],
                                    value: force.id
                                };
                                ret.push(path2);
                            }
                        });
                    });
                    console.log("forces.byName return: " + pprint(ret));
                    return ret;
                });
            }
        },
        {
            route: "forcesById[{keys:ids}]['id', 'name']",
            get: function(pathset) {
                var attributes = pathset[2];
                return request({uri: "http://data.police.uk/api/forces", json: true}).then(function(resp) {
                    var forcesById = _.keyBy(resp, 'id');
                    var resultCollection = pathset.ids.map(function(id){
                        return attributes.map(function(attribute) {
                            var myid = id;
                            return {
                                path: ['forcesById', myid, attribute],
                                value: forcesById[myid] ? forcesById[myid][attribute] : null //$error("Unknown force id: " + myid)
                            };
                        });
                    });

                    return _.flatten(resultCollection);
                });
            }
        },
        {
            route: "forcesById[{keys:ids}]['description']",
            get: function(pathset) {
                console.log("forcesById[{keys:ids}]['description']");
                var attributes = [pathset[2]];
                console.log("attributes requested: ", attributes);
                var resultPromiseCollection = pathset.ids.map(function(id){
                    return request({uri: "http://data.police.uk/api/forces/" + id, json: true}).then(function(resp) {
                        console.log("forcesById detail:" + id, resp);
                        return attributes.map(function(attribute) {
                            return {
                                path: ['forcesById', id, attribute],
                                value: resp[attribute]
                            };});
                    });
                });
                return Promise.all(resultPromiseCollection).then(function(resultCollection) {
                    console.log("description return is: ", JSON.stringify(resultCollection, null, 2));
                    return _.flatten(resultCollection);
                });
            }
        },
        {
            route: "forcesById[{keys:ids}]['engagement_methods']",
            get: function(pathset){
                console.log("forcesById[{keys:ids}]['engagement_methods']");
                var r = pathset.ids.map(function(id) {
                    return {
                        path: ['forcesById', id, 'engagement_methods'],
                        value: $ref(['engagementMethods', id])
                    };
                });
                console.log("forcesById[{keys:ids}]['engagement_methods'] will ret" + JSON.stringify(r, null, 2));
                return r;
            }
        },
        {
            route: "forcesById[{keys:ids}]['neighbourhoods']",
            get: function(pathset){
                console.log("forcesById[{keys:ids}]['neighbourhoods']", pathset);
                var r = pathset.ids.map(function(id) {
                    return {
                        path: ['forcesById', id, 'neighbourhoods'],
                        value: $ref(['neighbourhoodByForceId', id])
                    };
                });
                console.log("forcesById[{keys:ids}]['neighbourhoods'] will ret" + JSON.stringify(r, null, 2));
                return r;
            }
        },
        {
            route: "engagementMethods[{keys:forceIds}][{integers:idx}]['url', 'type', 'description', 'title']",
            get: function(pathset) {
                console.log("engagementMethods[{keys:forceIds}]['url', 'type', 'description', 'title']");
                var attributes = pathset[2];
                console.log("attributes requested: ", attributes);
                var resultPromiseCollection = pathset.forceIds.map(function(id){
                    console.log("requesting engmethods: " + id);
                    return request({uri: "http://data.police.uk/api/forces/" + id, json: true}).then(function(resp) {
                        console.log("engagementMethods response detail:" + id, resp);
                        var eng_methods = resp['engagement_methods'];
                        return pathset.idx.map(function(methodIdx) {
                            return attributes.map(function(attribute) {
                                var eng_method = eng_methods[methodIdx];
                                console.log("bobo", eng_method);
                                return {
                                    path: ['engagementMethods', id, methodIdx, attribute],
                                    value: eng_method[attribute]
                                };});
                        });
                    });
                });
                return Promise.all(resultPromiseCollection).then(function(resultCollection) {
                    var flatResultCollection = _.flatten(resultCollection);
                    console.log("engagement methods return is: ", JSON.stringify(flatResultCollection, null, 2));
                    return flatResultCollection;
                });
            }
        },
        {
            route: "neighbourhoodByForceId[{keys:forceIds}][{integers:neighbourhoodIndices}]",
            get: function(pathset) {
                console.log("req: neighbourhoodByForceId[{keys:forceIds}][{integers:neighbourhoodIndices}]", pathset);
                var requestPromises = pathset.forceIds.map(function(forceId) {
                    return pathset.neighbourhoodIndices.map(function(nIdx) {
                        var result = request({uri: "http://data.police.uk/api/" + forceId + "/neighbourhoods", json: true}).then(function(resp){
                            console.log("resp:neighbourhoodByForceId[{keys:forceIds}][{integers:neighbourhoodIndices}]", forceId,
                                        nIdx, JSON.stringify(resp, null, 2));
                            return {
                                path: ["neighbourhoodByForceId", forceId, nIdx],
                                value: resp[nIdx] ? $ref(['neighbourhoodByForceIdAndCode', forceId, resp[nIdx].id]) : null //$error("No neighbourhood for idx: " + nIdx)
                            };
                        });
                        return result;
                    });
                });
                var flatRequestPromises = _.flatten(requestPromises);
                return Promise.all(flatRequestPromises).then(function(allResps) {
                    console.log("Neighborhood all", JSON.stringify(allResps, null, 2)) ;
                    return allResps;
                });
            }
        },
        {
            route: "neighbourhoodByForceIdAndCode[{keys:forceIds}][{keys:nCodes}]['location']",
            get: function(pathset) {
                var rCollection = pathset.forceIds.map(function(forceId) {
                    return pathset.nCodes.map(function(nCode) {
                        return {
                            path: ["neighbourhoodByForceIdAndCode", forceId, nCode, 'location'],
                            value: $ref(['locationsByForceIdAndCode', forceId, nCode ])
                        };
                    });
                });
                return _.flatten(rCollection);
            }
        },
        {
            route: "neighbourhoodByForceIdAndCode[{keys:forceIds}][{keys:nCodes}]['people']",
            get: function(pathset) {
                var rCollection = pathset.forceIds.map(function(forceId) {
                    return pathset.nCodes.map(function(nCode) {
                        return {
                            path: ["neighbourhoodByForceIdAndCode", forceId, nCode, 'people'],
                            value: $ref(['peopleByForceIdAndNeighbourhoodCode', forceId, nCode ])
                        };
                    });
                });
                return _.flatten(rCollection);
            }
        },
        {
            route: "peopleByForceIdAndNeighbourhoodCode[{keys:forceIds}][{keys:nCodes}][{integers:personIndices}]['bio', 'rank', 'name']",
            get: function(pathset) {
                var attributes = pathset[4];
                console.log("\n\npathset: ", pprint(pathset));
                console.log("attributes", pprint(attributes));
                var requestPromises = pathset.forceIds.map(function(forceId) {
                    return pathset.nCodes.map(function(nCode) {
                        var result = request({uri: "http://data.police.uk/api/" + forceId + "/" + nCode + "/people", json: true}).then(function(resp){
                            var peopleAttributePaths = pathset.personIndices.map(function(idx) {
                                console.log("respTo" + pathset[0], forceId, nCode, pprint(pathset), pprint(resp));
                                return attributes.map(function(attribute) {
                                    console.log("evaluating " + idx + " " + attribute, resp);
                                    var attrValue = resp[idx] && resp[idx][attribute] ? resp[idx][attribute] :null; // $error("No person." + attribute + " for " + pprint(pathset) +  "for idx: " + idx);
                                    console.log("will set", attrValue);
                                    var individualAttr = {
                                        path: ["peopleByForceIdAndNeighbourhoodCode", forceId, nCode, idx, attribute],
                                        value: attrValue
                                    };
                                    console.log(pathset[0], "individualAttr", individualAttr);
                                    return individualAttr;
                                });
                            });
                            return _.flatten(peopleAttributePaths);
                        });
                        return result;
                    });
                });
                var flatRequestPromises = _.flatten(requestPromises);
                return Promise.all(flatRequestPromises).then(function(allResps) {
                    var flattened = _.flatten(allResps);
                    console.log("peopleByForceIdAndNeighbourhoodCode allResps: ", pprint(flattened)) ;
                    return flattened;
                });
            }
        },
        {
            route: "neighbourhoodByForceIdAndCode[{keys:forceIds}][{keys:nCodes}]['url_force','name','population']",
            get: function(pathset) {
                var requestPromises = pathset.forceIds.map(function(forceId) {
                    return pathset.nCodes.map(function(nCode) {
                        var result = request({uri: "http://data.police.uk/api/" + forceId + "/" + nCode, json: true}).then(function(resp){
                            console.log("neighbourhoods by ForceId and code", pathset, resp);
                            var respByCode = _.keyBy('id');
                            return {
                                path: ["neighbourhoodByForceIdAndCode", forceId, nCode],
                                value: resp[nIdx] ? $ref(['neighbourhoodByForceIdAndCode', forceId, resp[nIdx].id]) : $error("No neighbourhood for idx: " + nIdx)
                            };
                        });
                        return result;
                    });
                });
                var flatRequestPromises = _.flatten(requestPromises);
                return Promise.all(flatRequestPromises).then(function(allResps) {
                    console.log("Neighborhood all", allResps) ;
                    return allResps;
                });
            }
        },
        {
            route: "locationsByForceIdAndCode[{keys:forceIds}][{keys:nCodes}][{integers:indices}]['name', 'longitude', 'postcode', 'address', 'latitude', 'type', 'description']",
            get: function(pathset){
                var attributes = pathset[4];
                console.log("locAttrs", attributes);
                var requestPromises = pathset.forceIds.map(function(forceId) {
                    return pathset.nCodes.map(function(nCode) {
                        var result = request({uri: "http://data.police.uk/api/" + forceId + "/" + nCode, json: true}).then(function(resp){
                            console.log("locationsByForceIdAndCode pathset:", pathset,"response:", resp, attributes);
                            var individualAttrs = pathset.indices.map(function(idx) {
                                return attributes.map(function(attribute) {
                                    return {
                                        path: ["locationsByForceIdAndCode", forceId, nCode, idx, attribute],
                                        value: resp['locations'][idx][attribute]
                                    };
                                });
                            });
                            var flattenedAttrs =  _.flatten(individualAttrs);
                            console.log('flattenedAttrs', flattenedAttrs);
                            return flattenedAttrs;
                        });
                        console.log("tfw", result);
                        return result;
                    });
                });
                console.log("wtf, ", requestPromises);
                var flatRequestPromises = _.flatten(requestPromises);
                console.log("wtflat, ", flatRequestPromises);
                return Promise.all(flatRequestPromises).then(function(allResps) {
                    console.log("Neighborhood all", allResps) ;
                    return _.flatten(allResps);
                });
            }
        }
        //     // Our route needs to match a pattern of integers that
        //     // are used as eventIds
        //     route: "events[{integers:eventIds}]['name', 'description', 'location']",
        //     get: function(pathSet) {

        //         var results = [];

        //         // Above we specified an eventIds identifier that is an
        //         // array of ids which we can loop over
        //         pathSet.eventIds.forEach(function(eventId) {

        //             // Next, an array of key names that map is held at pathSet[2]
        //             pathSet[2].map(function(key) {

        //                 // We find the event the cooresponds to the current eventId
        //                 var eventRecord = eventsData.events[eventId];

        //                 // Finally we push a path/value object onto
        //                 // the results array
        //                 results.push({
        //                     path: ['events', eventId, key],
        //                     value: eventRecord[key]
        //                 });
        //             });
        //         });

        //         return results;
        //     }
        // },
        // {
        //     // Our route needs to match a pattern of integers that
        //     // are used as locationId
        //     route: "locationsById[{integers:locationId}]['city', 'state']",
        //     get: function(pathSet) {

        //         var results = [];

        //         // Above we specified an locationId identifier that is an
        //         // array of ids which we can loop over
        //         pathSet.locationId.forEach(function(locationId) {

        //             // Next, an array of key names that map is held at pathSet[2]
        //             pathSet[2].map(function(key) {

        //                 // We find the event the cooresponds to the current locationId
        //                 var location = eventsData.locationsById[locationId];

        //                 // Finally we push a path/value object onto
        //                 // the results array
        //                 results.push({
        //                     path: ['locationsById', locationId, key],
        //                     value: location[key]
        //                 });
        //             });
        //         });

        //         return results;
        //     }
        // },
        // {
        //     // The search route will match keys that match the names
        //     // of our conferences
        //     route: "events.byName[{keys}]['description']",
        //     get: function(pathSet) {

        //         var results = [];
        //         // We want to loop over each of the conference names provided
        //         pathSet[2].forEach(function(name) {
        //             // We also want to loop over all the events on the data object
        //             // and check if conference name is there
        //             eventsData.events.forEach(function(event) {
        //                 if(_.includes(event, name)) {
        //                     results.push({
        //                         path: ['events','byName', name, 'description'],
        //                         value: event.description
        //                     });
        //                 }
        //             });
        //         });
        //         return results;
        //     }
        // }
    ]);
}));

app.listen(3000);
console.log("Listening on http://localhost:3000");

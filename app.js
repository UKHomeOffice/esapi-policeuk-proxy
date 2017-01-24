/* --------------------------------------

 Below are several examples of hooking
 up a Falcor model and getting data from
 it to be displayed on the screen.

 Step 1: A local model cache is setup
 with some data. Data is requested with
 various get requests to the model.

 Step 2: We change the model over to a
 JSON Graph with references so that data
 isn't duplicated.

 Step 3: We move the data  over to the
 server to be served from a Falcor Router.
 This step is currently setup to run but
 you can comment it out and start from
 Step 1 by uncommenting the appropriate
 pieces.

 ----------------------------------------*/

var $ref = falcor.Model.ref;
/* === Step 1 === */

// We can prime the model cache with a new falcor.Model
var localmodel = new falcor.Model({
    cache: {
        forcesById: {
            "avon-and-somerset": {
                name: "Avon and Somerset Constabulary",
                description: {$type: "ref", value: ["dbi", "avon-and-somerset"]}
            },
            "city-of-london": {
                name: "City of London Police",
                description: $ref("dbi['city-of-london']")
            }
        },
        dbi: {
            "avon-and-somerset": "Yo yo",
            "city-of-london": "City Police",
            "city-of-madup": "mdup"
        },
        forces: [
            $ref("forcesById['city-of-london']") ,
            $ref("forcesById['avon-and-somerset']")
        ]
    }
});


/*  Demos */

// We can set the model to have a data source that is retrieved from the backend
// over HTTP by setting the soure to be a falcor.HttpDataSource.
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});
// model
//   // .get(["events", {from: 0, to: 2}, ["name", "description"]])
//   .get([
//     "events", {from: 0, to: 2}, ["name", "description"]
//   ],
//   [
//     'events', {from: 0, to: 2}, 'location', ['city', 'state']
//   ])
// model
//   .get(["events", {from: 0, to: 2}, ["name", "description", "location"],["city", "state"]])

//   .then(function(response) {
//     document.getElementById('event-data').innerHTML = JSON.stringify(response, null, 2);
//   });

// Search example - we pass "Midwest JS" which will be looked up
model
    .get(["forces", "byName", ["lei"], ["id", "name"]])
    .then(function(response) {
        document.getElementById('forces-data').innerHTML = JSON.stringify(response, null, 2);
    }, function(err) {
        console.log(err);
        // console.log(err['0'].value.message);
    });

// model
//     .get(["forces", {from: 0, to: 3}, ["id", "name"]])
//     .then(function(response) {
//         document.getElementById('forces-data').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         // console.log(err['0'].value.message);
//     });

// model
//     .get(["forcesById", ["avon-and-somerset", "city-of-london", "metropolitan"], ["name", "description"]])
//     .then(function(response) {
//         document.getElementById('forces-data2').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data2').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });


//// peopleByForceIdAndNeighbourhoodCode
// model
//     .get(
//         ["peopleByForceIdAndNeighbourhoodCode", ["leicestershire"], ["NC04"], [0, 1, 2], ["bio", "name", "rank"]])
//         //,"latitude", "longitude", "type", "population"]])
//     .then(function(response) {
//         console.log('got response', response);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log('error', err);
//         document.getElementById('forces-data3').innerHTML = "<h3>Error</h3>" + JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });
// model
//     .get(
//         ["forces", {from: 0, to: 5}, ["name", "description", "neighbourhoods"], {from: 0, to: 5}, ["id", "name"]]
//     )
//     .then(function(response) {
//         console.log('got response', response);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log('error', err);
//         document.getElementById('forces-data3').innerHTML = "<h3>Error</h3>" + JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });


// /// WIP two paths
// model
//     .get(
//         [["forcesById"], ["leicestershire"] , ["neighbourhoods"], "NC04", ["people"], ["bio"]],
//         ["forces",{from: 5, to: 10}, ["neighbourhoods", "description", "id"], {from: 0, to: 1}, ["location"], [0],
//          ["address","postcode"]])
//         //,"latitude", "longitude", "type", "population"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });

// stations by forceidx and neighbourhood, kinda works
// model
//     .get(
//         ["force",
//          [2, 3, 7], ["neighbourhoods", "description", "id"], [0, 1, 2], ["location"], [0],
//          ["address","postcode", "population"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });


// GOOD simple details from all forces (step 2 - add description)
// model
//     .get(
//         ["forces", {from: 0, to: 20} , ["id", "name", "neighbourhoods"]]) //, [0], ["location"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });

// GOOD stations by forceid and neighbourhood
// model
//     .get(
//         ["neighbourhoodByForceId",
//          ["metropolitan", "leicestershire"], {from: 0, to: 2}, ["location"], [0],
//          ["address","postcode", "population"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });


//// getting to people via force.neighbourhood
// model
//     .get(
//         ["forces", {from: 0, to: 5}, ["id","name","neighbourhoods"], {from: 0, to: 2},["people"],{from: 0, to: 1}, ["bio", "name", "rank"]],
//         ["forces", {from: 8, to: 10}, ["id","name", "neighbourhoods"], {from: 0, to: 2},["people"],{from: 0, to: 1}, ["bio", "name", "rank"]])
// //,"latitude", "longitude", "type", "population"]])
//     .then(function(response) {
//         console.log('got response', response);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log('error', err);
//         document.getElementById('forces-data3').innerHTML = "<h3>Error</h3>" + JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });

// GOOD! locations work directly
// model
//     .get(
//         ["locationsByForceIdAndCode", ["leicestershire"], ["NC04"] , [0], ["address","postcode", "population"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });


// 500 ! gives 500
// model
//     .get(
//         ["forces", {from: 0, to: 5}, ["id", "description", "engagement_methods"], 1, ["url"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data2').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });

var first6 = {from: 0, to: 5};

// GOOD! show multiple paths
// model
//     .get(
//         ["forcesById", ["leicestershire", "metropolitan"], ["name", "description", "id"]],
//         ["forcesById", ["metropolitan"], ["engagement_methods"], ["url"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data2').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });

// model
//     .get(
//         ["forces", {from: 0, to: 5}, ["name", "description", "id"]])
//      //   ["forces", {from: 0, to: 5}, ["engagement_methods"], ["url"]])
//     .then(function(response) {
//         document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
//     }, function(err) {
//         console.log(err);
//         document.getElementById('forces-data2').innerHTML = JSON.stringify(err, null, 2);
//         // console.log(err['0'].value.message);
//     });

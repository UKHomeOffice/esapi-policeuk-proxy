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

var localmodelid = new falcor.Model({
    cache: {
        forcesById: {
            "44": {
                name: "Avon and Somerset Constabulary",
                description: [ {$type: "ref", value: ["dbi", 44]}]
            },
            "45": {
                name: "City of London Police",
                description: [$ref("dbi[44]")]
            }
        },
        dbi: {
            "45": "Yo yo",
            "44": "City Police",
            "city-of-madup": "mdup"
        },
        forces: [
            $ref("forcesById['44']") ,
            $ref("forcesById['45']")
        ]
    }
});
// localmodel
// // We want the name and description values for the first three items
// // from the data model
// // .get(["events", {from: 0, to: 2}, ["name", "description"]])
// // To get the values on the "location" object, we need to pass the paths for the
// // keys on that object
//     .get(["forces", {from: 0, to: 1}, ["name", "description"]])
//     .then(function(response) {
//         document.getElementById("forces-data").innerHTML = JSON.stringify(response, null, 2);
//     });

localmodelid
// We want the name and description values for the first three items
// from the data model
// .get(["events", {from: 0, to: 2}, ["name", "description"]])
// To get the values on the "location" object, we need to pass the paths for the
// keys on that object
    .get(["forcesById", ["44", "45"], ["name", "description"]])
    .then(function(response) {
        document.getElementById("forces-data").innerHTML = JSON.stringify(response, null, 2);
    });

// model
//       // We set the value of the first occurrence of Utah to UT
//   .set(falcor.pathValue(["events", 0, "location", "state"], 'UT'))
//   .then(function(response) {
//     model
//     // What we find afterwards is that the value gets changed in one location, but not both.
//       .get(["events", {from: 0, to: 2}, ["name", "description", "location"],["city", "state"]])
//       .then(function(response) {
//         document.getElementById('event-data').innerHTML = JSON.stringify(response, null, 2);
//       });
//   });


/* === Step 2 === */

// We can use the shorthand for references with a variable

// var model = new falcor.Model({
//   cache: {
//     locationsById: {
//       1: {
//         city: "Salt Lake City",
//         state: "Utah"
//       },
//       2: {
//         city: "Las Vegas",
//         state: "Nevada"
//       },
//       3: {
//         city: "Minneapolis",
//         state: "Minnesota"
//       },
//       4: {
//         city: "Walker Creek Ranch",
//         state: "California"
//       }
//     },
//     events: [
//       {
//         name: "ng-conf",
//         description: "The world's best Angular Conference",
//         location: $ref('locationsById[1]')
//       },
//       {
//         name: "React Rally",
//         description: "Conference focusing on Facebook's React",
//         location: $ref('locationsById[1]')
//       },
//       {
//         name: "ng-Vegas",
//         description: "Two days jam-packed with Angular goodness with a focus on Angular 2",
//         location: $ref('locationsById[2]')
//       },
//       {
//         name: "Midwest JS",
//         description: "Midwest JS is a premier technology conference focused on the JavaScript ecosystem.",
//         location: $ref('locationsById[3]')
//       },
//       {
//         name: "NodeConf",
//         description: "NodeConf is the longest running community driven conference for the Node community.",
//         location: $ref('locationsById[4]')
//       }
//     ]
//   }
// });

// model
//   // Now when we set Utah to UT for the first occurrence, it is changed everywhere else
//   .set(falcor.pathValue(["events", 0, "location", "state"], 'UT'))
//   .then(function(response) {
//     model
//       .get(["events", {from: 0, to: 2}, ["name", "description", "location"],["city", "state"]])
//       .then(function(response) {
//         document.getElementById('event-data').innerHTML = JSON.stringify(response, null, 2);
//       });
//   });


/* === Step 3 === */

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
// in the events data on the server and sent back if it exists
model
    .get(["events", "byName", ["Midwest JS"], ['description']])
    .then(function(response) {
        document.getElementById('event-data').innerHTML = JSON.stringify(response, null, 2);
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

model
    .get(["forcesById", ["avon-and-somerset", "city-of-london", "metropolitan"], ["name", "description"]])
    .then(function(response) {
        document.getElementById('forces-data2').innerHTML = JSON.stringify(response, null, 2);
    }, function(err) {
        console.log(err);
        document.getElementById('forces-data2').innerHTML = JSON.stringify(err, null, 2);
        // console.log(err['0'].value.message);
    });

model
    .get(["forces", {from: 20, to: 24}, ["name", "description", "id"]])
    .then(function(response) {
        document.getElementById('forces-data3').innerHTML = JSON.stringify(response, null, 2);
    }, function(err) {
        console.log(err);
        document.getElementById('forces-data2').innerHTML = JSON.stringify(err, null, 2);
        // console.log(err['0'].value.message);
    });

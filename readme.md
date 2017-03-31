# Falcor Demo of PoliceUK

A simple discovery/spike into the viability of using Falcor to proxy an existing API at http://data.police.uk to address some of the short comings. 

We were looking at ways to better show how the data is structured. While also enabling powerful and simple query semantics that would reduce the number of requests to answer simple questions. 


## Installation

Clone the repo and then run:

    npm install
    node index.js

Navigate to localhost:3000

Demonstrations of certain queries / requests are encoded in index.js in comments. Uncomment and refresh to see them. 

## Reconized issues
This doesn't address stable sorting of the order of the various identifiers. Falcor seems to suggest having the canonical records for entities in arrays, and index them, which suggests that we'd need to keep those ids consistent to avoid breaking the graph so we'd want to look at that before taking this further. 

## License
MIT


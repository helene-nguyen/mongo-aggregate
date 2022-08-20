// In SQL : SELECT * FROM "rides"
db.rides.find();

// In SQL : SELECT f2 FROM "rides" WHERE f1 = 'APIttoresque';
db.rides.find({ f1: 'APIttoresque' });

// const { MongoClient } = require("mongodb");

// const url = 'mongodb://localhost:27017';
// const client = new MongoClient(url);


// (async function run() {
//     try {
//         // Connect the client to the server
//         await client.connect();
//         // Establish and verify connection
//         const db = client.db("oparc");
//         console.log("Connected successfully to server");

//         //const collection = db.collection('documents');
//         const findResult = await db.collection("rides").find().toArray();
//         //console.log(findResult);
//         /* équivalent en SQL :
        
//         SELECT * FROM rides;
        
//         Dans mongoDB, on va parler de collection et non de tables
        
//         */

//         const ridesCollection = db.collection('rides');

//         ridesCollection.find({ f1: "APIttoresque" }, { f2: 1, _id: 0 });

//         /* équivalent en SQL :
        
//         SELECT f2 FROM rides
//         WHERE f1 = 'APIttoresque';
        
//         */

//         ridesCollection.find({ f2: "000000000012d5e1" });

//         /* équivalent en SQL :
        
//         SELECT * FROM rides
//         WHERE f2 = '000000000012d5e1';
        
//         */


//         /*
        
//         Les étapes pour pouvoir requêter une BDD dans mongo :
        
//         1- use nom_de_la_bdd (use oparc)
//         2- l'objet "db" va représenter la BDD, on pourra la requêter
        
//         */


//         // On peut insérer n'importe quel type de format de document dans une collection
//         await ridesCollection.insertOne({f1: "les auto-DOMponneuses", f2: "000000000012d5f5", catapulte: "À rouleeeettes"});



//         // je supprime toutes les catapultes à roulettes
//         await ridesCollection.deleteMany({catapulte: "À rouleeeettes"});

//         // je modifie tous les documents qui ont la propriété catapulte avec la valeur "A rouleeeettes"
//         //await ridesCollection.updateMany({catapulte: "À rouleeeettes"},{catapulte:'toto'});


//         // je mets à jour le nom des champs
//         await ridesCollection.updateMany({}, { $rename: { f1: "event", f2: "visitor", f3: "timestamp" }});
    
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// })();

//How to know maxPool Size ?
//~import modules
import { client } from '../../app/database.js';


//^Methods
async function fetchAllRides(req, res) {
  try {
    //   await client.connect();
    const db = client.db('oparc');

    const ridesCollection = db.collection('rides');

    const findAllrides = await ridesCollection.find().toArray();

    // console.log("findAllrides: ", findAllrides);

    //   await client.close();
    // console.log('Connexion closed !');
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

async function fetchOneRide(req, res) {
  try {
    await client.connect();

    const db = client.db('oparc');

    const ridesCollection = db.collection('rides');

    const findOneride = await ridesCollection.find({ event: 'APIttoresque' }, { f2: 1, _id: 0 }).toArray();

    console.log('findOneride: ', findOneride);

    await client.close();
    // console.log('Connexion closed !');
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

async function createRide() {
  try {
    await client.connect();

    const db = client.db('oparc');    

    const ridesCollection = db.collection('rides');

    await ridesCollection.insertOne({f1: "les auto-DOMponneuses", f2: "000000000012d5f5", catapulte: "À rouleeeettes"});

    await client.close();
    // console.log('Connexion closed !');
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
  }

  async function updateMany() {
      try {
          await client.connect();
    
          const db = client.db('oparc');
    
          const ridesCollection = db.collection('rides');
    
          await ridesCollection.updateMany({}, { $rename: { f1: "event", f2: "visitor", f3: "timestamp" }});
    
          await client.close();
        } catch (err) {
          res.status(500);
          console.log(err.message);
        }
  };
  
  async function deleteMany() { 
      try {
          await client.connect();
    
          const db = client.db('oparc');
    
          const ridesCollection = db.collection('rides');
    
          await ridesCollection.deleteMany({catapulte: "À rouleeeettes"});
    
          await client.close();
        } catch (err) {
          res.status(500);
          console.log(err.message);
        }
  };

export { fetchAllRides, fetchOneRide, createRide, updateMany, deleteMany };

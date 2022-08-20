//~import modules
import { ObjectId } from 'mongodb';
import { client } from '../database.js';

//^Methods
async function fetchAllRides(req, res) {
  try {
    //^connect DB
    await client.connect();
    //^DB name
    const db = client.db('oparc');

    const collection = db.collection('rides');

    const rides = await collection.find().toArray();

    await client.close();
    // console.log('Connexion closed !');
    res.render('rides', {title: 'MongoDB Refactored', rides});
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

async function fetchOneRide(req, res) {
  try {
    await client.connect();
    const id = req.params.id;

    const db = client.db('oparc');

    const ridesCollection = db.collection('rides');

    //find by id 
    const ride = await ridesCollection.find(ObjectId(`${id}`)).toArray();
    // console.log('findOneride: ', ride);

    await client.close();
    // console.log('Connexion closed !');
    res.json({message: ride});
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

    await ridesCollection.insertOne({ f1: 'les auto-DOMponneuses', f2: '000000000012d5f5', catapulte: 'À rouleeeettes' });

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

    await ridesCollection.updateMany({}, { $rename: { f1: 'event', f2: 'visitor', f3: 'timestamp' } });

    await client.close();
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

async function deleteMany() {
  try {
    await client.connect();

    const db = client.db('oparc');

    const ridesCollection = db.collection('rides');

    await ridesCollection.deleteMany({ catapulte: 'À rouleeeettes' });

    await client.close();
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

async function fetchAllRidesByEvent(req, res) {
  try {
    
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

export {
  fetchAllRides, fetchOneRide, createRide, updateMany, deleteMany,
  fetchAllRidesByEvent};

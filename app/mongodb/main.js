//~import modules
import { client } from '../database.js';

//^Methods
async function fetchAllUsers(req, res) {
  try {
    //^connect DB
    await client.connect();
    //^DB name
    const db = client.db('test');

    const collection = db.collection('users');

    const users = await collection.find().toArray();
    // console.log("users: ", users);

    // console.log('Connexion closed !');
    res.render('home', {title: 'MongoDB Refactored', users});
  } catch (err) {
    res.status(500);
    console.log(err.message);
  }
}

export { fetchAllUsers };
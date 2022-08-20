//~import modules
import { ObjectId } from 'mongodb'; // !!!
import { client } from '../database.js';

const agg = {
  async matchResult(req, res) {
    try {
      //^connect DB
      await client.connect();
      //^DB name
      const db = client.db('oparc');
      const collection = db.collection('rides');

      //~AGGREGATE MATCH
      const result = await collection
        .aggregate([
          {
            $match: {
              // $match using it to get matching documents
              event: { $exists: true } // ask that event field exists
            }
          }
        ])
        .toArray();

      //^close client
      await client.close();
      //   console.log(result);
      res.end();
    } catch (err) {
      res.status(500);
      console.log(err.message);
    }
  },
  async getProjection(req, res) {
    try {
      //^connect DB
      await client.connect();
      //^DB name
      const db = client.db('oparc');
      const collection = db.collection('rides');

      //~AGGREGATE PROJECT
      // console.time('RESULT PROJECT');
      const result = await collection
        .aggregate([
          // for each document, 3 new fields
          // 2 first fields will receive a new name
          // the last field use dateFromString on f3 field to turn it into ISODate, an easy format to manipulate
          {
            $project: {
              //! Define a 'new' array
              Event: '$event', // rename "event" with "Event" name
              Visitor: '$visitor', // rename "visitor" with "Visitor"
              Time: {
                // turn into specific type
                $dateFromString: {
                  // convert the date
                  dateString: '$timestamp'
                }
              },
              f2: true //! here we want f2 (in our table, it doesn't exist)
            }
          },
          {
            $match: {
              // Event: {$exists: true} // we want "event" field
              Event: 'APIttoresque'
            }
          }
        ])
        .toArray();

      //   console.timeEnd('RESULT PROJECT');

      //^close client
      await client.close();
      console.log(result);
      res.end();
    } catch (err) {
      res.status(500);
      console.log(err.message);
    }
  },
  async getGroupProjection(req, res) {
    try {
      //^connect DB
      await client.connect();
      //^DB name
      const db = client.db('oparc');
      const collection = db.collection('rides');

      //   console.time('AGREGATE OPERATIONS');
      const result = await collection
        .aggregate([
          {
            $match: {
              event: { $exists: true } //display event field
            }
          },
          {
            $project: {
              //! SELECT
              Event: '$event', //& info we want
              Visitor: '$visitor'
            }
          },
          {
            $group: {
              //! GROUP BY
              _id: '$Event', //& we group by id
              //and the value is the event name
              count: {
                //! COUNT
                $sum: 1 //& sum of documents in each group !
              }
            }
          },
          {
            $match: {
              //! WHERE
              count: {
                $gt: 50600 //& the count is greater than (COMPARISON OPERATOR)
              }
            }
          },
          {
            $sort: {
              //! ORDER BY
              count: -1 //& DESC
            }
          },
          {
            $project: {
              // new projection //! NEW SELECT
              attraction_name: '$_id', //& replace the _id
              count: 1, // we want to keep the field "count"
              _id: 0 // filter "_id" field to not display it
            }
          }
        ])
        .toArray();

      //   console.timeEnd('AGREGATE OPERATIONS');
      console.log(result);
      //^close client
      await client.close();
      res.render('rides', { title: 'Rides', result });
    } catch (err) {
      res.status(500);
      console.log(err.message);
    }
  },
  async getVisitorsByDateNoAgg(req, res) {
    try {
      //^connect DB
      await client.connect();
      //^DB name
      const db = client.db('oparc');
      const collection = db.collection('rides');

      //& Visitors on June and September
      const resultVisitJune = await ridesCollection.countDocuments({ timestamp: { $regex: /^2019-06/ } });
      const resultVisitSeptember = await collection.countDocuments({ timestamp: { $regex: /^2019-09/ } });

      //^close client
      await client.close();

      console.log('Visitors month of June (no agg) : ', resultVisitJune);
      console.log('Visitors month of September (no agg) : ', resultVisitSeptember);

      res.end();
    } catch (err) {
      res.status(500);
      console.log(err.message);
    }
  },
  async getVisitorsByDateAgg(req, res) {
    try {
      //^connect DB
      await client.connect();
      //^DB name
      const db = client.db('oparc');
      const collection = db.collection('rides');

      //& Visitor on June with aggregate
      const resultVisitJuneAgg = await collection
        .aggregate([
          {
            $project: {
              Visitor: '$visitor',
              Date: {
                $dateFromString: {
                  dateString: '$timestamp'
                }
              },
              _id: 0
            }
          },
          {
            $group: {
              _id: {
                month: { $month: '$Date' },
                year: { $year: '$Date' }
              },
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              '_id.month': { $in: [6, 9] }, //! To match multiple condition
              //   source : https://stackoverflow.com/questions/39389823/mongodb-query-with-multiple-conditions
              '_id.year': { $eq: 2019 }
            }
          },
          {
            $project: {
              date: '$_id',
              count: 1,
              _id: 0
            }
          }
        ])
        .toArray();

      console.log('___________________________________________________________');

      console.log('Visitors more precisely : ', resultVisitJuneAgg);
      // {
      //   $match: {
      //     date: {
      //       $gte: new Date('2019-06-01'),
      //       $lt: new Date('2019-07-01')
      //     }
      //   }
      // },
      console.log('___________________________________________________________');

      //^close client
      await client.close();
      res.end();
    } catch (err) {
      res.status(500);
      console.log(err.message);
    }
  },
  async categories(req, res) {
    try {
      //^connect DB
      await client.connect();
      //^DB name
      const db = client.db('oparc');
      const collection = db.collection('rides');

      //& Categories
      console.time('Performance category :');
      const resultCategoryAgg = await collection
        .aggregate([
          {
            //^create a projection
            $project: {
              _id: 0,
              Name: '$event',
              Category: {
                //! another way to write => $eq: { if: {}, then:,else: }
                $cond: [
                  { $in: ['$event', ['ES6 Tycoon', 'APIttoresque', 'Promise cuitée', 'le Node Express']] },
                  'Children',
                  {
                    $cond: [
                      { $in: ['$event', ['Sequelizigzag', 'Eventropico', 'le Manoir des Vieux Clous', 'Coup de fourchette']] },
                      'Family',
                      { $cond: [{ $in: ['$event', [`la Tour de l'Array`, 'les auto-DOMponneuses', `l'EJS Palace`]] }, 'Sensations', ''] }
                    ]
                  }
                ]
              }
            }
          },
          //^Group by category
          {
            $group: {
              _id: '$Category',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              Category: '$_id',
              count: 1,
              _id: 0
            }
          }
        ])
        .toArray();

      console.log('Visitors by category : ', resultCategoryAgg);
      console.timeEnd('Performance category :');

      //^close client
      await client.close();
      res.end();
    } catch (err) {
      res.status(500);
      console.log(err.message);
    }
  }
};

export { agg };

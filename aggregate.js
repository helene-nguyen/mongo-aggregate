//~import module
import { log } from 'console';
import { MongoClient } from 'mongodb';

//~connexion
const url = 'mongodb://127.0.0.1:27017';

const client = new MongoClient(url);

(async function() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    const db = client.db('oparc');
    console.log('Connected successfully to server');

    const ridesCollection = db.collection('rides');

    //~AGGREGATE MATCH
    // const result = await ridesCollection.aggregate([
    //     {
    //         $match: { // $match est utilisé pour indiquer qu'on souhaite les documents correspondant à ce qui suit
    //             event: {$exists: true} // je demande que le champs "event" existe
    //         }
    //     }
    // ]).toArray();

    // console.log(result);

    //~AGGREGATE PROJECT
    // console.time('RESULT PROJECT');
    // const resultProject = await ridesCollection
    //   .aggregate([
    //     // retournera, pour chaque document, 3 nouveaux champs
    //     // les 2 premiers sont renommés en stockant la valeur de l'ancienne clé dans la nouvelle
    //     // le 3e utilise la fonction dateFromString sur le champ f3 pour le transformer en ISODate, un format de date facile à manipuler
    //     {
    //       $project: {
    //         //! On définit un 'nouveau' tableau
    //         Event: '$f1', // on veut renommer le champ "f1" en "event"
    //         Visitor: "$f2", // on veut renommer le champ "f2" en "visitor"
    //         time: { // on souhaite que le champ time soit dans un type spécifique
    //             $dateFromString: { // on souhaite convertir une date
    //                 dateString: "$f3"
    //             }
    //         },
    //         f2: true //! ici on va vouloir
    //       }
    //     },
    //     {
    //       $match: {
    //         // $match est utilisé pour indiquer qu'on souhaite les documents correspondant à ce qui suit
    //         // Event: {$exists: true} // je demande que le champs "event" existe
    //         Event: 'APIttoresque' // on ne cherche
    //       }
    //     }
    //   ])
    //   .toArray();

    // console.log(resultProject);
    //   console.timeEnd('RESULT PROJECT');

    //~AGGREGATE GROUP
    // const resultGroup = await ridesCollection.aggregate([
    //     {
    //         $match: { // $match est utilisé pour indiquer qu'on souhaite les documents correspondant à ce qui suit
    //             event: {$exists: true} // je demande que le champs "event" existe
    //         }
    //     },
    //     {
    //         $project: {
    //             event: "$f1", // on veut renommer le champ "f1" en "event"
    //             visitor: "$f2", // on veut renommer le champ "f2" en "visitor"
    //             time: { // on souhaite que le champ time soit dans un type spécifique
    //                 $dateFromString: { // on souhaite convertir une date depuis un string
    //                     dateString: "$f3"
    //                 }
    //             }
    //         }
    //     }
    // ]).toArray();

    // console.log(resultGroup);

    // //~AGGREGATE OPERATIONS
    //   console.time('AGREGATE OPERATIONS');
    // const resultOperations = await ridesCollection.aggregate([
    //     {
    //       //on souhaite conserver les documetns qui ont le champ f1 présent
    //       $match: {
    //         f1: { $exists: true }
    //       }
    //     },
    //     {
    //       $project: { //! SELECT
    //         event: '$f1', //& info we want
    //         visitor: '$f2'
    //       }
    //     },
    //     {
    //       $group: { //! GROUP BY
    //             _id: '$event', //& we group by id
    //         //and the value is the event name
    //         count: { //! COUNT
    //           $sum: 1 //& sum of documents in each group !
    //         }
    //       }
    //     },
    //     {
    //       $match: { //! WHERE
    //         count: {
    //           $gt: 50600 //& the count is greater than (COMPARISON OPERATOR)
    //         }
    //       }
    //     },
    //     {
    //       $sort: { //! ORDER BY
    //         count: -1 //& DESC
    //       }
    //     },
    //     {
    //         $project:{ // j'effectue une nouvelle projection //! NEW SELECT
    //             "name of attraction":"$_id", //& replace the _id
    //             count:1, // je précise que je souhaite conserver le champs "count"
    //             _id:0 // je filtre le champ "_id" pour qu'il n'apparaisse plus
    //         }
    //     }
    //   ]).toArray();

    //   console.log('resultOperations: ', resultOperations);
    //   console.timeEnd('AGREGATE OPERATIONS');

    //^_____________CHALLENGE

    //& Visitors on June and September

    const resultVisitJune = await ridesCollection.countDocuments({ f3: { $regex: /^2019-06/ } });
    const resultVisitSeptember = await ridesCollection.countDocuments({ f3: { $regex: /^2019-09/ } });

    console.log('Visitors month of June (no agg) : ', resultVisitJune);
    console.log('Visitors month of September (no agg) : ', resultVisitSeptember);

    //& Visitor on June with aggregate
    const resultVisitJuneAgg = await ridesCollection
      .aggregate([
        {
          $project: {
            Visitor: '$f2',
            Date: {
              $dateFromString: {
                dateString: '$f3'
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
        }
      ])
      .toArray();

    console.log(resultVisitJuneAgg);

    //& Categories
    console.time('Performance category :');
    const resultCategoryAgg = await ridesCollection
      .aggregate([
        {
          $project: {
            _id: 0,
            Name: '$f1',
            Category: {
              //! another way to write => $eq: { if: {}, then:,else: }
                $cond: [{ $in: ['$f1', ['ES6 Tycoon', 'APIttoresque', 'Promise cuitée', 'le Node Express']] }, 'Children',
                {$cond: [{ $in: ['$f1', ['Sequelizigzag', 'Eventropico', 'le Manoir des Vieux Clous', 'Coup de fourchette']] }, 'Family',
                {$cond: [{ $in: ['$f1', [ `la Tour de l'Array`, 'les auto-DOMponneuses', `l'EJS Palace`]] }, 'Sensations',
                '']}]}]
            }
          }
        }
      ])
      .toArray();

    console.log('resultCategoryAgg: ', resultCategoryAgg);
    console.timeEnd('Performance category :');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
})();

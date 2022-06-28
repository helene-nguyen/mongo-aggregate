// ça, c'est très long, parce que le fichier est volumineux
const data = require('./data.json');

// surtout, croyez ce message sur parole, n'affichez jamais le contenu d'une variable trop volumineuse dans la console, c'est le décès assuré
console.log("Fichier chargé !");

// chronométrons quelques accès à des données disséminées dans l'array

// constat : le premier accès prend beaucoup plus de temps (le temps exact dépend du premier index accédé)
// les suivants sont très rapides

console.time('accès à data[2000000]');
// ça, c'est très rapide parce que data a été chargé en mémoire
console.table(data[2000000]);
console.timeEnd('accès à data[2000000]');


console.time('accès à data[0]');
// ça, c'est très rapide parce que data a été chargé en mémoire
console.table(data[0]);
console.timeEnd('accès à data[0]');


console.time('accès à data[154782]');
// ça, c'est très rapide parce que data a été chargé en mémoire
console.table(data[154782]);
console.timeEnd('accès à data[154782]');

// révélation de ouf guedin : nos données n'ayant pas d'id, c'est finalement l'indice dans le tableau qui joue ce rôle
// => un array a donc un premier index d'office !

// mais c'est rarement suffisant

// si je veux afficher le parcours d'un visiteur (les attractions qu'il a visitées)
// je dois parcourir manuellement tout l'array à la recherche des lignes qui m'intéressent
// temps moyen constaté : 100ms, ça passe encore
// par contre, s'il faut le faire, disons, 30 fois par minute => ça prendrait en tout 3 secondes par minute
// rien que pour rechercher ces infos simples, c'est énorme

console.time('filtrage sur f2');
const visitorEvents = data.filter(ride => ride.f2 === '0000000000163e2f');
console.timeEnd('filtrage sur f2');

// anticipons le filtrage sur f2, créons un index basé sur ce champ
const dataByF2 = {};
// je parcours mes données, et pour chaque "ligne", je l'indexe par son champ f2
data.forEach(ride => {
    if (!dataByF2[ride.f2]) {
        dataByF2[ride.f2] = [];
    }
    dataByF2[ride.f2].push(ride);
});

// reproduisons l'expérience avec ce nouvel index

console.time('filtrage sur f2 avec index');
const visitorEventsWithIndex = dataByF2['0000000000163e2f'];
console.timeEnd('filtrage sur f2 avec index');

// je sais pas pour moi, mais chez moi, ça prend 116ms sans index et 0.02ms avec index, c'est donc 5800 fois plus rapide
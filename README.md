# MongoDB

Dariusz vous a envoyé une extraction des données de son parc sur l'année 2019. Il s'agit de toutes les visites d'attraction de chaque visiteur de chaque jour de l'année :boom:

Et si on en profitait pour mettre MongoDB à l'épreuve ?

## Mise en place

**Prérequis** : avoir une version récente (v4) de Mongo installée (pour vérifier, `mongod --version`) et l'utilitaire `tar` (pour vérifier, `tar --version`) mais normalement, il l'est par défaut sur le Téléporteur.

- Extraire le fichier de données de l'archive fournie : `tar zxvf ./data.tar.gz`
- Lancer notre server MongoDB : `sudo service mongod start`
- Importer le fichier de données dans une base MongoDB : `mongoimport --collection=rides --db=oparc --jsonArray --type=json data.json`

Si la base de données n'existe pas, il la crée. Pareil pour la collection. Non, on n'a pas défini de schéma (on ne parle pas des `schema` de Postgres mais plus généralement d'un quelconque _schéma de données_). Non, MongoDB n'en a pas besoin, cette notion n'existe pas pour lui.

## Échauffement

On va reprendre quelques manips effectuées avec le support Pokedex et les adapter à nos données.

1. Lancer le client MongoDB pour pouvoir lui passer nos requêtes : `mongo`
2. Lister les bases de données : `show dbs`
3. Se connecter à la db _oparc_ : `use oparc`
4. Récupérer toutes les données, sans filtre (pas de panique, c'est paginé): `db.rides.find()`
5. Premier paramètre de `.find()`, le filtre : `db.rides.find({f2: "000000000012d5e1"})`
6. Deuxième paramètre, la projection : `db.rides.find({f1: "APIttoresque"}, {f2: 1, _id: 0})`

## Comprendre l'outil

- Essayez donc d'insérer le document suivant `db.rides.insert({f1: "les auto-DOMponneuses", f2: "000000000012d5f5", catapulte: "À rouleeeettes"})`. Ça passe !
- Puis de rechercher le "parcours" du visteur dont le billet est "000000000012d5f5" avec `db.rides.find({f2: "000000000012d5f5"})` : le document est retrouvé.
- Oups, on le supprime : `db.rides.deleteOne({catapulte: "À rouleeeettes"})`

Conclusion : _sans schéma_ signifie que nos données ne respectent pas de schéma particulier. Ça ne signifie pas pour autant qu'on a pas besoin de schéma.

## Format pas beau

Bon, les noms des champs f1, f2, f3... bof... mais on va y remédier. Enfin, _on_... surtout _vous_. [La doc est là](https://docs.mongodb.com/manual/reference/operator/update/rename/), ça devrait nous permettre de donner des noms plus explicites aux champs de nos documents. Disons "event", "visitor" et "timestamp".

<details>
<summary>Solution</summary>

`db.rides.updateMany({}, { $rename: { f1: "event", f2: "visitor", f3: "timestamp" }})`

</details>

## Format ok, passons aux manips

Hormis les opérations de CRUD classiques, MongoDB regroupe toutes les manipulations au sein d'une seule et unique méthode `aggregate` qu'on nomme souvent framework tellement ses possibilités sont grandes.

La méthode `aggregate` accepte un argument, un tableau de "fonctions" d'agrégat, chaque fonction étant en fait un objet respectant un format particulier. Chaque fonction va effectuer son traitement sur les données générées par la fonction précédente (la première travaillera directement sur la collection dans son état initial). On pourrait représenter un aggregate comme ça :

_collection_ > **fonction1** > _résultat1_

_résultat1_ > **fonction2** > _résultat2_

_résultat2_ > **fonction3** > _résultat3_

_résultat3_ > **fonction4** > _résultatfinal_

Notion importante : dans toutes les fonctions d'agrégats, le symbole _$_ utilisé côté "valeur" fait référence au document actuel (un peu comme `this`, finalement).

On souhaite souvent filtrer les résultats avant toute autre opération gourmande en calcul (ou filtrer les documents de la collection), car le premier match d'une agrégation utilisera les index présents sur la collection et que cela diminuera le nombre de données à agréger. C'est l' équivalent de `find` construit comme une fonction d'agrégat. Son nom : `$match`.

```js
// ne retournera que les documents possédant un champ event
// si vous avez un doute sur l'homogénéité de votre collection, cela peut permettre d'assurer la cohérence du résultat de votre agrégat
{
    $match: {
        event: {$exists: true}
    }
}
```

Une des fonctions qu'on utilise souvent, c'est `$project` : elle propose à peu près les mêmes fonctionnalités que le deuxième paramètre de `find` mais permet également d'ajouter des champs "calculés" à partir des champs existants dans les documents.

```js
// retournera, pour chaque document, 3 nouveaux champs
// les 2 premiers sont renommés en stockant la valeur de l'ancienne clé dans la nouvelle
// le 3e utilise la fonction dateFromString sur le champ f3 pour le transformer en ISODate, un format de date facile à manipuler
{ 
    $project: {
        event: "$f1",
        visitor: "$f2",
        time: {
            $dateFromString: {
                dateString: "$f3"
            }
        }
    }
}
```

La fonction `$group` représente véritablement la notion d'agrégat. Elle permet d'identifier un champ à utiliser comme critère de groupage puis de déclarer d'autres champs, résultats de fonctions d'agrégats comme `$sum` pour additionner des valeurs (l'équivalent de `sum` en SQL), bien qu'on puisse aussi l'utiliser pour compter des lignes en additionnant 1 pour chaque ligne (l'équivalent de `count` en SQL). `$push` permet quant à lui de créer un array à partir de toutes les valeurs de chaque groupe.

```js
// regroupe les documents par visiteur
// et assemble les attractions visitées dans un array nommé events
{
    $group: {
        _id: "$visitor",
        events: {
            $push: "$event"
        }
    }
}

```

```js
// regroupe par attraction
// et "compte" les documents liés à chaque attraction en additionnant 1 pour chaque document
{
    $group: {
        _id: "$event",
        count: {
            $sum: 1
        }
    }
}
```

A ce stade on pourrait très bien réeffectué un autre filtre afin de limiter le résultat en fonction du comptage précédent.

```js
// "branché" après le $group ci-dessus, cette fonction ne retournera que les documents dont le champ count contient une valeur supérieure à 423000
{
    $match: {
        count: {
            $gt: 423000
        }
    }
}
```

Dernière fonction d'agrégat utile (mais il en existe beaucoup d'autres) : `$sort` trie les résultats en fonction d'un ou plusieurs champs, de façon croissante si la valeur 1 est passée, décroissante si -1.

```js
// trie de façon décroissante sur le champ count
{
    $sort: {
        count: -1
    }
}
```

## Exemple complet d'aggregate

```js
// attention, cet exemple part de la version non renommé de la collection
db.rides.aggregate(
    [
        {
            $match: {
                f1: {$exists: true}
            }
        },
        { 
            $project: {
                event: "$f1",
                visitor: "$f2"
            }
        },
        {
            $group: {
                _id: "$event",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $match: {
                count: {
                    $gt: 423000
                }
            }
        },
        {
            $sort: {
                count: -1
            }
        }
    ]
);
```
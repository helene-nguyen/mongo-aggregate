# Download MongoDB Database tools

<https://www.mongodb.com/try/download/database-tools>

To send data json to mongoDB, you have to use the MongoDB Database tools

- Download the file

![file](./images/1.jpg)
- Put it in your system file (here, I put it in mongoDB file in Program Files)

![file](./images/2.jpg)

- Configure your path

![file](./images/3.jpg)

And you can use

```sh
mongoimport --collection=rides --db=oparc --jsonArray --type=json data.json
```

![file](./images/4.jpg)

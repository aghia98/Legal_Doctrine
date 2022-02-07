# Legal_Doctrine

## This express server was tested using POSTMAN.

Legal_Doctrine needs the following dependencies :
```
express.js (framework to build routes easilly)
mongoose.js (ORM for mongoDB)
fuse.js (library to use fuzzy search)
```

It was tested using a local mongodb database. Please configure your mongoUrl in **config.js** file.
The actual configuration is :
> {'mongoUrl': 'mongodb://localhost:27017/LegalDoctrine'}

The Text schema is configured in **Legal_Doctrine/models/text.js**

The routes are configured in **Legal_Doctrine/routes/textRouter.js** and mounted on **'/text'**

The following routes are implemented :
```
/text (GET, POST)
/text/:textId (PUT)
/text/:textId/count (GET)
/text/:textId/state (PUT)  ===> Update the text state according to the given scheme
/text/:textId/count/:language (GET) ===> Where :language in {fr, en, ar}
/text/mostOccurrent (GET)
/text/search?q= (POST)
```


## How to run :
```
1- Run your mongodb server.
2- Go to the Legal_Doctrine folder.
3- Run 'npm install' command to install all the dependencies.
4- Run 'npm start' to run the server on 'http://localhost:3000'
```


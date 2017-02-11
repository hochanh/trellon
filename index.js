'use strict';

const express = require('express');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/trellon';
const masterBacklogID = process.env.MASTER_BACKLOG_ID;
const doneThisWeekID = process.env.DONE_THIS_WEEK_ID;
var db;


// App config
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


// Mongo config
MongoClient.connect(mongoUri, (err, database) => {
  if (err) console.log(err);
  db = database;
});


// Routes
app.get('/', function(req, res) {
  res.render('index.ejs', {masterBacklogID, doneThisWeekID});
});


app.post('/:route', (req, res) => {
  let data = req.body.data || [];
  data = data.map(item => ({'_id': item.id, 'name': item.name}));
  let route = req.params.route;
  if (['committed', 'completed'].indexOf(route) === -1) return res.send();
  db.collection(route).insertMany(data, (err, result) => {
    if (err) return console.log(err);
    console.log(`saved ${route} US to database`);
    res.send(result);
  });
});


// Start app
app.listen(3000, function() {
  console.log('listening on 3000');
});

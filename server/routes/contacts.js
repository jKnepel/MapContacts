var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const databaseUrl = require('./database');

// returns all contacts
router.get('/', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			const db = client.db(databaseUrl.DATABASE);

			// returns different contacts depending on the headers Userid, Userrole and Show-All
			if(req.header('Show-All') == 'true') {
				if(req.header('Userrole') == 'admin') {
					db.collection('contacts').find({}).toArray(function (err, result) {
						if (err != null) next(err);
						else {
							res.status(200).json(result);
							client.close();
						};
					});
				} else {
					db.collection('contacts').find({ $or: [ { ownerId: req.header('Userid') }, { private: false } ] }).toArray(function (err, result) {
						if (err != null) next(err);
						else {
							res.status(200).json(result);
							client.close();
						};
					});
				}
			} else {
				db.collection('contacts').find({ ownerId: req.header('Userid') }).toArray(function (err, result) {
					if (err != null) next(err);
					else {
						res.status(200).json(result);
						client.close();
					};
				});
			}
		};
	});
});

// returns contact with corresponding id
router.get('/:id', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('contacts').findOne({ _id: ObjectId(req.params.id) }, function (err, result) {
				if (err != null) next(err);
				else {
					if(result == null) res.status(404).json();
					else res.status(200).json(result);
					client.close();
				};
			});
		};
	});
});

// creates contact in database
router.post('/', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('contacts').insertOne(req.body, function (err, result) {
				if (err != null) next(err);
				else {
					res.status(201).location('/contacts/' + result.insertedId).send(result.insertedId);
					client.close();
				};
			});
		};
	});
});

// updates contact with corresponding id in database
router.put('/:id', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('contacts').replaceOne({ _id: ObjectId(req.params.id) }, req.body, function (err, result) {
				if (err != null) next(err);
				else {
					res.status(204).end();
					client.close();
				};
			});
		};
	});
});

// deletes contact with corresponding id
router.delete('/:id', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('contacts').deleteOne({ _id: ObjectId(req.params.id) }, function (err, result) {
				if (err != null) next(err);
				else {
					res.status(204).end();
					client.close();
				};
			});
		};
	});
});

module.exports = router;
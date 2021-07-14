var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
const databaseUrl = require('./database');

// returns all users
router.get('/', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('users').find({}).toArray(function (err, result) {
				if (err != null) next(err);
				else {
					res.status(200).json(result);
					client.close();
				};
			});
		};
	});
});

// returns user with the corresponding id
router.get('/:id', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('users').findOne({ userId: req.params.id }, function (err, result) {
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

// returns login data if user with corresponding userId and password exists
router.post('/login', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('users').findOne({ userId: req.body.user, password: req.body.passw }, function (err, result) {
				if (err != null) next(err);
				else {
					if (result == null) res.status(401).json();
					else res.status(200).json({ userId: result.userId, role: result.role });
					client.close()
				};
			});
		};
	});
});

// creates user in database
router.post('/register', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('users').insertOne({ userId: req.body.user, password: req.body.passw, firstName: req.body.firstName, lastName: req.body.lastName, role: 'non-admin' }, function (err, result) {
				if (err != null) next(err);
				else {
					res.status(201).json({ userId: req.body.user, role: 'non-admin' });
					client.close()
				};
			});
		};
	});
});

// updates user with corresponding id in database
router.put('/:id', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('users').replaceOne({ userId: req.params.id }, req.body, function (err, result) {
				if (err != null) next(err);
				else {
					res.status(204).end();
					client.close();
				};
			});
		};
	});
});

// deletes user with corresponding id
router.delete('/:id', function (req, res, next) {
	MongoClient.connect(databaseUrl.URI, { useUnifiedTopology: true }, function (err, client) {
		if (err != null) next(err);
		else {
			var db = client.db(databaseUrl.DATABASE);

			db.collection('users').deleteOne({ userId: req.params.id }, function (err, result) {
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

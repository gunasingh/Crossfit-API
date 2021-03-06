var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var PORT = process.env.PORT || 3000;
var app = express();
var moves = [];
var moveType = [
	'cardio',
	'core',
	'strength',
	'endurance',
	'gymnastic'
];

var nextMoveId = 1;

app.use(bodyParser.json());

// GET /
app.get('/', function (req, res) {
	res.send('Crossfit API root!');
});

// GET /moves?type=cardio&q=run
app.get('/moves', middleware.requireAuthentication, function (req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('type') && query.type.length > 0
			&& _.contains(moveType, query.type)) {
		where.type = {
			$like: query.type
		};
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.name = {
			$like: '%' + query.q + '%'
		};
	}

	db.move.findAll({where: where}).then(function (moves) {
		res.json(moves);
	}, function (e) {
		res.status(500).send();
	});
});

// GET /moves/:id
app.get('/moves/:id', middleware.requireAuthentication, function (req, res) {
	var moveId = parseInt(req.params.id, 10);

	db.move.findById(moveId).then(function (move) {
		if (!!move) {
			res.json(move.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});
});

// PUT /moves/:id
app.put('/moves/:id', middleware.requireAuthentication, function (req, res) {
	var moveId = parseInt(req.params.id, 10);

	var body = _.pick(req.body, 'name', 'type');
	var attributes = {};

	if (body.hasOwnProperty('type') && _.contains(moveType, body.type)) {
		attributes.type = body.type;
	}

	if (body.hasOwnProperty('name')) {
		attributes.name = body.name;
	}

	db.move.findById(moveId).then(function (move) {
		if (move) {
			move.update(attributes).then(function (move) {
				res.json(move.toJSON());
			}, function (e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function () {
		res.status(500).send();
	});
});

// POST /moves
app.post('/moves', middleware.requireAuthentication, function (req, res) {
	var body = _.pick(req.body, 'name', 'type');

	if (!_.isString(body.name)
		|| !_.isString(body.type)
		|| body.name.trim().length === 0
		|| !_.contains(moveType, body.type.trim().toLowerCase())) {
		//Bad data
		return res.status(400).send();
	}

	db.move.create(body).then(function (move) {
		res.json(move.toJSON());
	}).catch(function (e) {
		res.status(400).json(e);
	});
});

// DELETE /moves/:id
app.delete('/moves/:id', middleware.requireAuthentication, function (req, res) {
	var moveId = parseInt(req.params.id, 10);

	db.move.destroy({
		where: {
			id: moveId
		}
	}).then(function (rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No move with id'
			});
		} else {
			res.status(204).send();
		}
	}, function () {
		res.status(500).send();
	});
});

// POST /users
app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

// POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	}).then(function (tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function () {
		res.status(401).send();
	});
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function () {
		res.status(500).send();
	});
});

// Start the server
db.sequelize.sync({
	force: true
	}).then(function () {
	app.listen(PORT, function () {
		console.log('Server listening on port ' + PORT + '!');
	});
});
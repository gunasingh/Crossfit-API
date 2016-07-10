var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var PORT = process.env.PORT || 3000;
var app = express();
var moves = [];
var moveType = {
	CARDIO: 1,
	CORE: 2,
	STRENGTH: 4,
	ENDURANCE: 8,
	GYMNASTIC: 16,
	DEFAULT: 32
}

var nextMoveId = 1;

app.use(bodyParser.json());

// GET /
app.get('/', function (req, res) {
	res.send('Crossfit API root!');
});

// GET /moves
app.get('/moves', function (req, res) {
	res.json(moves);
});

// GET /moves/:id
app.get('/moves/:id', function (req, res) {
	var moveId = parseInt(req.params.id, 10);
	var matchedMove = _.findWhere(moves, {id: moveId});

	if (matchedMove) {
		res.json(matchedMove);
	} else {
		res.status(404).send();
	}
});

// POST /moves
app.post('/moves', function (req, res) {
	var body = _.pick(req.body, 'name', 'type');

	if (!_.isString(body.name)
		|| !_.isNumber(body.type)
		|| body.name.trim().length === 0
		|| body.type > moveType.DEFAULT) {
		//Bad data
		return res.status(400).send();
	}

	body.id = nextMoveId++;
	body.name = body.name.trim();
	body.type = body.type;
	moves.push(body);
	res.json(body);
});

// DELETE /moves/:id
app.delete('/moves/:id', function (req, res) {
	var moveId = parseInt(req.params.id, 10);
	var deleteMove = _.findWhere(moves, {id: moveId});

	if (deleteMove) {
		moves = _.without(moves, deleteMove);
		res.json(deleteMove);
	} else {
		res.status(404).send();
	}
});

// Start the server
app.listen(PORT, function () {
	console.log('Server listening on port ' + PORT + '!');
});
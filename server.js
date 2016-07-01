var express = require('express');
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 3000;
var app = express();
var moves = [];
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
	var matchedMove;

	moves.forEach(function (move) {
		if (move.id === moveId) {
			matchedMove = move;
		}
	});

	if (matchedMove) {
		res.json(matchedMove);
	} else {
		res.status(404).send();
	}
});

// POST /moves
app.post('/moves', function (req, res) {
	var body = req.body;

	body.id = nextMoveId++;
	moves.push(body);
	res.json(body);
});

// Start the server
app.listen(PORT, function () {
	console.log('Server listening on port ' + PORT + '!');
});
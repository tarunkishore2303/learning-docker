const keys = require("./keys");

// Express setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres setup

const { Pool } = require("pg");

const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort,
});

pgClient.on("error", () => console.log("Lost connections"));

pgClient.on("connect", (client) => {
	client
		.query("CREATE TABLE IF NOT EXISTS values(number INT)")
		.catch((err) => console.log(err));
});

// Redis setup

const redis = require("redis");
var client = redis.createClient({
	url: `redis://${keys.redisHost}:${keys.redisPort}`,
});
(async () => {
	try {
		await client.connect();
		console.log("connected");
	} catch (err) {
		console.error(err);
	}
})();

const publisher = client.duplicate();

(async () => {
	try {
		await publisher.connect();
		console.log("connected");
	} catch (err) {
		console.error(err);
	}
})();

app.get("/", (req, res) => {
	res.send("<h1> Hi </h1>");
});

app.get("/values/all", async (req, res) => {
	const values = await pgClient.query("SELECT * FROM values");
	res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
	await client.hGetAll("values", (err, values) => {
		res.send(values);
	});
});

app.post("/values", async (req, res) => {
	const index = req.body.index;
	if (parseInt(index) > 40) {
		return res.status(422).send("Very high index !");
	}
	await client.hSet("values", index, "Nothing yet !");
	await publisher.publish("insert", index);
	pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

	res.send({ working: true });
});

app.listen(5000, (err) => {
	console.log("Listening !");
});

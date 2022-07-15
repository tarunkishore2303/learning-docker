const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
	url: `redis://${keys.redisHost}:${keys.redisPort}`,
});

async () => {
	redisClient.on("error", (err) => console.log(err));
	await redisClient.connect();
};
const sub = redisClient.duplicate();

async () => {
	sub.on("message", async (channel, message) => {
		await redisClient.hset("values", message, fib(parseInt(message)));
	});
	await sub.connect();
	await sub.subscribe("insert");
};

function fib(index) {
	if (index < 2) return 1;
	return fib(index - 1) + fib(index - 2);
}

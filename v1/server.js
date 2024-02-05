import express from "express";
import cors from "cors";
import { PORT, URI } from "./config/config.js";
import mongoose from "mongoose";
import App from "./routes/root.js"
import { client } from './external_function/redisLogout/redisClient.js'

const server = express();
// const PORT = process.env.PORT || 5000
const corsOptions = {
    origin : [process.env.FRONTEND_URL,'http://localhost:5173'],
    methods: 'GET,POST',
    credentials: true,
};

server.use(cors(corsOptions));
server.disable("x-powered-by");
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    // .connect(process.env.URI, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    // })
    .connect(URI)
    .then(console.log("Connected to database"))
    .catch((err) => console.log(err));


// await client.set("Test-key", "Test-value")
// const val = await client.get("Test-key")
// console.log(val);

server.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to findme application." });
})

server.use(App);


// === START UP SERVER ===
const serverInstance =  server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);

serverInstance .on('close', async () => {
    console.log('Server closed unexpectedly. Performing cleanup or reconnection logic...');
    await client.disconnect()
    // Perform your cleanup or reconnection operations here
});

process.on('SIGTERM',  () => {
    console.log('Received SIGTERM signal. Performing cleanup before restart...');
    // Perform your cleanup or finalization operations here
    serverInstance .close( async () => {
        console.log('Server closed gracefully');
        await client.disconnect()
        process.exit(0);
    });
});
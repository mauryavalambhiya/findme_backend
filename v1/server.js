import express from "express";

const server = express();
const PORT = process.env.PORT || 5000

server.disable("x-powered-by");
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// === START UP SERVER ===
server.listen(PORT, () =>
    console.log(`Server running on port: http://localhost:${PORT}`)
);


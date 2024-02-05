import { createClient } from 'redis';
// import {  RADIS_URL, REDIS_PASS, REDIS_PORT } from '../config/config.js';


// const client = createClient({
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: process.env.RADIS_URL,
//         port: process.env.REDIS_PORT
//     }
// });

// client.on('error', (err) => console.log('Redis Client Error', err));
// await client.connect();

// export { client };

const client = createClient({
    password: '2bgz2jfPpfE5NWVnznkZKEpbVMIXVZo6',
    socket: {
        host: 'redis-18293.c267.us-east-1-4.ec2.cloud.redislabs.com',
        port: 18293
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

export { client };
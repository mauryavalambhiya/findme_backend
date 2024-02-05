import * as dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT
export const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN
export const URI = process.env.URI
export const RADIS_URL = process.env.RADIS_URL
export const REDIS_PASS = process.env.REDIS_PASS
export const REDIS_PORT = process.env.REDIS_PORT

// const {PORT, SECRET_ACCESS_TOKEN, URI, RADIS_URL , REDIS_PASS, REDIS_PORT} = process.env;

// export { PORT, SECRET_ACCESS_TOKEN, URI, RADIS_URL, REDIS_PASS, REDIS_PORT };
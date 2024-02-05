import { client } from './redisClient.js'

export async function ckeckBlackList(jwt, uid){
    const value = await client.get(jwt);   
    if(value == null){
        // do not exist
        return false
    }
    else{
        // do exist
        return true
    }
}
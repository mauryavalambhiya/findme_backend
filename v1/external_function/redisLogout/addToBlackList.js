// await client.set('my-key', 'my-value');
// await client.del('my-key');
// console.log(await client.keys('my-key'));
import { client } from './redisClient.js'

export async function AddToBlackList(jwt, uid){
    await client.set(jwt, uid , {
        EX: 22 * 60,
        NX: true,
      });
    const value = await client.get(jwt);
    console.log(value);
}
// await client.disconnect()

// await client.quit();

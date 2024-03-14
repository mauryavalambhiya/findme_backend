export default function getRefreshToken(req) {

    try {
        // var authHeader = req.headers["cookie"];
        // authHeader = authHeader.split(";")[1] 
        // const cookie = authHeader.split("=")[1];
        const cookie = req.headers["cookie"].split('; ').find(row => row.startsWith('jwt=')).split('=')[1]
        // const cookie = authHeader.split('; ').find(row => row.startsWith('SessionID=')).split('=')[1];
        // console.log("COOKIE :--- " + req.headers["cookie"].split('; ').find(row => row.startsWith('jwt=')).split('=')[1]);
        return cookie;
    }catch(err){
        return false
    }
}

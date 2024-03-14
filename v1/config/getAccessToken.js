export default function getAccessToken(req) {

    try {
        // var authHeader = req.headers["cookie"];
        // authHeader = authHeader.split(";")[0] 
        // const cookie = authHeader.split("=")[1];
        // console.log("authHeader :---- " + cookie);
        const cookie = req.headers["cookie"].split('; ').find(row => row.startsWith('SessionID=')).split('=')[1]

        return cookie;
    }catch(err){
        return false;
    }

}

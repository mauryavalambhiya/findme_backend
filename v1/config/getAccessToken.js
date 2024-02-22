export default function getAccessToken(req) {

    try {
        var authHeader = req.headers["cookie"];
        authHeader = authHeader.split(";")[0] 
        const cookie = authHeader.split("=")[1];
        // console.log("authHeader :---- " + cookie);
        return cookie;
    }catch(err){
        return false;
    }

}

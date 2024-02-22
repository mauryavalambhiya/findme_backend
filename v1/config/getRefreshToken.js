export default function getRefreshToken(req) {

    try {
        var authHeader = req.headers["cookie"];
        authHeader = authHeader.split(";")[1] 
        const cookie = authHeader.split("=")[1];
        return cookie;
    }catch(err){
        return false
    }
}

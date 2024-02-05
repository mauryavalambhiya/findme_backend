import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLICKEY,
    privateKey: process.env.IMAGEKIT_PRIVATEKEY
  });

export async function ImgAuth(req, res) {
    var result = imagekit.getAuthenticationParameters();
    res.send(result);
}
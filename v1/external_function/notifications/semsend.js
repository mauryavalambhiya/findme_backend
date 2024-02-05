// curl 'https://api.twilio.com/2010-04-01/Accounts/AC07c5e23121d724019ec09f81bc5796fd/Messages.json' -X POST \
// --data-urlencode 'To=+919426816487' \
// --data-urlencode 'From=+18288277140' \
// --data-urlencode 'Body=Hii this is test massage. please ignore this :}' \
// -u AC07c5e23121d724019ec09f81bc5796fd:[AuthToken]

const accountSid = 'AC07c5e23121d724019ec09f81bc5796fd';
const authToken = '[AuthToken]';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'Hii this is test massage. please ignore this :}',
        from: '+18288277140',
        to: '+919426816487'
    })
    .then(message => console.log(message.sid))
    .done();
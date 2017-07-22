const builder = require("botbuilder");
const restify = require("restify");
const request = require('request');

const IMGSEARCH_URL = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'
const BING_KEY = process.env.BING_API_KEY;

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

let connector = new builder.ChatConnector();
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, (session) => {
    let msg = session.message;
    let postOpt = {
            url: `${IMGSEARCH_URL}?q=${msg.text}`,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': BING_KEY
            },

        };

    session.sendTyping();

    request(postOpt, (error, response, body) => {
        let imgArr = [];
        body.value.forEach((img) => {
            imgArr.push({
                name: img.name,
                contentType: `image/${img.encodingFormat}`,
                contentUrl: img.contentUrl
            });
        });
        session.send({
            text: '您的搜尋結果：',
            attachments: imgArr
        });
    });
});
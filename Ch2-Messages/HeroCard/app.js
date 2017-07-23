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

        // 建立回傳的訊息
        let retMsg = new builder.Message(session);
        let imgArr = [];
        body.value.forEach((img) => {
            // 將資料製作成 Hero Card
            let imgCard = new builder.HeroCard(session)
                            .title(img.name)
                            .images([builder.CardImage.create(session, img.thumbnailUrl)]);
            imgArr.push(imgCard);
        });
        
        retMsg.attachments(imgArr);
        retMsg.attachmentLayout(builder.AttachmentLayout.carousel);
        session.send(retMsg);
    });
});
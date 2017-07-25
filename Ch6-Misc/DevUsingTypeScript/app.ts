import * as builder from 'botbuilder';
import * as restify from 'restify';
import * as request from 'request';

const IMGSEARCH_URL: string = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'
const BING_KEY: string = process.env.BING_API_KEY;

let server: restify.Server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

let connector: builder.ChatConnector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

let bot: builder.UniversalBot = new builder.UniversalBot(connector, (session: builder.Session): void => {
    let msg: builder.IMessage = session.message;
    let postOpt: request.Options = {
            url: `${IMGSEARCH_URL}?q=${msg.text}`,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': BING_KEY
            }
        };

    session.sendTyping();

    request(postOpt, (error, response: request.RequestResponse, body: any): void => {
        // 建立回傳的訊息
        let retMsg: builder.Message = new builder.Message(session);
        let imgArr: Array<builder.HeroCard> = [];
        body.value.forEach((img: any) => {
            // 將資料製作成 Hero Card
            let imgCard: builder.HeroCard = new builder.HeroCard(session)
                            .title(img.name)
                            .images([builder.CardImage.create(session, img.thumbnailUrl)]);
            imgArr.push(imgCard);
        });
        
        retMsg.attachments(imgArr);
        retMsg.attachmentLayout(builder.AttachmentLayout.carousel);
        session.send(retMsg);
    });
});
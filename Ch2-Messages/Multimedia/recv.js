const builder = require("botbuilder");
const restify = require("restify");
const request = require('request');

// 參考 https://azure.microsoft.com/services/cognitive-services/computer-vision/ 取得 API 資訊
const MCS_CV_ENDPOINT = process.env.MCS_CV_ENDPOINT;
const MCS_CV_KEY = process.env.MCS_CV_KEY;

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

let connector = new builder.ChatConnector();
server.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector, (session) => {
    let msg = session.message;

    if (msg.attachments && msg.attachments.length > 0) {
        let attachment = msg.attachments[0];

        session.sendTyping();

        if (attachment.contentType == 'image/jpg' ||
            attachment.contentType == 'image/jpeg') {

            // 拿到檔案內容
            request({ url: attachment.contentUrl, encoding:null }, (error, response, body) => {
                let postOpt = {
                    url: `${MCS_CV_ENDPOINT}/analyze?visualFeatures=Description`,
                    method: 'POST',
                    encoding: null,
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': MCS_CV_KEY
                    },
                    body: body 
                };
                
                // 呼叫 Cognitive Services - Computer Vision API
                request(postOpt, (e, r, b) => {
                    let resp = JSON.parse(b);
                    session.send(`您傳的圖片可能是「${resp.description.captions[0].text}」`);
                });
            });
        }
    }
});
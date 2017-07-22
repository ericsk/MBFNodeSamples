const restify = require('restify');
const builder = require('botbuilder');

// 建立 restify server 聽在 3978 port (或是指定的 port)
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// 建立 ChatConnector 接收由 Bot Connector 來的資訊
let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

// 建立 bot 實體來處理 chat connector 接收到的內容
let bot = new builder.UniversalBot(connector, (session) => {
    let text = session.message.text;
    session.send('您說「%s」，有 %d 個字', text, text.length);
});
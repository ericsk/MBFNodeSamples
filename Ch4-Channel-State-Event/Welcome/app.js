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
let bot = new builder.UniversalBot(connector, [
    (session) => {
        builder.Prompts.choice(session, '您好，我可以幫你做一些事，請問想要我做什麼呢？', ['唱歌', '說笑話', '沒事']);
    },
    (session, results) => {
        session.endDialog(`好的，您選擇的是**${results.response.entity}**`);
    }
]);

bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});
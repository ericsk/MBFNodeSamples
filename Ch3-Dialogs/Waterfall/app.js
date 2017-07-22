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
        session.beginDialog('greeting', session.userData.profile);
    },
    (session, results) => {
      session.userData.profile = results.response;
      session.send('%(name)s您好！%(from)s真是一個好地方！', session.userData.profile);
    }
]);

bot.dialog('greeting', [
    (session, args, next) => {
        session.dialogData.profile = args || {};

        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, '請問怎麼稱呼您？');
        } else {
            next();
        }
    },
    (session, results, next) => {
      if (results.response) {
          session.dialogData.profile.name = results.response;
      }

      if (!session.dialogData.profile.from) {
          builder.Prompts.text(session, `${session.dialogData.profile.name}您好！請問您是哪裡人呢？`);
      } else {
          next();
      }
    },
    (session, results) => {
        if (results.response) {
          session.dialogData.profile.from = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);
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
    (session, args) => {
        session.dialogData.profile = args || {};
        builder.Prompts.test(session, "請問怎麼稱呼您？");
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        builder.Prompts.number(session, "請問您工作幾年了呢？");
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.profile.career = results.response;
        }
        builder.Prompts.time(session, "請問您什麼時間報到的呢？");
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.profile.onboard = builder.EntityRecognizer.resolveTime([results.response]);
        }
        builder.Prompts.choice(session, "請問您喜歡什麼顏色？", ["紅", "黃", "藍", "綠"]);
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.profile.favoriteColor = results.response;
        }
        builder.Prompts.attachment(session, "最後, 上傳一張您的大頭貼吧！");
    },
    (session, results) => {
        if (results.response) {
            session.dialogData.profile.avatar = results.response[0];
        }
        builder.Prompts.confirm(session, "請問您是否確定要修改資料呢？");
    },
    (session, results) => {
        if (results.response) {
            session.send("正在儲存資料...");
            session.endDialogWithResult({ profile: session.dialogData.profile });
        } else {
            session.endDialog("好的，已經取消修改資料");
        }
    }
]);

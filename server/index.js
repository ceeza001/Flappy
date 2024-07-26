import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import sdk from 'node-appwrite';
import cors from 'cors';
import router from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.BOT_USERNAME;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID;
const BASE_URL = process.env.BASE_URL;
const gameName = "flappy";
const gameURL = "https://flappy-theta.vercel.app/";

// Ensure all necessary environment variables are set
if (!TOKEN || !DATABASE_ID || !COLLECTION_ID || !BASE_URL) {
  console.error('Missing necessary environment variables.');
  process.exit(1);
}

// Telegram Bot setup
const bot = new TelegramBot(TOKEN, { polling: true });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", router);

// Appwrite Client Setup
const client = new sdk.Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const database = new sdk.Databases(client);

// Bot Commands and Message Handlers
bot.onText(/\/start/, async (msg) => {
  const message = 'Welcome! Click the button below to start the app.';
  const keyboard = {
    inline_keyboard: [
      [{ text: "Start", callback_data: gameName }]
    ]
  };

  bot.sendMessage(msg.chat.id, message, { reply_markup: keyboard });

  const user = msg.from;
  console.log(msg);

  try {
    const existingUsers = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.equal('telegram_id', user.id.toString())
    ]);

    if (existingUsers.documents.length > 0) {
      console.log('User already exists in database:', existingUsers.documents[0]);
    } else {
      const response = await database.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
        telegram_id: user.id.toString(),
        first_name: user.first_name,
        username: user.username
      });

      console.log('User created in database:', response);
    }
  } catch (error) {
    console.error('Error checking/creating user in database:', error);
  }
});

bot.on("callback_query", (query) => {
  if (query.game_short_name !== gameName) {
    bot.answerCallbackQuery(query.id, { text: `Sorry, '${query.game_short_name}' is not available.` });
  } else {
    const userId = query.from.id; // Get user ID from the query
    const gameurl = `${gameURL}/index.html?id=${query.id}&user=${userId}`; // Add user ID to the game URL
    bot.answerCallbackQuery({
      callback_query_id: query.id,
      url: gameurl
    });
  }
});

bot.on("inline_query", function(iq) {
  bot.answerInlineQuery(iq.id, [{ type: "game", id: "0", game_short_name: gameName }]);
});

// Express Route
app.get('/', (req, res) => {
  res.send('Hello, this is the Telegram bot server');
});

app.get("/highscore/:score", function(req, res, next) {
  if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
  let query = queries[req.query.id];
  let options;
  if (query.message) {
    options = {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id
    };
  } else {
    options = {
      inline_message_id: query.inline_message_id
    };
  }

  bot.setGameScore(query.from.id, parseInt(req.params.score), options, function (err, result) {});
});

// Server Listener
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Database Connection and Server Initialization
(async () => {
  try {
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
})();

export { database };
export default app;
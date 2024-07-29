import express from 'express';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import sdk from 'node-appwrite';
import cors from 'cors';
import router from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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
const bot = new Telegraf(TOKEN);

// Set the webhook
const setWebhook = async () => {
  try {
    const webhookUrl = `${BASE_URL}/bot${TOKEN}`;
    await axios.post(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
      url: webhookUrl
    });
    console.log(`Webhook set to ${webhookUrl}`);
  } catch (error) {
    console.error('Error setting webhook:', error);
    process.exit(1);
  }
};

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
bot.start(async (ctx) => {
  const message = 'Welcome! Click the button below to start the app.';
  const keyboard = {
    inline_keyboard: [
      [{ text: "Start", callback_data: gameName }]
    ]
  };

  await ctx.reply(message, { reply_markup: keyboard });

  const user = ctx.from;
  console.log(ctx.message);

  try {
    const existingUsers = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.equal('telegram_id', user.id.toString())
    ]);

    if (existingUsers.documents.length === 0) {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
        telegram_id: user.id.toString(),
        first_name: user.first_name,
        username: user.username
      });
    }
  } catch (error) {
    console.error('Error checking/creating user in database:', error);
  }
});

bot.on('callback_query', async (ctx) => {
  const query = ctx.callbackQuery;
  if (query.data !== gameName) {
    await ctx.answerCbQuery(`Sorry, '${query.data}' is not available.`);
  } else {
    const user = query.from; // Get user ID from the query
    const gameurl = `${gameURL}/index.html?id=${query.id}&user=${user.id}`; // Add user ID to the game URL
    
    try {
      const existingUsers = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
        sdk.Query.equal('telegram_id', user.id.toString())
      ]);

      if (existingUsers.documents.length === 0) {
        const response = await database.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
          telegram_id: user.id.toString(),
          first_name: user.first_name,
          username: user.username
        });

        console.log('User created in database:', response);
      }

      await ctx.answerCbQuery(undefined, { url: gameurl });
    } catch (error) {
      console.error('Error handling callback query:', error);
      await ctx.answerCbQuery('An error occurred. Please try again.');
    }
  }
});

bot.on('inline_query', (ctx) => {
  ctx.answerInlineQuery([{
    type: 'game',
    id: '0',
    game_short_name: gameName
  }]);
});

// Express Route
app.get('/', (req, res) => {
  res.send('Hello, this is the Telegram bot server');
});

app.get("/highscore/:score", async (req, res) => {
  const queryId = req.query.id;
  if (!queries[queryId]) {
    console.error(`Query ID ${queryId} not found`);
    return res.status(404).send('Query ID not found');
  }

  let query = queries[queryId];
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

  try {
    const result = await bot.telegram.setGameScore(query.from.id, parseInt(req.params.score), options);
    res.status(200).send(result);
  } catch (err) {
    console.error('Error setting game score:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Webhook route
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Server Listener
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await setWebhook();
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

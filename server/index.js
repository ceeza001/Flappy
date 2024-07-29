import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
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
const BASE_URL = "https://flappy-server.vercel.app";
gameURL = "flappy-theta.vercel.app";
gameName = "Flaps";

// Telegram Bot setup
const bot = new Telegraf(TOKEN);

// Middleware to transfer data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Use router
app.use("/", router);

// Connection with Appwrite database
let client = new sdk.Client();
export const database = new sdk.Databases(client);

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your secret API key

// Bot Commands and Message Handlers
bot.start(async (ctx) => {
  const message = 'Welcome! Click the button below to start the app.';
  const keyboard = {
    inline_keyboard: [
      [{ text: "Start", callback_data: gameName }]
    ]
  };

  await ctx.reply(message, { reply_markup: keyboard });

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
  if (query.game_short_name !== gameName) {
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

// Error handling
bot.catch((err, ctx) => {
  console.log(`Update ${ctx.updateType} caused error ${err}`);
});

// Express route to handle webhook
app.use(bot.webhookCallback('/bot'));

bot.telegram.setWebhook(`${BASE_URL}/bot`);

app.get('/', (req, res) => {
  res.send('Hello, this is the Telegram bot server');
});

// Listening to port
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});

// Connect to the database and start the server
(async () => {
  try {
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // exit the process with an error code
  }
})();

export default app;  // Ensure proper export for Vercel

import express from 'express';
import { Telegraf, Markup } from 'telegraf';
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
const gameURL = "https://t.me/flappy_beta_bot/Start"

// Telegram Bot setup
const bot = new Telegraf(TOKEN);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Router
app.use("/", router);

// Appwrite database connection
const client = new sdk.Client();
const database = new sdk.Databases(client);

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // API Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Project ID
  .setKey(process.env.APPWRITE_API_KEY); // API Key

// Start command handler
bot.start(async (ctx) => {
  const message = 'Welcome! Click the button below to start the app.';
  const keyboard = Markup.inlineKeyboard([
    Markup.button.url('Start App', gameURL)
  ]);

  await ctx.reply(message, keyboard);

  const user = ctx.from;
  console.log(user);

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

// Echo command handler
bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/echo ')) {
    const resp = ctx.message.text.slice(6);
    await ctx.reply(resp);
  }
});

// Photo message handler
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const photo = 'cats.png'; // Ensure this path is correct or use a valid file ID
  await ctx.replyWithPhoto({ source: photo }, { caption: 'Lovely kittens' });
});

// Callback query handler
bot.on('callback_query', async (ctx) => {
  const query = ctx.callbackQuery;
  if (query.game_short_name !== gameName) {
    await ctx.answerCallbackQuery({ text: `Sorry, '${query.game_short_name}' is not available.` });
  } else {
    const gameurl = `${gameURL}?id=${query.id}`;
    await ctx.answerCallbackQuery({ url: gameurl });
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Update ${ctx.updateType} caused error ${err}`);
});

// Set webhook
app.use(bot.webhookCallback('/bot'));
await bot.telegram.setWebhook(`${BASE_URL}/bot`);

// Express route
app.get('/', (req, res) => {
  res.send('Hello, this is the Telegram bot server');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

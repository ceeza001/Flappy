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
const BASE_URL = process.env.BASE_URL;

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

// Start command
bot.start(async (ctx) => {
  const message = 'Welcome! Click the button below to start the app.';
  const keyboard = Markup.inlineKeyboard([
    Markup.button.url('Start App', 'https://t.me/flappy_beta_bot/Start')
  ]);

  ctx.reply(message, keyboard);

  const user = ctx.from;
  console.log(user);
  
  // Check if user already exists
  try {
    const existingUsers = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.equal('telegram_id', user.id.toString())
    ]);

    if (existingUsers.documents.length > 0) {
      console.log('User already exists in database:', existingUsers.documents[0]);
    } else {
      // Create a document in the Appwrite database
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

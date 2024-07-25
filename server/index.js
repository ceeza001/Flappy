import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import sdk from 'node-appwrite';
import cors from 'cors';
import router from './routes/routes.js';

const app = express();
const PORT = process.env.PORT || 80;

const TOKEN = '7289305234:AAExIAfBN1lu-lI-PEvfwvnT2LoPPax-fd4';
const BOT_USERNAME = '@flappy_beta_bot';

// Telegram Bot setup
const bot = new Telegraf(TOKEN);

// MIDDLEWARE TO TRANSFER DATA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Use router
app.use("/", router);

// CONNECTION WITH APPWRITE DATABASE
let client = new sdk.Client();
export const database = new sdk.Databases(client);

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('669e3e640013135966cf') // Your project ID
  .setKey('5c19ff3b6245f2ab7b9f6ebfc5d1ecfa89ae6e46b1b63e20e4afe82a5df10e2639278f5e00ae4f05e590c6eb5341e2a215408857652f6df01e45bd1e51934c8bd36da2367585498fbb232c236c66934bd0c7126f72b2f02db5f7c693229e17a48d986d57bf4a862cdd7a313ad0b8b36ac62e078e423f8238613ef8f58f1bbe07'); // Your secret API key

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
    const existingUsers = await database.listDocuments('669e664d0011e7c4a905', '669e667b0019c49c7456', [
      sdk.Query.equal('telegram_id', user.id.toString())
    ]);

    if (existingUsers.documents.length > 0) {
      console.log('User already exists in database:', existingUsers.documents[0]);
    } else {
      // Create a document in the Appwrite database
      const response = await database.createDocument('669e664d0011e7c4a905', '669e667b0019c49c7456', 'unique()', {
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

bot.telegram.setWebhook('https://0b11230f-7899-465f-a5b0-441a39bad871-00-4fs9y6wz3wmd.picard.replit.dev/bot');

app.get('/api/users', async (req, res) => {
  try {
    const existingUsers = await database.listDocuments('669e664d0011e7c4a905', '669e667b0019c49c7456', [
      sdk.Query.orderDesc('Highscore')
    ]);
    res.status(200).json(existingUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existingUsers = await database.listDocuments('669e664d0011e7c4a905', '669e667b0019c49c7456', [
      sdk.Query.equal('telegram_id', id)
    ]);
    if (existingUsers.documents.length > 0) {
      res.status(200).json(existingUsers.documents[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/:id', async (req, res) => {
  const { newHighScore } = req.body;
  const { id } = req.params;
  
  try {
    const users = await database.listDocuments('669e664d0011e7c4a905', '669e667b0019c49c7456', [
      sdk.Query.equal('telegram_id', id.toString())
    ]);
    
    if (users.documents.length > 0) {
      console.log(users);
      const documentId = users.documents[0].$id; // Assuming the document ID is needed for the update
      const updatedUser = await database.updateDocument('669e664d0011e7c4a905', '669e667b0019c49c7456', documentId, {
        Highscore : newHighScore,
      });
      res.status(200).json(updatedUser);
    } else {
      console.log('nouser')
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.log('nouser', err)
    res.status(400).json({ error: err.message });
  }
});

// LISTENING TO PORT
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});

// Connect to the database and start the server
(async () => {
  try {
    // Add your database connection logic here
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // exit the process with an error code
  }
})();

import { database } from "../index.js";
import dotenv from 'dotenv';
import sdk from 'node-appwrite';

dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID;

export const createUser = async (req, res) => {
  const { telegram_id, first_name, username } = req.body;
  const newUser = {
    telegram_id,
    first_name,
    username,
    created_date: Date.now(),
  };
  try {
    const createdData = await database.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', newUser);
    res.status(201).json(createdData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const existingUsers = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.orderDesc('Highscore')
    ]);
    res.status(200).json(existingUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const existingUsers = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.equal('telegram_id', id.toString())
    ]);
    if (existingUsers.documents.length > 0) {
      res.status(200).json(existingUsers.documents[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  try {
    const newUser = await database.updateDocument(DATABASE_ID, COLLECTION_ID, id, updatedUser);
    res.status(200).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUserHighScore = async (req, res) => {
  const { newHighScore } = req.body;
  const { id } = req.params;

  try {
    const users = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.equal('telegram_id', id.toString())
    ]);
    if (users.documents.length > 0) {
      const documentId = users.documents[0].$id;
      const updatedUser = await database.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, {
        Highscore: newHighScore,
      });
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

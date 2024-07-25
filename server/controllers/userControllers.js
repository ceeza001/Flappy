import { database } from "../index.js";
const COLLECTION_ID = "669e667b0019c49c7456";

export const createUser = async (req, res) => {
  const { telegram_id, first_name, username } = req.body;
  const newUser = {
    telegram_id: telegram_id,
    first_name: first_name,
    username: username,
    created_date: Date.now(),
  };
  try {
    const createdData = await database.createDocument(COLLECTION_ID, newUser);
    res.status(201).json(createdData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const data = await database.listDocuments(COLLECTION_ID, undefined, undefined, undefined, undefined, "DESC" );
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await database.listDocument(COLLECTION_ID, id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  try {
    const newUser = database.updateDocument(COLLECTION_ID, id, updatedUser);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUserHighScore = async (req, res) => {
  const { newHighScore } = req.body;
  const { userId } = req.params;

  try {
    const users = await database.listDocuments(COLLECTION_ID, [
      sdk.Query.equal('telegram_id', userId.toString())
    ]);

    if (users.documents.length > 0) {
      const documentId = users.documents[0].$id; // Assuming the document ID is needed for the update
      const updatedUser = await database.updateDocument(COLLECTION_ID, documentId, {
        highScore: newHighScore,
      });
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
import { Router, Request, Response } from "express";
import { Document } from "mongoose";

import log from "../utils/log";

// Models
import ChatModel, { Chat, Message } from "../Models/Chat";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Instantiate the router
const chatRoutes = Router();

// Use Middleware
chatRoutes.use(verifyToken);

/**
 * Route for getting chat
 * @name GET /chats/:chatId/messages
 * @function
 * @alias module:Routes/chatRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
chatRoutes.get(
  "/:matchId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const matchId = req.params.matchId;

      // Find the chat
      const chat = await ChatModel.findOne({ match: matchId });

      // Check if chat exists
      if (!chat) return res.status(404).send("Chat not found");

      return res.status(200).send(chat);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
 * Route for creating a new chat for a match.
 * @name POST /chats
 * @function
 * @alias module:Routes/chatRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
chatRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { match } = req.body;

    // Validate input
    if (!match) return res.status(400).send("Missing required fields");

    // Check if chat already exists
    const existingChat = await ChatModel.findOne({ match });
    if (existingChat) return res.status(409).send("Chat already exists");

    // Create new chat
    const newChat: Document & Chat = new ChatModel({
      match,
      messages: [],
      employerSilence: false,
      candidateSilence: false,
    });

    // Save and return new chat
    await newChat.save();
    return res.status(201).send("New chat created");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

/**
 * Route for deleting a chat.
 * @name DELETE /chats/:chatId
 * @function
 * @alias module:Routes/chatRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
chatRoutes.delete(
  "/:chatId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const chatId = req.params.chatId;

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) return res.status(404).send("Chat not found");

      // Delete the chat
      await chat.delete();

      return res.status(200).send("Chat deleted successfully");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
 * Route for getting messages in a chat with pagination.
 * @name GET /chats/:chatId/messages
 * @function
 * @alias module:Routes/chatRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
chatRoutes.get(
  "/:chatId/:page/:limit/messages",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const chatId = req.params.chatId;
      const page = parseInt(req.params.page) || 1;
      const limit = parseInt(req.params.limit) || 10;

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) return res.status(404).send("Chat not found");

      // Get messages with pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const messages = chat.messages.slice(startIndex, endIndex);

      return res.status(200).send(messages);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
 * Route for sending a message to a chat.
 * @name POST /chats/:chatId/messages
 * @function
 * @alias module:Routes/chatRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
chatRoutes.post(
  "/:chatId/messages",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { content, employerSent } = req.body;
      const chatId = req.params.chatId;

      // Validate input
      if (!content) return res.status(400).send("Message content is required");
      if (employerSent === undefined)
        return res.status(400).send("Sender information is required");

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) return res.status(404).send("Chat not found");

      // Check if chat has been silenced
      //   if (
      //     (chat.employerSilence && whoSent === "employer") ||
      //     (chat.candidateSilence && whoSent === "candidate")
      //   ) {
      //     return res.status(403).send("Cannot send message to silenced chat");
      //   }

      // Create new message
      const newMessage: Message = {
        content,
        employerSent,
        timeSent: new Date(),
      };

      // Add message to chat and save
      chat.messages.push(newMessage);
      await chat.save();

      return res.status(201).send(newMessage);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
 * Route for updating employerSilence and candidateSilence in a chat.
 * Just pass in one or more of "employerSilence": true as the body, candidate silence works as well.
 * @name PATCH /chats/:chatId/silence
 * @function
 * @alias module:Routes/chatRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
chatRoutes.patch(
  "/:chatId/silence",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { employerSilence, candidateSilence } = req.body;
      const chatId = req.params.chatId;

      // Validate input
      if (employerSilence === undefined && candidateSilence === undefined) {
        return res
          .status(400)
          .send("At least one silence parameter is required");
      }

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) return res.status(404).send("Chat not found");

      // Update employerSilence and candidateSilence
      if (employerSilence !== undefined) chat.employerSilence = employerSilence;
      if (candidateSilence !== undefined)
        chat.candidateSilence = candidateSilence;
      await chat.save();

      return res.status(200).send(chat);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
);

export default chatRoutes;

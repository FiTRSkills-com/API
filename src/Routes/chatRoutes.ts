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

Route for creating a new chat for a match.

@name POST /chats

@function

@alias module:Routes/chatRoutes

@property {Request} req Express Request

@property {Response} res Express Response

@returns {Promise<any>}
*/
chatRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { match } = req.body;

    // Validate input
    if (!match) {
      log.warn("Missing required fields in request body"); // Log the warning
      return res.status(400).send("Missing required fields");
    }

    // Check if chat already exists
    const existingChat = await ChatModel.findOne({ match });
    if (existingChat) {
      log.warn("Chat already exists"); // Log the warning
      return res.status(409).send("Chat already exists");
    }

    // Create new chat
    const newChat: Document & Chat = new ChatModel({
      match,
      messages: [],
      employerSilence: false,
      candidateSilence: false,
    });

    // Save and return new chat
    await newChat.save();
    log.info("New chat created"); // Log the successful creation
    return res.status(201).send("New chat created");
  } catch (err) {
    log.error(`Error creating new chat: ${err}`); // Log the error
    return res.status(500).send("Internal server error");
  }
});

/**

Route for deleting a chat.

@name DELETE /chats/:chatId

@function

@alias module:Routes/chatRoutes

@property {Request} req Express Request

@property {Response} res Express Response

@returns {Promise<any>}
*/
chatRoutes.delete(
  "/:chatId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const chatId = req.params.chatId;

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) {
        log.warn("Chat not found"); // Log the warning
        return res.status(404).send("Chat not found");
      }

      // Delete the chat
      await chat.delete();
      log.info(`Chat deleted successfully: ${chatId}`); // Log the successful deletion
      return res.status(200).send("Chat deleted successfully");
    } catch (err) {
      log.error(`Error deleting chat: ${err}`); // Log the error
      return res.status(500).send("Internal server error");
    }
  }
);

/**

Route for getting messages in a chat with pagination.
@name GET /chats/:chatId/messages
@function
@alias module:Routes/chatRoutes
@property {Request} req Express Request
@property {Response} res Express Response
@returns {Promise<any>}
*/
chatRoutes.get(
  "/:chatId/messages",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const chatId = req.params.chatId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) {
        log.warn("Chat not found"); // Log the warning
        return res.status(404).send("Chat not found");
      }

      // Get messages with pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const messages = chat.messages.slice(startIndex, endIndex);

      log.info(`Fetched messages for chat ${chatId}`); // Log the successful fetch
      return res.status(200).send(messages);
    } catch (err) {
      log.error(`Error fetching messages: ${err}`); // Log the error
      return res.status(500).send("Internal server error");
    }
  }
);

/**

Route for sending a message to a chat.

@name POST /chats/:chatId/messages

@function

@alias module:Routes/chatRoutes

@property {Request} req Express Request

@property {Response} res Express Response

@returns {Promise<any>}
*/
chatRoutes.post(
  "/:chatId/messages",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { content, whoSent } = req.body;
      const chatId = req.params.chatId;

      // Validate input
      if (!content) {
        log.warn("Message content is required"); // Log the warning
        return res.status(400).send("Message content is required");
      }
      if (!whoSent) {
        log.warn("Sender information is required"); // Log the warning
        return res.status(400).send("Sender information is required");
      }

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) {
        log.warn("Chat not found"); // Log the warning
        return res.status(404).send("Chat not found");
      }

      // Create new message
      const newMessage: Message = {
        content,
        whoSent,
        timeSent: new Date(),
      };

      // Add message to chat and save
      chat.messages.push(newMessage);
      await chat.save();

      log.info(`Message sent to chat ${chatId}`); // Log the successful message send
      return res.status(200).send(newMessage);
    } catch (err) {
      log.error(`Error sending message: ${err}`); // Log the error
      return res.status(500).send("Internal server error");
    }
  }
);

/**

Route for updating employerSilence and candidateSilence in a chat.

Just pass in one or more of "employerSilence": true as the body, candidate silence works as well.

@name PATCH /chats/:chatId/silence

@function

@alias module:Routes/chatRoutes

@property {Request} req Express Request

@property {Response} res Express Response

@returns {Promise<any>}
*/
chatRoutes.patch(
  "/:chatId/silence",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { employerSilence, candidateSilence } = req.body;
      const chatId = req.params.chatId;

      // Validate input
      if (!employerSilence && !candidateSilence) {
        log.warn("At least one silence parameter is required"); // Log the warning
        return res
          .status(400)
          .send("At least one silence parameter is required");
      }

      // Find the chat
      const chat = await ChatModel.findById(chatId);

      // Check if chat exists
      if (!chat) {
        log.warn("Chat not found"); // Log the warning
        return res.status(404).send("Chat not found");
      }

      // Update employerSilence and candidateSilence
      if (employerSilence !== undefined) chat.employerSilence = employerSilence;
      if (candidateSilence !== undefined)
        chat.candidateSilence = candidateSilence;
      await chat.save();

      log.info(`Updated silence settings for chat ${chatId}`); // Log the successful update
      return res.status(200).send(chat);
    } catch (err) {
      log.error(`Error updating silence settings: ${err}`); // Log the error
      return res.status(500).send("Internal server error");
    }
  }
);

export default chatRoutes;

import { Schema, model } from "mongoose";

export interface Message {
  content: String;
  whoSent: String;
  timeSent: Date;
}

const MessageSchema: Schema = new Schema<Message>({
  content: {
    type: String,
    required: true,
  },
  whoSent: {
    type: String,
    required: true,
  },
  timeSent: {
    type: Date,
    required: true,
  },
});

export interface Chat {
  match: String;
  messages: Message[];
  employerSilence: boolean;
  candidateSilence: boolean;
}

const ChatSchema: Schema = new Schema<Chat>({
  match: {
    type: Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  messages: [
    {
      type: MessageSchema,
      required: true,
      _id: false,
    },
  ],
  employerSilence: {
    type: Boolean,
    required: true,
  },
  candidateSilence: {
    type: Boolean,
    required: true,
  },
});

const ChatModel = model("Chat", ChatSchema);
export default ChatModel;

import { Schema, model } from "mongoose";

export interface Message {
  content: String;
  employerSent: boolean;
  timeSent: Date;
}

const MessageSchema: Schema = new Schema<Message>({
  content: {
    type: String,
    required: true,
  },
  employerSent: {
    type: Boolean,
    required: true,
  },
  timeSent: {
    type: Date,
    required: true,
  },
});

interface Chat {
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

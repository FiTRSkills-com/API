import { Schema, model } from "mongoose";

export enum matchStatus {
  PRE_MATCH = "Pre Match",
  MATCH = "Match",
  RETRACTED = "Retracted",
  INTERVIEW_SCHEDULED = "Inteview Scheduled",
  POST_INTERVIEW = "Post Interview",
}

export enum generalStatus {
  INTERESTED = "Interested",
  UNINTERESTED = "Uninterested",
  RETRACTED = "Retracted",
}

interface Status {
  matchStatus: String;
  generalStatus: String;
  dateModified: Date;
  previousStatus: String;
}

const StatusSchema: Schema = new Schema<Status>({
  matchStatus: {
    type: String,
    required: false,
  },
  generalStatus: {
    type: String,
    required: false,
  },
  dateModified: {
    type: Date,
    required: true,
  },
  previousStatus: {
    type: Schema.Types.ObjectId,
    ref: "Status",
  },
});

const StatusModel = model("Status", StatusSchema);
export default StatusModel;
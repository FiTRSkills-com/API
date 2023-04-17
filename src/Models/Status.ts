import { Schema, model } from "mongoose";

export enum matchStatus {
  PRE_MATCH = "Pre Match",
  MATCH = "Match",
  RETRACTED = "Retracted",
  REJECTED = "Rejected",
  INTERVIEW_SCHEDULED = "Interview Scheduled",
  POST_INTERVIEW = "Post Interview",
}

export enum generalStatus {
  PENDING = "Pending",
  INTERESTED = "Interested",
  UNINTERESTED = "Uninterested",
  RETRACTED = "Retracted",
}

interface Status {
  matchStatus?: String;
  generalStatus?: String;
  dateModified: Date;
  previousStatus?: String;
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
    required: false,
  },
});

const StatusModel = model("Status", StatusSchema);

export async function createDefaultMatchStatus() {
  let status = new StatusModel({
    matchStatus: matchStatus.PRE_MATCH,
    generalStatus: "",
    dateModified: new Date(Date.now()),
  });
  await status.save();
  return status;
}

export async function createDefaultCandidateMatchStatus() {
  let status = new StatusModel({
    matchStatus: "",
    generalStatus: generalStatus.INTERESTED,
    dateModified: new Date(Date.now()),
  });
  await status.save();
  return status;
}

export async function createDefaultEmployerPendingStatus() {
  let status = new StatusModel({
    matchStatus: "",
    generalStatus: generalStatus.PENDING,
    dateModified: new Date(Date.now()),
  });
  await status.save();
  return status;
}

export default StatusModel;

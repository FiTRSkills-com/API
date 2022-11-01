import { Schema, model } from "mongoose";

export enum generalStatus {
  PRE_MATCH = "Pre Match",
  MATCH = "Match",
  RETRACTED = "Retracted",
  INTERVIEW_SCHEDULED = "Inteview Scheduled",
  POST_INTERVIEW = "Post Interview",
}

export enum candidateStatus {
  CANDIDATE_INTERESTED = "Candidate Interested",
  CANDIDATE_UNINTERESTED = "Candidate Uninterested",
  CANDIDATE_RETRACTED = "Candidate Retracted",
}

export enum employerStatus {
  EMPLOYER_INTERESTED = "Employer Interested",
  EMPLOYER_UNINTERESTED = "Employer Uninterested",
  EMPLOYER_RETRACTED = "Employer Retracted",
}

interface Status {
  currentStatus: String;
  dateModified: Date;
  previousStatus: String;
}

const StatusSchema: Schema = new Schema<Status>({
  currentStatus: {
    type: String,
    required: true,
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

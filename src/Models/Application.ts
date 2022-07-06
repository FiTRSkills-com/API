import { Schema, model } from "mongoose";

interface Timeslot {
  date: Date;
  times: Date[];
}

export interface Application {
  job: string;
  user: string;
  status: string;
  interviewTimeSlots: Timeslot[];
}

const ApplicationSchema: Schema = new Schema<Application>({
  job: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  interviewTimeSlots: [
    {
      date: {
        type: Date,
      },
      times: [
        {
          type: Date
        }
      ]
    },
  ]
})

// Create and export the model
const ApplicationModel = model("Application", ApplicationSchema);
export default ApplicationModel;

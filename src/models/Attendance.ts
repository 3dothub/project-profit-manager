import mongoose, { Schema, models, model } from "mongoose";

export interface AttendanceDocument extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  status: "Present" | "Half Day" | "Absent";
  salary: number;
  createdAt: Date;
}

const AttendanceSchema = new Schema<AttendanceDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Half Day", "Absent"], required: true },
    salary: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate attendance for the same employee on the same date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ projectId: 1, date: -1 });

export default models.Attendance || model<AttendanceDocument>("Attendance", AttendanceSchema);

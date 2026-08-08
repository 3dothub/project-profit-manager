import mongoose, { Schema, models, model } from "mongoose";

export interface EmployeeDocument extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  role: string;
  dailySalary: number;
  joiningDate: Date;
  createdAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, required: true, trim: true },
    dailySalary: { type: Number, required: true, min: [1, "Daily salary must be greater than 0"] },
    joiningDate: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Employee || model<EmployeeDocument>("Employee", EmployeeSchema);

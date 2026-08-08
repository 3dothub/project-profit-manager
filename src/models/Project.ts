import mongoose, { Schema, models, model } from "mongoose";

export interface ProjectDocument extends mongoose.Document {
  name: string;
  budget: number;
  startDate: Date;
  endDate?: Date;
  description?: string;
  status: "Active" | "Completed" | "On Hold";
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: [1, "Budget must be greater than 0"] },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ name: 1 });
ProjectSchema.index({ status: 1 });

export default models.Project || model<ProjectDocument>("Project", ProjectSchema);

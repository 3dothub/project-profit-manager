import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Project from "@/models/Project";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/projects/:projectId/employees
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid project id" }, { status: 400 });
    }

    const employees = await Employee.find({ projectId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("GET employees error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
  }
}

// POST /api/projects/:projectId/employees
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid project id" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, role, dailySalary, joiningDate } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Employee name is required" }, { status: 400 });
    }
    if (!role || !role.trim()) {
      return NextResponse.json({ success: false, error: "Employee role is required" }, { status: 400 });
    }
    if (!dailySalary || Number(dailySalary) <= 0) {
      return NextResponse.json(
        { success: false, error: "Daily salary must be greater than 0" },
        { status: 400 }
      );
    }
    if (!joiningDate) {
      return NextResponse.json({ success: false, error: "Joining date is required" }, { status: 400 });
    }

    const employee = await Employee.create({
      projectId: id,
      name: name.trim(),
      phone: phone?.trim(),
      role: role.trim(),
      dailySalary: Number(dailySalary),
      joiningDate: new Date(joiningDate),
    });

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error) {
    console.error("POST employees error:", error);
    return NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 });
  }
}

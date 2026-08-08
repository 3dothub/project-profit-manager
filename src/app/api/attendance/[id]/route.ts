import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { calculateAttendanceSalary } from "@/lib/calculations";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/attendance/:id - update status (recalculates salary automatically)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid attendance id" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!["Present", "Half Day", "Absent"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid attendance status" }, { status: 400 });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json({ success: false, error: "Attendance record not found" }, { status: 404 });
    }

    const employee = await Employee.findById(attendance.employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, error: "Related employee not found" }, { status: 404 });
    }

    attendance.status = status;
    attendance.salary = calculateAttendanceSalary(status, employee.dailySalary);
    await attendance.save();

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error("PUT attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to update attendance" }, { status: 500 });
  }
}

// DELETE /api/attendance/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid attendance id" }, { status: 400 });
    }

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return NextResponse.json({ success: false, error: "Attendance record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete attendance" }, { status: 500 });
  }
}

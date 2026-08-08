import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { calculateAttendanceSalary } from "@/lib/calculations";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/projects/:projectId/attendance?date=YYYY-MM-DD
// Returns attendance for a specific date, including every employee on the
// project even if they don't yet have a record for that date (status "Absent").
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid project id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Date-range mode (used by the daily summary page)
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      const records = await Attendance.find({ projectId: id, date: dateFilter })
        .sort({ date: -1 })
        .lean();
      return NextResponse.json({ success: true, data: records });
    }

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const [employees, records] = await Promise.all([
      Employee.find({ projectId: id }).lean(),
      Attendance.find({ projectId: id, date: { $gte: dayStart, $lte: dayEnd } }).lean(),
    ]);

    const recordsByEmployee = new Map(records.map((r) => [r.employeeId.toString(), r]));

    const merged = employees.map((emp) => {
      const record = recordsByEmployee.get(emp._id.toString());
      return {
        _id: record?._id ?? null,
        projectId: id,
        employeeId: emp._id,
        employeeName: emp.name,
        dailySalary: emp.dailySalary,
        date: dayStart,
        status: record?.status ?? null,
        salary: record?.salary ?? 0,
      };
    });

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("GET attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST /api/projects/:projectId/attendance - mark attendance for an employee on a date
// If a record already exists for that employee + date, it is updated instead
// of duplicated (upsert), satisfying the "no duplicate attendance" requirement.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid project id" }, { status: 400 });
    }

    const body = await req.json();
    const { employeeId, date, status } = body;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return NextResponse.json({ success: false, error: "Valid employeeId is required" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ success: false, error: "Date is required" }, { status: 400 });
    }
    if (!["Present", "Half Day", "Absent"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid attendance status" }, { status: 400 });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const salary = calculateAttendanceSalary(status, employee.dailySalary);

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: dayStart },
      { projectId: id, employeeId, date: dayStart, status, salary },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { success: false, error: "Attendance for this employee on this date already exists" },
        { status: 409 }
      );
    }
    console.error("POST attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to record attendance" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Expense, { EXPENSE_CATEGORIES, PAYMENT_METHODS, ExpenseDocument } from "@/models/Expense";
import Project from "@/models/Project";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/projects/:projectId/expenses - list expenses for a project (with optional date range filter)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid project id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query: Record<string, unknown> = { projectId: id };
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      query.date = dateFilter;
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).lean<ExpenseDocument[]>();

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// POST /api/projects/:projectId/expenses - add a new expense
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
    const { date, category, description, amount, paymentMethod, notes } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: "Expense date is required" }, { status: 400 });
    }
    if (!EXPENSE_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, error: "Invalid expense category" }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ success: false, error: "Description is required" }, { status: 400 });
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: "Invalid payment method" }, { status: 400 });
    }

    const expense = await Expense.create({
      projectId: id,
      date: new Date(date),
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMethod,
      notes: notes?.trim(),
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error("POST expenses error:", error);
    return NextResponse.json({ success: false, error: "Failed to create expense" }, { status: 500 });
  }
}

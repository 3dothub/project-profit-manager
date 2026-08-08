import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Expense, { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/models/Expense";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/expenses/:id - update an expense
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid expense id" }, { status: 400 });
    }

    const body = await req.json();
    const { date, category, description, amount, paymentMethod, notes } = body;

    if (category !== undefined && !EXPENSE_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, error: "Invalid expense category" }, { status: 400 });
    }
    if (paymentMethod !== undefined && !PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: "Invalid payment method" }, { status: 400 });
    }
    if (amount !== undefined && Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be greater than 0" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (date !== undefined) update.date = new Date(date);
    if (category !== undefined) update.category = category;
    if (description !== undefined) update.description = description.trim();
    if (amount !== undefined) update.amount = Number(amount);
    if (paymentMethod !== undefined) update.paymentMethod = paymentMethod;
    if (notes !== undefined) update.notes = notes?.trim();

    const expense = await Expense.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return NextResponse.json({ success: false, error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error("PUT expense error:", error);
    return NextResponse.json({ success: false, error: "Failed to update expense" }, { status: 500 });
  }
}

// DELETE /api/expenses/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid expense id" }, { status: 400 });
    }

    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return NextResponse.json({ success: false, error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE expense error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete expense" }, { status: 500 });
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Receipt, Download } from "lucide-react";
import ExpenseTable from "@/components/expenses/ExpenseTable";
import ExpenseModal from "@/components/expenses/ExpenseModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import FAB from "@/components/ui/FAB";
import { IExpense } from "@/types/expense";
import { formatDate } from "@/lib/calculations";
import { downloadCSV } from "@/lib/csv";
import toast from "react-hot-toast";

export default function ExpensesPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IExpense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/expenses`);
    const json = await res.json();
    if (json.success) setExpenses(json.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchExpenses();
  }, [projectId, fetchExpenses]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Expense deleted");
        setDeleteTarget(null);
        fetchExpenses();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    downloadCSV(
      `expenses-${projectId}.csv`,
      expenses.map((e) => ({
        Date: formatDate(e.date),
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        "Payment Method": e.paymentMethod,
        Notes: e.notes || "",
      }))
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
          <p className="text-sm text-gray-500">Daily project expenses across all categories.</p>
        </div>
        <div className="flex gap-2">
          {expenses.length > 0 && (
            <button className="btn-secondary" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          <button
            className="btn-primary hidden sm:inline-flex"
            onClick={() => {
              setEditingExpense(null);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading expenses..." />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses recorded"
            description="Add your first expense to start tracking project spending."
            action={
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" /> Add Expense
              </button>
            }
          />
        ) : (
          <ExpenseTable
            expenses={expenses}
            onEdit={(expense) => {
              setEditingExpense(expense);
              setShowModal(true);
            }}
            onDelete={(expense) => setDeleteTarget(expense)}
          />
        )}
      </div>

      {showModal && (
        <ExpenseModal
          projectId={projectId}
          editingExpense={editingExpense}
          onClose={() => setShowModal(false)}
          onSaved={fetchExpenses}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        message={`Delete the expense "${deleteTarget?.description}"? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <FAB
        label="Add Expense"
        onClick={() => {
          setEditingExpense(null);
          setShowModal(true);
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Users, Pencil, Trash2, Phone } from "lucide-react";
import EmployeeModal from "@/components/employees/EmployeeModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { IEmployee } from "@/types/employee";
import { formatCurrency, formatDate } from "@/lib/calculations";
import toast from "react-hot-toast";

export default function EmployeesPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/employees`);
    const json = await res.json();
    if (json.success) setEmployees(json.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchEmployees();
  }, [projectId, fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/employees/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Employee removed");
        setDeleteTarget(null);
        fetchEmployees();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
          <p className="text-sm text-gray-500">Workers assigned to this project.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees added"
            description="Add workers to this project to start recording attendance and salary."
            action={
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" /> Add Employee
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map((emp) => (
              <div key={emp._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.role}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingEmployee(emp);
                        setShowModal(true);
                      }}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(emp)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{formatCurrency(emp.dailySalary)} / day</p>
                  {emp.phone && (
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <Phone className="h-3.5 w-3.5" /> {emp.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Joined {formatDate(emp.joiningDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EmployeeModal
          projectId={projectId}
          editingEmployee={editingEmployee}
          onClose={() => setShowModal(false)}
          onSaved={fetchEmployees}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        message={`Remove "${deleteTarget?.name}" from this project? Their attendance history will also be deleted.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

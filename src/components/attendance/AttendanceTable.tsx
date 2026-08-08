"use client";

import clsx from "clsx";
import { formatCurrency } from "@/lib/calculations";

export interface AttendanceRow {
  _id: string | null;
  employeeId: string;
  employeeName?: string;
  dailySalary: number;
  status: "Present" | "Half Day" | "Absent" | null;
  salary: number;
}

interface AttendanceTableProps {
  rows: AttendanceRow[];
  onMark: (employeeId: string, status: "Present" | "Half Day" | "Absent") => void;
  savingEmployeeId?: string | null;
}

const statusStyles: Record<string, string> = {
  Present: "bg-green-600 text-white border-green-600",
  "Half Day": "bg-yellow-500 text-white border-yellow-500",
  Absent: "bg-red-600 text-white border-red-600",
};

const inactiveStyles = "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";

export default function AttendanceTable({ rows, onMark, savingEmployeeId }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Employee</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Salary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.employeeId} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{row.employeeName}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {(["Present", "Half Day", "Absent"] as const).map((status) => (
                    <button
                      key={status}
                      disabled={savingEmployeeId === row.employeeId}
                      onClick={() => onMark(row.employeeId, status)}
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50",
                        row.status === status ? statusStyles[status] : inactiveStyles
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(row.salary)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

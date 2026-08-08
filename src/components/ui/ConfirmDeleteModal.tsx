"use client";

import Modal from "@/components/ui/Modal";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  message: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = "Delete record",
  message,
  loading,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null;
  return (
    <Modal onClose={onCancel} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

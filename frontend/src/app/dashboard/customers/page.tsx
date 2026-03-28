"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Customer } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";

const empty: Customer = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  licenseNumber: "",
};

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data: Customer } | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const list = await api.customers.list();
      setRows(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!modal) return;
    const { mode, data } = modal;
    try {
      if (mode === "create") {
        await api.customers.create({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          licenseNumber: data.licenseNumber,
        });
      } else {
        await api.customers.update(data._id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          licenseNumber: data.licenseNumber,
        });
      }
      setModal(null);
      await load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this customer?")) return;
    try {
      await api.customers.remove(id);
      await load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="card-surface h-64 animate-pulse bg-slate-100" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Keep records for renters"
        action={
          <button
            type="button"
            onClick={() =>
              setModal({
                mode: "create",
                data: { ...empty, _id: "new" },
              })
            }
            className="btn-primary w-full sm:w-auto"
          >
            Add customer
          </button>
        }
      />

      {/* Mobile list */}
      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="card-surface px-4 py-10 text-center text-sm text-ink-muted">No customers yet.</li>
        ) : (
          rows.map((c) => (
            <li key={c._id} className="card-surface overflow-hidden p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">{c.email}</p>
                  <p className="mt-2 text-sm text-ink-muted">{c.phone}</p>
                  {c.licenseNumber ? (
                    <p className="mt-1 text-xs text-ink-subtle">License: {c.licenseNumber}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-dark"
                    onClick={() => setModal({ mode: "edit", data: { ...c } })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    onClick={() => remove(c._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/90 text-left text-ink-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Phone</th>
                <th className="px-6 py-3 font-semibold">License</th>
                <th className="px-6 py-3 font-semibold w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c._id} className="transition hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-6 py-3 text-ink-muted">{c.email}</td>
                  <td className="px-6 py-3 text-ink-muted">{c.phone}</td>
                  <td className="px-6 py-3 text-ink-muted">{c.licenseNumber || "—"}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/15"
                        onClick={() => setModal({ mode: "edit", data: { ...c } })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        onClick={() => remove(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="py-12 text-center text-sm text-ink-muted">No customers yet.</p>
        )}
      </div>

      {modal ? (
        <Modal
          title={modal.mode === "create" ? "New customer" : "Edit customer"}
          onClose={() => setModal(null)}
          footer={
            <>
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={save}>
                Save
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <Field
              label="Name"
              value={modal.data.name}
              onChange={(v) => setModal({ ...modal, data: { ...modal.data, name: v } })}
            />
            <Field
              label="Email"
              type="email"
              value={modal.data.email}
              onChange={(v) => setModal({ ...modal, data: { ...modal.data, email: v } })}
            />
            <Field
              label="Phone"
              value={modal.data.phone}
              onChange={(v) => setModal({ ...modal, data: { ...modal.data, phone: v } })}
            />
            <Field
              label="Address"
              value={modal.data.address || ""}
              onChange={(v) => setModal({ ...modal, data: { ...modal.data, address: v } })}
            />
            <Field
              label="License number"
              value={modal.data.licenseNumber || ""}
              onChange={(v) =>
                setModal({ ...modal, data: { ...modal.data, licenseNumber: v } })
              }
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
}

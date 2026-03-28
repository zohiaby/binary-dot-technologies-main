"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Vehicle } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";

const empty: Vehicle = {
  _id: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  licensePlate: "",
  color: "",
  dailyRate: 0,
  isAvailable: true,
};

export default function VehiclesPage() {
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data: Vehicle } | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const list = await api.vehicles.list();
      setRows(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load vehicles");
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
        await api.vehicles.create({
          make: data.make,
          model: data.model,
          year: data.year,
          licensePlate: data.licensePlate,
          color: data.color,
          dailyRate: data.dailyRate,
          isAvailable: data.isAvailable,
        });
      } else {
        await api.vehicles.update(data._id, {
          make: data.make,
          model: data.model,
          year: data.year,
          licensePlate: data.licensePlate,
          color: data.color,
          dailyRate: data.dailyRate,
          isAvailable: data.isAvailable,
        });
      }
      setModal(null);
      await load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await api.vehicles.remove(id);
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
        title="Vehicles"
        subtitle="Fleet available for booking"
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
            Add vehicle
          </button>
        }
      />

      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="card-surface px-4 py-10 text-center text-sm text-ink-muted">No vehicles yet.</li>
        ) : (
          rows.map((v) => (
            <li key={v._id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {v.make} {v.model}{" "}
                    <span className="font-normal text-ink-muted">{v.year}</span>
                  </p>
                  <p className="mt-1 font-mono text-sm text-brand-dark">{v.licensePlate}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold text-ink">${v.dailyRate.toFixed(2)}/day</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        v.isAvailable
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-200/60"
                          : "bg-amber-50 text-amber-800 ring-amber-200/60"
                      }`}
                    >
                      {v.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-dark"
                    onClick={() => setModal({ mode: "edit", data: { ...v } })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    onClick={() => remove(v._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="hidden md:block card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/90 text-left text-ink-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">Vehicle</th>
                <th className="px-6 py-3 font-semibold">Plate</th>
                <th className="px-6 py-3 font-semibold">Daily rate</th>
                <th className="px-6 py-3 font-semibold">Available</th>
                <th className="px-6 py-3 font-semibold w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((v) => (
                <tr key={v._id} className="transition hover:bg-slate-50/80">
                  <td className="px-6 py-3">
                    <span className="font-medium text-ink">
                      {v.make} {v.model}
                    </span>
                    <span className="text-ink-muted ml-2">{v.year}</span>
                  </td>
                  <td className="px-6 py-3 font-mono text-ink-muted">{v.licensePlate}</td>
                  <td className="px-6 py-3 font-medium text-ink">${v.dailyRate.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        v.isAvailable
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-200/60"
                          : "bg-amber-50 text-amber-800 ring-amber-200/60"
                      }`}
                    >
                      {v.isAvailable ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/15"
                        onClick={() => setModal({ mode: "edit", data: { ...v } })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        onClick={() => remove(v._id)}
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
          <p className="py-12 text-center text-sm text-ink-muted">No vehicles yet.</p>
        )}
      </div>

      {modal ? (
        <Modal
          title={modal.mode === "create" ? "New vehicle" : "Edit vehicle"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink">Make</label>
              <input
                value={modal.data.make}
                onChange={(e) =>
                  setModal({ ...modal, data: { ...modal.data, make: e.target.value } })
                }
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink">Model</label>
              <input
                value={modal.data.model}
                onChange={(e) =>
                  setModal({ ...modal, data: { ...modal.data, model: e.target.value } })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Year</label>
              <input
                type="number"
                value={modal.data.year}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    data: { ...modal.data, year: Number(e.target.value) },
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Daily rate</label>
              <input
                type="number"
                step="0.01"
                value={modal.data.dailyRate}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    data: { ...modal.data, dailyRate: Number(e.target.value) },
                  })
                }
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink">License plate</label>
              <input
                value={modal.data.licensePlate}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    data: { ...modal.data, licensePlate: e.target.value },
                  })
                }
                className="input-field uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink">Color</label>
              <input
                value={modal.data.color || ""}
                onChange={(e) =>
                  setModal({ ...modal, data: { ...modal.data, color: e.target.value } })
                }
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2 flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <input
                type="checkbox"
                id="avail"
                className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand/30"
                checked={modal.data.isAvailable}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    data: { ...modal.data, isAvailable: e.target.checked },
                  })
                }
              />
              <label htmlFor="avail" className="text-sm font-medium text-ink">
                Available for booking
              </label>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

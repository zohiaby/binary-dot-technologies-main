"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Booking, type Customer, type Vehicle } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";

function isPopulatedCustomer(c: Booking["customer"]): c is Customer {
  return typeof c === "object" && c !== null && "name" in c;
}

function isPopulatedVehicle(v: Booking["vehicle"]): v is Vehicle {
  return typeof v === "object" && v !== null && "make" in v;
}

const statuses: Booking["status"][] = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
];

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200/60",
    confirmed: "bg-sky-50 text-sky-800 ring-sky-200/60",
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    completed: "bg-slate-100 text-slate-700 ring-slate-200/80",
    cancelled: "bg-red-50 text-red-700 ring-red-200/60",
  };
  return map[status] || "bg-slate-100 text-slate-700 ring-slate-200/80";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    customerId: string;
    vehicleId: string;
    startDate: string;
    endDate: string;
    status: Booking["status"];
    notes: string;
    id?: string;
  } | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const [b, c, v] = await Promise.all([
        api.bookings.list(),
        api.customers.list(),
        api.vehicles.list(),
      ]);
      setBookings(b);
      setCustomers(c);
      setVehicles(v);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    const today = new Date().toISOString().slice(0, 10);
    setModal({
      mode: "create",
      customerId: customers[0]?._id || "",
      vehicleId: vehicles.find((x) => x.isAvailable)?._id || vehicles[0]?._id || "",
      startDate: today,
      endDate: today,
      status: "confirmed",
      notes: "",
    });
  }

  function openEdit(b: Booking) {
    const cid = isPopulatedCustomer(b.customer) ? b.customer._id : String(b.customer);
    const vid = isPopulatedVehicle(b.vehicle) ? b.vehicle._id : String(b.vehicle);
    setModal({
      mode: "edit",
      id: b._id,
      customerId: cid,
      vehicleId: vid,
      startDate: new Date(b.startDate).toISOString().slice(0, 10),
      endDate: new Date(b.endDate).toISOString().slice(0, 10),
      status: b.status,
      notes: b.notes || "",
    });
  }

  async function save() {
    if (!modal) return;
    try {
      if (modal.mode === "create") {
        await api.bookings.create({
          customerId: modal.customerId,
          vehicleId: modal.vehicleId,
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          notes: modal.notes,
        });
      } else if (modal.id) {
        await api.bookings.update(modal.id, {
          customerId: modal.customerId,
          vehicleId: modal.vehicleId,
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          notes: modal.notes,
        });
      }
      setModal(null);
      await load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this booking?")) return;
    try {
      await api.bookings.remove(id);
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
        title="Bookings"
        subtitle="Assign vehicles to customers by date range"
        action={
          <button
            type="button"
            onClick={openCreate}
            disabled={!customers.length || !vehicles.length}
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
          >
            New booking
          </button>
        }
      />

      {(!customers.length || !vehicles.length) && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add at least one customer and one vehicle before creating a booking.
        </div>
      )}

      <ul className="space-y-3 md:hidden">
        {bookings.length === 0 ? (
          <li className="card-surface px-4 py-10 text-center text-sm text-ink-muted">No bookings yet.</li>
        ) : (
          bookings.map((b) => (
            <li key={b._id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {isPopulatedCustomer(b.customer) ? b.customer.name : "—"}
                  </p>
                  <p className="text-sm text-ink-muted truncate">
                    {isPopulatedVehicle(b.vehicle)
                      ? `${b.vehicle.make} ${b.vehicle.model}`
                      : "—"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(b.status)}`}
                >
                  {b.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
              </p>
              <p className="mt-2 text-lg font-bold text-ink">${b.totalAmount.toFixed(2)}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-brand/10 py-2.5 text-sm font-semibold text-brand-dark"
                  onClick={() => openEdit(b)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700"
                  onClick={() => remove(b._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="hidden md:block card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/90 text-left text-ink-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Vehicle</th>
                <th className="px-6 py-3 font-semibold">Dates</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b._id} className="transition hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-medium text-ink">
                    {isPopulatedCustomer(b.customer) ? b.customer.name : "—"}
                  </td>
                  <td className="px-6 py-3 text-ink-muted">
                    {isPopulatedVehicle(b.vehicle)
                      ? `${b.vehicle.make} ${b.vehicle.model} (${b.vehicle.licensePlate})`
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-ink-muted">
                    {new Date(b.startDate).toLocaleDateString()} –{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 font-semibold text-ink">${b.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/15"
                        onClick={() => openEdit(b)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        onClick={() => remove(b._id)}
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
        {bookings.length === 0 && (
          <p className="py-12 text-center text-sm text-ink-muted">No bookings yet.</p>
        )}
      </div>

      {modal ? (
        <Modal
          title={modal.mode === "create" ? "New booking" : "Edit booking"}
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Customer</label>
              <select
                value={modal.customerId}
                onChange={(e) => setModal({ ...modal, customerId: e.target.value })}
                className="input-field appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Vehicle</label>
              <select
                value={modal.vehicleId}
                onChange={(e) => setModal({ ...modal, vehicleId: e.target.value })}
                className="input-field appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.make} {v.model} — {v.licensePlate}
                    {!v.isAvailable ? " (unavailable)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Start</label>
                <input
                  type="date"
                  value={modal.startDate}
                  onChange={(e) => setModal({ ...modal, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">End</label>
                <input
                  type="date"
                  value={modal.endDate}
                  onChange={(e) => setModal({ ...modal, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Status</label>
              <select
                value={modal.status}
                onChange={(e) =>
                  setModal({ ...modal, status: e.target.value as Booking["status"] })
                }
                className="input-field capitalize appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Notes</label>
              <textarea
                value={modal.notes}
                onChange={(e) => setModal({ ...modal, notes: e.target.value })}
                rows={3}
                className="input-field min-h-[88px] resize-y"
              />
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

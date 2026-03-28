import { getToken, clearSession } from "./auth-storage";

// const base = process.env.NEXT_PUBLIC_API_URL || "https://test-backend-binary-dot-technologie.vercel.app/api";
const base = "https://test-backend-binary-dot-technologie.vercel.app/api";
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (
    !headers.has("Content-Type") &&
    rest.body &&
    typeof rest.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers,
    mode: "cors",
    credentials: "omit",
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    if (res.status === 401 && !skipAuth) {
      clearSession();
    }
    const msg =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: string }).message)
        : res.statusText;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<{
      token: string;
      admin: { id: string; name: string; email: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
  signup: (body: { name: string; email: string; password: string }) =>
    request<{
      token: string;
      admin: { id: string; name: string; email: string };
    }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),
  me: () =>
    request<{ admin: { id: string; name: string; email: string } }>("/auth/me"),

  customers: {
    list: () => request<Customer[]>("/customers"),
    get: (id: string) => request<Customer>(`/customers/${id}`),
    create: (body: Partial<Customer>) =>
      request<Customer>("/customers", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Customer>) =>
      request<Customer>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ message: string }>(`/customers/${id}`, { method: "DELETE" }),
  },
  vehicles: {
    list: () => request<Vehicle[]>("/vehicles"),
    get: (id: string) => request<Vehicle>(`/vehicles/${id}`),
    create: (body: Partial<Vehicle>) =>
      request<Vehicle>("/vehicles", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Vehicle>) =>
      request<Vehicle>(`/vehicles/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ message: string }>(`/vehicles/${id}`, { method: "DELETE" }),
  },
  bookings: {
    list: () => request<Booking[]>("/bookings"),
    get: (id: string) => request<Booking>(`/bookings/${id}`),
    create: (body: BookingInput) =>
      request<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      id: string,
      body: Partial<BookingInput> & { status?: Booking["status"] },
    ) =>
      request<Booking>(`/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ message: string }>(`/bookings/${id}`, { method: "DELETE" }),
  },
  dashboard: {
    stats: () =>
      request<{
        totalCustomers: number;
        totalVehicles: number;
        availableVehicles: number;
        totalBookings: number;
        totalRevenue: number;
      }>("/dashboard/stats"),
  },
};

export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  createdAt?: string;
};

export type Vehicle = {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  dailyRate: number;
  isAvailable: boolean;
  createdAt?: string;
};

export type Booking = {
  _id: string;
  customer: Customer | string;
  vehicle: Vehicle | string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  notes?: string;
  createdAt?: string;
};

export type BookingInput = {
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status?: Booking["status"];
  notes?: string;
};

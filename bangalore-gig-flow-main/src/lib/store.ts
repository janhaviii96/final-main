// =============================================
// Mock In-Memory / localStorage Store
// Replaces Supabase for a pure frontend demo
// =============================================

export type Role = "tasker" | "helper";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  gender: string;
  phone?: string;
  bio?: string;
  hourly_rate?: number;
  avatar_url?: string;
  is_identity_verified: boolean;
}

export interface Task {
  id: string;
  tasker_id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  budget_min: number;
  budget_max: number;
  status: "open" | "bidding" | "assigned" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  assigned_helper_id?: string | null;
  winning_bid_id?: string | null;
  face_scan_verified?: boolean;
}

export interface Bid {
  id: string;
  task_id: string;
  helper_id: string;
  amount: number;
  estimated_hours: number;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface Verification {
  id: string;
  user_id: string;
  type: "aadhaar" | "face_scan" | "pan" | "police";
  status: "pending" | "approved" | "rejected";
  notes?: string;
  document_url?: string;
  created_at: string;
}

export interface Wallet {
  user_id: string;
  balance: number;
  verification_bonus_claimed: boolean;
}

// ---- helpers ----

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- seed data ----

function seed() {
  if (localStorage.getItem("__seeded")) return;

  const taskerId = "user-tasker-demo";
  const helperId = "user-helper-demo";

  const users: User[] = [
    {
      id: taskerId,
      email: "tasker@demo.com",
      full_name: "Priya Sharma",
      role: "tasker",
      gender: "female",
      phone: "+91 9876543210",
      bio: "Looking for reliable helpers for home tasks.",
      is_identity_verified: false,
    },
    {
      id: helperId,
      email: "helper@demo.com",
      full_name: "Rahul Kumar",
      role: "helper",
      gender: "male",
      phone: "+91 9123456789",
      bio: "Experienced in plumbing, cleaning and repairs.",
      hourly_rate: 300,
      is_identity_verified: true,
    },
  ];

  const tasks: Task[] = [
    {
      id: "task-1",
      tasker_id: taskerId,
      title: "Deep clean my 2BHK apartment",
      description: "Need thorough cleaning of a 2BHK flat in Koramangala including kitchen and bathrooms.",
      category: "Cleaning",
      location_address: "Koramangala, Bengaluru",
      budget_min: 800,
      budget_max: 1500,
      status: "open",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "task-2",
      tasker_id: taskerId,
      title: "Fix leaking bathroom tap",
      description: "One tap in the main bathroom is leaking. Need a plumber to fix it quickly.",
      category: "Plumbing",
      location_address: "Indiranagar, Bengaluru",
      budget_min: 300,
      budget_max: 600,
      status: "open",
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: "task-3",
      tasker_id: "other-user",
      title: "Help moving furniture",
      description: "Need 2-3 people to help move furniture within the same building.",
      category: "Moving & Packing",
      location_address: "Whitefield, Bengaluru",
      budget_min: 500,
      budget_max: 1000,
      status: "open",
      created_at: new Date(Date.now() - 21600000).toISOString(),
    },
  ];

  const verifications: Verification[] = [
    {
      id: "v-1",
      user_id: helperId,
      type: "aadhaar",
      status: "approved",
      created_at: new Date().toISOString(),
    },
    {
      id: "v-2",
      user_id: helperId,
      type: "face_scan",
      status: "approved",
      created_at: new Date().toISOString(),
    },
  ];

  const wallets: Wallet[] = [
    { user_id: taskerId, balance: 0, verification_bonus_claimed: false },
    { user_id: helperId, balance: 30, verification_bonus_claimed: true },
  ];

  save("users", users);
  save("tasks", tasks);
  save("bids", [] as Bid[]);
  save("verifications", verifications);
  save("wallets", wallets);
  save("__seeded", true);
}

seed();

// ---- Auth ----

export function getCurrentUser(): User | null {
  const id = localStorage.getItem("current_user_id");
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}

export function login(email: string, password: string): User {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("No account found with this email");
  // For demo: accept any password (no real auth)
  if (password.length < 1) throw new Error("Password is required");
  localStorage.setItem("current_user_id", user.id);
  return user;
}

export function signup(
  email: string,
  _password: string,
  fullName: string,
  role: Role,
  gender: string
): User {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("An account with this email already exists");
  }
  const user: User = {
    id: uuid(),
    email,
    full_name: fullName,
    role,
    gender,
    is_identity_verified: false,
  };
  save("users", [...users, user]);
  // Create wallet
  const wallets = getWallets();
  wallets.push({ user_id: user.id, balance: 0, verification_bonus_claimed: false });
  save("wallets", wallets);
  localStorage.setItem("current_user_id", user.id);
  return user;
}

export function logout(): void {
  localStorage.removeItem("current_user_id");
}

export function updateUser(id: string, updates: Partial<User>): void {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...updates } : u));
  save("users", users);
}

// ---- Users ----

export function getUsers(): User[] {
  return load<User[]>("users", []);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

// ---- Tasks ----

export function getTasks(): Task[] {
  return load<Task[]>("tasks", []);
}

export function getTaskById(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function createTask(data: Omit<Task, "id" | "created_at">): Task {
  const task: Task = { ...data, id: uuid(), created_at: new Date().toISOString() };
  save("tasks", [...getTasks(), task]);
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): void {
  save("tasks", getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t)));
}

// ---- Bids ----

export function getBids(): Bid[] {
  return load<Bid[]>("bids", []);
}

export function getBidsForTask(taskId: string): Bid[] {
  return getBids().filter((b) => b.task_id === taskId);
}

export function getBidsForHelper(helperId: string): Bid[] {
  return getBids().filter((b) => b.helper_id === helperId);
}

export function createBid(data: Omit<Bid, "id" | "created_at">): Bid {
  const existing = getBids().find(
    (b) => b.task_id === data.task_id && b.helper_id === data.helper_id
  );
  if (existing) throw new Error("You have already placed a bid on this task");
  const bid: Bid = { ...data, id: uuid(), created_at: new Date().toISOString() };
  save("bids", [...getBids(), bid]);
  return bid;
}

export function updateBid(id: string, updates: Partial<Bid>): void {
  save("bids", getBids().map((b) => (b.id === id ? { ...b, ...updates } : b)));
}

// ---- Verifications ----

export function getVerifications(): Verification[] {
  return load<Verification[]>("verifications", []);
}

export function getVerificationsForUser(userId: string): Verification[] {
  return getVerifications().filter((v) => v.user_id === userId);
}

export function upsertVerification(
  data: Omit<Verification, "id" | "created_at">
): void {
  const all = getVerifications();
  const idx = all.findIndex(
    (v) => v.user_id === data.user_id && v.type === data.type
  );
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data };
  } else {
    all.push({ ...data, id: uuid(), created_at: new Date().toISOString() });
  }
  save("verifications", all);
}

// ---- Wallets ----

export function getWallets(): Wallet[] {
  return load<Wallet[]>("wallets", []);
}

export function getWallet(userId: string): Wallet {
  const w = getWallets().find((w) => w.user_id === userId);
  if (w) return w;
  const newWallet: Wallet = { user_id: userId, balance: 0, verification_bonus_claimed: false };
  save("wallets", [...getWallets(), newWallet]);
  return newWallet;
}

export function updateWallet(userId: string, updates: Partial<Wallet>): void {
  const wallets = getWallets();
  const idx = wallets.findIndex((w) => w.user_id === userId);
  if (idx >= 0) {
    wallets[idx] = { ...wallets[idx], ...updates };
  } else {
    wallets.push({ user_id: userId, balance: 0, verification_bonus_claimed: false, ...updates });
  }
  save("wallets", wallets);
}

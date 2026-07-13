var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import "dotenv/config";
import express from "express";
import path from "path";

// src/db/index.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  credentials: () => credentials,
  notifications: () => notifications,
  postbackLogs: () => postbackLogs,
  redeemCodes: () => redeemCodes,
  systemSettings: () => systemSettings,
  userRedemptions: () => userRedemptions,
  users: () => users,
  withdrawals: () => withdrawals
});
import { pgTable, text, integer, boolean, doublePrecision, bigint } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  username: text("username").primaryKey(),
  uid: text("uid").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  balancePoints: integer("balance_points").default(0).notNull(),
  totalReferred: integer("total_referred").default(0).notNull(),
  referredBy: text("referred_by").default("").notNull(),
  pendingCashoutPoints: integer("pending_cashout_points").default(0).notNull(),
  todayWorkPoints: integer("today_work_points").default(0).notNull(),
  ipAddress: text("ip_address").default("").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});
var credentials = pgTable("credentials", {
  username: text("username").primaryKey().references(() => users.username, { onDelete: "cascade" }),
  password: text("password").notNull()
});
var notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.username, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  // 'withdrawal', 'task', 'referral', etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull()
});
var postbackLogs = pgTable("postback_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.username, { onDelete: "cascade" }),
  username: text("username").notNull(),
  payout: doublePrecision("payout").default(0).notNull(),
  pointsCredited: integer("points_credited").default(0).notNull(),
  ip: text("ip").default("0.0.0.0").notNull(),
  campaignName: text("campaign_name").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull()
});
var withdrawals = pgTable("withdrawals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.username, { onDelete: "cascade" }),
  username: text("username").notNull(),
  email: text("email").notNull(),
  method: text("method").notNull(),
  accountNumber: text("account_number").notNull(),
  amountPoints: integer("amount_points").notNull(),
  amountBDT: integer("amount_bdt").notNull(),
  status: text("status").default("pending").notNull(),
  // 'pending', 'approved', 'rejected'
  createdAt: bigint("created_at", { mode: "number" }).notNull()
});
var systemSettings = pgTable("system_settings", {
  id: text("id").primaryKey().default("global"),
  vpnCheckEnabled: boolean("vpn_check_enabled").default(true).notNull(),
  conversionRate: integer("conversion_rate").default(1e4).notNull(),
  pointsToBdtRate: integer("points_to_bdt_rate").default(100).notNull(),
  minWithdrawRechargePoints: integer("min_withdraw_recharge_points").default(2e3).notNull(),
  minWithdrawBankPoints: integer("min_withdraw_bank_points").default(1e4).notNull(),
  adsenseCode: text("adsense_code").default("").notNull(),
  supportLink: text("support_link").default("https://t.me/mrcashbd").notNull()
});
var redeemCodes = pgTable("redeem_codes", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  description: text("description").notNull(),
  image: text("image").default("").notNull(),
  eligibilityType: text("eligibility_type").default("all").notNull(),
  // 'all' or 'limited'
  maxUsers: integer("max_users").default(0).notNull(),
  redeemedCount: integer("redeemed_count").default(0).notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull()
});
var userRedemptions = pgTable("user_redemptions", {
  id: text("id").primaryKey(),
  // username_code
  username: text("username").notNull().references(() => users.username, { onDelete: "cascade" }),
  code: text("code").notNull().references(() => redeemCodes.code, { onDelete: "cascade" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull()
});

// src/db/index.ts
var { Pool } = pkg;
var createPool = () => {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (connectionString) {
    return new Pool({
      connectionString,
      connectionTimeoutMillis: 15e3,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? void 0 : { rejectUnauthorized: false }
    });
  }
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15e3,
    ssl: process.env.SQL_SSL === "true" ? { rejectUnauthorized: false } : void 0
  });
};
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = drizzle(pool, { schema: schema_exports });

// server.ts
import { eq, and, desc, asc, sql } from "drizzle-orm";
var tableMap = {
  users: { table: users, keyCol: "username", keyProp: "username" },
  credentials: { table: credentials, keyCol: "username", keyProp: "username" },
  notifications: { table: notifications, keyCol: "id", keyProp: "id" },
  postback_logs: { table: postbackLogs, keyCol: "id", keyProp: "id" },
  withdrawals: { table: withdrawals, keyCol: "id", keyProp: "id" },
  system_settings: { table: systemSettings, keyCol: "id", keyProp: "id" },
  redeem_codes: { table: redeemCodes, keyCol: "code", keyProp: "code" },
  user_redemptions: { table: userRedemptions, keyCol: "id", keyProp: "id" }
};
var sanitizeDataForSql = (table, data) => {
  const sanitized = {};
  const increments = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === void 0 || !(key in table)) continue;
    if (val && typeof val === "object" && "__increment" in val) {
      increments[key] = val.__increment;
    } else {
      sanitized[key] = val;
    }
  }
  return { sanitized, increments };
};
var CompatDocRef = class {
  constructor(_collectionPath, _docId) {
    this._collectionPath = _collectionPath;
    this._docId = _docId;
  }
  async set(data, options) {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown collection path: ${this._collectionPath}`);
    const { sanitized, increments } = sanitizeDataForSql(tableInfo.table, data);
    const insertValues = { ...sanitized };
    for (const [key, incVal] of Object.entries(increments)) {
      insertValues[key] = incVal;
    }
    if (insertValues[tableInfo.keyProp] === void 0) {
      insertValues[tableInfo.keyProp] = this._docId;
    }
    const updateFields = { ...sanitized };
    for (const [key, incVal] of Object.entries(increments)) {
      updateFields[key] = sql`${tableInfo.table[key]} + ${incVal}`;
    }
    await db.insert(tableInfo.table).values(insertValues).onConflictDoUpdate({
      target: tableInfo.table[tableInfo.keyCol],
      set: updateFields
    });
  }
  async update(data) {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown collection path: ${this._collectionPath}`);
    const { sanitized, increments } = sanitizeDataForSql(tableInfo.table, data);
    const updateFields = { ...sanitized };
    for (const [key, incVal] of Object.entries(increments)) {
      updateFields[key] = sql`${tableInfo.table[key]} + ${incVal}`;
    }
    if (Object.keys(updateFields).length === 0) return;
    await db.update(tableInfo.table).set(updateFields).where(eq(tableInfo.table[tableInfo.keyCol], this._docId));
  }
  async get() {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown collection path: ${this._collectionPath}`);
    const rows = await db.select().from(tableInfo.table).where(eq(tableInfo.table[tableInfo.keyCol], this._docId)).limit(1);
    const exists = rows.length > 0;
    const rowData = exists ? rows[0] : void 0;
    return {
      exists,
      id: this._docId,
      data: () => rowData
    };
  }
  async delete() {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown collection path: ${this._collectionPath}`);
    await db.delete(tableInfo.table).where(eq(tableInfo.table[tableInfo.keyCol], this._docId));
  }
};
var CompatQuery = class _CompatQuery {
  constructor(_collectionPath, whereConditions = [], orderByFields = [], limitVal) {
    this._collectionPath = _collectionPath;
    this._whereConditions = [];
    this._orderByFields = [];
    this._whereConditions = [...whereConditions];
    this._orderByFields = [...orderByFields];
    this._limitVal = limitVal;
  }
  where(field, op, value) {
    return new _CompatQuery(
      this._collectionPath,
      [...this._whereConditions, { field, value }],
      this._orderByFields,
      this._limitVal
    );
  }
  orderBy(field, direction = "asc") {
    return new _CompatQuery(
      this._collectionPath,
      this._whereConditions,
      [...this._orderByFields, { field, direction }],
      this._limitVal
    );
  }
  limit(num) {
    return new _CompatQuery(
      this._collectionPath,
      this._whereConditions,
      this._orderByFields,
      num
    );
  }
  async get() {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown collection path: ${this._collectionPath}`);
    let queryBuilder = db.select().from(tableInfo.table);
    const conditions = this._whereConditions.map((cond) => {
      return eq(tableInfo.table[cond.field], cond.value);
    });
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    const orderSpec = this._orderByFields.map((ord) => {
      return ord.direction === "desc" ? desc(tableInfo.table[ord.field]) : asc(tableInfo.table[ord.field]);
    });
    if (orderSpec.length > 0) {
      queryBuilder = queryBuilder.orderBy(...orderSpec);
    }
    if (this._limitVal !== void 0) {
      queryBuilder = queryBuilder.limit(this._limitVal);
    }
    const rows = await queryBuilder;
    const docs = rows.map((row) => {
      const docId = row[tableInfo.keyProp];
      return {
        id: docId,
        exists: true,
        data: () => row,
        ref: new CompatDocRef(this._collectionPath, docId)
      };
    });
    return {
      size: docs.length,
      empty: docs.length === 0,
      docs,
      forEach: (callback) => {
        docs.forEach(callback);
      }
    };
  }
};
var CompatCollectionRef = class extends CompatQuery {
  constructor(collectionPath) {
    super(collectionPath, [], [], void 0);
  }
  doc(id) {
    const finalId = id || this._generateDocId();
    return new CompatDocRef(this._collectionPath, finalId);
  }
  _generateDocId() {
    if (this._collectionPath === "notifications") {
      return `NT-${Math.floor(1e5 + Math.random() * 9e5)}`;
    } else if (this._collectionPath === "postback_logs") {
      return `LB-${Date.now()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
    } else if (this._collectionPath === "withdrawals") {
      return `WD-${Math.floor(1e5 + Math.random() * 9e5)}`;
    }
    return Math.random().toString(36).substring(2, 15);
  }
};
var CompatBatch = class {
  constructor() {
    this._ops = [];
  }
  set(docRef, data, options) {
    this._ops.push(async () => {
      await docRef.set(data, options);
    });
    return this;
  }
  update(docRef, data) {
    this._ops.push(async () => {
      await docRef.update(data);
    });
    return this;
  }
  delete(docRef) {
    this._ops.push(async () => {
      await docRef.delete();
    });
    return this;
  }
  async commit() {
    for (const op of this._ops) {
      await op();
    }
  }
};
var db2 = {
  collection: (path2) => new CompatCollectionRef(path2),
  batch: () => new CompatBatch()
};
var FieldValue = {
  increment: (val) => ({ __increment: val }),
  serverTimestamp: () => Date.now()
};
var PORT = 3e3;
var app = express();
app.use(express.json());
var sysSettings = {
  vpnCheckEnabled: true,
  conversionRate: 1e4,
  // $1 = 10000 points
  pointsToBdtRate: 100,
  // 1000 points = 10 BDT (so 100 points = 1 BDT)
  minWithdrawRechargePoints: 2e3,
  // 20 BDT
  minWithdrawBankPoints: 1e4,
  // 100 BDT
  adsenseCode: "",
  supportLink: "https://t.me/mrcashbd"
};
db.select().from(systemSettings).where(eq(systemSettings.id, "global")).limit(1).then((rows) => {
  if (rows.length > 0) {
    sysSettings = {
      vpnCheckEnabled: rows[0].vpnCheckEnabled,
      conversionRate: rows[0].conversionRate,
      pointsToBdtRate: rows[0].pointsToBdtRate,
      minWithdrawRechargePoints: rows[0].minWithdrawRechargePoints,
      minWithdrawBankPoints: rows[0].minWithdrawBankPoints,
      adsenseCode: rows[0].adsenseCode,
      supportLink: rows[0].supportLink
    };
  } else {
    db.insert(systemSettings).values({
      id: "global",
      ...sysSettings
    }).catch((err) => console.error("Failed to insert default system settings:", err));
  }
}).catch((err) => {
  console.error("Failed to load system settings from database:", err);
});
async function addNotification(userId, title, message, type) {
  try {
    const notifId = `NT-${Math.floor(1e5 + Math.random() * 9e5)}`;
    await db2.collection("notifications").doc(notifId).set({
      id: notifId,
      userId: userId.toLowerCase().trim(),
      title,
      message,
      type,
      isRead: false,
      createdAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
var getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip.trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
};
async function checkIpBangladesh(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.16.")) {
    return { isBD: true, isProxy: false, country: "Bangladesh (Local Host Bypass)" };
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (res.ok) {
      const data = await res.json();
      const countryCode = data.country_code;
      const isBD = countryCode === "BD";
      const isProxy = !!(data.security?.vpn || data.security?.proxy || data.org?.toLowerCase().includes("hosting") || data.org?.toLowerCase().includes("vpn") || data.asn?.toLowerCase().includes("hosting"));
      return { isBD, isProxy, country: data.country_name || "Unknown" };
    }
  } catch (e) {
    console.error("IP check error:", e);
  }
  return { isBD: true, isProxy: false, country: "Bangladesh (Fallback)" };
}
app.post("/api/v1/auth/register", async (req, res) => {
  try {
    const { email, username, password, referrerCode, name, phoneNumber } = req.body;
    if (!email || !username || !password || !name || !phoneNumber) {
      return res.status(400).json({ error: "Please enter all fields (Name, Username, Email, Phone Number, Password)" });
    }
    const emailNormalized = email.toLowerCase().trim();
    const usernameNormalized = username.toLowerCase().trim();
    const userRef = db2.collection("users").doc(usernameNormalized);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const querySnap = await db2.collection("users").where("email", "==", emailNormalized).get();
    if (!querySnap.empty) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    const clientIp = getClientIp(req);
    const isMahamudAdmin = emailNormalized === "mahamudurrahman778@gmail.com";
    let referredBy = "";
    if (referrerCode) {
      const refUsername = referrerCode.toLowerCase().trim();
      const refDoc = db2.collection("users").doc(refUsername);
      const refSnap = await refDoc.get();
      if (refSnap.exists && refUsername !== usernameNormalized) {
        referredBy = refUsername;
        await refDoc.update({
          totalReferred: FieldValue.increment(1)
        });
        await addNotification(
          refUsername,
          "New Referral Joined! \u{1F465}",
          `User "${usernameNormalized}" joined using your referral link. You will earn a 5% commission on all their earnings!`,
          "referral"
        );
      }
    }
    const newUser = {
      uid: usernameNormalized,
      email: emailNormalized,
      username: usernameNormalized,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      balancePoints: 0,
      totalReferred: 0,
      referredBy,
      pendingCashoutPoints: 0,
      todayWorkPoints: 0,
      ipAddress: clientIp,
      status: "active",
      createdAt: Date.now(),
      isAdmin: isMahamudAdmin
    };
    await userRef.set(newUser);
    await db2.collection("credentials").doc(usernameNormalized).set({ password });
    await addNotification(
      usernameNormalized,
      "Welcome to MR CASH BD! \u{1F389}",
      "We are excited to have you! Complete tasks on the Offerwall to start earning points and level up your account.",
      "task"
    );
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error, please try again." });
  }
});
app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }
    const usernameNormalized = username.toLowerCase().trim();
    const userDocRef = db2.collection("users").doc(usernameNormalized);
    const userSnap = await userDocRef.get();
    if (!userSnap.exists) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const credDocRef = db2.collection("credentials").doc(usernameNormalized);
    const credSnap = await credDocRef.get();
    if (!credSnap.exists || credSnap.data()?.password !== password) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const userData = userSnap.data() || {};
    if (userData.status === "banned") {
      return res.status(403).json({ error: "Your account is banned. Contact support." });
    }
    res.json(userData);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/v1/user/profile/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const userSnap = await db2.collection("users").doc(username).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userSnap.data());
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/v1/user/settings/update", async (req, res) => {
  try {
    const { username, name, password, email, phoneNumber } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    const usernameNormalized = username.toLowerCase().trim();
    const userRef = db2.collection("users").doc(usernameNormalized);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const updates = {};
    if (name !== void 0 && name.trim() !== "") {
      updates.name = name.trim();
    }
    if (phoneNumber !== void 0 && phoneNumber.trim() !== "") {
      updates.phoneNumber = phoneNumber.trim();
    }
    if (email !== void 0 && email.trim() !== "") {
      const emailNormalized = email.toLowerCase().trim();
      const querySnap = await db2.collection("users").where("email", "==", emailNormalized).get();
      let taken = false;
      querySnap.forEach((doc) => {
        if (doc.id !== usernameNormalized) {
          taken = true;
        }
      });
      if (taken) {
        return res.status(400).json({ error: "Email is already in use by another user." });
      }
      updates.email = emailNormalized;
    }
    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }
    if (password && password.trim() !== "") {
      await db2.collection("credentials").doc(usernameNormalized).set({ password: password.trim() });
    }
    const freshSnap = await userRef.get();
    res.json(freshSnap.data());
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ error: "Failed to update settings." });
  }
});
app.get("/api/v1/user/referrals/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const snaps = await db2.collection("users").where("referredBy", "==", username).get();
    const list = [];
    snaps.forEach((doc) => {
      const data = doc.data() || {};
      list.push({
        username: data.username,
        createdAt: data.createdAt,
        status: data.status,
        todayWorkPoints: data.todayWorkPoints || 0
      });
    });
    res.json(list);
  } catch (err) {
    console.error("Fetch user referrals error:", err);
    res.status(500).json({ error: "Failed to fetch referrals." });
  }
});
app.get("/api/v1/user/referrals-detailed/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const referralsSnap = await db2.collection("users").where("referredBy", "==", username).get();
    const referrals = [];
    referralsSnap.forEach((doc) => {
      const data = doc.data() || {};
      referrals.push({
        username: data.username,
        createdAt: data.createdAt,
        status: data.status,
        todayWorkPoints: data.todayWorkPoints || 0
      });
    });
    const notifsSnap = await db2.collection("notifications").where("userId", "==", username).where("type", "==", "referral").get();
    let totalBonusPoints = 0;
    const bonusLogs = [];
    notifsSnap.forEach((doc) => {
      const data = doc.data() || {};
      const msg = data.message || "";
      const match = msg.match(/\+(\d+)\s+Points/);
      let points = 0;
      if (match) {
        points = parseInt(match[1], 10);
        totalBonusPoints += points;
      }
      bonusLogs.push({
        id: data.id,
        title: data.title,
        message: msg,
        points,
        createdAt: data.createdAt
      });
    });
    bonusLogs.sort((a, b) => b.createdAt - a.createdAt);
    res.json({
      totalReferred: referrals.length,
      totalBonusPoints,
      referrals,
      bonusLogs
    });
  } catch (err) {
    console.error("Fetch detailed referrals error:", err);
    res.status(500).json({ error: "Failed to fetch detailed referral stats." });
  }
});
app.get("/api/v1/earnings/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const snaps = await db2.collection("postback_logs").where("userId", "==", username).get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (err) {
    console.error("Fetch user earnings error:", err);
    res.status(500).json({ error: "Failed to load user earnings." });
  }
});
app.get("/api/v1/leaderboard", async (req, res) => {
  try {
    const querySnap = await db2.collection("users").where("isAdmin", "==", false).orderBy("balancePoints", "desc").limit(10).get();
    const list = [];
    querySnap.forEach((doc) => {
      const data = doc.data();
      list.push({
        username: data.username,
        balancePoints: data.balancePoints,
        todayWorkPoints: data.todayWorkPoints,
        totalReferred: data.totalReferred
      });
    });
    const defaultUsers = [
      { username: "shakib_bd", balancePoints: 145e3, todayWorkPoints: 12500, totalReferred: 24 },
      { username: "tasnim_eva", balancePoints: 98400, todayWorkPoints: 8400, totalReferred: 15 },
      { username: "rahmat_cpa", balancePoints: 85200, todayWorkPoints: 9100, totalReferred: 18 },
      { username: "arif_khan", balancePoints: 62e3, todayWorkPoints: 4200, totalReferred: 9 },
      { username: "mimi_2026", balancePoints: 47900, todayWorkPoints: 3500, totalReferred: 5 },
      { username: "hassan_earn", balancePoints: 38200, todayWorkPoints: 2900, totalReferred: 4 },
      { username: "farhana_bd", balancePoints: 31e3, todayWorkPoints: 1800, totalReferred: 3 },
      { username: "joy_cpa", balancePoints: 24500, todayWorkPoints: 2200, totalReferred: 6 },
      { username: "nabil_it", balancePoints: 19800, todayWorkPoints: 1200, totalReferred: 2 },
      { username: "sumaiya_win", balancePoints: 15400, todayWorkPoints: 950, totalReferred: 1 }
    ];
    const finalResult = [...list];
    for (const defUser of defaultUsers) {
      if (finalResult.length >= 10) break;
      if (!finalResult.some((u) => u.username.toLowerCase() === defUser.username.toLowerCase())) {
        finalResult.push(defUser);
      }
    }
    finalResult.sort((a, b) => b.balancePoints - a.balancePoints);
    res.json(finalResult.slice(0, 10));
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    const defaultUsers = [
      { username: "shakib_bd", balancePoints: 145e3, todayWorkPoints: 12500, totalReferred: 24 },
      { username: "tasnim_eva", balancePoints: 98400, todayWorkPoints: 8400, totalReferred: 15 },
      { username: "rahmat_cpa", balancePoints: 85200, todayWorkPoints: 9100, totalReferred: 18 },
      { username: "arif_khan", balancePoints: 62e3, todayWorkPoints: 4200, totalReferred: 9 },
      { username: "mimi_2026", balancePoints: 47900, todayWorkPoints: 3500, totalReferred: 5 },
      { username: "hassan_earn", balancePoints: 38200, todayWorkPoints: 2900, totalReferred: 4 },
      { username: "farhana_bd", balancePoints: 31e3, todayWorkPoints: 1800, totalReferred: 3 },
      { username: "joy_cpa", balancePoints: 24500, todayWorkPoints: 2200, totalReferred: 6 },
      { username: "nabil_it", balancePoints: 19800, todayWorkPoints: 1200, totalReferred: 2 },
      { username: "sumaiya_win", balancePoints: 15400, todayWorkPoints: 950, totalReferred: 1 }
    ];
    res.json(defaultUsers);
  }
});
app.post("/api/v1/admin/leaderboard/reward", async (req, res) => {
  try {
    const { rewards } = req.body;
    if (!rewards || !Array.isArray(rewards) || rewards.length < 10) {
      return res.status(400).json({ error: "Rewards array with exactly 10 values is required." });
    }
    const querySnap = await db2.collection("users").where("isAdmin", "==", false).orderBy("balancePoints", "desc").limit(10).get();
    const realUsersList = [];
    querySnap.forEach((doc) => {
      realUsersList.push(doc.data());
    });
    const defaultUsers = [
      { username: "shakib_bd", balancePoints: 145e3, todayWorkPoints: 12500, totalReferred: 24 },
      { username: "tasnim_eva", balancePoints: 98400, todayWorkPoints: 8400, totalReferred: 15 },
      { username: "rahmat_cpa", balancePoints: 85200, todayWorkPoints: 9100, totalReferred: 18 },
      { username: "arif_khan", balancePoints: 62e3, todayWorkPoints: 4200, totalReferred: 9 },
      { username: "mimi_2026", balancePoints: 47900, todayWorkPoints: 3500, totalReferred: 5 },
      { username: "hassan_earn", balancePoints: 38200, todayWorkPoints: 2900, totalReferred: 4 },
      { username: "farhana_bd", balancePoints: 31e3, todayWorkPoints: 1800, totalReferred: 3 },
      { username: "joy_cpa", balancePoints: 24500, todayWorkPoints: 2200, totalReferred: 6 },
      { username: "nabil_it", balancePoints: 19800, todayWorkPoints: 1200, totalReferred: 2 },
      { username: "sumaiya_win", balancePoints: 15400, todayWorkPoints: 950, totalReferred: 1 }
    ];
    const mergedLeaderboard = [...realUsersList];
    for (const defUser of defaultUsers) {
      if (mergedLeaderboard.length >= 10) break;
      if (!mergedLeaderboard.some((u) => u.username.toLowerCase() === defUser.username.toLowerCase())) {
        mergedLeaderboard.push(defUser);
      }
    }
    mergedLeaderboard.sort((a, b) => b.balancePoints - a.balancePoints);
    const awardedList = [];
    for (let i = 0; i < 10; i++) {
      const item = mergedLeaderboard[i];
      const pointsAwarded = Number(rewards[i]) || 0;
      if (pointsAwarded <= 0) continue;
      const uid = String(item.username).toLowerCase().trim();
      const userRef = db2.collection("users").doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.update({
          balancePoints: FieldValue.increment(pointsAwarded)
        });
        const leadId = `LB-${Date.now()}-${i}`;
        await db2.collection("postback_logs").doc(leadId).set({
          id: leadId,
          userId: uid,
          username: item.username,
          payout: pointsAwarded / sysSettings.conversionRate,
          // mock equivalent payout in USD
          pointsCredited: pointsAwarded,
          ip: "0.0.0.0",
          campaignName: `Leaderboard Rank #${i + 1} Reward \u{1F3C6}`,
          createdAt: Date.now()
        });
        await addNotification(
          uid,
          "Leaderboard Reward Received! \u{1F3C6}",
          `Congratulations! You ranked #${i + 1} on the top earners leaderboard. The Administrator has awarded you +${pointsAwarded.toLocaleString()} Points!`,
          "task"
        );
        awardedList.push({
          username: item.username,
          rank: i + 1,
          pointsAwarded,
          status: "credited"
        });
      } else {
        awardedList.push({
          username: item.username,
          rank: i + 1,
          pointsAwarded,
          status: "skipped_mock_user"
        });
      }
    }
    res.json({ success: true, message: "Leaderboard rewards distributed successfully.", details: awardedList });
  } catch (err) {
    console.error("Error distributing leaderboard rewards:", err);
    res.status(500).json({ error: "Failed to distribute leaderboard rewards." });
  }
});
app.get("/api/v1/offers", async (req, res) => {
  try {
    const { username } = req.query;
    const clientIp = getClientIp(req);
    let isUserAdmin = false;
    if (username) {
      const uSnap = await db2.collection("users").doc(username.toLowerCase().trim()).get();
      if (uSnap.exists) {
        const ud = uSnap.data() || {};
        if (ud.status === "banned") {
          return res.status(403).json({ error: "Banned user" });
        }
        isUserAdmin = !!ud.isAdmin;
      }
    }
    let ipCheck = { isBD: true, isProxy: false, country: "Bangladesh (Simulated)" };
    if (sysSettings.vpnCheckEnabled && !isUserAdmin) {
      ipCheck = await checkIpBangladesh(clientIp);
      if (!ipCheck.isBD) {
        return res.status(403).json({
          error: "ACCESS BLOCKED",
          message: `MR CASH is only available for users located in Bangladesh. Your current location: ${ipCheck.country}.`
        });
      }
      if (ipCheck.isProxy) {
        return res.status(403).json({
          error: "VPN/PROXY DETECTED",
          message: "Please disconnect your VPN or Proxy server to complete tasks."
        });
      }
    }
    const cpaOffers = [
      {
        id: "1092831",
        title: "Bkash App Install & Transact",
        description: "Download the bKash app from the Google Play Store, register a new account, and perform a micro-transaction.",
        payout: 0.85,
        points: 8500,
        category: "App Installs",
        timeMinutes: 10,
        link: "https://fasturl.cc/example_cpa_bkash",
        imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092832",
        title: "Nagad Account Verification",
        description: "Open a Nagad account using your national ID, complete KYC verification, and set your secure 4-digit PIN.",
        payout: 0.7,
        points: 7e3,
        category: "Signups",
        timeMinutes: 8,
        link: "https://fasturl.cc/example_cpa_nagad",
        imageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092833",
        title: "Daraz BD - Browse & Add to Cart",
        description: "Install Daraz BD shopping app, search for premium products, add 3 items to your shopping cart.",
        payout: 0.35,
        points: 3500,
        category: "App Installs",
        timeMinutes: 5,
        link: "https://fasturl.cc/example_daraz_shopping",
        imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092834",
        title: "Toffee - Premium Sports Streaming",
        description: "Install Toffee live TV app, register with your local BD mobile number and stream sports for 2 minutes.",
        payout: 0.4,
        points: 4e3,
        category: "App Installs",
        timeMinutes: 4,
        link: "https://fasturl.cc/example_toffee_stream",
        imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092835",
        title: "Chorki App Install & Register",
        description: "Download the Chorki Entertainment platform and complete a free SMS registration step.",
        payout: 0.3,
        points: 3e3,
        category: "App Installs",
        timeMinutes: 3,
        link: "https://fasturl.cc/example_chorki_app",
        imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092836",
        title: "Pathao - Book Your First Ride",
        description: "Open the Pathao app, complete a simple phone register, and look up rides nearby.",
        payout: 0.5,
        points: 5e3,
        category: "Signups",
        timeMinutes: 6,
        link: "https://fasturl.cc/example_pathao_ride",
        imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092837",
        title: "Consumer Habits & Shopping Survey",
        description: "Complete a quick 5-minute survey about your online shopping and mobile wallet preferences in Bangladesh.",
        payout: 0.25,
        points: 2500,
        category: "Surveys",
        timeMinutes: 5,
        link: "https://fasturl.cc/example_consumer_survey",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=60"
      },
      {
        id: "1092838",
        title: "Mobile Banking Experience Poll",
        description: "Share your feedback on local mobile banking services (bKash/Nagad) to earn easy rewards. Takes 3 minutes.",
        payout: 0.2,
        points: 2e3,
        category: "Surveys",
        timeMinutes: 3,
        link: "https://fasturl.cc/example_banking_poll",
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=150&auto=format&fit=crop&q=60"
      }
    ];
    const formattedOffers = cpaOffers.map((o) => ({
      campid: o.id,
      title: o.title,
      description: o.description,
      link: o.link,
      payoutPoints: o.points,
      payoutUSD: o.payout,
      originalTitle: o.title,
      country: "BD",
      device: o.category === "App Installs" ? "Android" : "Mobile",
      category: o.category
    }));
    res.json({
      ip: clientIp,
      country: ipCheck.country,
      offers: formattedOffers
    });
  } catch (err) {
    console.error("Offers fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve available premium offers." });
  }
});
app.get("/api/v1/offers/redirect", (req, res) => {
  try {
    const { offerId, username, link } = req.query;
    if (!offerId || !username || !link) {
      return res.status(400).send("Missing query parameters for redirection");
    }
    const uid = String(username).toLowerCase().trim();
    const targetLink = decodeURIComponent(link);
    const urlObj = new URL(targetLink);
    urlObj.searchParams.set("subid", uid);
    urlObj.searchParams.set("aff_sub", uid);
    urlObj.searchParams.set("click_id", `${uid}-${Date.now()}`);
    res.redirect(urlObj.toString());
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Failed to parse offer redirect link.");
  }
});
app.get("/api/v1/postback/cpalead", async (req, res) => {
  try {
    const { userId, payout, ip, leadId, campaignName, password } = req.query;
    if (password !== "Mahamud004") {
      return res.status(401).send("Unauthorized postback password verification failed");
    }
    if (!userId || !payout) {
      return res.status(400).send("Required parameters missing: userId or payout");
    }
    const uid = String(userId).toLowerCase().trim();
    const userRef = db2.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).send("User not found on MR CASH system");
    }
    const payoutUSD = parseFloat(payout) || 0;
    const pointsCredited = Math.round(payoutUSD * sysSettings.conversionRate);
    await userRef.update({
      balancePoints: FieldValue.increment(pointsCredited),
      todayWorkPoints: FieldValue.increment(pointsCredited)
    });
    await addNotification(
      uid,
      "Task Approved! \u2705",
      `You have successfully completed "${campaignName || "Premium Offer"}" and earned ${pointsCredited} Points!`,
      "task"
    );
    const leadLogRef = db2.collection("postback_logs").doc(String(leadId || Date.now()));
    const leadData = {
      id: String(leadId || Date.now()),
      userId: uid,
      username: userSnap.data()?.username,
      payout: payoutUSD,
      pointsCredited,
      ip: String(ip || "0.0.0.0"),
      campaignName: String(campaignName || "Premium Offer"),
      createdAt: Date.now()
    };
    await leadLogRef.set(leadData);
    const userData = userSnap.data() || {};
    if (userData.referredBy) {
      const referrerRef = db2.collection("users").doc(userData.referredBy);
      const referrerSnap = await referrerRef.get();
      if (referrerSnap.exists) {
        const bonusPoints = Math.round(pointsCredited * 0.05);
        if (bonusPoints > 0) {
          await referrerRef.update({
            balancePoints: FieldValue.increment(bonusPoints)
          });
          await addNotification(
            userData.referredBy,
            "Referral Bonus Earned! \u{1F4B0}",
            `You earned +${bonusPoints} Points (5% commission) because your referral "${userData.username || uid}" completed a task!`,
            "referral"
          );
        }
      }
    }
    res.send("1");
  } catch (err) {
    console.error("Postback execution error:", err);
    res.status(500).send("0");
  }
});
app.post("/api/v1/withdraw", async (req, res) => {
  try {
    const { username, method, accountNumber, points } = req.body;
    if (!username || !method || !accountNumber || !points) {
      return res.status(400).json({ error: "Please enter all withdrawal fields." });
    }
    const uid = String(username).toLowerCase().trim();
    const userRef = db2.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User account not found." });
    }
    const userData = userSnap.data() || {};
    const requestPoints = parseInt(points);
    if (userData.balancePoints < requestPoints) {
      return res.status(400).json({ error: "Insufficient points balance." });
    }
    const isRecharge = method === "Mobile Recharge";
    const minPoints = isRecharge ? sysSettings.minWithdrawRechargePoints : sysSettings.minWithdrawBankPoints;
    const bdtAmount = requestPoints / sysSettings.pointsToBdtRate;
    if (requestPoints < minPoints) {
      return res.status(400).json({
        error: `Minimum withdrawal is ${minPoints} points (${minPoints / sysSettings.pointsToBdtRate} BDT) for this method.`
      });
    }
    const withdrawalId = `WD-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const newWithdrawal = {
      id: withdrawalId,
      userId: uid,
      username: userData.username,
      email: userData.email,
      method,
      accountNumber,
      amountPoints: requestPoints,
      amountBDT: bdtAmount,
      status: "pending",
      createdAt: Date.now()
    };
    await db2.collection("withdrawals").doc(withdrawalId).set(newWithdrawal);
    await userRef.update({
      balancePoints: FieldValue.increment(-requestPoints),
      pendingCashoutPoints: FieldValue.increment(requestPoints)
    });
    await addNotification(
      uid,
      "Withdrawal Requested \u{1F4B8}",
      `Your request for ${requestPoints.toLocaleString()} PTS (${bdtAmount.toFixed(2)} BDT) via ${method} is submitted and pending review.`,
      "withdrawal"
    );
    res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      withdrawal: newWithdrawal
    });
  } catch (err) {
    console.error("Withdrawal error:", err);
    res.status(500).json({ error: "Server error, try again." });
  }
});
app.get("/api/v1/withdrawals/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const snaps = await db2.collection("withdrawals").where("userId", "==", username).get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(list);
  } catch (err) {
    console.error("Fetch user withdrawals error:", err);
    res.status(500).json({ error: "Failed to fetch withdrawals." });
  }
});
app.get("/api/v1/admin/stats", async (req, res) => {
  try {
    const usersSnap = await db2.collection("users").get();
    const withdrawalsSnap = await db2.collection("withdrawals").get();
    const logsSnap = await db2.collection("postback_logs").get();
    const totalMembers = usersSnap.size;
    let totalPaidBDT = 0;
    let pendingWithdrawalsCount = 0;
    withdrawalsSnap.forEach((doc) => {
      const d = doc.data();
      if (d.status === "approved") {
        totalPaidBDT += d.amountBDT || 0;
      } else if (d.status === "pending") {
        pendingWithdrawalsCount++;
      }
    });
    let totalPointsEarned = 0;
    logsSnap.forEach((doc) => {
      totalPointsEarned += doc.data().pointsCredited || 0;
    });
    res.json({
      totalMembers,
      totalPaidBDT,
      totalPointsEarned,
      pendingWithdrawalsCount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to aggregate statistics." });
  }
});
app.get("/api/v1/admin/withdrawals", async (req, res) => {
  try {
    const snaps = await db2.collection("withdrawals").get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load withdrawals." });
  }
});
app.post("/api/v1/admin/withdrawals/action", async (req, res) => {
  try {
    const { withdrawalId, action } = req.body;
    if (!withdrawalId || !action) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const withdrawRef = db2.collection("withdrawals").doc(withdrawalId);
    const wdSnap = await withdrawRef.get();
    if (!wdSnap.exists) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }
    const wdData = wdSnap.data() || {};
    if (wdData.status !== "pending") {
      return res.status(400).json({ error: "Withdrawal is already processed" });
    }
    const userRef = db2.collection("users").doc(wdData.userId);
    if (action === "approve") {
      await withdrawRef.update({ status: "approved" });
      await userRef.update({
        pendingCashoutPoints: FieldValue.increment(-wdData.amountPoints)
      });
      await addNotification(
        wdData.userId,
        "Withdrawal Approved! \u{1F389}",
        `Your cash-out request of ${wdData.amountPoints.toLocaleString()} PTS (${wdData.amountBDT} BDT) via ${wdData.method} has been approved and sent!`,
        "withdrawal"
      );
    } else if (action === "reject") {
      await withdrawRef.update({ status: "rejected" });
      await userRef.update({
        balancePoints: FieldValue.increment(wdData.amountPoints),
        pendingCashoutPoints: FieldValue.increment(-wdData.amountPoints)
      });
      await addNotification(
        wdData.userId,
        "Withdrawal Rejected \u274C",
        `Your cash-out request of ${wdData.amountPoints.toLocaleString()} PTS via ${wdData.method} was rejected. Points have been returned to your balance.`,
        "withdrawal"
      );
    }
    res.json({ success: true, message: `Withdrawal successfully ${action}d.` });
  } catch (err) {
    console.error("Withdraw action error:", err);
    res.status(500).json({ error: "Server action error." });
  }
});
app.get("/api/v1/admin/users", async (req, res) => {
  try {
    const snaps = await db2.collection("users").get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load user list." });
  }
});
app.post("/api/v1/admin/users/edit", async (req, res) => {
  try {
    const { username, action, value } = req.body;
    const userRef = db2.collection("users").doc(username.toLowerCase().trim());
    const uSnap = await userRef.get();
    if (!uSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    if (action === "ban") {
      await userRef.update({ status: "banned" });
    } else if (action === "unban") {
      await userRef.update({ status: "active" });
    } else if (action === "setPoints") {
      await userRef.update({ balancePoints: Number(value) });
    }
    res.json({ success: true, message: "User updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to edit user" });
  }
});
app.get("/api/v1/admin/postbacks", async (req, res) => {
  try {
    const snaps = await db2.collection("postback_logs").get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load postback logs." });
  }
});
app.get("/api/v1/admin/settings", (req, res) => {
  res.json(sysSettings);
});
app.post("/api/v1/admin/settings/update", async (req, res) => {
  try {
    const {
      vpnCheckEnabled,
      conversionRate,
      pointsToBdtRate,
      minWithdrawRechargePoints,
      minWithdrawBankPoints,
      adsenseCode,
      supportLink
    } = req.body;
    if (vpnCheckEnabled !== void 0) sysSettings.vpnCheckEnabled = !!vpnCheckEnabled;
    if (conversionRate !== void 0) sysSettings.conversionRate = Number(conversionRate);
    if (pointsToBdtRate !== void 0) sysSettings.pointsToBdtRate = Number(pointsToBdtRate);
    if (minWithdrawRechargePoints !== void 0) sysSettings.minWithdrawRechargePoints = Number(minWithdrawRechargePoints);
    if (minWithdrawBankPoints !== void 0) sysSettings.minWithdrawBankPoints = Number(minWithdrawBankPoints);
    if (adsenseCode !== void 0) sysSettings.adsenseCode = String(adsenseCode);
    if (supportLink !== void 0) sysSettings.supportLink = String(supportLink);
    await db.insert(systemSettings).values({
      id: "global",
      ...sysSettings
    }).onConflictDoUpdate({
      target: systemSettings.id,
      set: sysSettings
    });
    res.json({ success: true, message: "System configurations updated.", settings: sysSettings });
  } catch (err) {
    console.error("Failed to save configuration settings to PostgreSQL:", err);
    res.status(500).json({ error: "Failed to save configuration settings." });
  }
});
app.get("/api/v1/notifications/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const snaps = await db2.collection("notifications").where("userId", "==", username).orderBy("createdAt", "desc").limit(20).get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    res.json(list);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to retrieve notifications." });
  }
});
app.post("/api/v1/notifications/read", async (req, res) => {
  try {
    const { username, notificationId, readAll } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    const uid = String(username).toLowerCase().trim();
    if (readAll) {
      const snaps = await db2.collection("notifications").where("userId", "==", uid).where("isRead", "==", false).get();
      const batch = db2.batch();
      snaps.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });
      await batch.commit();
      return res.json({ success: true, message: "All notifications marked as read." });
    } else if (notificationId) {
      const notifRef = db2.collection("notifications").doc(notificationId);
      await notifRef.update({ isRead: true });
      return res.json({ success: true, message: "Notification marked as read." });
    }
    res.status(400).json({ error: "Invalid parameters" });
  } catch (err) {
    console.error("Mark read notifications error:", err);
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
});
app.get("/api/v1/redeem/events", async (req, res) => {
  try {
    const now = Date.now();
    const snaps = await db2.collection("redeem_codes").get();
    const list = [];
    snaps.forEach((doc) => {
      const data = doc.data();
      if (data && data.expiresAt > now) {
        list.push(data);
      }
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (err) {
    console.error("Fetch redeem events error:", err);
    res.status(500).json({ error: "Failed to retrieve ongoing events." });
  }
});
app.post("/api/v1/redeem", async (req, res) => {
  try {
    const { username, code } = req.body;
    if (!username || !code) {
      return res.status(400).json({ error: "Missing username or code parameter" });
    }
    const userNormalized = username.toLowerCase().trim();
    const codeNormalized = code.toUpperCase().trim();
    const userRef = db2.collection("users").doc(userNormalized);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User account not found." });
    }
    const userData = userSnap.data();
    if (userData.status === "banned") {
      return res.status(403).json({ error: "Banned accounts cannot claim rewards." });
    }
    const codeRef = db2.collection("redeem_codes").doc(codeNormalized);
    const codeSnap = await codeRef.get();
    if (!codeSnap.exists) {
      return res.status(400).json({ error: "Invalid or incorrect redemption code." });
    }
    const codeData = codeSnap.data();
    if (codeData.expiresAt < Date.now()) {
      return res.status(400).json({ error: "This promo code has already expired." });
    }
    if (codeData.eligibilityType === "limited" && codeData.redeemedCount >= codeData.maxUsers) {
      return res.status(400).json({ error: "This code has reached its maximum limit of claims." });
    }
    const claimId = `${userNormalized}_${codeNormalized}`;
    const claimRef = db2.collection("user_redemptions").doc(claimId);
    const claimSnap = await claimRef.get();
    if (claimSnap.exists) {
      return res.status(400).json({ error: "You have already redeemed this code!" });
    }
    await claimRef.set({
      id: claimId,
      username: userNormalized,
      code: codeNormalized,
      createdAt: Date.now()
    });
    await codeRef.update({
      redeemedCount: FieldValue.increment(1)
    });
    await userRef.update({
      balancePoints: FieldValue.increment(codeData.rewardPoints)
    });
    await addNotification(
      userNormalized,
      "Code Redeemed! \u{1F381}",
      `Successfully redeemed code "${codeNormalized}". Added +${codeData.rewardPoints.toLocaleString()} PTS to your balance!`,
      "task"
    );
    res.json({
      success: true,
      message: `Successfully redeemed code! Added +${codeData.rewardPoints.toLocaleString()} PTS to your account balance.`,
      pointsCredited: codeData.rewardPoints
    });
  } catch (err) {
    console.error("Code redemption error:", err);
    res.status(500).json({ error: "Failed to process redemption." });
  }
});
app.get("/api/v1/admin/redeem-codes", async (req, res) => {
  try {
    const snaps = await db2.collection("redeem_codes").get();
    const list = [];
    snaps.forEach((doc) => {
      list.push(doc.data());
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (err) {
    console.error("Fetch all redeem codes error:", err);
    res.status(500).json({ error: "Failed to load redeem codes." });
  }
});
app.post("/api/v1/admin/redeem-codes", async (req, res) => {
  try {
    const { code, name, rewardPoints, description, image, eligibilityType, maxUsers, expiresAt } = req.body;
    if (!code || !name || !rewardPoints || !description) {
      return res.status(400).json({ error: "Missing required code parameters (code, name, points, description)." });
    }
    const codeNormalized = String(code).toUpperCase().trim();
    const codeRef = db2.collection("redeem_codes").doc(codeNormalized);
    const codeSnap = await codeRef.get();
    const existingData = codeSnap.exists ? codeSnap.data() : null;
    const newEvent = {
      code: codeNormalized,
      name: String(name).trim(),
      rewardPoints: Number(rewardPoints),
      description: String(description).trim(),
      image: String(image || "").trim(),
      eligibilityType: eligibilityType === "limited" ? "limited" : "all",
      maxUsers: eligibilityType === "limited" ? Number(maxUsers || 0) : 0,
      redeemedCount: existingData ? Number(existingData.redeemedCount || 0) : 0,
      expiresAt: Number(expiresAt),
      createdAt: existingData ? Number(existingData.createdAt || Date.now()) : Date.now()
    };
    await codeRef.set(newEvent);
    res.json({ success: true, message: "Redemption code successfully saved.", data: newEvent });
  } catch (err) {
    console.error("Save redeem code error:", err);
    res.status(500).json({ error: "Failed to save redemption code." });
  }
});
app.post("/api/v1/admin/redeem-codes/delete", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Missing code parameter." });
    }
    const codeNormalized = String(code).toUpperCase().trim();
    await db2.collection("redeem_codes").doc(codeNormalized).delete();
    res.json({ success: true, message: "Redemption code deleted successfully." });
  } catch (err) {
    console.error("Delete redeem code error:", err);
    res.status(500).json({ error: "Failed to delete redemption code." });
  }
});
var viteDevServer = null;
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  import("vite").then(({ createServer }) => {
    createServer({
      server: { middlewareMode: true },
      appType: "spa"
    }).then((vite) => {
      viteDevServer = vite;
    }).catch((err) => {
      console.error("Failed to start Vite:", err);
    });
  }).catch((err) => {
    console.error("Failed to import Vite:", err);
  });
  app.use((req, res, next) => {
    if (viteDevServer) {
      viteDevServer.middlewares(req, res, next);
    } else {
      next();
    }
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MR CASH BD Server running at http://localhost:${PORT}`);
  });
}
var server_default = app;
export {
  server_default as default
};
//# sourceMappingURL=index.js.map

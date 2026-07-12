import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db as drizzleDb } from './src/db/index.js';
import { users, credentials, notifications, postbackLogs, withdrawals, systemSettings, redeemCodes, userRedemptions } from './src/db/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tableMap: Record<string, { table: any; keyCol: string; keyProp: string }> = {
  users: { table: users, keyCol: 'username', keyProp: 'username' },
  credentials: { table: credentials, keyCol: 'username', keyProp: 'username' },
  notifications: { table: notifications, keyCol: 'id', keyProp: 'id' },
  postback_logs: { table: postbackLogs, keyCol: 'id', keyProp: 'id' },
  withdrawals: { table: withdrawals, keyCol: 'id', keyProp: 'id' },
  system_settings: { table: systemSettings, keyCol: 'id', keyProp: 'id' },
  redeem_codes: { table: redeemCodes, keyCol: 'code', keyProp: 'code' },
  user_redemptions: { table: userRedemptions, keyCol: 'id', keyProp: 'id' },
};

const sanitizeDataForSql = (table: any, data: any) => {
  const sanitized: any = {};
  const increments: any = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || !(key in table)) continue;
    if (val && typeof val === 'object' && '__increment' in val) {
      increments[key] = (val as any).__increment;
    } else {
      sanitized[key] = val;
    }
  }
  return { sanitized, increments };
};

class CompatDocRef {
  constructor(public _collectionPath: string, public _docId: string) {}
  async set(data: any) {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown collection: ${this._collectionPath}`);
    const { sanitized, increments } = sanitizeDataForSql(tableInfo.table, data);
    const insertValues = { ...sanitized };
    for (const [key, incVal] of Object.entries(increments)) insertValues[key] = incVal;
    if (insertValues[tableInfo.keyProp] === undefined) insertValues[tableInfo.keyProp] = this._docId;
    const updateFields: any = { ...sanitized };
    for (const [key, incVal] of Object.entries(increments)) updateFields[key] = sql`${tableInfo.table[key]} + ${incVal}`;
    await drizzleDb.insert(tableInfo.table).values(insertValues).onConflictDoUpdate({
      target: tableInfo.table[tableInfo.keyCol],
      set: updateFields,
    });
  }
  async update(data: any) {
    const tableInfo = tableMap[this._collectionPath];
    if (!tableInfo) throw new Error(`Unknown path: ${this._collectionPath}`);
    const { sanitized, increments } = sanitizeDataForSql(tableInfo.table, data);
    const updateFields: any = { ...sanitized };
    for (const [key, incVal] of Object.entries(increments)) updateFields[key] = sql`${tableInfo.table[key]} + ${incVal}`;
    if (Object.keys(updateFields).length === 0) return;
    await drizzleDb.update(tableInfo.table).set(updateFields).where(eq(tableInfo.table[tableInfo.keyCol], this._docId));
  }
  async get() {
    const tableInfo = tableMap[this._collectionPath];
    const rows = await drizzleDb.select().from(tableInfo.table).where(eq(tableInfo.table[tableInfo.keyCol], this._docId)).limit(1);
    const exists = rows.length > 0;
    return { exists, id: this._docId, data: () => exists ? rows[0] : undefined };
  }
  async delete() {
    const tableInfo = tableMap[this._collectionPath];
    await drizzleDb.delete(tableInfo.table).where(eq(tableInfo.table[tableInfo.keyCol], this._docId));
  }
}

class CompatQuery {
  constructor(public _collectionPath: string, protected _where: any[] = [], protected _order: any[] = [], protected _lim?: number) {}
  where(field: string, op: string, value: any) { return new CompatQuery(this._collectionPath, [...this._where, { field, value }], this._order, this._lim); }
  orderBy(field: string, dir: 'asc' | 'desc' = 'asc') { return new CompatQuery(this._collectionPath, this._where, [...this._order, { field, dir }], this._lim); }
  limit(n: number) { return new CompatQuery(this._collectionPath, this._where, this._order, n); }
  async get() {
    const tableInfo = tableMap[this._collectionPath];
    let q = drizzleDb.select().from(tableInfo.table);
    const conds = this._where.map(c => eq(tableInfo.table[c.field], c.value));
    if (conds.length > 0) q = q.where(and(...conds)) as any;
    const ords = this._order.map(o => o.dir === 'desc' ? desc(tableInfo.table[o.field]) : asc(tableInfo.table[o.field]));
    if (ords.length > 0) q = q.orderBy(...ords) as any;
    if (this._lim) q = q.limit(this._lim) as any;
    const rows = await q;
    const docs = rows.map((r: any) => ({ id: r[tableInfo.keyProp], exists: true, data: () => r, ref: new CompatDocRef(this._collectionPath, r[tableInfo.keyProp]) }));
    return { size: docs.length, empty: docs.length === 0, docs, forEach: (cb: any) => docs.forEach(cb) };
  }
}

class CompatCollectionRef extends CompatQuery {
  constructor(path: string) { super(path); }
  doc(id?: string) { return new CompatDocRef(this._collectionPath, id || Math.random().toString(36).substring(2, 15)); }
}

const db = { collection: (p: string) => new CompatCollectionRef(p), batch: () => new (class { _ops: any[] = []; set(r: any, d: any) { this._ops.push(() => r.set(d)); return this; } update(r: any, d: any) { this._ops.push(() => r.update(d)); return this; } async commit() { for (const op of this._ops) await op(); } })() };
const FieldValue = { increment: (val: number) => ({ __increment: val }), serverTimestamp: () => Date.now() };

const app = express();
app.use(express.json());

let sysSettings = { vpnCheckEnabled: true, conversionRate: 10000, pointsToBdtRate: 100, minWithdrawRechargePoints: 2000, minWithdrawBankPoints: 10000, adsenseCode: '', supportLink: 'https://t.me/mrcashbd' };

// Routes setup
app.get('/api/v1/status', (req, res) => res.json({ status: 'running' }));

// Helper for Notifications
async function addNotification(userId: string, title: string, message: string, type: string) {
  const notifId = `NT-${Math.floor(100000 + Math.random() * 900000)}`;
  await db.collection('notifications').doc(notifId).set({ id: notifId, userId: userId.toLowerCase().trim(), title, message, type, isRead: false, createdAt: Date.now() });
}

// User Profile Update
app.post('/api/v1/user/settings/update', async (req, res) => {
  const { username, name, password, email, phoneNumber } = req.body;
  const userRef = db.collection('users').doc(username.toLowerCase().trim());
  await userRef.update({ name, email, phoneNumber });
  if (password) await db.collection('credentials').doc(username.toLowerCase().trim()).set({ password });
  const fresh = await userRef.get();
  res.json(fresh.data());
});

// Withdrawal Request
app.post('/api/v1/withdraw', async (req, res) => {
  const { username, method, accountNumber, points } = req.body;
  const uid = username.toLowerCase().trim();
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const userData: any = userSnap.data();
  if (userData.balancePoints < points) return res.status(400).json({ error: 'Insufficient points' });
  const wdId = `WD-${Math.floor(100000 + Math.random() * 900000)}`;
  await db.collection('withdrawals').doc(wdId).set({ id: wdId, userId: uid, username: userData.username, method, accountNumber, amountPoints: points, status: 'pending', createdAt: Date.now() });
  await userRef.update({ balancePoints: FieldValue.increment(-points), pendingCashoutPoints: FieldValue.increment(points) });
  res.status(201).json({ message: 'Success' });
});

// Serving Static Files for Vercel
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return;
  res.sendFile(path.join(distPath, 'index.html'));
});

export default app;

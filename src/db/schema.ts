import { pgTable, text, integer, boolean, doublePrecision, bigint } from 'drizzle-orm/pg-core';

// 1. Users table
export const users = pgTable('users', {
  username: text('username').primaryKey(),
  uid: text('uid').notNull(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  balancePoints: integer('balance_points').default(0).notNull(),
  totalReferred: integer('total_referred').default(0).notNull(),
  referredBy: text('referred_by').default('').notNull(),
  pendingCashoutPoints: integer('pending_cashout_points').default(0).notNull(),
  todayWorkPoints: integer('today_work_points').default(0).notNull(),
  ipAddress: text('ip_address').default('').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
});

// 2. Credentials table (for authentication passwords)
export const credentials = pgTable('credentials', {
  username: text('username').primaryKey().references(() => users.username, { onDelete: 'cascade' }),
  password: text('password').notNull(),
});

// 3. Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.username, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'withdrawal', 'task', 'referral', etc.
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// 4. Postback Logs table
export const postbackLogs = pgTable('postback_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.username, { onDelete: 'cascade' }),
  username: text('username').notNull(),
  payout: doublePrecision('payout').default(0).notNull(),
  pointsCredited: integer('points_credited').default(0).notNull(),
  ip: text('ip').default('0.0.0.0').notNull(),
  campaignName: text('campaign_name').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// 5. Withdrawals table
export const withdrawals = pgTable('withdrawals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.username, { onDelete: 'cascade' }),
  username: text('username').notNull(),
  email: text('email').notNull(),
  method: text('method').notNull(),
  accountNumber: text('account_number').notNull(),
  amountPoints: integer('amount_points').notNull(),
  amountBDT: integer('amount_bdt').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected'
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// 6. System Settings table (to persist admin settings)
export const systemSettings = pgTable('system_settings', {
  id: text('id').primaryKey().default('global'),
  vpnCheckEnabled: boolean('vpn_check_enabled').default(true).notNull(),
  conversionRate: integer('conversion_rate').default(10000).notNull(),
  pointsToBdtRate: integer('points_to_bdt_rate').default(100).notNull(),
  minWithdrawRechargePoints: integer('min_withdraw_recharge_points').default(2000).notNull(),
  minWithdrawBankPoints: integer('min_withdraw_bank_points').default(10000).notNull(),
  adsenseCode: text('adsense_code').default('').notNull(),
  supportLink: text('support_link').default('https://t.me/mrcashbd').notNull(),
  maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
  maintenanceMessage: text('maintenance_message').default('System is undergoing maintenance. Please check back shortly.').notNull(),
  broadcastMessage: text('broadcast_message').default('').notNull(),
});

// 7. Redeem Codes table
export const redeemCodes = pgTable('redeem_codes', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  rewardPoints: integer('reward_points').notNull(),
  description: text('description').notNull(),
  image: text('image').default('').notNull(),
  eligibilityType: text('eligibility_type').default('all').notNull(), // 'all' or 'limited'
  maxUsers: integer('max_users').default(0).notNull(),
  redeemedCount: integer('redeemed_count').default(0).notNull(),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// 8. User Redemptions table
export const userRedemptions = pgTable('user_redemptions', {
  id: text('id').primaryKey(), // username_code
  username: text('username').notNull().references(() => users.username, { onDelete: 'cascade' }),
  code: text('code').notNull().references(() => redeemCodes.code, { onDelete: 'cascade' }),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});


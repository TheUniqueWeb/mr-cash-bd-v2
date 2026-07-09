export interface User {
  uid: string;
  email: string;
  username: string;
  balancePoints: number;
  totalReferred: number;
  referredBy: string;
  pendingCashoutPoints: number;
  todayWorkPoints: number;
  ipAddress: string;
  status: 'active' | 'banned';
  createdAt: number;
  isAdmin: boolean;
  name?: string;
  phoneNumber?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  email: string;
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Mobile Recharge';
  accountNumber: string;
  amountPoints: number;
  amountBDT: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface CPAOffer {
  campid: string;
  title: string;
  description: string;
  link: string;
  payoutPoints: number;
  payoutUSD: number;
  originalTitle: string;
  country: string;
  device: string;
  category: string;
}

export interface PostbackLog {
  id: string;
  userId: string;
  username: string;
  payout: number;
  pointsCredited: number;
  ip: string;
  leadId: string;
  campaignName: string;
  createdAt: number;
}

export interface SystemStats {
  totalMembers: number;
  totalPaidBDT: number;
  totalPointsEarned: number;
  pendingWithdrawalsCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'withdrawal' | 'task' | 'referral';
  isRead: boolean;
  createdAt: number;
}

export interface SystemSettings {
  vpnCheckEnabled: boolean;
  conversionRate: number;
  pointsToBdtRate: number;
  minWithdrawRechargePoints: number;
  minWithdrawBankPoints: number;
  adsenseCode: string;
  supportLink: string;
}

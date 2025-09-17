export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  village: string;
  householdSize: string;
  address: string;
  points: number;
  level: number;
  role: 'user' | 'admin';
  isActive: boolean;
  redeemedRewards: string[];
  createdAt: string;
}

export interface Admin {
  id: string;
  idNumber: string;
  name: string;
  role: 'admin';
  createdAt: string;
}

export interface Stats {
  households: number;
  villages: number;
  wasteReduction: number;
  rewards: number;
}

export interface AuthContextType {
  user: User | Admin | null;
  token: string | null;
  login: (token: string, user: User | Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
export interface Reward {
  _id: string;
  title: string;
  description: string;
  pointsRequired: number;
  type: 'Discount' | 'Recharge' | 'Voucher' | 'Product'; // Expanded to match server schema
  requiredLevel: number; // Added to support tier-based rewards
}
export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'buyer' | 'seller';
    createdAt: Date;
    country?: string;
    businessName?: string;
  }
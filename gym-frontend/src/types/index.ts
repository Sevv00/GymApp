export interface User {
  id: number;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  userRole: string;
  createdAt?: string;
  lastLoggedInDate?: string;
  isGoogle?: boolean;
  discount?: string;
  adAgreement?: boolean;
  isActive?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Offer {
  id: number;
  offerName: string;
  offerDescription?: string;
  priceText?: string;
  price: number;
  durationDays: number;
  isPermanent: boolean;
  offerExpiredDate?: string;
  createdAt?: string;
  createdById?: number;
  createdByName?: string;
  isActive?: boolean;
  classInfo?: ClassInfo;
}

export interface ClassInfo {
  id: number;
  offerId: number;
  offerName?: string;
  startTime: string;
  endTime: string;
  instructorId?: number;
  instructorName?: string;
  capacity: number;
  registeredCount: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorName?: string;
  isActive?: boolean;
}

export interface GymInfo {
  id?: number;
  openingHours?: string;
  gymDesc?: string;
  firstPhoneNumber?: string;
  secondPhoneNumber?: string;
  firstEmail?: string;
  secondEmail?: string;
  updatedAt?: string;
  updatedByName?: string;
}

export interface Purchase {
  id: number;
  userId?: number;
  userName?: string;
  offerId: number;
  offerName: string;
  purchaseDate: string;
  validUntil?: string;
}

export interface GymAdmission {
  id: number;
  userId: number;
  userName?: string;
  startTime: string;
  endTime: string;
}

// Admin Authentication
export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  admin: Admin;
}

// Car
export interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'automatic' | 'manual';
  images: string[];
  displayLocation: 'market' | 'business' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface CarFormData {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'automatic' | 'manual';
  images: string[];
  displayLocation: 'market' | 'business' | 'both';
}

// Tire
export interface Tire {
  _id: string;
  brand: string;
  size: string;
  price: number;
  condition: 'new' | 'used';
  images: string[];
  displayLocation: 'market' | 'business' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface TireFormData {
  brand: string;
  size: string;
  price: number;
  condition: 'new' | 'used';
  images: string[];
  displayLocation: 'market' | 'business' | 'both';
}

// Wheel Drum
export interface WheelDrum {
  _id: string;
  brand: string;
  size: string;
  price: number;
  condition: string;
  images: string[];
  displayLocation: 'market' | 'business' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface WheelDrumFormData {
  brand: string;
  size: string;
  price: number;
  condition: string;
  images: string[];
  displayLocation: 'market' | 'business' | 'both';
}

// Contact Inquiry
export interface Contact {
  _id: string;
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiryDetails?: string;
  status: 'new' | 'in_progress' | 'resolved';
  emailSent: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  contacts?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Error
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

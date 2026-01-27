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
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  transmission: string;
  fuelType: string;
  description?: string;
  images?: string[];
  status: 'available' | 'sold' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface CarFormData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  transmission: string;
  fuelType: string;
  description?: string;
  images?: string[];
  status: 'available' | 'sold' | 'pending';
}

// Tire
export interface Tire {
  _id: string;
  brand: string;
  model: string;
  size: string;
  price: number;
  quantity: number;
  season: string;
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TireFormData {
  brand: string;
  model: string;
  size: string;
  price: number;
  quantity: number;
  season: string;
  description?: string;
  images?: string[];
}

// Wheel Drum
export interface WheelDrum {
  _id: string;
  brand: string;
  model: string;
  size: string;
  price: number;
  quantity: number;
  material: string;
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WheelDrumFormData {
  brand: string;
  model: string;
  size: string;
  price: number;
  quantity: number;
  material: string;
  description?: string;
  images?: string[];
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

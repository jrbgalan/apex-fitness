export type IntensityLevel = 'Low' | 'Moderate' | 'High' | 'Elite';
export type ClassLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface ClassItem {
  id: string;
  name: string;
  category: string;
  description: string;
  intensity: IntensityLevel;
  duration: number;
  trainer: string;
  capacity: number;
  level?: ClassLevel;
  image?: string;
  image_url?: string;
  credit?: string;
}

export interface TrainerItem {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  image_url: string;
  experience_years: number;
  order: number;
  credit?: string;
}

export interface MembershipPlanItem {
  id: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  highlighted: boolean;
  best_offer?: boolean;
  badge?: string;
  description: string;
  order: number;
}

export interface MembershipSignupData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: 'monthly' | 'annual';
  status?: string;
  created_at?: string;
}

export interface ScheduleSlotItem {
  id: string;
  class_name: string;
  trainer: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' | string;
  start_time: string;
  duration?: number;
  category: string;
  end_time?: string;
  spots_remaining?: number;
}

export interface LocationItem {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  amenities: string[];
  photo: string;
  gallery: string[];
  description: string;
  phone?: string;
  credit?: string;
}

export type ProductCategory = 'Apparel' | 'Supplements' | 'Equipment' | 'Accessories' | 'Wellness Tech';

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  hover_image?: string;
  gallery?: string[];
  stock: number;
  rating: number;
  badge?: 'New' | 'Best Seller';
  sizes?: string[];
  flavors?: string[];
}

export interface CartItem {
  id: string;
  product: ProductItem;
  quantity: number;
  selectedSize?: string;
  selectedFlavor?: string;
}

export interface OrderData {
  id?: string;
  customer_name: string;
  email: string;
  phone?: string;
  shipping_address: string;
  items: CartItem[];
  subtotal: number;
  status?: string;
  created_at?: string;
}

export interface TourBookingData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  preferred_date: string;
  preferred_time: string;
  preferred_location?: string;
  notes?: string;
  status?: string;
  created_at?: string;
}

export interface ContactInquiryData {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at?: string;
}

export interface NewsletterSubscriberData {
  id?: string;
  email: string;
  created_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface FacilityPhoto {
  src: string;
  alt: string;
  credit?: string;
  photographer?: string;
}

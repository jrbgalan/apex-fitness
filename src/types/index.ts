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
  location?: string;
}

export interface DailyHours {
  day: string;
  open: string;
  close: string;
  is24Hours?: boolean;
}

export interface LocationStats {
  sqft: number;
  studios: number;
  trainers: number;
}

export interface GalleryPhoto {
  url: string;
  photographer: string;
  credit?: string;
  caption?: string;
}

export interface LocationItem {
  id: string;
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  hours: string;
  daily_hours?: DailyHours[];
  amenities: string[];
  stats: LocationStats;
  photo: string;
  hero_image: string;
  gallery: string[];
  gallery_photos?: GalleryPhoto[];
  description: string;
  credit?: string;
  photographer?: string;
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
  member_price?: number;
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
  order_number?: string;
  customer_name: string;
  email: string;
  phone?: string;
  shipping_address: string;
  shipping_city?: string;
  shipping_postal?: string;
  shipping_district?: string;
  delivery_method?: 'Standard' | 'Express';
  delivery_cost?: number;
  promo_code?: string;
  discount_amount?: number;
  tax_amount?: number;
  subtotal: number;
  total?: number;
  items: CartItem[];
  status?: string;
  estimated_delivery?: string;
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

export type IntensityLevel = 'Low' | 'Moderate' | 'High' | 'Elite';

export interface ClassItem {
  id: string;
  name: string;
  category: string;
  description: string;
  intensity: IntensityLevel;
  duration: number;
  trainer: string;
  capacity: number;
  image_url?: string;
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
}

export interface MembershipPlanItem {
  id: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  highlighted: boolean;
  description: string;
  order: number;
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

export interface TourBookingData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  status?: string;
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


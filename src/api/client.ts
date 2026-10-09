import {
  INITIAL_CLASSES,
  INITIAL_TRAINERS,
  INITIAL_PLANS,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
} from '@/data/mockData';
import {
  ClassItem,
  TrainerItem,
  MembershipPlanItem,
  ScheduleSlotItem,
  LocationItem,
  ProductItem,
  TourBookingData,
  NewsletterSubscriberData,
  MembershipSignupData,
  OrderData,
  ContactInquiryData,
  AuthUser,
} from '@/types';

// Safe localStorage access
const getStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
};

const TourBookingAPI = {
  create: async (data: TourBookingData): Promise<TourBookingData> => {
    await new Promise((r) => setTimeout(r, 450));
    if (!data.name || !data.email || !data.preferred_date) {
      throw new Error('Please fill in your name, email, and preferred date.');
    }
    const bookings = getStorage<TourBookingData[]>('apex_tour_bookings', []);
    const newBooking: TourBookingData = {
      id: `tour-${Date.now()}`,
      ...data,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    setStorage('apex_tour_bookings', [...bookings, newBooking]);
    return newBooking;
  },
  list: async (): Promise<TourBookingData[]> => {
    return getStorage<TourBookingData[]>('apex_tour_bookings', []);
  },
};

const NewsletterAPI = {
  create: async ({ email }: { email: string }): Promise<NewsletterSubscriberData> => {
    await new Promise((r) => setTimeout(r, 350));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const subs = getStorage<NewsletterSubscriberData[]>('apex_newsletter_subscribers', []);
    const normalized = email.trim().toLowerCase();
    const exists = subs.some((s) => s.email && s.email.toLowerCase() === normalized);
    if (exists) {
      throw new Error('This email is already subscribed to the Apex journal.');
    }
    const newSub: NewsletterSubscriberData = {
      id: `sub-${Date.now()}`,
      email: normalized,
      created_at: new Date().toISOString(),
    };
    setStorage('apex_newsletter_subscribers', [...subs, newSub]);
    return newSub;
  },
  list: async (): Promise<NewsletterSubscriberData[]> => getStorage<NewsletterSubscriberData[]>('apex_newsletter_subscribers', []),
};

const MembershipSignupsAPI = {
  create: async (data: MembershipSignupData): Promise<MembershipSignupData> => {
    await new Promise((r) => setTimeout(r, 500));
    if (!data.name || !data.email) {
      throw new Error('Please enter your full name and email address.');
    }
    const signups = getStorage<MembershipSignupData[]>('apex_membership_signups', []);
    const newSignup: MembershipSignupData = {
      id: `signup-${Date.now()}`,
      ...data,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    setStorage('apex_membership_signups', [...signups, newSignup]);
    return newSignup;
  },
  list: async (): Promise<MembershipSignupData[]> => {
    return getStorage<MembershipSignupData[]>('apex_membership_signups', []);
  },
};

const ProductsAPI = {
  getProductsCatalog: (): ProductItem[] => {
    const stored = getStorage<ProductItem[] | null>('apex_products_catalog', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    // Seed initial products if not in storage
    setStorage('apex_products_catalog', INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },
  list: async (category?: string): Promise<ProductItem[]> => {
    await new Promise((r) => setTimeout(r, 150));
    const catalog = ProductsAPI.getProductsCatalog();
    if (category && category !== 'All') {
      return catalog.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return [...catalog];
  },
  get: async (id: string): Promise<ProductItem | null> => {
    await new Promise((r) => setTimeout(r, 100));
    const catalog = ProductsAPI.getProductsCatalog();
    return catalog.find((p) => p.id === id) || null;
  },
};

const OrdersAPI = {
  create: async (data: OrderData): Promise<OrderData> => {
    await new Promise((r) => setTimeout(r, 600));
    if (!data.customer_name || !data.email || !data.shipping_address) {
      throw new Error('Please fill in your recipient name, email, and shipping address.');
    }
    if (!data.items || data.items.length === 0) {
      throw new Error('Your cart is currently empty.');
    }

    // 1. Stock check & deduction
    const catalog = [...ProductsAPI.getProductsCatalog()];
    for (const item of data.items) {
      const prodIndex = catalog.findIndex((p) => p.id === item.product.id);
      if (prodIndex === -1) {
        throw new Error(`Product "${item.product.name}" was not found in our catalog.`);
      }
      const prod = catalog[prodIndex];
      if (prod.stock < item.quantity) {
        throw new Error(
          prod.stock === 0
            ? `Sorry, "${prod.name}" is now completely sold out.`
            : `Sorry, only ${prod.stock} units of "${prod.name}" remain available.`
        );
      }
      // Deduce stock
      catalog[prodIndex] = {
        ...prod,
        stock: Math.max(0, prod.stock - item.quantity),
      };
    }

    // Save updated catalog
    setStorage('apex_products_catalog', catalog);

    // 2. Generate unique order
    const orderNum = `APX-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    // Estimated delivery in 3 business days
    const estDeliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const estDeliveryStr = estDeliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const orders = getStorage<OrderData[]>('apex_orders', []);
    const newOrder: OrderData = {
      id: orderNum,
      order_number: orderNum,
      ...data,
      status: 'Processing',
      estimated_delivery: estDeliveryStr,
      created_at: now.toISOString(),
    };
    setStorage('apex_orders', [...orders, newOrder]);
    return newOrder;
  },
  get: async (id: string): Promise<OrderData | null> => {
    await new Promise((r) => setTimeout(r, 150));
    const orders = getStorage<OrderData[]>('apex_orders', []);
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },
  list: async (): Promise<OrderData[]> => {
    return getStorage<OrderData[]>('apex_orders', []);
  },
};

const ContactInquiriesAPI = {
  create: async (data: ContactInquiryData): Promise<ContactInquiryData> => {
    await new Promise((r) => setTimeout(r, 450));
    if (!data.name || !data.email || !data.message) {
      throw new Error('Please provide your name, email, and message.');
    }
    const list = getStorage<ContactInquiryData[]>('apex_contact_inquiries', []);
    const newInquiry: ContactInquiryData = {
      id: `inq-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    setStorage('apex_contact_inquiries', [...list, newInquiry]);
    return newInquiry;
  },
  list: async (): Promise<ContactInquiryData[]> => {
    return getStorage<ContactInquiryData[]>('apex_contact_inquiries', []);
  },
};

export const api = {
  entities: {
    Class: {
      list: async (): Promise<ClassItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        return [...INITIAL_CLASSES];
      },
      get: async (id: string): Promise<ClassItem | null> => INITIAL_CLASSES.find((c) => c.id === id) || null,
    },
    Classes: {
      list: async (): Promise<ClassItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        return [...INITIAL_CLASSES];
      },
      get: async (id: string): Promise<ClassItem | null> => INITIAL_CLASSES.find((c) => c.id === id) || null,
    },
    Trainer: {
      list: async (sortBy = 'order', limit = 10): Promise<TrainerItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        let res = [...INITIAL_TRAINERS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id: string): Promise<TrainerItem | null> => INITIAL_TRAINERS.find((t) => t.id === id) || null,
    },
    Trainers: {
      list: async (sortBy = 'order', limit = 10): Promise<TrainerItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        let res = [...INITIAL_TRAINERS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id: string): Promise<TrainerItem | null> => INITIAL_TRAINERS.find((t) => t.id === id) || null,
    },
    MembershipPlan: {
      list: async (sortBy = 'order', limit = 10): Promise<MembershipPlanItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        let res = [...INITIAL_PLANS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id: string): Promise<MembershipPlanItem | null> => INITIAL_PLANS.find((p) => p.id === id) || null,
    },
    MembershipPlans: {
      list: async (sortBy = 'order', limit = 10): Promise<MembershipPlanItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        let res = [...INITIAL_PLANS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id: string): Promise<MembershipPlanItem | null> => INITIAL_PLANS.find((p) => p.id === id) || null,
    },
    ScheduleSlot: {
      list: async (): Promise<ScheduleSlotItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        return [...INITIAL_SCHEDULE_SLOTS];
      },
    },
    ScheduleSlots: {
      list: async (): Promise<ScheduleSlotItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        return [...INITIAL_SCHEDULE_SLOTS];
      },
    },
    Locations: {
      list: async (city?: string): Promise<LocationItem[]> => {
        await new Promise((r) => setTimeout(r, 200));
        if (city && city !== 'All') {
          return INITIAL_LOCATIONS.filter((l) => l.city.toLowerCase() === city.toLowerCase());
        }
        return [...INITIAL_LOCATIONS];
      },
      get: async (id: string): Promise<LocationItem | null> =>
        INITIAL_LOCATIONS.find((l) => l.id === id) || null,
    },
    Products: ProductsAPI,
    Orders: OrdersAPI,
    MembershipSignups: MembershipSignupsAPI,
    ContactInquiries: ContactInquiriesAPI,
    TourBooking: TourBookingAPI,
    TourBookings: TourBookingAPI,
    NewsletterSubscriber: NewsletterAPI,
    NewsletterSubscribers: NewsletterAPI,
  },
  app: {
    getPublicSettings: async () => ({
      id: 'apex-fitness-gym',
      name: 'Apex Fitness Gym',
      public_settings: {},
    }),
  },
  auth: {
    me: async (): Promise<AuthUser | null> => {
      return getStorage<AuthUser | null>('apex_auth_user', null);
    },
    loginViaEmailPassword: async (email: string, _password?: string): Promise<AuthUser> => {
      const user: AuthUser = { id: 'user-1', email, name: email.split('@')[0], role: 'member' };
      setStorage('apex_auth_user', user);
      if (typeof window !== 'undefined') window.localStorage.setItem('token', 'apex-token-123');
      return user;
    },
    logout: async (redirectUrl?: string): Promise<void> => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('apex_auth_user');
        window.localStorage.removeItem('token');
        if (redirectUrl) window.location.href = redirectUrl;
      }
    },
    register: async (userData: Record<string, any>): Promise<AuthUser> => {
      const user: AuthUser = { id: `user-${Date.now()}`, email: userData.email, name: userData.name || userData.email.split('@')[0], role: 'member' };
      setStorage('apex_auth_user', user);
      return user;
    },
    verifyOtp: async (_data?: any) => ({ access_token: 'apex-token-123' }),
    setToken: (token: string): void => {
      if (typeof window !== 'undefined') window.localStorage.setItem('token', token);
    },
    resendOtp: async (_email?: string) => true,
    resetPasswordRequest: async (_email?: string) => true,
    resetPassword: async (_data?: any) => true,
    loginWithProvider: (_provider: string, returnTo?: string): void => {
      const user: AuthUser = { id: 'user-oauth', email: 'member@apexfitness.com', name: 'Apex Member', role: 'member' };
      setStorage('apex_auth_user', user);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', 'apex-token-oauth');
        if (returnTo) window.location.href = returnTo;
      }
    },
    redirectToLogin: (returnTo?: string): void => {
      if (typeof window !== 'undefined') {
        window.location.href = `/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      }
    },
  },
};

// Aliases
export const client = api;
export default api;

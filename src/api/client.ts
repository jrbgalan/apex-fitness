import {
  INITIAL_CLASSES,
  INITIAL_TRAINERS,
  INITIAL_PLANS,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
} from '@/data/mockData';
import {
  SEED_TOUR_BOOKINGS,
  SEED_MEMBERSHIP_SIGNUPS,
  SEED_ORDERS,
  SEED_NEWSLETTER_SUBSCRIBERS,
} from '@/data/adminSeedData';
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

// Safe localStorage access with automatic seed initialization
const getStorage = <T>(key: string, fallback: T, autoSeed = false): T => {
  try {
    if (typeof window === 'undefined') return fallback;
    const item = window.localStorage.getItem(key);
    if (!item) {
      if (autoSeed) {
        window.localStorage.setItem(key, JSON.stringify(fallback));
      }
      return fallback;
    }
    const parsed = JSON.parse(item) as T;
    if (Array.isArray(parsed) && parsed.length === 0 && autoSeed && Array.isArray(fallback) && fallback.length > 0) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
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

// ==========================================
// 1. TOUR BOOKINGS API
// ==========================================
const TourBookingAPI = {
  list: async (locationFilter?: string): Promise<TourBookingData[]> => {
    await new Promise((r) => setTimeout(r, 120));
    const bookings = getStorage<TourBookingData[]>('apex_tour_bookings', SEED_TOUR_BOOKINGS, true);
    if (locationFilter && locationFilter !== 'All') {
      return bookings.filter(
        (b) => b.preferred_location && b.preferred_location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    return bookings;
  },
  create: async (data: TourBookingData): Promise<TourBookingData> => {
    await new Promise((r) => setTimeout(r, 200));
    if (!data.name || !data.email || !data.preferred_date) {
      throw new Error('Please fill in your name, email, and preferred date.');
    }
    const bookings = getStorage<TourBookingData[]>('apex_tour_bookings', SEED_TOUR_BOOKINGS, true);
    const newBooking: TourBookingData = {
      id: `tour-${Date.now()}`,
      ...data,
      status: data.status || 'New',
      created_at: new Date().toISOString(),
    };
    setStorage('apex_tour_bookings', [newBooking, ...bookings]);
    return newBooking;
  },
  update: async (id: string, partial: Partial<TourBookingData>): Promise<TourBookingData> => {
    await new Promise((r) => setTimeout(r, 150));
    const bookings = getStorage<TourBookingData[]>('apex_tour_bookings', SEED_TOUR_BOOKINGS, true);
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    const updated = { ...bookings[index], ...partial };
    bookings[index] = updated;
    setStorage('apex_tour_bookings', [...bookings]);
    return updated;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const bookings = getStorage<TourBookingData[]>('apex_tour_bookings', SEED_TOUR_BOOKINGS, true);
    const filtered = bookings.filter((b) => b.id !== id);
    setStorage('apex_tour_bookings', filtered);
    return true;
  },
};

// ==========================================
// 2. MEMBERSHIP SIGNUPS API
// ==========================================
const MembershipSignupsAPI = {
  list: async (): Promise<MembershipSignupData[]> => {
    await new Promise((r) => setTimeout(r, 120));
    return getStorage<MembershipSignupData[]>('apex_membership_signups', SEED_MEMBERSHIP_SIGNUPS, true);
  },
  create: async (data: MembershipSignupData): Promise<MembershipSignupData> => {
    await new Promise((r) => setTimeout(r, 200));
    if (!data.name || !data.email) {
      throw new Error('Please enter your full name and email address.');
    }
    const signups = getStorage<MembershipSignupData[]>('apex_membership_signups', SEED_MEMBERSHIP_SIGNUPS, true);
    const newSignup: MembershipSignupData = {
      id: `signup-${Date.now()}`,
      ...data,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
    };
    setStorage('apex_membership_signups', [newSignup, ...signups]);
    return newSignup;
  },
  update: async (id: string, partial: Partial<MembershipSignupData>): Promise<MembershipSignupData> => {
    await new Promise((r) => setTimeout(r, 150));
    const signups = getStorage<MembershipSignupData[]>('apex_membership_signups', SEED_MEMBERSHIP_SIGNUPS, true);
    const index = signups.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Signup record not found');
    const updated = { ...signups[index], ...partial };
    signups[index] = updated;
    setStorage('apex_membership_signups', [...signups]);
    return updated;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const signups = getStorage<MembershipSignupData[]>('apex_membership_signups', SEED_MEMBERSHIP_SIGNUPS, true);
    const filtered = signups.filter((s) => s.id !== id);
    setStorage('apex_membership_signups', filtered);
    return true;
  },
};

// ==========================================
// 3. PRODUCTS & INVENTORY API
// ==========================================
const ProductsAPI = {
  list: async (category?: string): Promise<ProductItem[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const catalog = getStorage<ProductItem[]>('apex_products_catalog', INITIAL_PRODUCTS, true);
    if (category && category !== 'All') {
      return catalog.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return [...catalog];
  },
  get: async (id: string): Promise<ProductItem | null> => {
    await new Promise((r) => setTimeout(r, 80));
    const catalog = getStorage<ProductItem[]>('apex_products_catalog', INITIAL_PRODUCTS, true);
    return catalog.find((p) => p.id === id) || null;
  },
  create: async (data: Omit<ProductItem, 'id'> & { id?: string }): Promise<ProductItem> => {
    await new Promise((r) => setTimeout(r, 200));
    const catalog = getStorage<ProductItem[]>('apex_products_catalog', INITIAL_PRODUCTS, true);
    const newProduct: ProductItem = {
      id: data.id || `prod-${Date.now()}`,
      rating: 5.0,
      ...data,
    };
    setStorage('apex_products_catalog', [newProduct, ...catalog]);
    return newProduct;
  },
  update: async (id: string, partial: Partial<ProductItem>): Promise<ProductItem> => {
    await new Promise((r) => setTimeout(r, 150));
    const catalog = getStorage<ProductItem[]>('apex_products_catalog', INITIAL_PRODUCTS, true);
    const index = catalog.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    const updated = { ...catalog[index], ...partial };
    catalog[index] = updated;
    setStorage('apex_products_catalog', [...catalog]);
    return updated;
  },
  updateStock: async (id: string, stock: number): Promise<ProductItem> => {
    return ProductsAPI.update(id, { stock: Math.max(0, stock) });
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const catalog = getStorage<ProductItem[]>('apex_products_catalog', INITIAL_PRODUCTS, true);
    setStorage(
      'apex_products_catalog',
      catalog.filter((p) => p.id !== id)
    );
    return true;
  },
};

// ==========================================
// 4. ORDERS API
// ==========================================
const OrdersAPI = {
  list: async (statusFilter?: string): Promise<OrderData[]> => {
    await new Promise((r) => setTimeout(r, 120));
    const orders = getStorage<OrderData[]>('apex_orders', SEED_ORDERS, true);
    if (statusFilter && statusFilter !== 'All') {
      return orders.filter((o) => o.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    return orders;
  },
  get: async (id: string): Promise<OrderData | null> => {
    await new Promise((r) => setTimeout(r, 100));
    const orders = getStorage<OrderData[]>('apex_orders', SEED_ORDERS, true);
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },
  create: async (data: OrderData): Promise<OrderData> => {
    await new Promise((r) => setTimeout(r, 300));
    if (!data.customer_name || !data.email || !data.shipping_address) {
      throw new Error('Please fill in your recipient name, email, and shipping address.');
    }
    if (!data.items || data.items.length === 0) {
      throw new Error('Your cart is currently empty.');
    }

    // Deduct stock from catalog
    const catalog = getStorage<ProductItem[]>('apex_products_catalog', INITIAL_PRODUCTS, true);
    for (const item of data.items) {
      const prodIndex = catalog.findIndex((p) => p.id === item.product.id);
      if (prodIndex !== -1) {
        catalog[prodIndex].stock = Math.max(0, catalog[prodIndex].stock - item.quantity);
      }
    }
    setStorage('apex_products_catalog', [...catalog]);

    const orderNum = `APX-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const estDeliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const estDeliveryStr = estDeliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const orders = getStorage<OrderData[]>('apex_orders', SEED_ORDERS, true);
    const newOrder: OrderData = {
      id: orderNum,
      order_number: orderNum,
      ...data,
      status: 'Processing',
      estimated_delivery: estDeliveryStr,
      created_at: now.toISOString(),
    };
    setStorage('apex_orders', [newOrder, ...orders]);
    return newOrder;
  },
  updateStatus: async (id: string, status: string): Promise<OrderData> => {
    await new Promise((r) => setTimeout(r, 150));
    const orders = getStorage<OrderData[]>('apex_orders', SEED_ORDERS, true);
    const index = orders.findIndex((o) => o.id === id || o.order_number === id);
    if (index === -1) throw new Error('Order not found');
    const updated = { ...orders[index], status };
    orders[index] = updated;
    setStorage('apex_orders', [...orders]);
    return updated;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const orders = getStorage<OrderData[]>('apex_orders', SEED_ORDERS, true);
    setStorage(
      'apex_orders',
      orders.filter((o) => o.id !== id && o.order_number !== id)
    );
    return true;
  },
};

// ==========================================
// 5. CLASSES & SCHEDULE API
// ==========================================
const ClassesAPI = {
  list: async (): Promise<ClassItem[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStorage<ClassItem[]>('apex_classes_catalog', INITIAL_CLASSES, true);
  },
  get: async (id: string): Promise<ClassItem | null> => {
    await new Promise((r) => setTimeout(r, 80));
    const list = getStorage<ClassItem[]>('apex_classes_catalog', INITIAL_CLASSES, true);
    return list.find((c) => c.id === id) || null;
  },
  create: async (data: Omit<ClassItem, 'id'> & { id?: string }): Promise<ClassItem> => {
    await new Promise((r) => setTimeout(r, 200));
    const list = getStorage<ClassItem[]>('apex_classes_catalog', INITIAL_CLASSES, true);
    const newClass: ClassItem = {
      id: data.id || `class-${Date.now()}`,
      ...data,
    };
    setStorage('apex_classes_catalog', [newClass, ...list]);
    return newClass;
  },
  update: async (id: string, partial: Partial<ClassItem>): Promise<ClassItem> => {
    await new Promise((r) => setTimeout(r, 150));
    const list = getStorage<ClassItem[]>('apex_classes_catalog', INITIAL_CLASSES, true);
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found');
    const updated = { ...list[index], ...partial };
    list[index] = updated;
    setStorage('apex_classes_catalog', [...list]);
    return updated;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const list = getStorage<ClassItem[]>('apex_classes_catalog', INITIAL_CLASSES, true);
    setStorage(
      'apex_classes_catalog',
      list.filter((c) => c.id !== id)
    );
    return true;
  },
};

const ScheduleSlotsAPI = {
  list: async (locationSlug?: string): Promise<ScheduleSlotItem[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const slots = getStorage<ScheduleSlotItem[]>('apex_schedule_slots', INITIAL_SCHEDULE_SLOTS, true);
    if (locationSlug && locationSlug !== 'All') {
      return slots.filter((s) => !s.location || s.location === locationSlug);
    }
    return slots;
  },
  create: async (data: Omit<ScheduleSlotItem, 'id'> & { id?: string }): Promise<ScheduleSlotItem> => {
    await new Promise((r) => setTimeout(r, 200));
    const slots = getStorage<ScheduleSlotItem[]>('apex_schedule_slots', INITIAL_SCHEDULE_SLOTS, true);
    const newSlot: ScheduleSlotItem = {
      id: data.id || `slot-${Date.now()}`,
      ...data,
    };
    setStorage('apex_schedule_slots', [...slots, newSlot]);
    return newSlot;
  },
  update: async (id: string, partial: Partial<ScheduleSlotItem>): Promise<ScheduleSlotItem> => {
    await new Promise((r) => setTimeout(r, 150));
    const slots = getStorage<ScheduleSlotItem[]>('apex_schedule_slots', INITIAL_SCHEDULE_SLOTS, true);
    const index = slots.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Schedule slot not found');
    const updated = { ...slots[index], ...partial };
    slots[index] = updated;
    setStorage('apex_schedule_slots', [...slots]);
    return updated;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const slots = getStorage<ScheduleSlotItem[]>('apex_schedule_slots', INITIAL_SCHEDULE_SLOTS, true);
    setStorage(
      'apex_schedule_slots',
      slots.filter((s) => s.id !== id)
    );
    return true;
  },
};

// ==========================================
// 6. TRAINERS API
// ==========================================
const TrainersAPI = {
  list: async (sortBy = 'order', limit = 50): Promise<TrainerItem[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const trainers = getStorage<TrainerItem[]>('apex_trainers_catalog', INITIAL_TRAINERS, true);
    const res = [...trainers];
    if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
    return res.slice(0, limit);
  },
  get: async (id: string): Promise<TrainerItem | null> => {
    await new Promise((r) => setTimeout(r, 80));
    const trainers = getStorage<TrainerItem[]>('apex_trainers_catalog', INITIAL_TRAINERS, true);
    return trainers.find((t) => t.id === id) || null;
  },
  create: async (data: Omit<TrainerItem, 'id'> & { id?: string }): Promise<TrainerItem> => {
    await new Promise((r) => setTimeout(r, 200));
    const trainers = getStorage<TrainerItem[]>('apex_trainers_catalog', INITIAL_TRAINERS, true);
    const newTrainer: TrainerItem = {
      id: data.id || `trainer-${Date.now()}`,
      order: trainers.length + 1,
      ...data,
    };
    setStorage('apex_trainers_catalog', [...trainers, newTrainer]);
    return newTrainer;
  },
  update: async (id: string, partial: Partial<TrainerItem>): Promise<TrainerItem> => {
    await new Promise((r) => setTimeout(r, 150));
    const trainers = getStorage<TrainerItem[]>('apex_trainers_catalog', INITIAL_TRAINERS, true);
    const index = trainers.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Trainer not found');
    const updated = { ...trainers[index], ...partial };
    trainers[index] = updated;
    setStorage('apex_trainers_catalog', [...trainers]);
    return updated;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const trainers = getStorage<TrainerItem[]>('apex_trainers_catalog', INITIAL_TRAINERS, true);
    setStorage(
      'apex_trainers_catalog',
      trainers.filter((t) => t.id !== id)
    );
    return true;
  },
};

// ==========================================
// 7. LOCATIONS API
// ==========================================
const LocationsAPI = {
  list: async (city?: string): Promise<LocationItem[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const locations = getStorage<LocationItem[]>('apex_locations_catalog', INITIAL_LOCATIONS, true);
    if (city && city !== 'All') {
      return locations.filter((l) => l.city.toLowerCase() === city.toLowerCase());
    }
    return [...locations];
  },
  get: async (idOrSlug: string): Promise<LocationItem | null> => {
    await new Promise((r) => setTimeout(r, 80));
    const locations = getStorage<LocationItem[]>('apex_locations_catalog', INITIAL_LOCATIONS, true);
    return locations.find((l) => l.id === idOrSlug || l.slug === idOrSlug) || null;
  },
  create: async (data: Omit<LocationItem, 'id'> & { id?: string }): Promise<LocationItem> => {
    await new Promise((r) => setTimeout(r, 200));
    const locations = getStorage<LocationItem[]>('apex_locations_catalog', INITIAL_LOCATIONS, true);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newLocation: LocationItem = {
      id: data.id || `loc-${Date.now()}`,
      slug,
      stats: data.stats || { sqft: 15000, studios: 3, trainers: 12 },
      photo: data.photo || INITIAL_LOCATIONS[0].photo,
      hero_image: data.hero_image || INITIAL_LOCATIONS[0].hero_image,
      gallery: data.gallery || INITIAL_LOCATIONS[0].gallery,
      amenities: data.amenities || ['Sauna', 'Spa'],
      ...data,
    };
    setStorage('apex_locations_catalog', [...locations, newLocation]);
    return newLocation;
  },
  update: async (idOrSlug: string, partial: Partial<LocationItem>): Promise<LocationItem> => {
    await new Promise((r) => setTimeout(r, 150));
    const locations = getStorage<LocationItem[]>('apex_locations_catalog', INITIAL_LOCATIONS, true);
    const index = locations.findIndex((l) => l.id === idOrSlug || l.slug === idOrSlug);
    if (index === -1) throw new Error('Location not found');
    const updated = { ...locations[index], ...partial };
    locations[index] = updated;
    setStorage('apex_locations_catalog', [...locations]);
    return updated;
  },
  delete: async (idOrSlug: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const locations = getStorage<LocationItem[]>('apex_locations_catalog', INITIAL_LOCATIONS, true);
    setStorage(
      'apex_locations_catalog',
      locations.filter((l) => l.id !== idOrSlug && l.slug !== idOrSlug)
    );
    return true;
  },
};

// ==========================================
// 8. NEWSLETTER API
// ==========================================
const NewsletterAPI = {
  list: async (): Promise<NewsletterSubscriberData[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStorage<NewsletterSubscriberData[]>('apex_newsletter_subscribers', SEED_NEWSLETTER_SUBSCRIBERS, true);
  },
  create: async ({ email }: { email: string }): Promise<NewsletterSubscriberData> => {
    await new Promise((r) => setTimeout(r, 200));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const subs = getStorage<NewsletterSubscriberData[]>('apex_newsletter_subscribers', SEED_NEWSLETTER_SUBSCRIBERS, true);
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
    setStorage('apex_newsletter_subscribers', [newSub, ...subs]);
    return newSub;
  },
  delete: async (id: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 150));
    const subs = getStorage<NewsletterSubscriberData[]>('apex_newsletter_subscribers', SEED_NEWSLETTER_SUBSCRIBERS, true);
    setStorage(
      'apex_newsletter_subscribers',
      subs.filter((s) => s.id !== id)
    );
    return true;
  },
};

// ==========================================
// 9. CONTACT INQUIRIES API
// ==========================================
const ContactInquiriesAPI = {
  create: async (data: ContactInquiryData): Promise<ContactInquiryData> => {
    await new Promise((r) => setTimeout(r, 300));
    if (!data.name || !data.email || !data.message) {
      throw new Error('Please provide your name, email, and message.');
    }
    const list = getStorage<ContactInquiryData[]>('apex_contact_inquiries', []);
    const newInquiry: ContactInquiryData = {
      id: `inq-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    setStorage('apex_contact_inquiries', [newInquiry, ...list]);
    return newInquiry;
  },
  list: async (): Promise<ContactInquiryData[]> => {
    return getStorage<ContactInquiryData[]>('apex_contact_inquiries', []);
  },
};

// ==========================================
// 10. COMBINED EXPORTS & AUTH
// ==========================================
export const api = {
  entities: {
    Class: ClassesAPI,
    Classes: ClassesAPI,
    Trainer: TrainersAPI,
    Trainers: TrainersAPI,
    MembershipPlan: {
      list: async (sortBy = 'order', limit = 10): Promise<MembershipPlanItem[]> => {
        await new Promise((r) => setTimeout(r, 100));
        const res = [...INITIAL_PLANS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id: string): Promise<MembershipPlanItem | null> => INITIAL_PLANS.find((p) => p.id === id) || null,
    },
    MembershipPlans: {
      list: async (sortBy = 'order', limit = 10): Promise<MembershipPlanItem[]> => {
        await new Promise((r) => setTimeout(r, 100));
        const res = [...INITIAL_PLANS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id: string): Promise<MembershipPlanItem | null> => INITIAL_PLANS.find((p) => p.id === id) || null,
    },
    ScheduleSlot: ScheduleSlotsAPI,
    ScheduleSlots: ScheduleSlotsAPI,
    Locations: LocationsAPI,
    Products: ProductsAPI,
    Orders: OrdersAPI,
    MembershipSignups: MembershipSignupsAPI,
    ContactInquiries: ContactInquiriesAPI,
    TourBooking: TourBookingAPI,
    TourBookings: TourBookingAPI,
    NewsletterSubscriber: NewsletterAPI,
    NewsletterSubscribers: NewsletterAPI,
  },
  tourBookings: {
    getAll: () => TourBookingAPI.list(),
    ...TourBookingAPI,
  },
  membershipSignups: {
    getAll: () => MembershipSignupsAPI.list(),
    ...MembershipSignupsAPI,
  },
  orders: {
    getAll: () => OrdersAPI.list(),
    ...OrdersAPI,
  },
  products: {
    getAll: () => ProductsAPI.list(),
    ...ProductsAPI,
  },
  classes: {
    getAll: () => ClassesAPI.list(),
    ...ClassesAPI,
  },
  scheduleSlots: {
    getAll: () => ScheduleSlotsAPI.list(),
    ...ScheduleSlotsAPI,
  },
  trainers: {
    getAll: () => TrainersAPI.list(),
    ...TrainersAPI,
  },
  locations: {
    getAll: () => LocationsAPI.list(),
    ...LocationsAPI,
  },
  subscribers: {
    getAll: () => NewsletterAPI.list(),
    ...NewsletterAPI,
  },
  app: {
    getPublicSettings: async () => ({
      id: 'apex-fitness-gym',
      name: 'Apex Fitness Gym',
      public_settings: {},
    }),
  },
  auth: {
    getCurrentUser: (): AuthUser | null => {
      return getStorage<AuthUser | null>('apex_auth_user', null);
    },
    me: async (): Promise<AuthUser | null> => {
      return getStorage<AuthUser | null>('apex_auth_user', null);
    },
    isAdmin: (): boolean => {
      const user = getStorage<AuthUser | null>('apex_auth_user', null);
      return user?.role === 'admin';
    },
    loginAsAdmin: async (): Promise<AuthUser> => {
      await new Promise((r) => setTimeout(r, 300));
      const adminUser: AuthUser = {
        id: 'admin-apex-01',
        email: 'admin@apexfitness.ph',
        name: 'John Romeo Galan',
        role: 'admin',
      };
      setStorage('apex_auth_user', adminUser);
      if (typeof window !== 'undefined') window.localStorage.setItem('token', 'apex-token-admin-root');
      return adminUser;
    },
    loginViaEmailPassword: async (email: string, _password?: string): Promise<AuthUser> => {
      await new Promise((r) => setTimeout(r, 300));
      const isAdminEmail = email.toLowerCase().includes('admin');
      const user: AuthUser = {
        id: `user-${Date.now()}`,
        email,
        name: isAdminEmail ? 'Executive Administrator' : email.split('@')[0],
        role: isAdminEmail ? 'admin' : 'member',
      };
      setStorage('apex_auth_user', user);
      if (typeof window !== 'undefined') window.localStorage.setItem('token', `apex-token-${user.role}`);
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
      const user: AuthUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        role: 'member',
      };
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
      const user: AuthUser = {
        id: 'user-oauth',
        email: 'member@apexfitness.com',
        name: 'Apex Member',
        role: 'member',
      };
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

export const client = api;
export default api;

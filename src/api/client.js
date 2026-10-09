import { INITIAL_CLASSES, INITIAL_TRAINERS, INITIAL_PLANS, INITIAL_SCHEDULE_SLOTS } from '@/data/mockData';

// Safe localStorage access
const getStorage = (key, fallback) => {
  try {
    const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
};

const TourBookingAPI = {
  create: async (data) => {
    await new Promise((r) => setTimeout(r, 450));
    if (!data.name || !data.email || !data.preferred_date) {
      throw new Error('Please fill in your name, email, and preferred date.');
    }
    const bookings = getStorage('apex_tour_bookings', []);
    const newBooking = {
      id: `tour-${Date.now()}`,
      ...data,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    setStorage('apex_tour_bookings', [...bookings, newBooking]);
    return newBooking;
  },
  list: async () => {
    return getStorage('apex_tour_bookings', []);
  },
};

const NewsletterAPI = {
  create: async ({ email }) => {
    await new Promise((r) => setTimeout(r, 350));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const subs = getStorage('apex_newsletter_subscribers', []);
    const normalized = email.trim().toLowerCase();
    const exists = subs.some((s) => s.email && s.email.toLowerCase() === normalized);
    if (exists) {
      throw new Error('This email is already subscribed to the Apex journal.');
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      email: normalized,
      created_at: new Date().toISOString(),
    };
    setStorage('apex_newsletter_subscribers', [...subs, newSub]);
    return newSub;
  },
  list: async () => getStorage('apex_newsletter_subscribers', []),
};

export const api = {
  entities: {
    Class: {
      list: async () => {
        await new Promise((r) => setTimeout(r, 200));
        return [...INITIAL_CLASSES];
      },
      get: async (id) => INITIAL_CLASSES.find((c) => c.id === id) || null,
    },
    Trainer: {
      list: async (sortBy = 'order', limit = 10) => {
        await new Promise((r) => setTimeout(r, 200));
        let res = [...INITIAL_TRAINERS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id) => INITIAL_TRAINERS.find((t) => t.id === id) || null,
    },
    MembershipPlan: {
      list: async (sortBy = 'order', limit = 10) => {
        await new Promise((r) => setTimeout(r, 200));
        let res = [...INITIAL_PLANS];
        if (sortBy === 'order') res.sort((a, b) => a.order - b.order);
        return res.slice(0, limit);
      },
      get: async (id) => INITIAL_PLANS.find((p) => p.id === id) || null,
    },
    ScheduleSlot: {
      list: async () => {
        await new Promise((r) => setTimeout(r, 200));
        return [...INITIAL_SCHEDULE_SLOTS];
      },
    },
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
    me: async () => {
      return getStorage('apex_auth_user', null);
    },
    loginViaEmailPassword: async (email, _password) => {
      const user = { id: 'user-1', email, name: email.split('@')[0], role: 'member' };
      setStorage('apex_auth_user', user);
      if (typeof window !== 'undefined') window.localStorage.setItem('token', 'apex-token-123');
      return user;
    },
    logout: async (redirectUrl) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('apex_auth_user');
        window.localStorage.removeItem('token');
        if (redirectUrl) window.location.href = redirectUrl;
      }
    },
    register: async (userData) => {
      const user = { id: `user-${Date.now()}`, ...userData, role: 'member' };
      setStorage('apex_auth_user', user);
      return user;
    },
    verifyOtp: async () => ({ access_token: 'apex-token-123' }),
    setToken: (token) => {
      if (typeof window !== 'undefined') window.localStorage.setItem('token', token);
    },
    resendOtp: async () => true,
    resetPasswordRequest: async () => true,
    resetPassword: async () => true,
    loginWithProvider: (provider, returnTo) => {
      const user = { id: 'user-oauth', email: 'member@apexfitness.com', name: 'Apex Member', role: 'member' };
      setStorage('apex_auth_user', user);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', 'apex-token-oauth');
        if (returnTo) window.location.href = returnTo;
      }
    },
    redirectToLogin: (returnTo) => {
      if (typeof window !== 'undefined') {
        window.location.href = `/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      }
    },
  },
};

// Aliases
export const client = api;
export default api;

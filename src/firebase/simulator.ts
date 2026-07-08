'use client';

// Types for Simulator
export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'farmer' | 'admin';
  createdAt: string;
}

export interface MockFarmer {
  userId: string;
  landSize: number;
  soilType: 'clay' | 'sandy' | 'loamy' | 'alluvial' | 'black';
  waterSource: 'rainfed' | 'canal' | 'borewell' | 'drip';
  currentCrop: string;
  cropHistory: string[];
  income: number;
  category: 'small' | 'marginal' | 'large';
}

export interface MockApplication {
  id: string;
  userId: string;
  applicantName: string;
  type: 'birth' | 'death' | 'income' | 'residence';
  status: 'pending' | 'under_verification' | 'approved' | 'rejected';
  submittedAt: string;
  updatedAt: string;
  details: any;
  documents: { name: string; url: string }[];
  adminRemarks?: string;
}

export interface MockCrop {
  id: string;
  name: string;
  soilType: string[];
  season: string[];
  waterRequirement: 'high' | 'medium' | 'low';
  expectedYield: string;
  fertilizers: string[];
  pests: string[];
}

export interface MockScheme {
  id: string;
  name: string;
  description: string;
  incomeLimit: number;
  maxLandSize: number;
  category: string[];
  benefits: string;
}

export interface MockWeather {
  temp: number;
  humidity: number;
  wind: number;
  rain: number;
  condition: string;
}

export interface MockNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface MockCropRecommendation {
  id: string;
  userId: string;
  soilType: string;
  season: string;
  waterAvailability: string;
  recommendation: {
    bestCrop: string;
    expectedYield: string;
    fertilizerSuggestion: string;
    irrigationAdvice: string;
    pestPrevention: string;
  };
  createdAt: string;
}

// Initial Database Seeds
const initialCrops: MockCrop[] = [
  {
    id: 'crop-1',
    name: 'Rice (Paddy)',
    soilType: ['clay', 'alluvial'],
    season: ['kharif'],
    waterRequirement: 'high',
    expectedYield: '20-25 quintals/acre',
    fertilizers: ['DAP', 'Urea', 'Zinc Sulphate'],
    pests: ['Stem Borer', 'Leaf Folder', 'Brown Plant Hopper'],
  },
  {
    id: 'crop-2',
    name: 'Wheat',
    soilType: ['loamy', 'black', 'alluvial'],
    season: ['rabi'],
    waterRequirement: 'medium',
    expectedYield: '18-22 quintals/acre',
    fertilizers: ['NPK 12:32:16', 'Urea', 'Muriate of Potash'],
    pests: ['Yellow Rust', 'Aphids', 'Termites'],
  },
  {
    id: 'crop-3',
    name: 'Cotton',
    soilType: ['black', 'alluvial'],
    season: ['kharif'],
    waterRequirement: 'medium',
    expectedYield: '8-12 quintals/acre',
    fertilizers: ['NPK', 'Urea', 'Magnesium Sulphate'],
    pests: ['Bollworm', 'Whitefly', 'Jassids'],
  },
  {
    id: 'crop-4',
    name: 'Maize (Corn)',
    soilType: ['loamy', 'sandy', 'alluvial'],
    season: ['kharif', 'rabi'],
    waterRequirement: 'medium',
    expectedYield: '22-26 quintals/acre',
    fertilizers: ['Urea', 'Single Super Phosphate', 'Zinc'],
    pests: ['Fall Armyworm', 'Stem Borer'],
  },
  {
    id: 'crop-5',
    name: 'Groundnut',
    soilType: ['sandy', 'loamy'],
    season: ['kharif'],
    waterRequirement: 'low',
    expectedYield: '10-14 quintals/acre',
    fertilizers: ['Gypsum', 'Single Super Phosphate', 'Urea'],
    pests: ['White Grub', 'Leaf Miner', 'Rust'],
  }
];

const initialSchemes: MockScheme[] = [
  {
    id: 'scheme-1',
    name: 'PM-Kisan Samman Nidhi',
    description: 'Central sector income support scheme for landholding farmer families across the country.',
    incomeLimit: 1000000,
    maxLandSize: 5,
    category: ['small', 'marginal'],
    benefits: '₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts.'
  },
  {
    id: 'scheme-2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Government sponsored crop insurance scheme securing farmers against harvest failures due to weather and pests.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: 'Full financial insurance coverage against crop damage at extremely low premium rates (1.5% to 2% for farmers).'
  },
  {
    id: 'scheme-3',
    name: 'Soil Health Card Scheme',
    description: 'National project assisting farmers in optimizing fertilizer usage and testing nutrients.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: 'Free physical soil testing reports every 2 years, containing specific advisory on micro-nutrients and manure.'
  },
  {
    id: 'scheme-4',
    name: 'Kisan Credit Card (KCC)',
    description: 'Short-term credit support system helping farmers purchase timely farming inputs.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: 'Low-interest loans (up to 4% interest rate on prompt repayment) to cover working capital needs for crop cycle.'
  },
  {
    id: 'scheme-5',
    name: 'GramVikas Organic Subsidy',
    description: 'Village Panchayat green fund promoting bio-farming practices and organic crop growth.',
    incomeLimit: 300000,
    maxLandSize: 3,
    category: ['small', 'marginal'],
    benefits: '50% direct subsidy up to ₹15,000 for constructing vermicompost beds and bio-fertilizer stocks.'
  }
];

const initialWeather: MockWeather = {
  temp: 29,
  humidity: 74,
  wind: 11,
  rain: 45,
  condition: 'Partly Cloudy'
};

const initialUsers: Record<string, MockUser> = {
  'mock-citizen-123': {
    uid: 'mock-citizen-123',
    email: 'citizen@village.com',
    displayName: 'Rajesh Kumar',
    role: 'citizen',
    createdAt: new Date().toISOString(),
  },
  'mock-farmer-456': {
    uid: 'mock-farmer-456',
    email: 'farmer@farm.com',
    displayName: 'Harish Patel',
    role: 'farmer',
    createdAt: new Date().toISOString(),
  },
  'mock-admin-789': {
    uid: 'mock-admin-789',
    email: 'admin@gramvikas.gov.in',
    displayName: 'Panchayat Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
};

const initialFarmers: Record<string, MockFarmer> = {
  'mock-farmer-456': {
    userId: 'mock-farmer-456',
    landSize: 3.5,
    soilType: 'clay',
    waterSource: 'borewell',
    currentCrop: 'Rice (Paddy)',
    cropHistory: ['Rice (Paddy)', 'Wheat'],
    income: 140000,
    category: 'marginal'
  }
};

const initialRolesAdmin: Record<string, boolean> = {
  'mock-admin-789': true
};

const initialApplications: MockApplication[] = [
  {
    id: 'app-001',
    userId: 'mock-citizen-123',
    applicantName: 'Rajesh Kumar',
    type: 'income',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    details: {
      fullName: 'Rajesh Kumar',
      annualIncome: 120000,
      sourceOfIncome: 'Agriculture Labor',
      purpose: 'Education Subsidy'
    },
    documents: [
      { name: 'Income_Declaration.pdf', url: 'data:application/pdf;base64,mockpdfcontent' }
    ]
  },
  {
    id: 'app-002',
    userId: 'mock-citizen-123',
    applicantName: 'Rajesh Kumar',
    type: 'residence',
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    details: {
      fullName: 'Rajesh Kumar',
      address: 'Ward No. 3, Rampur Village',
      durationOfStay: '12 Years',
      purpose: 'Ration Card Linkage'
    },
    documents: [
      { name: 'Aadhaar_Card.pdf', url: 'data:application/pdf;base64,mockpdfcontent' }
    ],
    adminRemarks: 'Address verified by Gram Sevak.'
  }
];

const initialNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    userId: 'mock-citizen-123',
    title: 'Application Approved',
    message: 'Your Residence Certificate application (app-002) has been approved by the Administrator.',
    read: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

// Helper to access LocalStorage safely in Next.js Server Components / SSR
function loadDB() {
  if (typeof window === 'undefined') {
    return {
      users: initialUsers,
      farmers: initialFarmers,
      applications: initialApplications,
      crops: initialCrops,
      government_schemes: initialSchemes,
      weather: initialWeather,
      roles_admin: initialRolesAdmin,
      notifications: initialNotifications,
      crop_recommendations: [] as MockCropRecommendation[],
      currentUser: null as MockUser | null,
    };
  }

  const stored = localStorage.getItem('gramvikas_db');
  if (!stored) {
    const data = {
      users: initialUsers,
      farmers: initialFarmers,
      applications: initialApplications,
      crops: initialCrops,
      government_schemes: initialSchemes,
      weather: initialWeather,
      roles_admin: initialRolesAdmin,
      notifications: initialNotifications,
      crop_recommendations: [],
      currentUser: null,
    };
    localStorage.setItem('gramvikas_db', JSON.stringify(data));
    return data;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse database, resetting.', e);
    const data = {
      users: initialUsers,
      farmers: initialFarmers,
      applications: initialApplications,
      crops: initialCrops,
      government_schemes: initialSchemes,
      weather: initialWeather,
      roles_admin: initialRolesAdmin,
      notifications: initialNotifications,
      crop_recommendations: [],
      currentUser: null,
    };
    localStorage.setItem('gramvikas_db', JSON.stringify(data));
    return data;
  }
}

function saveDB(data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gramvikas_db', JSON.stringify(data));
    // Trigger window event so other hooks are notified
    window.dispatchEvent(new Event('gramvikas_db_update'));
  }
}

// Simulated Event Listener Registry
type DBUpdateListener = () => void;
const listeners = new Set<DBUpdateListener>();

export const simulator = {
  subscribe(listener: DBUpdateListener) {
    listeners.add(listener);
    if (typeof window !== 'undefined') {
      window.addEventListener('gramvikas_db_update', listener);
      window.addEventListener('storage', listener);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener('gramvikas_db_update', listener);
        window.removeEventListener('storage', listener);
      }
    };
  },

  notify() {
    listeners.forEach((listener) => {
      try { listener(); } catch (e) { console.error(e); }
    });
  },

  getData() {
    return loadDB();
  },

  getCurrentUser(): MockUser | null {
    return loadDB().currentUser;
  },

  setCurrentUser(user: MockUser | null) {
    const db = loadDB();
    db.currentUser = user;
    saveDB(db);
    this.notify();
  },

  login(email: string, password: string): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const db = loadDB();
        const found = Object.values(db.users).find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase()
        ) as MockUser | undefined;

        if (!found) {
          return reject(new Error('User not found.'));
        }

        // Mock verification: check if password matches name + 123 (e.g. citizen123, admin123, farmer123)
        // or just accept any password of length >= 6 for ease of simulation
        if (password.length < 6) {
          return reject(new Error('Password must be at least 6 characters.'));
        }

        db.currentUser = found;
        saveDB(db);
        this.notify();
        resolve(found);
      }, 500);
    });
  },

  register(email: string, fullName: string, role: 'citizen' | 'farmer' | 'admin'): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const db = loadDB();
        const exists = Object.values(db.users).some(
          (u: any) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (exists) {
          return reject(new Error('Email already registered.'));
        }

        const uid = `mock-user-${Date.now()}`;
        const newUser: MockUser = {
          uid,
          email,
          displayName: fullName,
          role,
          createdAt: new Date().toISOString()
        };

        db.users[uid] = newUser;

        if (role === 'farmer') {
          db.farmers[uid] = {
            userId: uid,
            landSize: 0,
            soilType: 'loamy',
            waterSource: 'rainfed',
            currentCrop: '',
            cropHistory: [],
            income: 0,
            category: 'marginal'
          };
        }

        if (role === 'admin') {
          db.roles_admin[uid] = true;
        }

        db.currentUser = newUser;
        saveDB(db);
        this.notify();
        resolve(newUser);
      }, 500);
    });
  },

  logout() {
    const db = loadDB();
    db.currentUser = null;
    saveDB(db);
    this.notify();
  },

  updateUserProfile(uid: string, data: Partial<MockUser>) {
    const db = loadDB();
    if (db.users[uid]) {
      db.users[uid] = { ...db.users[uid], ...data };
      if (db.currentUser && db.currentUser.uid === uid) {
        db.currentUser = { ...db.currentUser, ...data };
      }
      saveDB(db);
      this.notify();
    }
  },

  updateFarmerProfile(uid: string, data: Partial<MockFarmer>) {
    const db = loadDB();
    if (!db.farmers[uid]) {
      db.farmers[uid] = {
        userId: uid,
        landSize: 0,
        soilType: 'loamy',
        waterSource: 'rainfed',
        currentCrop: '',
        cropHistory: [],
        income: 0,
        category: 'marginal'
      };
    }
    db.farmers[uid] = { ...db.farmers[uid], ...data };
    
    // Automatically calculate farmer category based on land size
    const land = db.farmers[uid].landSize;
    if (land <= 2.5) {
      db.farmers[uid].category = 'marginal';
    } else if (land <= 5) {
      db.farmers[uid].category = 'small';
    } else {
      db.farmers[uid].category = 'large';
    }

    saveDB(db);
    this.notify();
  },

  submitApplication(userId: string, applicantName: string, type: 'birth' | 'death' | 'income' | 'residence', details: any, documents: { name: string; url: string }[]): Promise<MockApplication> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = loadDB();
        const id = `app-${String(Math.floor(100 + Math.random() * 900))}`;
        const newApp: MockApplication = {
          id,
          userId,
          applicantName,
          type,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          details,
          documents
        };

        db.applications.unshift(newApp);
        saveDB(db);
        this.notify();
        resolve(newApp);
      }, 500);
    });
  },

  updateApplicationStatus(id: string, status: 'pending' | 'under_verification' | 'approved' | 'rejected', remarks?: string): Promise<MockApplication> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const db = loadDB();
        const appIndex = db.applications.findIndex((a: any) => a.id === id);
        if (appIndex === -1) {
          return reject(new Error('Application not found.'));
        }

        const app = db.applications[appIndex];
        app.status = status;
        app.adminRemarks = remarks;
        app.updatedAt = new Date().toISOString();

        db.applications[appIndex] = app;

        // Send a notification to the applicant
        const notifId = `notif-${Date.now()}`;
        const newNotif: MockNotification = {
          id: notifId,
          userId: app.userId,
          title: `Application Status: ${status.replace('_', ' ').toUpperCase()}`,
          message: `Your ${app.type.toUpperCase()} Certificate application (${app.id}) has been marked as ${status.replace('_', ' ')}.${remarks ? ` Remarks: "${remarks}"` : ''}`,
          read: false,
          createdAt: new Date().toISOString()
        };
        db.notifications.unshift(newNotif);

        saveDB(db);
        this.notify();
        resolve(app);
      }, 300);
    });
  },

  manageCrops(action: 'add' | 'edit' | 'delete', data: Partial<MockCrop>): Promise<MockCrop[]> {
    return new Promise((resolve) => {
      const db = loadDB();
      if (action === 'add') {
        const id = `crop-${Date.now()}`;
        const newCrop: MockCrop = {
          id,
          name: data.name || 'Unnamed Crop',
          soilType: data.soilType || [],
          season: data.season || [],
          waterRequirement: data.waterRequirement || 'medium',
          expectedYield: data.expectedYield || 'N/A',
          fertilizers: data.fertilizers || [],
          pests: data.pests || []
        };
        db.crops.push(newCrop);
      } else if (action === 'edit' && data.id) {
        const index = db.crops.findIndex((c: any) => c.id === data.id);
        if (index !== -1) {
          db.crops[index] = { ...db.crops[index], ...data };
        }
      } else if (action === 'delete' && data.id) {
        db.crops = db.crops.filter((c: any) => c.id !== data.id);
      }
      saveDB(db);
      this.notify();
      resolve(db.crops);
    });
  },

  manageSchemes(action: 'add' | 'edit' | 'delete', data: Partial<MockScheme>): Promise<MockScheme[]> {
    return new Promise((resolve) => {
      const db = loadDB();
      if (action === 'add') {
        const id = `scheme-${Date.now()}`;
        const newScheme: MockScheme = {
          id,
          name: data.name || 'Unnamed Scheme',
          description: data.description || '',
          incomeLimit: Number(data.incomeLimit) || 9999999,
          maxLandSize: Number(data.maxLandSize) || 99,
          category: data.category || [],
          benefits: data.benefits || ''
        };
        db.government_schemes.push(newScheme);
      } else if (action === 'edit' && data.id) {
        const index = db.government_schemes.findIndex((s: any) => s.id === data.id);
        if (index !== -1) {
          db.government_schemes[index] = {
            ...db.government_schemes[index],
            ...data,
            incomeLimit: Number(data.incomeLimit) ?? db.government_schemes[index].incomeLimit,
            maxLandSize: Number(data.maxLandSize) ?? db.government_schemes[index].maxLandSize,
          };
        }
      } else if (action === 'delete' && data.id) {
        db.government_schemes = db.government_schemes.filter((s: any) => s.id !== data.id);
      }
      saveDB(db);
      this.notify();
      resolve(db.government_schemes);
    });
  },

  updateWeather(data: Partial<MockWeather>) {
    const db = loadDB();
    db.weather = { ...db.weather, ...data };
    saveDB(db);
    this.notify();
    return db.weather;
  },

  markNotificationsRead(userId: string) {
    const db = loadDB();
    db.notifications.forEach((n: any) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveDB(db);
    this.notify();
  },

  saveCropRecommendation(userId: string, soilType: string, season: string, waterAvailability: string, rec: any) {
    const db = loadDB();
    const newRec: MockCropRecommendation = {
      id: `rec-${Date.now()}`,
      userId,
      soilType,
      season,
      waterAvailability,
      recommendation: rec,
      createdAt: new Date().toISOString()
    };
    db.crop_recommendations.unshift(newRec);
    saveDB(db);
    this.notify();
    return newRec;
  }
};

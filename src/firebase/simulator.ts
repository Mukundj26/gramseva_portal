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
  sowingStart?: string;
  sowingEnd?: string;
  harvestStart?: string;
  harvestEnd?: string;
}

export interface MockScheme {
  id: string;
  name: string;
  description: string;
  incomeLimit: number;
  maxLandSize: number;
  category: string[];
  benefits: string;
  deadline?: string;
}

export interface MockWeather {
  temp: number;
  humidity: number;
  wind: number;
  rain: number;
  condition: string;
  location?: string;
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

export interface MockNotice {
  id: string;
  category: 'announcement' | 'government' | 'event' | 'meeting' | 'health' | 'festival';
  title: string;
  content: string;
  date: string;
  organizedBy: string;
  venue?: string;
}

export interface MockComplaint {
  id: string;
  userId: string;
  category: 'road' | 'water' | 'streetlight' | 'garbage';
  description: string;
  photoUrl?: string;
  location: string;
  status: 'pending' | 'in_progress' | 'resolved';
  adminRemarks?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface MockFacility {
  id: string;
  category: 'school' | 'hospital' | 'anganwadi' | 'water_tank' | 'panchayat' | 'road' | 'public_facility';
  name: string;
  ward: 'Ward 1' | 'Ward 2' | 'Ward 3' | 'Ward 4' | 'Ward 5';
  details: string;
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
    sowingStart: '2026-06-15',
    sowingEnd: '2026-07-15',
    harvestStart: '2026-11-01',
    harvestEnd: '2026-11-30'
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
    sowingStart: '2026-11-01',
    sowingEnd: '2026-12-15',
    harvestStart: '2026-03-15',
    harvestEnd: '2026-04-15'
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
    sowingStart: '2026-06-01',
    sowingEnd: '2026-07-10',
    harvestStart: '2026-11-15',
    harvestEnd: '2026-12-30'
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
    sowingStart: '2026-06-20',
    sowingEnd: '2026-07-25',
    harvestStart: '2026-10-01',
    harvestEnd: '2026-10-31'
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
    sowingStart: '2026-06-10',
    sowingEnd: '2026-07-20',
    harvestStart: '2026-10-10',
    harvestEnd: '2026-11-10'
  },
  {
    id: 'crop-6',
    name: 'Sugarcane',
    soilType: ['clay', 'loamy', 'alluvial'],
    season: ['kharif'],
    waterRequirement: 'high',
    expectedYield: '300-400 quintals/acre',
    fertilizers: ['NPK 50:50:50', 'Urea', 'Organic Compost'],
    pests: ['Early Shoot Borer', 'Top Borer', 'Red Rot'],
    sowingStart: '2026-01-15',
    sowingEnd: '2026-03-15',
    harvestStart: '2026-12-01',
    harvestEnd: '2026-12-31'
  },
  {
    id: 'crop-7',
    name: 'Onion',
    soilType: ['sandy', 'loamy', 'alluvial'],
    season: ['rabi', 'kharif'],
    waterRequirement: 'medium',
    expectedYield: '80-100 quintals/acre',
    fertilizers: ['FYM (Manure)', 'NPK 30:20:30', 'Urea'],
    pests: ['Thrips', 'Purple Blotch'],
    sowingStart: '2026-10-15',
    sowingEnd: '2026-11-30',
    harvestStart: '2026-02-15',
    harvestEnd: '2026-03-31'
  },
  {
    id: 'crop-8',
    name: 'Tomato',
    soilType: ['loamy', 'sandy', 'black', 'alluvial'],
    season: ['kharif', 'rabi', 'zaid'],
    waterRequirement: 'medium',
    expectedYield: '150-200 quintals/acre',
    fertilizers: ['NPK 40:60:65', 'Urea'],
    pests: ['Fruit Borer', 'Leaf Miner', 'Late Blight'],
    sowingStart: '2026-07-01',
    sowingEnd: '2026-08-15',
    harvestStart: '2026-10-15',
    harvestEnd: '2026-12-15'
  },
  {
    id: 'crop-9',
    name: 'Chilli',
    soilType: ['loamy', 'black', 'alluvial'],
    season: ['kharif', 'rabi'],
    waterRequirement: 'medium',
    expectedYield: '30-40 quintals/acre',
    fertilizers: ['FYM (Manure)', 'NPK 30:30:30', 'Urea'],
    pests: ['Thrips', 'Mites', 'Fruit Borer'],
    sowingStart: '2026-06-15',
    sowingEnd: '2026-07-31',
    harvestStart: '2026-09-01',
    harvestEnd: '2026-10-31'
  },
  {
    id: 'crop-10',
    name: 'Mango',
    soilType: ['loamy', 'alluvial', 'black'],
    season: ['kharif'],
    waterRequirement: 'medium',
    expectedYield: '40-60 quintals/acre',
    fertilizers: ['Nitrogen', 'Phosphorus', 'Potassium', 'Micro-nutrients'],
    pests: ['Mango Hopper', 'Powdery Mildew', 'Anthracnose'],
    sowingStart: '2026-07-01',
    sowingEnd: '2026-08-30',
    harvestStart: '2026-04-01',
    harvestEnd: '2026-06-30'
  },
  {
    id: 'crop-11',
    name: 'Banana',
    soilType: ['clay', 'loamy', 'alluvial'],
    season: ['kharif', 'zaid'],
    waterRequirement: 'high',
    expectedYield: '150-200 quintals/acre',
    fertilizers: ['NPK', 'Muriate of Potash', 'Organic Compost'],
    pests: ['Banana Aphid', 'Panama Wilt', 'Sigatoka Leaf Spot'],
  },
  {
    id: 'crop-12',
    name: 'Potato',
    soilType: ['sandy', 'loamy'],
    season: ['rabi'],
    waterRequirement: 'medium',
    expectedYield: '80-120 quintals/acre',
    fertilizers: ['NPK 60:80:100', 'Urea'],
    pests: ['Late Blight', 'Potato Tuber Moth'],
  },
  {
    id: 'crop-13',
    name: 'Okra (Lady Finger)',
    soilType: ['sandy', 'loamy', 'black', 'alluvial'],
    season: ['zaid', 'kharif'],
    waterRequirement: 'medium',
    expectedYield: '40-50 quintals/acre',
    fertilizers: ['NPK 20:20:20', 'Urea'],
    pests: ['Shoot & Fruit Borer', 'Whitefly', 'YVMV'],
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
    benefits: '₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts.',
    deadline: '2026-07-25'
  },
  {
    id: 'scheme-2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Government sponsored crop insurance scheme securing farmers against harvest failures due to weather and pests.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: 'Full financial insurance coverage against crop damage at extremely low premium rates (1.5% to 2% for farmers).',
    deadline: '2026-08-15'
  },
  {
    id: 'scheme-3',
    name: 'Soil Health Card Scheme',
    description: 'National project assisting farmers in optimizing fertilizer usage and testing nutrients.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: 'Free physical soil testing reports every 2 years, containing specific advisory on micro-nutrients and manure.',
    deadline: '2026-09-30'
  },
  {
    id: 'scheme-4',
    name: 'Kisan Credit Card (KCC)',
    description: 'Short-term credit support system helping farmers purchase timely farming inputs.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: 'Low-interest loans (up to 4% interest rate on prompt repayment) to cover working capital needs for crop cycle.',
    deadline: '2026-07-28'
  },
  {
    id: 'scheme-5',
    name: 'GramVikas Organic Subsidy',
    description: 'Village Panchayat green fund promoting bio-farming practices and organic crop growth.',
    incomeLimit: 300000,
    maxLandSize: 3,
    category: ['small', 'marginal'],
    benefits: '50% direct subsidy up to ₹15,000 for constructing vermicompost beds and bio-fertilizer stocks.',
    deadline: '2026-07-22'
  },
  {
    id: 'scheme-6',
    name: 'PMKSY - Micro Irrigation Subsidy',
    description: 'Financial assistance scheme for implementing modern drip and sprinkler irrigation systems.',
    incomeLimit: 9999999,
    maxLandSize: 10,
    category: ['small', 'marginal', 'large'],
    benefits: 'Up to 55% direct capital subsidy on installation costs for small/marginal farmers, and 45% for other farmers.',
    deadline: '2026-08-10'
  },
  {
    id: 'scheme-7',
    name: 'PM-Kusum Solar Pump Scheme',
    description: 'Solar energy support scheme for installing subsidized solar water pumps and solarizing grid-connected agricultural pumps.',
    incomeLimit: 9999999,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: '60% overall capital subsidy (30% central + 30% state gov), with bank loans covering 30% and farmer contribution of only 10%.',
    deadline: '2026-07-30'
  },
  {
    id: 'scheme-8',
    name: 'SMAM Tractor & Farm Implement Subsidy',
    description: 'Central sector scheme for promoting agricultural mechanization and custom hiring centers.',
    incomeLimit: 9999999,
    maxLandSize: 5,
    category: ['small', 'marginal'],
    benefits: '40% to 50% direct financial subsidy on the purchase of tractors, rotavators, power tillers, and sowing drills.',
    deadline: '2026-08-05'
  },
  {
    id: 'scheme-9',
    name: 'National Horticulture Mission (NHM)',
    description: 'Development program targeting holistic growth of the horticulture sector (fruits, vegetables, flowers, spices).',
    incomeLimit: 600000,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: '50% capital subsidy (up to ₹3 Lakhs) for polyhouse/greenhouse construction, nursery setup, and cold storage units.',
    deadline: '2026-08-20'
  },
  {
    id: 'scheme-10',
    name: 'National Livestock Mission (NLM)',
    description: 'Financial support program encouraging entrepreneurs and farmers to establish dairy, poultry, and goat rearing units.',
    incomeLimit: 400000,
    maxLandSize: 99,
    category: ['small', 'marginal', 'large'],
    benefits: '25% capital subsidy (33.3% for SC/ST categories) on bank loans for purchasing crossbred cattle, building sheds, and feed management.',
    deadline: '2026-08-30'
  }
];

const initialWeather: MockWeather = {
  temp: 29,
  humidity: 74,
  wind: 11,
  rain: 45,
  condition: 'Partly Cloudy',
  location: 'Rampur Panchayat'
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

const initialNotices: MockNotice[] = [
  {
    id: 'notice-1',
    category: 'meeting',
    title: 'Gram Sabha General Assembly Meeting',
    content: 'All village residents are requested to attend the upcoming Gram Sabha meeting to discuss the annual budget, drinking water pipe installation, and road repair allocations.',
    date: '2026-07-20T10:00:00Z',
    organizedBy: 'Gram Panchayat Rampur',
    venue: 'Panchayat Samiti Hall'
  },
  {
    id: 'notice-2',
    category: 'health',
    title: 'Free Health & Eye Checkup Camp',
    content: 'A medical team from the District Civil Hospital is organizing a free health camp. Services include general checkup, blood pressure screening, diabetes testing, and free eye drops distribution.',
    date: '2026-07-24T09:00:00Z',
    organizedBy: 'Health Dept & Rampur Panchayat',
    venue: 'Primary School Building'
  },
  {
    id: 'notice-3',
    category: 'festival',
    title: 'Annual Harvest Festival & Ganesh Chaturthi Celebrations',
    content: 'Preparations for the annual cultural parade and community dinner are starting. Volunteers requested to contact the cultural committee.',
    date: '2026-09-04T18:00:00Z',
    organizedBy: 'Rampur Festival Committee',
    venue: 'Main Temple Ground'
  },
  {
    id: 'notice-4',
    category: 'government',
    title: 'Subsidized Solar Pump Distribution Notice',
    content: 'Applications are invited for PM-Kusum scheme solar water pumps. Beneficiaries will receive a 60% subsidy. Submit land ownership copy and Aadhaar before July 30.',
    date: '2026-07-15T00:00:00Z',
    organizedBy: 'MSEDCL & Agriculture Dept',
    venue: 'Mandi Office'
  },
  {
    id: 'notice-5',
    category: 'event',
    title: 'Clean Rampur (Swachhta Abhiyan) Drive',
    content: 'Let us join hands to make our village plastic-free. Cleaning drive will start from Ward 1 and finish at the river bridge.',
    date: '2026-07-18T07:00:00Z',
    organizedBy: 'Youth Club & Panchayat',
    venue: 'Village Square'
  },
  {
    id: 'notice-6',
    category: 'announcement',
    title: 'Drinking Water Timing Shift',
    content: 'Due to pump maintenance at the reservoir, public drinking water supply will be active from 6:00 AM to 8:00 AM instead of evening hours for the next 3 days.',
    date: '2026-07-12T12:00:00Z',
    organizedBy: 'Panchayat Water Committee',
    venue: 'Reservoir Station'
  }
];

const initialComplaints: MockComplaint[] = [
  {
    id: 'complaint-1',
    userId: 'mock-citizen-123',
    category: 'road',
    description: 'Huge potholes near the primary school main gate. It is very dangerous for children cycling or walking to school.',
    photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    location: 'Latitude: 18.5204, Longitude: 73.8567 (Near Primary School Gate)',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'complaint-2',
    userId: 'mock-citizen-123',
    category: 'water',
    description: 'Main drinking water pipeline is leaking at Ward 3 junction. A large volume of clean water is being wasted since yesterday morning.',
    photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    location: 'Latitude: 18.5215, Longitude: 73.8580 (Ward 3 Junction)',
    status: 'in_progress',
    adminRemarks: 'Plumbing contractor notified. Repairs scheduled for tomorrow morning.',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'complaint-3',
    userId: 'mock-citizen-123',
    category: 'streetlight',
    description: 'Three streetlights are completely non-functional on Maruti Mandir street, making the entire lane dark and unsafe at night.',
    location: 'Maruti Mandir lane, Rampur',
    status: 'resolved',
    adminRemarks: 'Streetlight bulbs replaced by Panchayat electrical contractor on July 10.',
    submittedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const initialFacilities: MockFacility[] = [
  {
    id: 'fac-1',
    category: 'school',
    name: 'Zilla Parishad Primary School, Vadgaon Rasai',
    ward: 'Ward 1',
    details: 'Grades 1-7. Medium: Marathi. Student capacity: 180. Headmaster: Mr. S. B. Walunj. Phone: +91 2138-223101. Hours: 8:00 AM - 1:30 PM.'
  },
  {
    id: 'fac-2',
    category: 'school',
    name: 'Shri Bhairavnath Vidyalaya & Jr. College',
    ward: 'Ward 3',
    details: 'Secondary & Higher Secondary Education (Arts/Commerce/Science). Principal: Shri. V. K. Shirke. Phone: +91 94210 55667.'
  },
  {
    id: 'fac-3',
    category: 'hospital',
    name: 'Primary Health Center (PHC), Vadgaon Rasai',
    ward: 'Ward 2',
    details: '24/7 delivery room, ambulance service, and outpatient clinic. Medical Officer: Dr. Sachin Gawade. Phone: +91 2138-223405.'
  },
  {
    id: 'fac-4',
    category: 'hospital',
    name: 'Veterinary Dispensary (Category 1)',
    ward: 'Ward 2',
    details: 'Cattle vaccination, artificial insemination, and fodder development advising. Livestock Officer: Dr. Sandip Nighot.'
  },
  {
    id: 'fac-5',
    category: 'anganwadi',
    name: 'Anganwadi Center (Gothan Area)',
    ward: 'Ward 1',
    details: 'Supplementary nutrition and pre-school education activities. Worker: Smt. Mangal Solankar.'
  },
  {
    id: 'fac-6',
    category: 'anganwadi',
    name: 'Anganwadi Center (Wablewadi Road Block)',
    ward: 'Ward 5',
    details: 'Preschool lessons and child weight monitoring. Worker: Smt. Savita Khese.'
  },
  {
    id: 'fac-7',
    category: 'water_tank',
    name: 'Bhima River Jackwell & Water Filtration Scheme',
    ward: 'Ward 2',
    details: 'Integrated water intake from Bhima river with chlorination tanks. Supplying clean drinking water to all village wards.'
  },
  {
    id: 'fac-8',
    category: 'water_tank',
    name: 'Overhead Storage Tank (Rasai Mandir Hill)',
    ward: 'Ward 4',
    details: 'Capacity: 1,20,000 Liters. Services the higher-elevation neighborhoods and pilgrim rest house zones.'
  },
  {
    id: 'fac-9',
    category: 'panchayat',
    name: 'Gram Panchayat Karyalaya, Vadgaon Rasai',
    ward: 'Ward 3',
    details: 'Administrative office for Shirur block. Sarpanch: Smt. Rohini Kadam. Gram Sevak: Mr. D. S. Bhosale. Phone: +91 99220 88771. Hours: 10:00 AM - 5:00 PM.'
  },
  {
    id: 'fac-10',
    category: 'road',
    name: 'Shirur-Vadgaon Rasai State Highway Link',
    ward: 'Ward 4',
    details: 'MSRDC double-lane road connecting the village directly to Shirur taluka headquarter markets.'
  },
  {
    id: 'fac-11',
    category: 'road',
    name: 'Mandavgan Pharata Link Road',
    ward: 'Ward 3',
    details: 'District road link facilitating connection to adjacent agricultural belts and sugarcane factories.'
  },
  {
    id: 'fac-12',
    category: 'public_facility',
    name: 'Rasai Devi Devasthan Trust Pilgrim Rest House',
    ward: 'Ward 3',
    details: 'Dharamshala rooms and community kitchen facility for visiting devotees during the annual village fair.'
  },
  {
    id: 'fac-13',
    category: 'public_facility',
    name: 'Vadgaon Rasai Post Office (PIN 412211)',
    ward: 'Ward 1',
    details: 'Sub-post office. Savings deposits, register post, Speed Post. Postmaster: Shri. Nitin Kalokhe.'
  },
  {
    id: 'fac-14',
    category: 'public_facility',
    name: 'Bank of Maharashtra (Vadgaon Rasai Branch)',
    ward: 'Ward 3',
    details: 'Agricultural crop loans, gold loans, ATM services, and SHG credit linkages. Branch Manager: Shri. Saurabh Roy. Phone: +91 2138-223201.'
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
      notices: initialNotices,
      complaints: initialComplaints,
      facilities: initialFacilities,
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
      notices: initialNotices,
      complaints: initialComplaints,
      facilities: initialFacilities,
      currentUser: null,
    };
    localStorage.setItem('gramvikas_db', JSON.stringify(data));
    return data;
  }

  try {
    const parsed = JSON.parse(stored);
    let updated = false;
    if (!parsed.notices) {
      parsed.notices = initialNotices;
      updated = true;
    }
    if (!parsed.complaints) {
      parsed.complaints = initialComplaints;
      updated = true;
    }
    if (!parsed.facilities || parsed.facilities.some((f: any) => f.name.includes('Rampur'))) {
      parsed.facilities = initialFacilities;
      updated = true;
    }
    if (!parsed.government_schemes || !parsed.government_schemes.some((s: any) => s.deadline)) {
      parsed.government_schemes = initialSchemes;
      updated = true;
    }
    if (!parsed.crops || !parsed.crops.some((c: any) => c.sowingStart)) {
      parsed.crops = initialCrops;
      updated = true;
    }
    if (updated) {
      localStorage.setItem('gramvikas_db', JSON.stringify(parsed));
    }
    return parsed;
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
      notices: initialNotices,
      complaints: initialComplaints,
      facilities: initialFacilities,
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
  },

  submitNotice(category: string, title: string, content: string, organizedBy: string, venue?: string) {
    const db = loadDB();
    const newNotice: MockNotice = {
      id: `notice-${Date.now()}`,
      category: category as any,
      title,
      content,
      date: new Date().toISOString(),
      organizedBy,
      venue
    };
    db.notices.unshift(newNotice);
    saveDB(db);
    this.notify();
    return newNotice;
  },

  deleteNotice(id: string) {
    const db = loadDB();
    db.notices = db.notices.filter((n: any) => n.id !== id);
    saveDB(db);
    this.notify();
  },

  submitComplaint(userId: string, category: string, description: string, photoUrl: string, location: string) {
    const db = loadDB();
    const newComplaint: MockComplaint = {
      id: `comp-${Date.now()}`,
      userId,
      category: category as any,
      description,
      photoUrl: photoUrl || undefined,
      location,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.complaints.unshift(newComplaint);
    saveDB(db);
    this.notify();
    return newComplaint;
  },

  updateComplaintStatus(complaintId: string, status: 'pending' | 'in_progress' | 'resolved', remarks: string) {
    const db = loadDB();
    const index = db.complaints.findIndex((c: any) => c.id === complaintId);
    if (index !== -1) {
      db.complaints[index] = {
        ...db.complaints[index],
        status,
        adminRemarks: remarks || undefined,
        updatedAt: new Date().toISOString()
      };
      
      // Auto-notify the citizen
      const targetUserId = db.complaints[index].userId;
      const categoryLabel = db.complaints[index].category.toUpperCase();
      const newNotif = {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: `Complaint Status Update`,
        message: `Your complaint (${complaintId}) regarding ${categoryLabel} is now marked: ${status.toUpperCase()}. Remarks: "${remarks || 'None'}"`,
        read: false,
        createdAt: new Date().toISOString()
      };
      db.notifications.unshift(newNotif);

      saveDB(db);
      this.notify();
      return db.complaints[index];
    }
    throw new Error('Complaint not found.');
  },

  manageFacilities(action: 'add' | 'delete', data: any) {
    const db = loadDB();
    if (action === 'add') {
      const newFac: MockFacility = {
        id: `fac-${Date.now()}`,
        category: data.category,
        name: data.name,
        ward: data.ward,
        details: data.details
      };
      db.facilities.push(newFac);
    } else if (action === 'delete') {
      db.facilities = db.facilities.filter((f: any) => f.id !== data.id);
    }
    saveDB(db);
    this.notify();
    return db.facilities;
  }
};

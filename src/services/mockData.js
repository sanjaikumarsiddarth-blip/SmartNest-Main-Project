// Central Mock Data Store for SmartNest AI

export const INITIAL_USERS = [
  {
    user_id: "usr_buyer_01",
    name: "Aarav Sharma",
    email: "aarav@smartnest.ai",
    password: "password123",
    role: "buyer",
    status: "active",
    registered_at: "2026-08-10T10:30:00Z"
  },
  {
    user_id: "usr_buyer_02",
    name: "Priya Patel",
    email: "priya@smartnest.ai",
    password: "password123",
    role: "buyer",
    status: "active",
    registered_at: "2026-08-15T14:20:00Z"
  },
  {
    user_id: "usr_seller_01",
    name: "Prestige Developers",
    email: "prestige@smartnest.ai",
    password: "password123",
    role: "seller",
    status: "active",
    registered_at: "2026-07-01T09:00:00Z",
    properties_count: 3,
    total_views: 1420,
    total_enquiries: 38
  },
  {
    user_id: "usr_seller_02",
    name: "Landmark Realty",
    email: "landmark@smartnest.ai",
    password: "password123",
    role: "seller",
    status: "active",
    registered_at: "2026-07-12T11:45:00Z",
    properties_count: 3,
    total_views: 980,
    total_enquiries: 22
  },
  {
    user_id: "usr_seller_03",
    name: "GreenSpaces Builders",
    email: "greenspaces@smartnest.ai",
    password: "password123",
    role: "seller",
    status: "active",
    registered_at: "2026-08-01T16:10:00Z",
    properties_count: 2,
    total_views: 640,
    total_enquiries: 15
  },
  {
    user_id: "usr_admin_01",
    name: "Vikram Malhotra",
    email: "admin@smartnest.ai",
    password: "adminpassword",
    role: "admin",
    status: "active",
    registered_at: "2026-06-01T08:00:00Z"
  }
];

export const INITIAL_LIFESTYLE_PROFILE = {
  lifestyle_type: "Family-Oriented Professional",
  ai_summary: "Your preferences highlight a balanced urban sanctuary prioritizing short commutes and child-friendly educational infrastructure. You favor low acoustic pollution, reliable connectivity, and pedestrian access to neighborhood green spaces.",
  priority_weights: {
    commute: 25,
    budget: 20,
    schools: 20,
    noise: 15,
    parks: 10,
    amenities: 10
  },
  dealbreakers: [
    "Commute above 30 minutes",
    "High noise",
    "Budget above ₹60L"
  ]
};

export const INITIAL_PROPERTIES = [
  {
    property_id: "P01",
    title: "Serene Green Meadows",
    type: "Apartment",
    price: 5500000, // ₹55 Lakhs
    bhk: 2,
    area_sqft: 1180,
    location: "Avinashi Road, Peelamedu",
    city: "Coimbatore",
    coordinates: { lat: 11.0280, lng: 77.0125 },
    description: "Sun-drenched south-facing apartment with panoramic views of the western hills. Situated inside a gated community with lush landscaped gardens, high acoustic insulation, and an on-campus pre-school.",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 18,
    commute_mode: "Car / Metro",
    school_distance_km: 1.2,
    hospital_distance_km: 2.1,
    park_distance_km: 0.4,
    noise_level: "low",
    green_score: 92,
    amenity_score: 88,
    match_score: 96,
    slightly_over_budget: false,
    seller_id: "usr_seller_01",
    status: "active",
    score_breakdown: {
      budget: { score: 19, max: 20 },
      commute: { score: 19, max: 20 },
      location: { score: 14, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 9, max: 10 },
      noise: { score: 10, max: 10 },
      parks: { score: 10, max: 10 },
      amenities: { score: 5, max: 5 }
    },
    ai_explanation: "This property is an outstanding 96% match because it checks your highest priorities: an effortless 18-minute commute to tech corridors, exceptionally low ambient noise, and a reputable school within 1.2km.",
    nearby: {
      schools: [
        { name: "Stanes Anglo Indian School", distance_km: 1.2, rating: 4.8 },
        { name: "Bhavan's Vidya Mandir", distance_km: 2.0, rating: 4.7 },
        { name: "National Model Matriculation", distance_km: 2.4, rating: 4.5 }
      ],
      hospitals: [
        { name: "PSG Institute of Medical Sciences", distance_km: 2.1 },
        { name: "Kovai Medical Center (KMCH)", distance_km: 3.4 }
      ],
      parks: [
        { name: "VOC Park & Botanical Gardens", distance_km: 0.4 },
        { name: "Peelamedu Lake Greenway", distance_km: 1.1 }
      ],
      transport: [
        { name: "Peelamedu Metro Station", type: "Metro", distance_m: 600 },
        { name: "Avinashi Road Express Bus Bay", type: "Bus Stop", distance_m: 250 },
        { name: "Coimbatore Junction Railway", type: "Railway", distance_m: 4500 }
      ]
    },
    views: 452,
    shortlists: 34,
    enquiries: 12
  },
  {
    property_id: "P02",
    title: "The Urban Zenith Residences",
    type: "Apartment",
    price: 5800000, // ₹58 Lakhs
    bhk: 2,
    area_sqft: 1240,
    location: "Saravanampatti Tech Zone",
    city: "Coimbatore",
    coordinates: { lat: 11.0825, lng: 76.9960 },
    description: "Contemporary 2BHK residence tailor-made for IT professionals. Features fibre-optic smart home wiring, co-working lounge, rooftop jogging track, and 24x7 power backup.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 12,
    commute_mode: "Walk / Scooter",
    school_distance_km: 2.1,
    hospital_distance_km: 1.8,
    park_distance_km: 0.8,
    noise_level: "low",
    green_score: 84,
    amenity_score: 95,
    match_score: 92,
    slightly_over_budget: false,
    seller_id: "usr_seller_01",
    status: "active",
    score_breakdown: {
      budget: { score: 18, max: 20 },
      commute: { score: 20, max: 20 },
      location: { score: 14, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 8, max: 10 },
      noise: { score: 9, max: 10 },
      parks: { score: 8, max: 10 },
      amenities: { score: 5, max: 5 }
    },
    ai_explanation: "Ultra-convenient 12-minute commute to primary offices with comprehensive clubhouse amenities. Fits squarely into your noise and budget thresholds with top-tier fiber connectivity.",
    nearby: {
      schools: [
        { name: "KGISL Institute Campus School", distance_km: 2.1, rating: 4.6 },
        { name: "Manchester International School", distance_km: 3.2, rating: 4.8 },
        { name: "Lisieux CMI Public School", distance_km: 3.8, rating: 4.4 }
      ],
      hospitals: [
        { name: "Kumaran Hospital", distance_km: 1.8 },
        { name: "Sree Abirami Hospital", distance_km: 2.9 }
      ],
      parks: [
        { name: "Saravanampatti Tech Park Garden", distance_km: 0.8 },
        { name: "Chil SEZ Eco Zone", distance_km: 1.5 }
      ],
      transport: [
        { name: "Saravanampatti Bus Terminus", type: "Bus Stop", distance_m: 350 },
        { name: "Sathy Road Flyover Junction", type: "Transit", distance_m: 800 },
        { name: "Coimbatore North Railway Station", type: "Railway", distance_m: 6200 }
      ]
    },
    views: 388,
    shortlists: 28,
    enquiries: 9
  },
  {
    property_id: "P03",
    title: "Whispering Pines Villa",
    type: "Villa",
    price: 6300000, // ₹63 Lakhs
    bhk: 3,
    area_sqft: 1850,
    location: "Vadavalli Foothills",
    city: "Coimbatore",
    coordinates: { lat: 11.0267, lng: 76.9025 },
    description: "Serene independent triplex villa offering private garden lawn, solar-powered water heating, and pristine mountain breezes away from urban clamor.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 28,
    commute_mode: "Car",
    school_distance_km: 1.8,
    hospital_distance_km: 3.0,
    park_distance_km: 0.2,
    noise_level: "low",
    green_score: 98,
    amenity_score: 82,
    match_score: 87,
    slightly_over_budget: true,
    seller_id: "usr_seller_02",
    status: "active",
    score_breakdown: {
      budget: { score: 14, max: 20 },
      commute: { score: 16, max: 20 },
      location: { score: 13, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 9, max: 10 },
      noise: { score: 10, max: 10 },
      parks: { score: 10, max: 10 },
      amenities: { score: 5, max: 5 }
    },
    ai_explanation: "Offers an idyllic sanctuary and the highest wellness and green score (98). It is slightly over your ₹60L target, but grants a dedicated 3BHK footprint and scenic mountain air.",
    nearby: {
      schools: [
        { name: "Chinmaya Vidyalaya Senior Secondary", distance_km: 1.8, rating: 4.9 },
        { name: "Delhi Public School Coimbatore", distance_km: 3.5, rating: 4.7 },
        { name: "G.D. Matriculation School", distance_km: 4.0, rating: 4.5 }
      ],
      hospitals: [
        { name: "Vadavalli Community Health Center", distance_km: 3.0 },
        { name: "Ganga Hospital Specialty Wing", distance_km: 4.8 }
      ],
      parks: [
        { name: "Maruthamalai Hillside Reserve", distance_km: 0.2 },
        { name: "Vadavalli Panchayat Children's Park", distance_km: 1.4 }
      ],
      transport: [
        { name: "Vadavalli Bus Stand", type: "Bus Stop", distance_m: 750 },
        { name: "Maruthamalai Road Link", type: "Transit", distance_m: 400 },
        { name: "Thondamuthur Bypass", type: "Highway", distance_m: 1200 }
      ]
    },
    views: 290,
    shortlists: 19,
    enquiries: 6
  },
  {
    property_id: "P04",
    title: "Parkside Harmony Condos",
    type: "Apartment",
    price: 5200000, // ₹52 Lakhs
    bhk: 2,
    area_sqft: 1090,
    location: "Ramanathapuram",
    city: "Coimbatore",
    coordinates: { lat: 10.9935, lng: 76.9847 },
    description: "Centrally positioned 2BHK adjacent to community sports park and prominent CBSE schooling cluster. Perfect starter home for growing families.",
    images: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 22,
    commute_mode: "Bus / Car",
    school_distance_km: 0.7,
    hospital_distance_km: 1.5,
    park_distance_km: 0.3,
    noise_level: "medium",
    green_score: 80,
    amenity_score: 86,
    match_score: 89,
    slightly_over_budget: false,
    seller_id: "usr_seller_02",
    status: "active",
    score_breakdown: {
      budget: { score: 20, max: 20 },
      commute: { score: 17, max: 20 },
      location: { score: 13, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 10, max: 10 },
      noise: { score: 7, max: 10 },
      parks: { score: 8, max: 10 },
      amenities: { score: 4, max: 5 }
    },
    ai_explanation: "Unbeatable school proximity (700m) and ₹8L under your maximum budget. Commute is well within your 30-minute ceiling, although moderate street noise requires window glazing.",
    nearby: {
      schools: [
        { name: "Alvernia Matriculation Higher Secondary", distance_km: 0.7, rating: 4.8 },
        { name: "St. Francis Anglo-Indian Girls School", distance_km: 1.4, rating: 4.7 },
        { name: "Carmel Garden Public School", distance_km: 1.9, rating: 4.6 }
      ],
      hospitals: [
        { name: "Gem Hospital & Research Centre", distance_km: 1.5 },
        { name: "Coimbatore Child Trust Hospital", distance_km: 2.2 }
      ],
      parks: [
        { name: "Ramanathapuram Community Park", distance_km: 0.3 },
        { name: "Sungam Lake Promenade", distance_km: 1.2 }
      ],
      transport: [
        { name: "Trichy Road Junction Bus Stop", type: "Bus Stop", distance_m: 200 },
        { name: "Sungam Roundabout Hub", type: "Transit", distance_m: 900 },
        { name: "Singanallur Bus Terminal", type: "Bus Terminal", distance_m: 3100 }
      ]
    },
    views: 312,
    shortlists: 24,
    enquiries: 7
  },
  {
    property_id: "P05",
    title: "Lotus Grandeur Towers",
    type: "Apartment",
    price: 7200000, // ₹72 Lakhs
    bhk: 3,
    area_sqft: 1680,
    location: "Race Course Road",
    city: "Coimbatore",
    coordinates: { lat: 11.0016, lng: 76.9678 },
    description: "Prestigious address overlooking the tree-lined circular boulevard of Race Course. Features marble floors, imported bath fittings, infinity pool, and concierge services.",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 15,
    commute_mode: "Car",
    school_distance_km: 1.1,
    hospital_distance_km: 1.0,
    park_distance_km: 0.1,
    noise_level: "low",
    green_score: 95,
    amenity_score: 98,
    match_score: 79,
    slightly_over_budget: true,
    seller_id: "usr_seller_02",
    status: "active",
    score_breakdown: {
      budget: { score: 9, max: 20 },
      commute: { score: 19, max: 20 },
      location: { score: 15, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 9, max: 10 },
      noise: { score: 9, max: 10 },
      parks: { score: 10, max: 10 },
      amenities: { score: 5, max: 5 }
    },
    ai_explanation: "Top tier in luxury, green canopy, and amenities. Its overall match score is adjusted lower solely due to exceeding your ₹60L preferred budget threshold by ₹12L.",
    nearby: {
      schools: [
        { name: "Stanes High School", distance_km: 1.1, rating: 4.8 },
        { name: "Bishop Appasamy College & School", distance_km: 1.5, rating: 4.4 }
      ],
      hospitals: [
        { name: "GKNM Hospital", distance_km: 1.0 },
        { name: "Sri Ramakrishna Hospital", distance_km: 2.5 }
      ],
      parks: [
        { name: "Race Course Walkers Promenade", distance_km: 0.1 },
        { name: "Thomas Park", distance_km: 0.5 }
      ],
      transport: [
        { name: "Race Course South Bus Bay", type: "Bus Stop", distance_m: 180 },
        { name: "Coimbatore Main Junction", type: "Railway", distance_m: 1800 }
      ]
    },
    views: 520,
    shortlists: 15,
    enquiries: 4
  },
  {
    property_id: "P06",
    title: "Emerald Heights Villa",
    type: "Villa",
    price: 4900000, // ₹49 Lakhs
    bhk: 2,
    area_sqft: 1300,
    location: "Thudiyalur Suburb",
    city: "Coimbatore",
    coordinates: { lat: 11.0772, lng: 76.9388 },
    description: "Independent single-level villa with private car porch, borewell & Siruvani drinking water, and private kitchen garden terrace.",
    images: [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 25,
    commute_mode: "Car / Bus",
    school_distance_km: 1.6,
    hospital_distance_km: 2.8,
    park_distance_km: 1.2,
    noise_level: "low",
    green_score: 86,
    amenity_score: 75,
    match_score: 85,
    slightly_over_budget: false,
    seller_id: "usr_seller_03",
    status: "active",
    score_breakdown: {
      budget: { score: 20, max: 20 },
      commute: { score: 16, max: 20 },
      location: { score: 12, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 8, max: 10 },
      noise: { score: 9, max: 10 },
      parks: { score: 6, max: 10 },
      amenities: { score: 4, max: 5 }
    },
    ai_explanation: "Remarkable value at ₹49L with absolute privacy and zero noise. Excellent standalone land asset with reasonable distance to educational institutions.",
    nearby: {
      schools: [
        { name: "Vidhya Niketan Public School", distance_km: 1.6, rating: 4.6 },
        { name: "Amrita Vidyalayam", distance_km: 2.4, rating: 4.7 }
      ],
      hospitals: [
        { name: "VG Hospital", distance_km: 2.8 },
        { name: "Ganga Spine Care Center", distance_km: 4.2 }
      ],
      parks: [
        { name: "Thudiyalur Municipal Park", distance_km: 1.2 }
      ],
      transport: [
        { name: "Thudiyalur Bus Stand", type: "Bus Stop", distance_m: 600 },
        { name: "Mettupalayam Road Highway", type: "Transit", distance_m: 450 }
      ]
    },
    views: 198,
    shortlists: 16,
    enquiries: 5
  },
  {
    property_id: "P07",
    title: "Skyline Nexus Studio & Suites",
    type: "Apartment",
    price: 3800000, // ₹38 Lakhs
    bhk: 1,
    area_sqft: 680,
    location: "Tidel Park Road, Civil Aerodrome",
    city: "Coimbatore",
    coordinates: { lat: 11.0265, lng: 77.0255 },
    description: "Smart, energy-efficient 1BHK optimized for modern single professionals or frequent business travelers. 5 minutes from airport and tech corridor.",
    images: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 8,
    commute_mode: "Walk",
    school_distance_km: 3.5,
    hospital_distance_km: 2.4,
    park_distance_km: 2.0,
    noise_level: "high",
    green_score: 65,
    amenity_score: 89,
    match_score: 64,
    slightly_over_budget: false,
    seller_id: "usr_seller_03",
    status: "active",
    score_breakdown: {
      budget: { score: 20, max: 20 },
      commute: { score: 20, max: 20 },
      location: { score: 11, max: 15 },
      bhk: { score: 4, max: 10 },
      schools: { score: 3, max: 10 },
      noise: { score: 3, max: 10 },
      parks: { score: 4, max: 10 },
      amenities: { score: 5, max: 5 }
    },
    ai_explanation: "Spectacular 8-minute walking commute and ultra-affordable price, but partial match due to 1BHK sizing, airport traffic noise, and lower family school metrics.",
    nearby: {
      schools: [
        { name: "GRG Matriculation School", distance_km: 3.5, rating: 4.4 }
      ],
      hospitals: [
        { name: "Aravind Eye Hospital", distance_km: 2.4 }
      ],
      parks: [
        { name: "Aerodrome Perimeter Trail", distance_km: 2.0 }
      ],
      transport: [
        { name: "Tidel Park Bus Shelter", type: "Bus Stop", distance_m: 100 },
        { name: "Coimbatore International Airport", type: "Airport", distance_m: 1800 }
      ]
    },
    views: 310,
    shortlists: 8,
    enquiries: 2
  },
  {
    property_id: "P08",
    title: "Hillview Sovereign Enclave",
    type: "Villa",
    price: 8500000, // ₹85 Lakhs
    bhk: 4,
    area_sqft: 2600,
    location: "Kovaipudur",
    city: "Coimbatore",
    coordinates: { lat: 10.9328, lng: 76.9422 },
    description: "Luxurious 4BHK architectural masterpiece in the peaceful foothills known as Little Ooty. Private plunge pool, landscaped terrace, and quiet shaded avenues.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80"
    ],
    commute_minutes: 36,
    commute_mode: "Car",
    school_distance_km: 1.4,
    hospital_distance_km: 3.8,
    park_distance_km: 0.5,
    noise_level: "low",
    green_score: 96,
    amenity_score: 92,
    match_score: 72,
    slightly_over_budget: true,
    seller_id: "usr_seller_01",
    status: "pending", // For Admin moderation flow demo
    score_breakdown: {
      budget: { score: 6, max: 20 },
      commute: { score: 11, max: 20 },
      location: { score: 12, max: 15 },
      bhk: { score: 10, max: 10 },
      schools: { score: 9, max: 10 },
      noise: { score: 10, max: 10 },
      parks: { score: 9, max: 10 },
      amenities: { score: 5, max: 5 }
    },
    ai_explanation: "Exceptional space and resort atmosphere, but commute reaches 36 minutes and price is significantly beyond the ₹60L bracket, triggering dealbreaker alerts.",
    nearby: {
      schools: [
        { name: "CSI Boys Higher Secondary", distance_km: 1.4, rating: 4.5 },
        { name: "Sri Krishna Arts & Science Campus", distance_km: 2.2, rating: 4.7 }
      ],
      hospitals: [
        { name: "Kovaipudur Primary Care", distance_km: 3.8 }
      ],
      parks: [
        { name: "Kovaipudur Hillside Park", distance_km: 0.5 }
      ],
      transport: [
        { name: "Kovaipudur Bus Stand", type: "Bus Stop", distance_m: 550 },
        { name: "Palakkad Main Highway", type: "Highway", distance_m: 2400 }
      ]
    },
    views: 140,
    shortlists: 9,
    enquiries: 2
  }
];

export const INITIAL_SELLER_ANALYTICS = {
  views_over_time: [
    { date: "Day 1", views: 24 }, { date: "Day 2", views: 32 }, { date: "Day 3", views: 28 },
    { date: "Day 4", views: 45 }, { date: "Day 5", views: 52 }, { date: "Day 6", views: 48 },
    { date: "Day 7", views: 60 }, { date: "Day 8", views: 58 }, { date: "Day 9", views: 64 },
    { date: "Day 10", views: 72 }, { date: "Day 11", views: 68 }, { date: "Day 12", views: 80 },
    { date: "Day 13", views: 85 }, { date: "Day 14", views: 79 }, { date: "Day 15", views: 90 },
    { date: "Day 16", views: 94 }, { date: "Day 17", views: 88 }, { date: "Day 18", views: 102 },
    { date: "Day 19", views: 110 }, { date: "Day 20", views: 105 }, { date: "Day 21", views: 118 },
    { date: "Day 22", views: 125 }, { date: "Day 23", views: 119 }, { date: "Day 24", views: 130 },
    { date: "Day 25", views: 138 }, { date: "Day 26", views: 134 }, { date: "Day 27", views: 142 },
    { date: "Day 28", views: 150 }, { date: "Day 29", views: 146 }, { date: "Day 30", views: 162 }
  ],
  enquiries_over_time: [
    { date: "Week 1", enquiries: 4 },
    { date: "Week 2", enquiries: 7 },
    { date: "Week 3", enquiries: 11 },
    { date: "Week 4", enquiries: 16 }
  ],
  match_distribution: [
    { bucket: "95–100%", count: 48 },
    { bucket: "85–94%", count: 32 },
    { bucket: "70–84%", count: 14 },
    { bucket: "<70%", count: 6 }
  ],
  enquiry_count: 38,
  shortlist_count: 89,
  match_potential_score: 94,
  top_buyer_preferences: {
    budget_range: "₹50L – ₹65L",
    preferred_bhk: "2 BHK (68%)",
    commute_priority: "High (82%)",
    school_priority: "High (74%)",
    noise_preference: "Low (91%)"
  },
  match_tiers: [
    { tier: "Excellent Match (95–100%)", buyers: 48, pct: 48, color: "var(--teal)" },
    { tier: "Great Match (85–94%)", buyers: 32, pct: 32, color: "#3D5A73" },
    { tier: "Good Match (70–84%)", buyers: 14, pct: 14, color: "var(--amber)" },
    { tier: "Partial Match (<70%)", buyers: 6, pct: 6, color: "#94A3B8" }
  ],
  top_lifestyles: [
    { name: "Family-Oriented Professional", value: 42, color: "#2A9D8F" },
    { name: "Young Urban Professional", value: 31, color: "#3D5A73" },
    { name: "Retired Couple", value: 27, color: "#E9C46A" }
  ],
  buyer_insight_ai: "Your property's low noise level and school proximity are its strongest match drivers — 91% of interested buyers listed noise as high priority, and 74% require nearby schools."
};

export const INITIAL_ADMIN_ANALYTICS = {
  users_over_time: [
    { period: "Jan", users: 120 }, { period: "Feb", users: 190 },
    { period: "Mar", users: 280 }, { period: "Apr", users: 410 },
    { period: "May", users: 590 }, { period: "Jun", users: 840 }
  ],
  properties_over_time: [
    { period: "Jan", properties: 30 }, { period: "Feb", properties: 55 },
    { period: "Mar", properties: 90 }, { period: "Apr", properties: 140 },
    { period: "May", properties: 210 }, { period: "Jun", properties: 315 }
  ],
  searches_per_day: [
    { day: "Mon", count: 320 }, { day: "Tue", count: 410 }, { day: "Wed", count: 480 },
    { day: "Thu", count: 510 }, { day: "Fri", count: 620 }, { day: "Sat", count: 740 }, { day: "Sun", count: 690 }
  ],
  recommendations_generated: [
    { month: "Jan", recs: 850 }, { month: "Feb", recs: 1420 },
    { month: "Mar", recs: 2100 }, { month: "Apr", recs: 3400 },
    { month: "May", recs: 4900 }, { month: "Jun", recs: 6850 }
  ],
  most_searched_locations: [
    { city: "Coimbatore", searches: 4200, percentage: 38 },
    { city: "Bangalore", searches: 3100, percentage: 28 },
    { city: "Chennai", searches: 1950, percentage: 17 },
    { city: "Hyderabad", searches: 1200, percentage: 11 },
    { city: "Kochi", searches: 680, percentage: 6 }
  ],
  avg_match_score: 86.4,
  pending_approvals_count: 2,
  total_users: 1428,
  total_sellers: 86,
  total_properties: 342,
  active_listings: 318,
  reported_listings: 3,
  recommendations_total: 18720
};

export const INITIAL_ENQUIRIES = [
  {
    enquiry_id: "enq_01",
    property_id: "P01",
    property_title: "Serene Green Meadows",
    buyer_id: "usr_buyer_01",
    buyer_name: "Aarav Sharma",
    buyer_email: "aarav@smartnest.ai",
    seller_id: "usr_seller_01",
    message: "Hello, I took the SmartNest AI lifestyle quiz and this property came out as a 96% match. I'd love to schedule an on-site visit this Saturday afternoon to inspect the pre-school facility.",
    date: "2026-09-02T14:15:00Z",
    status: "new",
    response: null
  },
  {
    enquiry_id: "enq_02",
    property_id: "P02",
    property_title: "The Urban Zenith Residences",
    buyer_id: "usr_buyer_02",
    buyer_name: "Priya Patel",
    buyer_email: "priya@smartnest.ai",
    seller_id: "usr_seller_01",
    message: "Does this apartment have dedicated covered EV parking slots near the tower lobby? Also curious about the internet provider options in the co-working lounge.",
    date: "2026-08-30T10:00:00Z",
    status: "responded",
    response: "Hi Priya! Yes, both Level 1 basements have EV-ready chargers. We have dual redundant fiber lines from ACT and Airtel in the co-working center."
  },
  {
    enquiry_id: "enq_03",
    property_id: "P04",
    property_title: "Parkside Harmony Condos",
    buyer_id: "usr_buyer_01",
    buyer_name: "Aarav Sharma",
    buyer_email: "aarav@smartnest.ai",
    seller_id: "usr_seller_02",
    message: "Can you confirm the handover timeline and whether the kitchen comes modular fitted as shown in photos?",
    date: "2026-08-25T11:20:00Z",
    status: "closed",
    response: "Handover is scheduled for October 2026 with fully modular Italian acrylic cabinetry."
  }
];

export const INITIAL_REPORTS = [
  {
    report_id: "rep_01",
    property_id: "P07",
    property_title: "Skyline Nexus Studio & Suites",
    reported_by: "Kavita Rao",
    reporter_email: "kavita@smartnest.ai",
    reason: "Acoustic noise is substantially louder during evening airport flight corridors than indicated in the basic description.",
    date: "2026-09-01T15:30:00Z",
    status: "pending"
  },
  {
    report_id: "rep_02",
    property_id: "P05",
    property_title: "Lotus Grandeur Towers",
    reported_by: "Rajesh Kumar",
    reporter_email: "rajesh@smartnest.ai",
    reason: "Price quoted on listing differs from the official developer brochure by ₹2 Lakhs.",
    date: "2026-08-28T09:40:00Z",
    status: "resolved"
  }
];

export const INITIAL_SEARCH_HISTORY = [
  {
    history_id: "hist_01",
    summary: "2 BHK in Coimbatore, Budget ₹50L–₹60L, Commute < 25m, Low Noise",
    date: "2026-09-04T18:30:00Z",
    results_count: 5,
    params: { city: "Coimbatore", bhk: 2, max_budget: 6000000, max_commute: 25 }
  },
  {
    history_id: "hist_02",
    summary: "Villa in Vadavalli / Foothills, High Greenery, Budget ₹65L",
    date: "2026-09-01T11:15:00Z",
    results_count: 2,
    params: { city: "Coimbatore", type: "Villa", max_budget: 6500000 }
  },
  {
    history_id: "hist_03",
    summary: "Quiet Apartment near Peelamedu / Tidel with Metro access",
    date: "2026-08-27T08:45:00Z",
    results_count: 4,
    params: { city: "Coimbatore", location: "Peelamedu" }
  }
];

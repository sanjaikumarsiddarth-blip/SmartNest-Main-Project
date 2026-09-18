// Central Mock Data Store for SmartNest AI

export const INITIAL_USERS = [
  {
    "user_id": "usr_buyer_01",
    "name": "Aarav Sharma",
    "email": "aarav@smartnest.ai",
    "password": "password123",
    "role": "buyer",
    "status": "active",
    "registered_at": "2026-08-10T10:30:00Z"
  },
  {
    "user_id": "usr_buyer_02",
    "name": "Priya Patel",
    "email": "priya@smartnest.ai",
    "password": "password123",
    "role": "buyer",
    "status": "active",
    "registered_at": "2026-08-15T14:20:00Z"
  },
  {
    "user_id": "usr_seller_01",
    "name": "Prestige Developers",
    "email": "sales@prestigedevelopers.in",
    "password": "password123",
    "role": "seller",
    "status": "active",
    "registered_at": "2026-07-01T09:00:00Z",
    "properties_count": 10,
    "total_views": 5002,
    "total_enquiries": 155
  },
  {
    "user_id": "usr_seller_02",
    "name": "Landmark Realty",
    "email": "contact@landmarkrealty.in",
    "password": "password123",
    "role": "seller",
    "status": "active",
    "registered_at": "2026-07-12T11:45:00Z",
    "properties_count": 10,
    "total_views": 4205,
    "total_enquiries": 116
  },
  {
    "user_id": "usr_seller_03",
    "name": "GreenSpaces Builders",
    "email": "hello@greenspacesbuilders.in",
    "password": "password123",
    "role": "seller",
    "status": "active",
    "registered_at": "2026-08-01T16:10:00Z",
    "properties_count": 10,
    "total_views": 4095,
    "total_enquiries": 116
  },
  {
    "user_id": "usr_admin_01",
    "name": "Vikram Malhotra",
    "email": "admin@smartnest.ai",
    "password": "adminpassword",
    "role": "admin",
    "status": "active",
    "registered_at": "2026-06-01T08:00:00Z"
  }
];

export const INITIAL_SELLERS = [
  {
    "seller_id": "S001",
    "user_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "seller_type": "Real Estate Developer",
    "phone": "+91 98765 43210",
    "email": "sales@prestigedevelopers.in",
    "location": "Peelamedu, Coimbatore",
    "experience_years": "8+ Years",
    "rating": 4.6,
    "review_count": 128,
    "properties_count": 10,
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S002",
    "user_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "seller_type": "Real Estate Developer",
    "phone": "+91 98432 76120",
    "email": "contact@landmarkrealty.in",
    "location": "Saravanampatti, Coimbatore",
    "experience_years": "11+ Years",
    "rating": 4.7,
    "review_count": 164,
    "properties_count": 10,
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S003",
    "user_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "seller_type": "Real Estate Developer",
    "phone": "+91 97915 45231",
    "email": "hello@greenspacesbuilders.in",
    "location": "RS Puram, Coimbatore",
    "experience_years": "9+ Years",
    "rating": 4.5,
    "review_count": 112,
    "properties_count": 10,
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S004",
    "user_id": "usr_seller_04",
    "seller_name": "Cedar Homes",
    "seller_type": "Residential Developer",
    "phone": "+91 99524 31876",
    "email": "sales@cedarhomes.in",
    "location": "Vadavalli, Coimbatore",
    "experience_years": "9+ Years",
    "rating": 4.6,
    "review_count": 113,
    "properties_count": "44+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S005",
    "user_id": "usr_seller_05",
    "seller_name": "BlueStone Realty",
    "seller_type": "Real Estate Company",
    "phone": "+91 97891 62453",
    "email": "contact@bluestonerealty.in",
    "location": "Singanallur, Coimbatore",
    "experience_years": "7+ Years",
    "rating": 4.4,
    "review_count": 87,
    "properties_count": "31+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S006",
    "user_id": "usr_seller_06",
    "seller_name": "Horizon Living",
    "seller_type": "Property Developer",
    "phone": "+91 98947 53218",
    "email": "sales@horizonliving.in",
    "location": "Thudiyalur, Coimbatore",
    "experience_years": "12+ Years",
    "rating": 4.8,
    "review_count": 201,
    "properties_count": "85+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S007",
    "user_id": "usr_seller_07",
    "seller_name": "GreenLeaf Builders",
    "seller_type": "Residential Builder",
    "phone": "+91 98422 68145",
    "email": "hello@greenleafbuilders.in",
    "location": "Kalapatti, Coimbatore",
    "experience_years": "10+ Years",
    "rating": 4.6,
    "review_count": 142,
    "properties_count": "56+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S008",
    "user_id": "usr_seller_08",
    "seller_name": "Urban Heights Developers",
    "seller_type": "Real Estate Developer",
    "phone": "+91 97654 21890",
    "email": "sales@urbanheights.in",
    "location": "Avinashi Road, Coimbatore",
    "experience_years": "5+ Years",
    "rating": 4.5,
    "review_count": 74,
    "properties_count": "27+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S009",
    "user_id": "usr_seller_09",
    "seller_name": "Serene Homes Group",
    "seller_type": "Residential Developer",
    "phone": "+91 99521 74326",
    "email": "contact@serenehomes.in",
    "location": "Kovaipudur, Coimbatore",
    "experience_years": "14+ Years",
    "rating": 4.8,
    "review_count": 236,
    "properties_count": "92+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  },
  {
    "seller_id": "S010",
    "user_id": "usr_seller_10",
    "seller_name": "Prime Habitat",
    "seller_type": "Property Developer",
    "phone": "+91 98843 61572",
    "email": "sales@primehabitat.in",
    "location": "Gandhipuram, Coimbatore",
    "experience_years": "8+ Years",
    "rating": 4.5,
    "review_count": 109,
    "properties_count": "41+",
    "rera_registered": true,
    "trusted_developer": true,
    "verified": true
  }
];

export const INITIAL_LIFESTYLE_PROFILE = {
  "lifestyle_type": "Family-Oriented Professional",
  "ai_summary": "Your preferences highlight a balanced urban sanctuary prioritizing short commutes and child-friendly educational infrastructure. You favor low acoustic pollution, reliable connectivity, and pedestrian access to neighborhood green spaces.",
  "priority_weights": {
    "commute": 25,
    "budget": 20,
    "schools": 20,
    "noise": 15,
    "parks": 10,
    "amenities": 10
  },
  "dealbreakers": [
    "Commute above 30 minutes",
    "High noise",
    "Budget above ₹60L"
  ]
};

export const INITIAL_PROPERTIES = [
  {
    "property_id": "prestige_prop_001",
    "legacy_id": "P01",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Emerald Palms Executive Suite",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5500000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1180,
    "location": "Avinashi Road, Peelamedu",
    "address": "Avinashi Road, Peelamedu",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.028,
      "lng": 77.0125
    },
    "description": "Sun-drenched south-facing apartment with panoramic views of the western hills. Situated inside a gated community with lush landscaped gardens, high acoustic insulation, and an on-campus pre-school.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 18,
    "commute_mode": "Car / Metro",
    "school_distance_km": 1.2,
    "hospital_distance_km": 2.1,
    "park_distance_km": 0.4,
    "noise_level": "low",
    "green_score": 92,
    "amenity_score": 88,
    "match_score": 96,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 18-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.2,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.1
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.4
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 452,
    "shortlists": 34,
    "enquiries": 12,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_002",
    "legacy_id": "P02",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "The Urban Zenith Residences",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5800000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1240,
    "location": "Saravanampatti Tech Zone",
    "address": "Saravanampatti Tech Zone",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0825,
      "lng": 76.996
    },
    "description": "Contemporary 2BHK residence tailor-made for IT professionals. Features fibre-optic smart home wiring, co-working lounge, rooftop jogging track, and 24x7 power backup.",
    "images": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 12,
    "commute_mode": "Walk / Scooter",
    "school_distance_km": 2.1,
    "hospital_distance_km": 1.8,
    "park_distance_km": 0.8,
    "noise_level": "low",
    "green_score": 84,
    "amenity_score": 95,
    "match_score": 92,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 12-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 2.1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.8
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.8
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 520,
    "shortlists": 42,
    "enquiries": 15,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_003",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Green Residency",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6800000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1560,
    "location": "Kalapatti IT Corridor",
    "address": "Kalapatti Main Road",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0692,
      "lng": 77.0345
    },
    "description": "Expansive 3BHK home surrounded by organic community fruit groves and solar-powered common areas. Perfect for families seeking healthy lifestyle balances.",
    "images": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 14,
    "commute_mode": "Car / Metro",
    "school_distance_km": 1.5,
    "hospital_distance_km": 2.4,
    "park_distance_km": 0.6,
    "noise_level": "low",
    "green_score": 95,
    "amenity_score": 90,
    "match_score": 94,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 14-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.5,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.4
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.6
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 410,
    "shortlists": 31,
    "enquiries": 11,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_004",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Lakeview Homes",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 7200000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1620,
    "location": "Singanallur Lakefront",
    "address": "Trichy Road, Near Singanallur Boat House",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.9982,
      "lng": 77.021
    },
    "description": "Scenic waterfront living featuring floor-to-ceiling glass façades facing the tranquil Singanallur wetland sanctuary with jogging promenade and bird sanctuary views.",
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 22,
    "commute_mode": "Car",
    "school_distance_km": 1.8,
    "hospital_distance_km": 2,
    "park_distance_km": 0.2,
    "noise_level": "low",
    "green_score": 96,
    "amenity_score": 92,
    "match_score": 90,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 22-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.8,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.2
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 485,
    "shortlists": 38,
    "enquiries": 14,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_005",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Garden Enclave",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5200000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1120,
    "location": "Peelamedu East",
    "address": "VK Road, Peelamedu",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0315,
      "lng": 77.018
    },
    "description": "Cozy urban apartment surrounded by botanical courtyard plantings and shaded walkways. Ultra-quiet neighborhood with zero commercial traffic noise.",
    "images": [
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 16,
    "commute_mode": "Metro / Walk",
    "school_distance_km": 1.1,
    "hospital_distance_km": 1.9,
    "park_distance_km": 0.5,
    "noise_level": "low",
    "green_score": 89,
    "amenity_score": 86,
    "match_score": 95,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 16-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.9
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.5
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 390,
    "shortlists": 29,
    "enquiries": 10,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_006",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige City Apartments",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 7500000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1700,
    "location": "Race Course Road",
    "address": "Race Course Road, Gopalapuram",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.002,
      "lng": 76.974
    },
    "description": "High-status central Coimbatore residence with tree-lined avenues, elite social clubs, and direct connectivity to city financial districts.",
    "images": [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 20,
    "commute_mode": "Car",
    "school_distance_km": 1.4,
    "hospital_distance_km": 1.5,
    "park_distance_km": 0.3,
    "noise_level": "low",
    "green_score": 91,
    "amenity_score": 96,
    "match_score": 89,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 20-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.4,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.5
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.3
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 610,
    "shortlists": 54,
    "enquiries": 22,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_007",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Prime Residency",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 4900000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1050,
    "location": "Civil Aerodrome Road",
    "address": "SITRA, Civil Aerodrome Post",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.037,
      "lng": 77.042
    },
    "description": "Smart-budget 2BHK home within 5 minutes of international departures and Tidel Park Phase 2. High rental yield asset with verified title credentials.",
    "images": [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 15,
    "commute_mode": "Scooter / Bus",
    "school_distance_km": 2,
    "hospital_distance_km": 2.2,
    "park_distance_km": 0.9,
    "noise_level": "low",
    "green_score": 83,
    "amenity_score": 87,
    "match_score": 93,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 15-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 2,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.2
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.9
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 430,
    "shortlists": 36,
    "enquiries": 13,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_008",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Harmony Towers",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 9200000,
    "bhk": 4,
    "bedrooms": 4,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 2150,
    "location": "Avinashi Expressway",
    "address": "Goldwins, Avinashi Road",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.045,
      "lng": 77.058
    },
    "description": "Palatial 4BHK sky condominium boasting double-height living room balconies, private clubhouse membership, infinity pool, and concierge services.",
    "images": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 19,
    "commute_mode": "Car",
    "school_distance_km": 1.6,
    "hospital_distance_km": 2.5,
    "park_distance_km": 0.7,
    "noise_level": "low",
    "green_score": 93,
    "amenity_score": 98,
    "match_score": 86,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 19-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.6,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.5
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.7
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 575,
    "shortlists": 46,
    "enquiries": 18,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_009",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Elite Homes",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6500000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1480,
    "location": "Hope College Junction",
    "address": "Hope College, Avinashi Road",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.026,
      "lng": 77.008
    },
    "description": "Central, connected, and tranquil. Built with German acoustic double glazing to insulate against urban bustle while keeping premier schools and hospitals within walking distance.",
    "images": [
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 17,
    "commute_mode": "Metro / Car",
    "school_distance_km": 0.9,
    "hospital_distance_km": 1.6,
    "park_distance_km": 0.6,
    "noise_level": "low",
    "green_score": 88,
    "amenity_score": 91,
    "match_score": 95,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 17-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 0.9,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.6
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.6
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 490,
    "shortlists": 40,
    "enquiries": 16,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "prestige_prop_010",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "title": "Prestige Parkside Residences",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5600000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1210,
    "location": "Tidel Park Road",
    "address": "Near Tidel Park, Civil Aerodrome Post",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0295,
      "lng": 77.025
    },
    "description": "Next-door convenience to Coimbatore IT expressway. Features electric car charging stations, heated indoor pool, badminton court, and uninterrupted backup power.",
    "images": [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 8,
    "commute_mode": "Walk / Bicycle",
    "school_distance_km": 1.7,
    "hospital_distance_km": 2.1,
    "park_distance_km": 0.5,
    "noise_level": "low",
    "green_score": 87,
    "amenity_score": 93,
    "match_score": 97,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 8-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.7,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.1
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.5
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S001",
      "user_id": "usr_seller_01",
      "seller_name": "Prestige Developers",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98765 43210",
      "email": "sales@prestigedevelopers.in",
      "location": "Peelamedu, Coimbatore",
      "experience_years": "8+ Years",
      "rating": 4.6,
      "review_count": 128,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 640,
    "shortlists": 58,
    "enquiries": 24,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_001",
    "legacy_id": "P03",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Whispering Pines Villa",
    "type": "Villa",
    "property_type": "Villa",
    "price": 6300000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1650,
    "location": "Vadavalli Foothills",
    "address": "Vadavalli Foothills, Marudhamalai Road",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.031,
      "lng": 76.9015
    },
    "description": "Independent 3BHK duplex villa nestled against the Western Ghats breeze. Features private terrace organic garden, high ceilings, Italian marble living lounge, and serene noise ratings.",
    "images": [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 26,
    "commute_mode": "Car",
    "school_distance_km": 1.5,
    "hospital_distance_km": 2.8,
    "park_distance_km": 0.3,
    "noise_level": "low",
    "green_score": 98,
    "amenity_score": 82,
    "match_score": 88,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 26-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.5,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.8
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.3
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 430,
    "shortlists": 35,
    "enquiries": 14,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_002",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Imperial Towers",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5100000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1100,
    "location": "Gandhipuram Central",
    "address": "Cross Cut Road, Gandhipuram",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.018,
      "lng": 76.966
    },
    "description": "Centrally positioned 2BHK executive condo with effortless walking access to city shopping hubs, multi-cuisine dining avenues, and express bus interchanges.",
    "images": [
      "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 20,
    "commute_mode": "Metro / Transit",
    "school_distance_km": 1,
    "hospital_distance_km": 1.2,
    "park_distance_km": 0.9,
    "noise_level": "medium",
    "green_score": 79,
    "amenity_score": 94,
    "match_score": 86,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with medium ambient noise and a 20-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.2
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.9
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 380,
    "shortlists": 26,
    "enquiries": 9,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_003",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Boulevard Court",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6700000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1520,
    "location": "Saibaba Colony",
    "address": "NSR Road, Saibaba Colony",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0255,
      "lng": 76.945
    },
    "description": "Premium family apartment in peaceful Saibaba Colony enclave. Beautiful canopy tree views, expansive balconies, and close proximity to top matriculation schools.",
    "images": [
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 24,
    "commute_mode": "Car",
    "school_distance_km": 0.8,
    "hospital_distance_km": 1.4,
    "park_distance_km": 0.4,
    "noise_level": "low",
    "green_score": 93,
    "amenity_score": 90,
    "match_score": 91,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 24-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 0.8,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.4
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.4
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 460,
    "shortlists": 38,
    "enquiries": 13,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_004",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Meadows Villa",
    "type": "Villa",
    "property_type": "Villa",
    "price": 8800000,
    "bhk": 4,
    "bedrooms": 4,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 2200,
    "location": "Thondamuthur Road",
    "address": "Thondamuthur Road, Near Isha Foothills",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.009,
      "lng": 76.885
    },
    "description": "Luxury eco-villa community situated amidst coconut palms and mountain breezes. Private swimming pool, yoga gazebo, and 100% solar captive energy generation.",
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 32,
    "commute_mode": "Car",
    "school_distance_km": 2.5,
    "hospital_distance_km": 3.2,
    "park_distance_km": 0.1,
    "noise_level": "low",
    "green_score": 99,
    "amenity_score": 95,
    "match_score": 84,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 32-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 2.5,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 3.2
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.1
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 510,
    "shortlists": 44,
    "enquiries": 17,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_005",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Crest Residences",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 4600000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 980,
    "location": "Ramanathapuram",
    "address": "Trichy Road, Ramanathapuram",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.995,
      "lng": 76.985
    },
    "description": "Affordable and stylish 2BHK layout crafted for young home buyers. Low maintenance community charges, covered reserved parking, and security CCTV ring.",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 19,
    "commute_mode": "Transit / Scooter",
    "school_distance_km": 1.3,
    "hospital_distance_km": 1.7,
    "park_distance_km": 0.8,
    "noise_level": "low",
    "green_score": 82,
    "amenity_score": 85,
    "match_score": 92,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 19-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.3,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.7
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.8
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 340,
    "shortlists": 22,
    "enquiries": 8,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_006",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Royal Orchards",
    "type": "Villa",
    "property_type": "Villa",
    "price": 7400000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1780,
    "location": "Kovaipudur Hills",
    "address": "Kovaipudur Main Road",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.938,
      "lng": 76.942
    },
    "description": "Gentle hill-elevation villa blessed with 'Little Ooty' climate year-round. Private portico, landscaped front lawn, and dedicated clubhouse gymnasium.",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 28,
    "commute_mode": "Car",
    "school_distance_km": 1.9,
    "hospital_distance_km": 2.6,
    "park_distance_km": 0.4,
    "noise_level": "low",
    "green_score": 97,
    "amenity_score": 88,
    "match_score": 87,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 28-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.9,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.6
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.4
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 420,
    "shortlists": 32,
    "enquiries": 11,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_007",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Serenity Park",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5400000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1190,
    "location": "RS Puram North",
    "address": "Diwan Bahadur Road, RS Puram",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.011,
      "lng": 76.951
    },
    "description": "Sought-after residential address bordering premier boutique shopping streets and cultural centers. Excellent natural cross-ventilation and modular kitchen.",
    "images": [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 23,
    "commute_mode": "Car",
    "school_distance_km": 1,
    "hospital_distance_km": 1.3,
    "park_distance_km": 0.5,
    "noise_level": "low",
    "green_score": 89,
    "amenity_score": 92,
    "match_score": 93,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 23-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.3
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.5
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 470,
    "shortlists": 39,
    "enquiries": 14,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_008",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Highpoint Suites",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6900000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1580,
    "location": "Trichy Road",
    "address": "Trichy Road, Sungam Bypass",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.9995,
      "lng": 76.988
    },
    "description": "Strategic location offering seamless arterial access to both downtown commercial towers and the upcoming southern industrial corridor.",
    "images": [
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 21,
    "commute_mode": "Car / Bus",
    "school_distance_km": 1.6,
    "hospital_distance_km": 1.8,
    "park_distance_km": 0.7,
    "noise_level": "low",
    "green_score": 86,
    "amenity_score": 91,
    "match_score": 90,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 21-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.6,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.8
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.7
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 440,
    "shortlists": 34,
    "enquiries": 12,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_009",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Heritage Enclave",
    "type": "Independent House",
    "property_type": "Independent House",
    "price": 7900000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1850,
    "location": "Perur Bypass",
    "address": "Perur Main Road, Siruvani Greenway",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.975,
      "lng": 76.92
    },
    "description": "Traditional Dravidian architectural aesthetics harmonized with modern earthquake-resistant structural engineering. Features red terracotta courtyard tile and rainwater recharge wells.",
    "images": [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 27,
    "commute_mode": "Car",
    "school_distance_km": 1.8,
    "hospital_distance_km": 2.7,
    "park_distance_km": 0.3,
    "noise_level": "low",
    "green_score": 96,
    "amenity_score": 87,
    "match_score": 87,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 27-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.8,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.7
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.3
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 395,
    "shortlists": 28,
    "enquiries": 10,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "landmark_prop_010",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "title": "Landmark Pinnacle Vista",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 4800000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1020,
    "location": "Sundarapuram Junction",
    "address": "Pollachi Main Road, Sundarapuram",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.952,
      "lng": 76.978
    },
    "description": "Value-packed 2BHK corner unit with clear sky illumination. Close proximity to SIDCO manufacturing hub and engineering colleges.",
    "images": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 25,
    "commute_mode": "Bus / Scooter",
    "school_distance_km": 1.4,
    "hospital_distance_km": 2.1,
    "park_distance_km": 0.7,
    "noise_level": "low",
    "green_score": 84,
    "amenity_score": 86,
    "match_score": 91,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 25-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.4,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.1
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.7
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S002",
      "user_id": "usr_seller_02",
      "seller_name": "Landmark Realty",
      "seller_type": "Real Estate Developer",
      "phone": "+91 98432 76120",
      "email": "contact@landmarkrealty.in",
      "location": "Saravanampatti, Coimbatore",
      "experience_years": "11+ Years",
      "rating": 4.7,
      "review_count": 164,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 360,
    "shortlists": 25,
    "enquiries": 8,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_001",
    "legacy_id": "P05",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "Lotus Grandeur Eco Towers",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6400000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1480,
    "location": "RS Puram Central",
    "address": "West Club Road, RS Puram",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0085,
      "lng": 76.9535
    },
    "description": "Signature IGBC Platinum rated green residence incorporating vertical oxygen gardens, non-toxic organic paints, and solar-filtered tap water.",
    "images": [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 22,
    "commute_mode": "Car",
    "school_distance_km": 1.2,
    "hospital_distance_km": 1.5,
    "park_distance_km": 0.3,
    "noise_level": "low",
    "green_score": 98,
    "amenity_score": 94,
    "match_score": 93,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 22-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.2,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.5
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.3
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 480,
    "shortlists": 40,
    "enquiries": 15,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_002",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Symphony Suites",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 4700000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1060,
    "location": "Kovaipudur Valley",
    "address": "Kovaipudur Hills, Sector 4",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.942,
      "lng": 76.938
    },
    "description": "Quiet micro-climate apartment nestled below whispering pine ridges. Pristine air quality index ratings and zero automotive pollution.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 27,
    "commute_mode": "Car / Bus",
    "school_distance_km": 1.7,
    "hospital_distance_km": 2.3,
    "park_distance_km": 0.4,
    "noise_level": "low",
    "green_score": 96,
    "amenity_score": 87,
    "match_score": 91,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 27-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.7,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.3
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.4
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 390,
    "shortlists": 31,
    "enquiries": 11,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_003",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Nature Crest",
    "type": "Villa",
    "property_type": "Villa",
    "price": 8200000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1920,
    "location": "Marudhamalai Foothills",
    "address": "Marudhamalai Temple Road, Somayampalayam",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.041,
      "lng": 76.892
    },
    "description": "Pure sanctuary luxury. Custom independent villa with private meditation courtyard, panoramic mountain sunset decks, and organic community farming plots.",
    "images": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 29,
    "commute_mode": "Car",
    "school_distance_km": 2.1,
    "hospital_distance_km": 3,
    "park_distance_km": 0.2,
    "noise_level": "low",
    "green_score": 99,
    "amenity_score": 93,
    "match_score": 87,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 29-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 2.1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 3
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.2
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 465,
    "shortlists": 39,
    "enquiries": 14,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_004",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Evergreen Heights",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5300000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1150,
    "location": "Thudiyalur Junction",
    "address": "Mettupalayam Road, Thudiyalur",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.078,
      "lng": 76.945
    },
    "description": "Northern growth hub apartment near major tech parks and CBSE academy clusters. Excellent groundwater replenishment and 100% LED smart lighting.",
    "images": [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 19,
    "commute_mode": "Car / Metro",
    "school_distance_km": 1.1,
    "hospital_distance_km": 1.8,
    "park_distance_km": 0.6,
    "noise_level": "low",
    "green_score": 88,
    "amenity_score": 89,
    "match_score": 94,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 19-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.8
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.6
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 370,
    "shortlists": 27,
    "enquiries": 9,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_005",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Solar Vista",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6600000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1510,
    "location": "Saravanampatti North",
    "address": "Sathy Road, Near IT SEZ",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.089,
      "lng": 77.005
    },
    "description": "Net-zero energy ready 3BHK residence engineered with solar thermal water heating, greywater recycling gardens, and acoustic insulated party walls.",
    "images": [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 13,
    "commute_mode": "Scooter / Walk",
    "school_distance_km": 1.9,
    "hospital_distance_km": 2.1,
    "park_distance_km": 0.7,
    "noise_level": "low",
    "green_score": 94,
    "amenity_score": 92,
    "match_score": 93,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 13-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.9,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.1
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.7
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 450,
    "shortlists": 36,
    "enquiries": 13,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_006",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Eco Harmony",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 4500000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 990,
    "location": "Singanallur Greenway",
    "address": "Kamarajar Road, Singanallur",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.0025,
      "lng": 77.016
    },
    "description": "Compact, affordable green home with maximum thermal comfort design that reduces air-conditioning needs by 35% through smart overhangs.",
    "images": [
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 17,
    "commute_mode": "Transit / Metro",
    "school_distance_km": 1.3,
    "hospital_distance_km": 1.6,
    "park_distance_km": 0.5,
    "noise_level": "low",
    "green_score": 90,
    "amenity_score": 84,
    "match_score": 92,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 17-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.3,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.6
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.5
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 320,
    "shortlists": 21,
    "enquiries": 7,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_007",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Flora Meadows",
    "type": "Villa",
    "property_type": "Villa",
    "price": 9400000,
    "bhk": 4,
    "bedrooms": 4,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 2350,
    "location": "Alandurai Green Belt",
    "address": "Siruvani Main Road, Alandurai",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.962,
      "lng": 76.845
    },
    "description": "Palatial ecological estate villa surrounded by teak and sandalwood groves with uninterrupted mountain panoramas and pure Siruvani drinking water supply.",
    "images": [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 35,
    "commute_mode": "Car",
    "school_distance_km": 3,
    "hospital_distance_km": 3.5,
    "park_distance_km": 0.1,
    "noise_level": "low",
    "green_score": 100,
    "amenity_score": 96,
    "match_score": 83,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 35-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 3,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 3.5
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.1
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 490,
    "shortlists": 42,
    "enquiries": 16,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_008",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Canopy Homes",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 7100000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1600,
    "location": "Ganapathy East",
    "address": "Athipalayam Road, Ganapathy",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.039,
      "lng": 76.982
    },
    "description": "Luxury botanical apartments where every home has an oversized timber deck terrace facing lush tree foliage. Central clubhouse with organic juice bar.",
    "images": [
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 16,
    "commute_mode": "Car / Scooter",
    "school_distance_km": 1,
    "hospital_distance_km": 1.7,
    "park_distance_km": 0.4,
    "noise_level": "low",
    "green_score": 93,
    "amenity_score": 91,
    "match_score": 94,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 16-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 1.7
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.4
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 410,
    "shortlists": 33,
    "enquiries": 12,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_009",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Tranquil Courtyard",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 5000000,
    "bhk": 2,
    "bedrooms": 2,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1120,
    "location": "Vellakinar Village",
    "address": "Near IT Corridor, Vellakinar",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 11.065,
      "lng": 76.965
    },
    "description": "Intimate low-rise gated apartment enclave built around a central rainwater pond with lotus fountains and reading gazebos.",
    "images": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 15,
    "commute_mode": "Scooter / Bus",
    "school_distance_km": 1.5,
    "hospital_distance_km": 2,
    "park_distance_km": 0.3,
    "noise_level": "low",
    "green_score": 92,
    "amenity_score": 87,
    "match_score": 95,
    "slightly_over_budget": false,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 15-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.5,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.3
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 350,
    "shortlists": 26,
    "enquiries": 9,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  },
  {
    "property_id": "greenspaces_prop_010",
    "seller_id": "usr_seller_03",
    "seller_name": "GreenSpaces Builders",
    "title": "GreenSpaces Eden Residences",
    "type": "Apartment",
    "property_type": "Apartment",
    "price": 6200000,
    "bhk": 3,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "area_sqft": 1440,
    "location": "Podanur Main Road",
    "address": "Chettipalayam Road, Podanur",
    "city": "Coimbatore",
    "coordinates": {
      "lat": 10.965,
      "lng": 76.995
    },
    "description": "Quiet green residential living with zero railway horn disturbances. Features butterfly sensory gardens, solar water pumps, and high speed EV fast chargers.",
    "images": [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    "photos": [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    "commute_minutes": 24,
    "commute_mode": "Car / Train",
    "school_distance_km": 1.6,
    "hospital_distance_km": 2.2,
    "park_distance_km": 0.5,
    "noise_level": "low",
    "green_score": 91,
    "amenity_score": 89,
    "match_score": 91,
    "slightly_over_budget": true,
    "amenities": [
      "Supermarket",
      "School",
      "Park",
      "Gym",
      "Parking",
      "24/7 Security"
    ],
    "status": "active",
    "score_breakdown": {
      "budget": {
        "score": 18,
        "max": 20
      },
      "commute": {
        "score": 18,
        "max": 20
      },
      "location": {
        "score": 14,
        "max": 15
      },
      "bhk": {
        "score": 10,
        "max": 10
      },
      "schools": {
        "score": 9,
        "max": 10
      },
      "noise": {
        "score": 9,
        "max": 10
      },
      "parks": {
        "score": 9,
        "max": 10
      },
      "amenities": {
        "score": 5,
        "max": 5
      }
    },
    "ai_explanation": "Rated high for lifestyle index with low ambient noise and a 24-minute commute corridor.",
    "nearby": {
      "schools": [
        {
          "name": "National Public School",
          "distance_km": 1.6,
          "rating": 4.7
        }
      ],
      "hospitals": [
        {
          "name": "City Health Care Center",
          "distance_km": 2.2
        }
      ],
      "parks": [
        {
          "name": "Eco Botanical Park",
          "distance_km": 0.5
        }
      ],
      "transport": [
        {
          "name": "Express Transit Stop",
          "type": "Bus / Metro",
          "distance_m": 350
        }
      ]
    },
    "seller": {
      "seller_id": "S003",
      "user_id": "usr_seller_03",
      "seller_name": "GreenSpaces Builders",
      "seller_type": "Real Estate Developer",
      "phone": "+91 97915 45231",
      "email": "hello@greenspacesbuilders.in",
      "location": "RS Puram, Coimbatore",
      "experience_years": "9+ Years",
      "rating": 4.5,
      "review_count": 112,
      "properties_count": 10,
      "rera_registered": true,
      "trusted_developer": true,
      "verified": true
    },
    "views": 370,
    "shortlists": 28,
    "enquiries": 10,
    "created_at": "2026-08-15T10:00:00Z",
    "updated_at": "2026-08-20T12:00:00Z"
  }
];

export const INITIAL_ENQUIRIES = [
  {
    "enquiry_id": "enq_01",
    "property_id": "prestige_prop_001",
    "property_title": "Emerald Palms Executive Suite",
    "buyer_id": "usr_buyer_01",
    "buyer_name": "Aarav Sharma",
    "buyer_email": "aarav@smartnest.ai",
    "seller_id": "usr_seller_01",
    "message": "Hello, I took the SmartNest lifestyle quiz and this property came out as a 96% match. I'd love to schedule an on-site visit this Saturday afternoon to inspect the pre-school facility.",
    "date": "2026-09-02T14:15:00Z",
    "status": "new",
    "response": null
  },
  {
    "enquiry_id": "enq_02",
    "property_id": "prestige_prop_002",
    "property_title": "The Urban Zenith Residences",
    "buyer_id": "usr_buyer_02",
    "buyer_name": "Priya Patel",
    "buyer_email": "priya@smartnest.ai",
    "seller_id": "usr_seller_01",
    "message": "Does this apartment have dedicated covered EV parking slots near the tower lobby? Also curious about the internet provider options in the co-working lounge.",
    "date": "2026-08-30T10:00:00Z",
    "status": "responded",
    "response": "Hi Priya! Yes, both Level 1 basements have EV-ready chargers. We have dual redundant fiber lines from ACT and Airtel in the co-working center."
  },
  {
    "enquiry_id": "enq_03",
    "property_id": "landmark_prop_001",
    "property_title": "Whispering Pines Villa",
    "buyer_id": "usr_buyer_01",
    "buyer_name": "Aarav Sharma",
    "buyer_email": "aarav@smartnest.ai",
    "seller_id": "usr_seller_02",
    "message": "Can you confirm the handover timeline and whether the kitchen comes modular fitted as shown in photos?",
    "date": "2026-08-25T11:20:00Z",
    "status": "closed",
    "response": "Handover is scheduled for October 2026 with fully modular Italian acrylic cabinetry."
  }
];

export const INITIAL_REPORTS = [
  {
    "report_id": "rep_01",
    "property_id": "prestige_prop_007",
    "property_title": "Prestige Prime Residency",
    "reported_by": "Kavita Rao",
    "reporter_email": "kavita@smartnest.ai",
    "reason": "Acoustic noise is slightly louder during evening airport flight corridors than indicated in the basic description.",
    "date": "2026-09-01T15:30:00Z",
    "status": "pending"
  },
  {
    "report_id": "rep_02",
    "property_id": "greenspaces_prop_001",
    "property_title": "Lotus Grandeur Eco Towers",
    "reported_by": "Rajesh Kumar",
    "reporter_email": "rajesh@smartnest.ai",
    "reason": "Price quoted on listing differs from the official developer brochure by ₹2 Lakhs.",
    "date": "2026-08-28T09:40:00Z",
    "status": "resolved"
  }
];

export const INITIAL_SEARCH_HISTORY = [
  {
    "history_id": "hist_01",
    "summary": "2 BHK in Coimbatore, Budget ₹50L–₹60L, Commute < 25m, Low Noise",
    "date": "2026-09-04T18:30:00Z",
    "results_count": 5,
    "params": {
      "city": "Coimbatore",
      "bhk": 2,
      "max_budget": 6000000,
      "max_commute": 25
    }
  },
  {
    "history_id": "hist_02",
    "summary": "Villa in Vadavalli / Foothills, High Greenery, Budget ₹65L",
    "date": "2026-09-01T11:15:00Z",
    "results_count": 2,
    "params": {
      "city": "Coimbatore",
      "type": "Villa",
      "max_budget": 6500000
    }
  },
  {
    "history_id": "hist_03",
    "summary": "Quiet Apartment near Peelamedu / Tidel with Metro access",
    "date": "2026-08-27T08:45:00Z",
    "results_count": 4,
    "params": {
      "city": "Coimbatore",
      "location": "Peelamedu"
    }
  }
];

export const INITIAL_CONVERSATIONS = [
  {
    "conversation_id": "conv_01",
    "enquiry_id": "enq_01",
    "buyer_id": "usr_buyer_01",
    "buyer_name": "Aarav Sharma",
    "buyer_email": "aarav@smartnest.ai",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "seller_email": "sales@prestigedevelopers.in",
    "property_id": "prestige_prop_001",
    "property_title": "Emerald Palms Executive Suite",
    "property_image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    "property_price": 5500000,
    "property_location": "Avinashi Road, Peelamedu",
    "status": "responded",
    "unread_for_buyer": false,
    "unread_for_seller": true,
    "last_message": "Thank you! 11:00 AM works perfectly. Will bring my family along. Looking forward to it.",
    "last_message_at": "2026-09-07T10:15:00Z",
    "messages": [
      {
        "message_id": "msg_01_01",
        "conversation_id": "conv_01",
        "sender_id": "usr_buyer_01",
        "sender_role": "buyer",
        "sender_name": "Aarav Sharma",
        "receiver_id": "usr_seller_01",
        "text": "Hello, I took the SmartNest lifestyle quiz and Emerald Palms Executive Suite came out as a 96% match. Could we arrange a site visit this Saturday morning to inspect the campus pre-school?",
        "created_at": "2026-09-05T14:15:00Z",
        "read_at": "2026-09-05T15:00:00Z",
        "status": "read"
      },
      {
        "message_id": "msg_01_02",
        "conversation_id": "conv_01",
        "sender_id": "usr_seller_01",
        "sender_role": "seller",
        "sender_name": "Prestige Developers",
        "receiver_id": "usr_buyer_01",
        "text": "Hi Aarav! We would be delighted to host you. Saturday at 11:00 AM works well. Our relationship manager Karthik will meet you at the central clubhouse entrance.",
        "created_at": "2026-09-06T09:30:00Z",
        "read_at": "2026-09-06T10:00:00Z",
        "status": "read"
      },
      {
        "message_id": "msg_01_03",
        "conversation_id": "conv_01",
        "sender_id": "usr_buyer_01",
        "sender_role": "buyer",
        "sender_name": "Aarav Sharma",
        "receiver_id": "usr_seller_01",
        "text": "Thank you! 11:00 AM works perfectly. Will bring my family along. Looking forward to it.",
        "created_at": "2026-09-07T10:15:00Z",
        "read_at": null,
        "status": "delivered"
      }
    ]
  },
  {
    "conversation_id": "conv_02",
    "enquiry_id": "enq_03",
    "buyer_id": "usr_buyer_01",
    "buyer_name": "Aarav Sharma",
    "buyer_email": "aarav@smartnest.ai",
    "seller_id": "usr_seller_02",
    "seller_name": "Landmark Realty",
    "seller_email": "contact@landmarkrealty.in",
    "property_id": "landmark_prop_001",
    "property_title": "Whispering Pines Villa",
    "property_image": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
    "property_price": 6300000,
    "property_location": "Vadavalli Foothills",
    "status": "responded",
    "unread_for_buyer": true,
    "unread_for_seller": false,
    "last_message": "Greetings Aarav! Yes, all Phase 2 triplex villas come pre-installed with sensor-driven drip lines and rainwater collection.",
    "last_message_at": "2026-09-07T16:45:00Z",
    "messages": [
      {
        "message_id": "msg_02_01",
        "conversation_id": "conv_02",
        "sender_id": "usr_buyer_01",
        "sender_role": "buyer",
        "sender_name": "Aarav Sharma",
        "receiver_id": "usr_seller_02",
        "text": "Hi, could you let me know if the private garden lawn has provision for automated drip irrigation?",
        "created_at": "2026-09-07T11:20:00Z",
        "read_at": "2026-09-07T12:00:00Z",
        "status": "read"
      },
      {
        "message_id": "msg_02_02",
        "conversation_id": "conv_02",
        "sender_id": "usr_seller_02",
        "sender_role": "seller",
        "sender_name": "Landmark Realty",
        "receiver_id": "usr_buyer_01",
        "text": "Greetings Aarav! Yes, all Phase 2 triplex villas come pre-installed with sensor-driven drip lines and rainwater collection.",
        "created_at": "2026-09-07T16:45:00Z",
        "read_at": null,
        "status": "delivered"
      }
    ]
  },
  {
    "conversation_id": "conv_03",
    "enquiry_id": "enq_02",
    "buyer_id": "usr_buyer_02",
    "buyer_name": "Priya Patel",
    "buyer_email": "priya@smartnest.ai",
    "seller_id": "usr_seller_01",
    "seller_name": "Prestige Developers",
    "seller_email": "sales@prestigedevelopers.in",
    "property_id": "prestige_prop_002",
    "property_title": "The Urban Zenith Residences",
    "property_image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
    "property_price": 5800000,
    "property_location": "Saravanampatti Tech Zone",
    "status": "responded",
    "unread_for_buyer": false,
    "unread_for_seller": false,
    "last_message": "Hi Priya! Yes, both Level 1 basements have EV-ready chargers. We have dual redundant fiber lines from ACT and Airtel in the co-working center.",
    "last_message_at": "2026-08-30T10:30:00Z",
    "messages": [
      {
        "message_id": "msg_03_01",
        "conversation_id": "conv_03",
        "sender_id": "usr_buyer_02",
        "sender_role": "buyer",
        "sender_name": "Priya Patel",
        "receiver_id": "usr_seller_01",
        "text": "Does this apartment have dedicated covered EV parking slots near the tower lobby? Also curious about the internet provider options in the co-working lounge.",
        "created_at": "2026-08-30T10:00:00Z",
        "read_at": "2026-08-30T10:15:00Z",
        "status": "read"
      },
      {
        "message_id": "msg_03_02",
        "conversation_id": "conv_03",
        "sender_id": "usr_seller_01",
        "sender_role": "seller",
        "sender_name": "Prestige Developers",
        "receiver_id": "usr_buyer_02",
        "text": "Hi Priya! Yes, both Level 1 basements have EV-ready chargers. We have dual redundant fiber lines from ACT and Airtel in the co-working center.",
        "created_at": "2026-08-30T10:30:00Z",
        "read_at": "2026-08-30T11:00:00Z",
        "status": "read"
      }
    ]
  }
];

export const INITIAL_SELLER_ANALYTICS = {
  "views_over_time": [
    {
      "date": "Day 1",
      "views": 24
    },
    {
      "date": "Day 2",
      "views": 32
    },
    {
      "date": "Day 3",
      "views": 28
    },
    {
      "date": "Day 4",
      "views": 45
    },
    {
      "date": "Day 5",
      "views": 52
    },
    {
      "date": "Day 6",
      "views": 48
    },
    {
      "date": "Day 7",
      "views": 60
    },
    {
      "date": "Day 8",
      "views": 58
    },
    {
      "date": "Day 9",
      "views": 64
    },
    {
      "date": "Day 10",
      "views": 72
    },
    {
      "date": "Day 11",
      "views": 68
    },
    {
      "date": "Day 12",
      "views": 80
    },
    {
      "date": "Day 13",
      "views": 85
    },
    {
      "date": "Day 14",
      "views": 79
    },
    {
      "date": "Day 15",
      "views": 90
    },
    {
      "date": "Day 16",
      "views": 94
    },
    {
      "date": "Day 17",
      "views": 88
    },
    {
      "date": "Day 18",
      "views": 102
    },
    {
      "date": "Day 19",
      "views": 110
    },
    {
      "date": "Day 20",
      "views": 105
    },
    {
      "date": "Day 21",
      "views": 118
    },
    {
      "date": "Day 22",
      "views": 125
    },
    {
      "date": "Day 23",
      "views": 119
    },
    {
      "date": "Day 24",
      "views": 130
    },
    {
      "date": "Day 25",
      "views": 138
    },
    {
      "date": "Day 26",
      "views": 134
    },
    {
      "date": "Day 27",
      "views": 142
    },
    {
      "date": "Day 28",
      "views": 150
    },
    {
      "date": "Day 29",
      "views": 146
    },
    {
      "date": "Day 30",
      "views": 162
    }
  ],
  "enquiries_over_time": [
    {
      "date": "Week 1",
      "enquiries": 4
    },
    {
      "date": "Week 2",
      "enquiries": 7
    },
    {
      "date": "Week 3",
      "enquiries": 11
    },
    {
      "date": "Week 4",
      "enquiries": 16
    }
  ],
  "match_distribution": [
    {
      "bucket": "95–100%",
      "count": 48
    },
    {
      "bucket": "85–94%",
      "count": 32
    },
    {
      "bucket": "70–84%",
      "count": 14
    },
    {
      "bucket": "<70%",
      "count": 6
    }
  ],
  "enquiry_count": 155,
  "shortlist_count": 89,
  "match_potential_score": 94,
  "top_buyer_preferences": {
    "budget_range": "₹50L – ₹65L",
    "preferred_bhk": "2 BHK (68%)",
    "commute_priority": "High (82%)",
    "school_priority": "High (74%)",
    "noise_preference": "Low (91%)"
  },
  "match_tiers": [
    {
      "tier": "Excellent Match (95–100%)",
      "buyers": 48,
      "pct": 48,
      "color": "var(--teal)"
    },
    {
      "tier": "Great Match (85–94%)",
      "buyers": 32,
      "pct": 32,
      "color": "#3D5A73"
    },
    {
      "tier": "Good Match (70–84%)",
      "buyers": 14,
      "pct": 14,
      "color": "var(--amber)"
    },
    {
      "tier": "Partial Match (<70%)",
      "buyers": 6,
      "pct": 6,
      "color": "#94A3B8"
    }
  ],
  "top_lifestyles": [
    {
      "name": "Family-Oriented Professional",
      "value": 42,
      "color": "#2A9D8F"
    },
    {
      "name": "Young Urban Professional",
      "value": 31,
      "color": "#3D5A73"
    },
    {
      "name": "Retired Couple",
      "value": 27,
      "color": "#E9C46A"
    }
  ],
  "buyer_insight_ai": "Your property's low noise level and school proximity are its strongest match drivers — 91% of interested buyers listed noise as high priority, and 74% require nearby schools."
};

export const INITIAL_ADMIN_ANALYTICS = {
  "users_over_time": [
    {
      "period": "Jan",
      "users": 120
    },
    {
      "period": "Feb",
      "users": 190
    },
    {
      "period": "Mar",
      "users": 280
    },
    {
      "period": "Apr",
      "users": 410
    },
    {
      "period": "May",
      "users": 590
    },
    {
      "period": "Jun",
      "users": 840
    }
  ],
  "properties_over_time": [
    {
      "period": "Jan",
      "properties": 30
    },
    {
      "period": "Feb",
      "properties": 55
    },
    {
      "period": "Mar",
      "properties": 90
    },
    {
      "period": "Apr",
      "properties": 140
    },
    {
      "period": "May",
      "properties": 210
    },
    {
      "period": "Jun",
      "properties": 315
    }
  ],
  "searches_per_day": [
    {
      "day": "Mon",
      "count": 320
    },
    {
      "day": "Tue",
      "count": 410
    },
    {
      "day": "Wed",
      "count": 480
    },
    {
      "day": "Thu",
      "count": 510
    },
    {
      "day": "Fri",
      "count": 620
    },
    {
      "day": "Sat",
      "count": 740
    },
    {
      "day": "Sun",
      "count": 690
    }
  ],
  "recommendations_generated": [
    {
      "month": "Jan",
      "recs": 850
    },
    {
      "month": "Feb",
      "recs": 1420
    },
    {
      "month": "Mar",
      "recs": 2100
    },
    {
      "month": "Apr",
      "recs": 3400
    },
    {
      "month": "May",
      "recs": 4900
    },
    {
      "month": "Jun",
      "recs": 6850
    }
  ],
  "most_searched_locations": [
    {
      "city": "Coimbatore",
      "searches": 4200,
      "percentage": 38
    },
    {
      "city": "Bangalore",
      "searches": 3100,
      "percentage": 28
    },
    {
      "city": "Chennai",
      "searches": 1950,
      "percentage": 17
    },
    {
      "city": "Hyderabad",
      "searches": 1200,
      "percentage": 11
    },
    {
      "city": "Kochi",
      "searches": 680,
      "percentage": 6
    }
  ],
  "avg_match_score": 86.4,
  "pending_approvals_count": 0,
  "total_users": 1428,
  "total_sellers": 3,
  "total_properties": 30,
  "active_listings": 30,
  "reported_listings": 2,
  "recommendations_total": 18720
};

export const DEFAULT_ANALYTICS_PERIOD_DATA = {
  '7d': {
    users_over_time: [
      { period: 'Mon', users: 1412 },
      { period: 'Tue', users: 1416 },
      { period: 'Wed', users: 1420 },
      { period: 'Thu', users: 1423 },
      { period: 'Fri', users: 1425 },
      { period: 'Sat', users: 1428 },
      { period: 'Sun', users: 1432 }
    ],
    properties_over_time: [
      { period: 'Mon', properties: 27 },
      { period: 'Tue', properties: 28 },
      { period: 'Wed', properties: 28 },
      { period: 'Thu', properties: 29 },
      { period: 'Fri', properties: 30 },
      { period: 'Sat', properties: 30 },
      { period: 'Sun', properties: 31 }
    ],
    searches_per_day: [
      { day: 'Mon', count: 320 },
      { day: 'Tue', count: 410 },
      { day: 'Wed', count: 480 },
      { day: 'Thu', count: 510 },
      { day: 'Fri', count: 620 },
      { day: 'Sat', count: 740 },
      { day: 'Sun', count: 690 }
    ],
    recommendations_generated: [
      { month: 'Mon', recs: 210 },
      { month: 'Tue', recs: 290 },
      { month: 'Wed', recs: 340 },
      { month: 'Thu', recs: 380 },
      { month: 'Fri', recs: 460 },
      { month: 'Sat', recs: 580 },
      { month: 'Sun', recs: 510 }
    ],
    most_searched_locations: [
      { city: 'Coimbatore', searches: 980, percentage: 38 },
      { city: 'Bangalore', searches: 720, percentage: 28 },
      { city: 'Chennai', searches: 440, percentage: 17 },
      { city: 'Hyderabad', searches: 280, percentage: 11 },
      { city: 'Kochi', searches: 155, percentage: 6 }
    ]
  },
  '30d': {
    users_over_time: [
      { period: 'Week 1', users: 1240 },
      { period: 'Week 2', users: 1295 },
      { period: 'Week 3', users: 1360 },
      { period: 'Week 4', users: 1428 }
    ],
    properties_over_time: [
      { period: 'Week 1', properties: 22 },
      { period: 'Week 2', properties: 25 },
      { period: 'Week 3', properties: 28 },
      { period: 'Week 4', properties: 30 }
    ],
    searches_per_day: [
      { day: 'Mon', count: 340 },
      { day: 'Tue', count: 420 },
      { day: 'Wed', count: 490 },
      { day: 'Thu', count: 530 },
      { day: 'Fri', count: 640 },
      { day: 'Sat', count: 780 },
      { day: 'Sun', count: 710 }
    ],
    recommendations_generated: [
      { month: 'Week 1', recs: 3100 },
      { month: 'Week 2', recs: 4200 },
      { month: 'Week 3', recs: 5100 },
      { month: 'Week 4', recs: 6320 }
    ],
    most_searched_locations: [
      { city: 'Coimbatore', searches: 4200, percentage: 38 },
      { city: 'Bangalore', searches: 3100, percentage: 28 },
      { city: 'Chennai', searches: 1950, percentage: 17 },
      { city: 'Hyderabad', searches: 1200, percentage: 11 },
      { city: 'Kochi', searches: 680, percentage: 6 }
    ]
  },
  '90d': {
    users_over_time: [
      { period: 'Month 1', users: 890 },
      { period: 'Month 2', users: 1150 },
      { period: 'Month 3', users: 1428 }
    ],
    properties_over_time: [
      { period: 'Month 1', properties: 18 },
      { period: 'Month 2', properties: 24 },
      { period: 'Month 3', properties: 30 }
    ],
    searches_per_day: [
      { day: 'Mon', count: 310 },
      { day: 'Tue', count: 390 },
      { day: 'Wed', count: 460 },
      { day: 'Thu', count: 490 },
      { day: 'Fri', count: 590 },
      { day: 'Sat', count: 710 },
      { day: 'Sun', count: 660 }
    ],
    recommendations_generated: [
      { month: 'Month 1', recs: 4800 },
      { month: 'Month 2', recs: 6200 },
      { month: 'Month 3', recs: 7720 }
    ],
    most_searched_locations: [
      { city: 'Coimbatore', searches: 12400, percentage: 38 },
      { city: 'Bangalore', searches: 9150, percentage: 28 },
      { city: 'Chennai', searches: 5560, percentage: 17 },
      { city: 'Hyderabad', searches: 3600, percentage: 11 },
      { city: 'Kochi', searches: 1960, percentage: 6 }
    ]
  },
  '1y': {
    users_over_time: [
      { period: 'Jan', users: 120 },
      { period: 'Feb', users: 190 },
      { period: 'Mar', users: 280 },
      { period: 'Apr', users: 410 },
      { period: 'May', users: 590 },
      { period: 'Jun', users: 750 },
      { period: 'Jul', users: 920 },
      { period: 'Aug', users: 1080 },
      { period: 'Sep', users: 1230 },
      { period: 'Oct', users: 1310 },
      { period: 'Nov', users: 1370 },
      { period: 'Dec', users: 1428 }
    ],
    properties_over_time: [
      { period: 'Jan', properties: 4 },
      { period: 'Feb', properties: 8 },
      { period: 'Mar', properties: 12 },
      { period: 'Apr', properties: 16 },
      { period: 'May', properties: 20 },
      { period: 'Jun', properties: 23 },
      { period: 'Jul', properties: 25 },
      { period: 'Aug', properties: 27 },
      { period: 'Sep', properties: 28 },
      { period: 'Oct', properties: 29 },
      { period: 'Nov', properties: 30 },
      { period: 'Dec', properties: 30 }
    ],
    searches_per_day: [
      { day: 'Mon', count: 320 },
      { day: 'Tue', count: 410 },
      { day: 'Wed', count: 480 },
      { day: 'Thu', count: 510 },
      { day: 'Fri', count: 620 },
      { day: 'Sat', count: 740 },
      { day: 'Sun', count: 690 }
    ],
    recommendations_generated: [
      { month: 'Jan', recs: 850 },
      { month: 'Feb', recs: 1420 },
      { month: 'Mar', recs: 2100 },
      { month: 'Apr', recs: 3400 },
      { month: 'May', recs: 4900 },
      { month: 'Jun', recs: 6850 },
      { month: 'Jul', recs: 8900 },
      { month: 'Aug', recs: 11200 },
      { month: 'Sep', recs: 13500 },
      { month: 'Oct', recs: 15400 },
      { month: 'Nov', recs: 17100 },
      { month: 'Dec', recs: 18720 }
    ],
    most_searched_locations: [
      { city: 'Coimbatore', searches: 48200, percentage: 38 },
      { city: 'Bangalore', searches: 35500, percentage: 28 },
      { city: 'Chennai', searches: 21600, percentage: 17 },
      { city: 'Hyderabad', searches: 13950, percentage: 11 },
      { city: 'Kochi', searches: 7600, percentage: 6 }
    ]
  }
};

export const getPeriodAnalyticsData = (period = '30d') => {
  return DEFAULT_ANALYTICS_PERIOD_DATA[period] || DEFAULT_ANALYTICS_PERIOD_DATA['30d'];
};


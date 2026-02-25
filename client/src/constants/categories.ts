export interface CategoryMeta {
  label: string;
  color: string;
  icon: string;
}

export interface CategoryExplanation {
  definition: string;
  scope: string;
  examples: string[];
  department: string;
}

export const CATEGORY_EXPLANATIONS: Record<string, CategoryExplanation> = {
  'Solid Waste (Garbage) Related': {
    definition: 'Complaints about the collection, segregation, and disposal of solid waste across BBMP wards.',
    scope: 'Door-to-door collection, public bins, bulk waste clearance, illegal dumping, waste segregation at source',
    examples: [
      'Garbage not collected for 3+ days',
      'Overflowing bin blocking footpath',
      'Bulk waste not cleared after event',
    ],
    department: 'BBMP Solid Waste Management (SWM)',
  },
  'Electrical': {
    definition: 'Issues with BBMP-maintained public electrical infrastructure, primarily street lighting on public roads.',
    scope: 'Streetlight outages, fallen electrical poles, exposed wiring, transformer faults on public land',
    examples: [
      'Streetlight not working for weeks',
      'Fallen electrical pole blocking road',
      'Exposed live wire near footpath',
    ],
    department: 'BBMP Electrical Department / BESCOM (joint)',
  },
  'Road Maintenance(Engg)': {
    definition: 'Complaints about road surface quality, potholes, and related infrastructure within BBMP limits.',
    scope: 'Potholes, road cave-ins, broken footpath slabs, road dividers, missing storm drain covers',
    examples: [
      'Pothole causing accidents on main road',
      'Road caved in after heavy rain',
      'Broken footpath slab near school',
    ],
    department: 'BBMP Engineering (Roads) Department',
  },
  'Revenue Department': {
    definition: 'Property tax, encroachments, and building regulation complaints handled by BBMP\'s Revenue wing.',
    scope: 'Property tax disputes, illegal constructions, building plan violations, encroachments on public land',
    examples: [
      'Illegal construction blocking road access',
      'Footpath encroached by commercial vendor',
      'Property tax record mismatch',
    ],
    department: 'BBMP Revenue / Property Tax Department',
  },
  'Forest': {
    definition: 'Complaints related to trees, parks, and green cover managed by BBMP Horticulture.',
    scope: 'Fallen or dangerous trees, tree pruning requests, park upkeep, encroachments on green areas',
    examples: [
      'Tree fell on road blocking traffic',
      'Overgrown branch obstructing streetlight',
      'Park encroached by unauthorised structure',
    ],
    department: 'BBMP Horticulture Department',
  },
  'Lakes': {
    definition: 'Issues involving Bengaluru\'s lakes, water bodies, and stormwater drainage network.',
    scope: 'Lake encroachment, sewage discharge, storm drain blockages, flooding from clogged waterways',
    examples: [
      'Sewage flowing directly into neighbourhood lake',
      'Storm drain blocked causing street flooding',
      'Lake boundary encroached by construction',
    ],
    department: 'BBMP Lakes Department / BWSSB (joint)',
  },
  'E khata / Khata services': {
    definition: 'Complaints about BBMP property documentation, including Khata certificates and e-Khata registration.',
    scope: 'Khata transfer delays, e-Khata errors, property mutation issues, ownership record disputes',
    examples: [
      'Khata transfer pending for 6+ months',
      'e-Khata certificate not issued after payment',
      'Wrong survey number in property records',
    ],
    department: 'BBMP Revenue / Property Tax Department',
  },
};

export const CATEGORIES: Record<string, CategoryMeta> = {
  'Solid Waste (Garbage) Related': {
    label: 'Garbage',
    color: '#16a34a',
    icon: '🗑️',
  },
  'Electrical': {
    label: 'Electrical / Streetlights',
    color: '#facc15',
    icon: '💡',
  },
  'Road Maintenance(Engg)': {
    label: 'Roads',
    color: '#f97316',
    icon: '🛣️',
  },
  'Revenue Department': {
    label: 'Revenue',
    color: '#818cf8',
    icon: '📋',
  },
  'Forest': {
    label: 'Forest / Trees',
    color: '#22c55e',
    icon: '🌳',
  },
  'Lakes': {
    label: 'Lakes',
    color: '#0ea5e9',
    icon: '💧',
  },
  'E khata / Khata services': {
    label: 'Khata Services',
    color: '#a78bfa',
    icon: '📜',
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);
export const ALL_CATEGORY = 'All Categories';

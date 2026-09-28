export type ExperienceItem = {
  year: string;
  company: string;
  period: string;
  role: string;
};

export const experience: ExperienceItem[] = [
  {
    year: '2025–2026',
    company: 'Blissful Design',
    period: '06/2025 – 09/2026',
    role: 'Full-time • Product Design',
  },
  {
    year: '2025',
    company: 'Blissful Design',
    period: '04/2025 – 06/2025',
    role: 'Part-time • Product Design',
  },
  {
    year: '2024–2025',
    company: 'Natuno',
    period: '07/2024 – 06/2025',
    role: 'Product Design',
  },
  {
    year: '2024',
    company: 'Nija works',
    period: '05/2024 – 06/2024',
    role: 'Interface Designer',
  },
  {
    year: '2021–2023',
    company: 'Illiyin Studio',
    period: '10/2021 – 10/2023',
    role: 'User Interface Designer',
  },
];

export const capabilities = [
  'Product Design',
  'Web App Design',
  'Mobile App Design',
  'Website Design',
  'Design Systems',
  'Brand Identity',
  'Pitch Deck Design',
  'Motion & Interaction',
  'MVP Product',
  'Design to Code',
  'Framer Implementation',
  'Frontend Implementation',
] as const;

export type ExperienceItem = {
  year: string;
  company: string;
  period: string;
  role: string;
};

export const experience: ExperienceItem[] = [
  {
    year: '2026',
    company: 'Natuno.Lab',
    period: '12/12 - 12/12',
    role: 'Product Designer | UI/UX Designer',
  },
  {
    year: '2026',
    company: 'Natuno.Lab',
    period: '12/12 - 12/12',
    role: 'Product Designer | UI/UX Designer',
  },
  {
    year: '2026',
    company: 'Natuno.Lab',
    period: '12/12 - 12/12',
    role: 'Product Designer | UI/UX Designer',
  },
  {
    year: '2026',
    company: 'Illiyin Studio',
    period: '12/12 - 12/12',
    role: 'Fulltime • User Interface Designer',
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

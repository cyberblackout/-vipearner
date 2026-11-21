export interface PayoutRecord {
  id: string;
  masked_phone: string;
  masked_name: string;
  amount: number;
  created_at: string;
}

const GHANAIAN_NAMES = [
  'Kwame A.',
  'Kofi M.',
  'Emmanuel O.',
  'Ama S.',
  'Abena D.',
  'Yaw B.',
  'Prince K.',
  'Godsway G.',
  'Selasi E.',
  'Justice T.',
  'Samuel N.',
  'Daniel F.',
  'Ebenezer K.',
  'Grace A.',
  'Akua P.',
  'Richmond B.',
  'Josephine M.',
  'Gideon T.',
  'Derrick Q.',
  'Bernice K.',
  'Benjamin A.',
  'Dorothy Y.',
  'Frank O.',
  'Rita N.',
  'Michael E.',
  'Sandra B.',
  'Charles K.',
  'Vera S.',
  'Richard T.',
  'Gloria M.',
  'Kwabena E.',
  'Adwoa F.',
  'Kwaku P.',
  'Afia B.',
  'Prosper D.',
  'Faustina K.',
  'Isaac N.',
  'Harriet O.',
  'Joseph T.',
  'Millicent A.',
  'Solomon K.',
  'Belinda M.',
  'Dennis F.',
  'Patience Y.',
  'Kelvin A.',
  'Deborah C.',
  'Joshua B.',
  'Abigail S.',
  'Stephen T.',
  'Mercy K.',
  'Evans O.',
  'Eunice D.',
  'Felix M.',
  'Rebecca N.',
  'Patrick A.',
  'Comfort E.',
  'Collins B.',
  'Juliet K.',
  'Dominic F.',
  'Priscilla T.',
  'Desmond G.',
  'Cynthia S.',
  'Bernard A.',
  'Gladys O.',
  'Alex M.',
  'Evelyn D.',
  'Victor K.',
  'Victoria P.',
  'Bright E.',
  'Esther B.',
  'George T.',
  'Janet N.',
  'Vincent O.',
  'Florence K.',
  'Theophilus A.',
  'Irene M.',
  'Francis D.',
  'Beatrice S.',
  'Andrews B.',
  'Vivian K.',
  'Gabriel O.',
  'Lydia T.',
  'Moses E.',
  'Doris A.',
  'David N.',
  'Agnes M.',
  'Aaron B.',
  'Theresa K.',
  'Caleb F.',
  'Portia D.',
  'Jonathan S.',
  'Jennifer O.',
  'Elijah T.',
  'Rejoice A.',
  'Kojo E.',
  'Emefa B.',
  'Kwesi M.',
  'Mavis K.',
  'Stephen D.',
  'Diana N.',
  'Peter A.',
  'Emmanuella O.',
  'Nathaniel K.',
  'Gifty B.',
  'Albert T.',
  'Peace M.',
  'Eric F.',
  'Mabel S.',
];

const PHONE_PREFIXES = ['024', '054', '055', '059', '020', '050', '027', '057', '026'];

// Interleaved mix: Small -> Mid -> High -> Small -> Mid -> High so adjacent cards show dynamic variety
const SAMPLE_AMOUNTS = [
  // Cluster 1
  110.0,
  4152.98,
  18161.0,

  // Cluster 2
  65.0,
  2430.0,
  42500.0,

  // Cluster 3
  280.0,
  8663.35,
  70200.0,

  // Cluster 4
  195.0,
  3500.0,
  100800.0,

  // Cluster 5
  80.0,
  6604.5,
  34200.0,

  // Cluster 6
  350.0,
  9900.0,
  85000.0,

  // Cluster 7
  50.0,
  1250.0,
  24500.0,

  // Cluster 8
  450.0,
  4860.0,
  48900.0,

  // Cluster 9
  135.0,
  1650.0,
  56000.0,

  // Cluster 10
  680.0,
  7500.0,
  98500.0,

  // Cluster 11
  160.0,
  3200.0,
  68400.0,

  // Cluster 12
  550.0,
  5400.0,
  28000.0,

  // Cluster 13
  240.0,
  2100.0,
  19800.0,

  // Cluster 14
  780.0,
  2850.0,
  14800.0,

  // Cluster 15
  890.0,
  12450.0,
  15600.0,

  // Cluster 16
  950.0,
  3500.0,
  22300.0,
];

// Generate 140 deterministic payouts (+100 users added) with interleaved small, mid, and high amounts
export const DEMO_PAYOUTS: PayoutRecord[] = Array.from({ length: 140 }).map((_, i) => {
  const name = GHANAIAN_NAMES[i % GHANAIAN_NAMES.length];
  const prefix = PHONE_PREFIXES[i % PHONE_PREFIXES.length];
  const lastFour = (1000 + ((i * 379) % 9000)).toString();
  const maskedPhone = `${prefix}****${lastFour.slice(-3)}`;
  const amount = SAMPLE_AMOUNTS[i % SAMPLE_AMOUNTS.length];
  // Spread timestamp between 1 minute ago and 90 minutes ago
  const minutesAgo = (i * 0.65) + 0.5;
  const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

  return {
    id: `demo-payout-${i + 1}`,
    masked_phone: maskedPhone,
    masked_name: name,
    amount,
    created_at: createdAt,
  };
});

import { getDb } from '../lib/db';

interface SeedProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
  likedUser: boolean;
}

const mockIndianProfiles: SeedProfile[] = [
  {
    id: 'coy_1',
    name: 'Ananya Sen',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'nift delhi grad. handloom textiles by day, hunting vintage calcutta vinyl at 2am. let’s get chai.',
    city: 'Hauz Khas, New Delhi',
    interests: ['Handloom', 'Filter Coffee', 'Vinyl Records', 'Textile Archives'],
    likedUser: true,
  },
  {
    id: 'coy_2',
    name: 'Kabir Mehta',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'lighting designer for indie theatre. spending sundays at church street bookstores and roasters.',
    city: 'Indiranagar, Bangalore',
    interests: ['Stage Lighting', 'Church Street', 'Filter Kaapi', 'Film 35mm'],
    likedUser: false,
  },
  {
    id: 'coy_3',
    name: 'Riya Deshmukh',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'fine arts at st. xavier’s. printmaking, monsoon walks along marine drive, and secondhand books in fort.',
    city: 'Bandra West, Mumbai',
    interests: ['Printmaking', 'Marine Drive', 'Art History', 'Irani Chai'],
    likedUser: true,
  },
  {
    id: 'coy_4',
    name: 'Rohan Verma',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'urban designer thinking about lake revival and cycle paths. usually found in cubbon park with a cold brew.',
    city: 'Koramangala, Bangalore',
    interests: ['Urbanism', 'Cubbon Park', 'Cycling', 'Specialty Coffee'],
    likedUser: false,
  },
  {
    id: 'coy_5',
    name: 'Meera Nambiar',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: 'sustainable architecture at spa delhi. passionate about terracotta jalis and south indian filter kaapi.',
    city: 'South Delhi, Delhi',
    interests: ['Terracotta', 'Architecture', 'Filter Kaapi', 'Heritage Walks'],
    likedUser: true,
  },
  {
    id: 'coy_6',
    name: 'Devansh Kulkarni',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'pastry chef at an artisanal sourdough bakery in bandra. amateur sitar & analog synth player.',
    city: 'Bandra, Mumbai',
    interests: ['Sourdough', 'Analog Synths', 'Bakeries', 'Indian Classical'],
    likedUser: true,
  },
  {
    id: 'coy_7',
    name: 'Tara Iyer',
    age: 20,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    bio: 'ashoka uni philosophy junior. reading arundhati roy under trees, obsessive about good benne masala dosa.',
    city: 'Sonipat / Delhi NCR',
    interests: ['Philosophy', 'Benne Dosa', 'Used Books', 'Poetry'],
    likedUser: false,
  },
  {
    id: 'coy_8',
    name: 'Arjun Singhania',
    age: 26,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'landscape architect working with native arid flora. fond of stepwells, brutalist buildings, and ramen.',
    city: 'Navrangpura, Ahmedabad',
    interests: ['Stepwells', 'Native Flora', 'Brutalism', 'Bonsai'],
    likedUser: true,
  },
  {
    id: 'coy_9',
    name: 'Zoya Merchant',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'nid ahmedabad industrial design. i craft brass lamps that look sculptural, minimal, and warm.',
    city: 'Paldi, Ahmedabad',
    interests: ['Brass Craft', 'Minimalism', 'Museums', 'Product Design'],
    likedUser: false,
  },
  {
    id: 'coy_10',
    name: 'Aditya Nair',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'marine researcher in kochi. mapping coastal coral reefs and cycling along fort kochi backwaters.',
    city: 'Fort Kochi, Kerala',
    interests: ['Marine Ecology', 'Backwaters', 'Cycling', 'Black Coffee'],
    likedUser: false,
  },
  {
    id: 'coy_11',
    name: 'Diya Banerjee',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    bio: 'jadavpur comparative literature. passionate about street photography, college street stalls, and cha.',
    city: 'College Street, Kolkata',
    interests: ['Street Photography', 'College Street', 'Poetry', 'Adda & Cha'],
    likedUser: true,
  },
  {
    id: 'coy_12',
    name: 'Vivaan Rao',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    bio: 'documentary audio producer. recording rain in the ghats and collecting 70s hindi cinema cassettes.',
    city: 'Kothrud, Pune',
    interests: ['Field Audio', 'Cassettes', 'Western Ghats', 'Masala Chai'],
    likedUser: false,
  },
  {
    id: 'coy_13',
    name: 'Ishaan Joshi',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    bio: 'nls bangalore law student. quiz bowl enthusiast, aeropress brewer, weekend runner in cubbon park.',
    city: 'Nagarbhavi, Bangalore',
    interests: ['Moot Court', 'Aeropress', 'Cubbon Park', 'Trivia'],
    likedUser: false,
  },
  {
    id: 'coy_14',
    name: 'Sanjana Pillai',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    bio: 'ceramics resident in pondicherry. pottery wheels, ocean swims at dawn, and fresh sourdough boules.',
    city: 'White Town, Pondicherry',
    interests: ['Ceramics', 'Dawn Swims', 'French Bakeries', 'Wheel Throwing'],
    likedUser: true,
  },
  {
    id: 'coy_15',
    name: 'Neil D’Souza',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&w=800&q=80',
    bio: 'cinematographer in goa. shooting 16mm beach documentaries and hunting vintage feni cocktail bars.',
    city: 'Fontainhas, Panjim',
    interests: ['Cinematography', 'Goan Cuisine', '16mm Film', 'Surfing'],
    likedUser: false,
  },
  {
    id: 'coy_16',
    name: 'Aisha Kapoor',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    bio: 'publishing assistant at an indie press. will make you cardamom chai and talk about urdu poetry.',
    city: 'Shahpur Jat, New Delhi',
    interests: ['Urdu Poetry', 'Cardamom Chai', 'Book Design', 'Flea Markets'],
    likedUser: true,
  },
  {
    id: 'coy_17',
    name: 'Tanvi Shah',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    bio: 'tiss social science student. weekend heritage walks, handloom textile archives, and ginger lemon tea.',
    city: 'Matunga, Mumbai',
    interests: ['Social Policy', 'Heritage Walks', 'Handlooms', 'Filter Coffee'],
    likedUser: false,
  },
  {
    id: 'coy_18',
    name: 'Siddharth Menon',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    bio: 'coffee roaster in chikmagalur. obsessed with washed arabica estates and rainy forest trails.',
    city: 'Chikmagalur / Bangalore',
    interests: ['Coffee Estates', 'Trekking', 'Estate Arabica', 'Birding'],
    likedUser: false,
  },
  {
    id: 'coy_19',
    name: 'Shreya Bhattacharya',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'kathak & contemporary dancer. thumris, oversized handloom kurtas, and traditional filter kaapi.',
    city: 'South Kolkata, Kolkata',
    interests: ['Kathak', 'Contemporary Dance', 'Handloom Kurtas', 'Filter Kaapi'],
    likedUser: true,
  },
  {
    id: 'coy_20',
    name: 'Farhan Qureshi',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80',
    bio: 'mechanical engineer building custom brass portafilters. old delhi food trail regular.',
    city: 'Chandni Chowk, Delhi',
    interests: ['Metal Lathes', 'Old Delhi Food', 'Espresso', 'Vintage Clocks'],
    likedUser: false,
  },
  {
    id: 'coy_21',
    name: 'Nandini Sen',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'wildlife biologist tracking leopards in the western ghats. tea estates, binoculars, and field notes.',
    city: 'Dehradun, Uttarakhand',
    interests: ['Wildlife Biology', 'Field Notes', 'Bird Watching', 'Trekking'],
    likedUser: true,
  },
  {
    id: 'coy_22',
    name: 'Aryan Saxena',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'iit bombay computer science. avid chess player, synthesizer hobbyist, fond of late night pav bhaji.',
    city: 'Powai, Mumbai',
    interests: ['Chess', 'Synthesizers', 'Pav Bhaji', 'Open Source'],
    likedUser: false,
  },
  {
    id: 'coy_23',
    name: 'Kriti Vasudevan',
    age: 20,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'iit madras humanities. sketches temple architecture in ink, drinks too much sukku malli coffee.',
    city: 'Mylapore, Chennai',
    interests: ['Ink Sketching', 'Temple Architecture', 'Filter Coffee', 'Carnatic Music'],
    likedUser: false,
  },
  {
    id: 'coy_24',
    name: 'Sameer Khan',
    age: 26,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'furniture conservator restoring colonial teakwood pieces in fort. wood shavings in every kurta.',
    city: 'Colaba, Mumbai',
    interests: ['Teak Restorations', 'Antiques', 'Colaba Cafes', 'Woodworking'],
    likedUser: true,
  },
  {
    id: 'coy_25',
    name: 'Alisha Reddy',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: 'public health fellow in hyderabad. passionate about old city heritage, biryani, and bouldering.',
    city: 'Jubilee Hills, Hyderabad',
    interests: ['Public Health', 'Old City Walks', 'Bouldering', 'Irani Chai'],
    likedUser: false,
  },
  {
    id: 'coy_26',
    name: 'Arman Malik',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'apprentice sitar maker in miraj. spending hours picking tun wood and listening to vilayat khan.',
    city: 'Deccan Gymkhana, Pune',
    interests: ['Classical Sitar', 'Lutherie', 'Acoustics', 'Kulhad Chai'],
    likedUser: false,
  },
  {
    id: 'coy_27',
    name: 'Roshni Paul',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    bio: 'risograph artist in bangalore. creating small poetry chapbooks and sipping warm sulaimani tea.',
    city: 'Cooke Town, Bangalore',
    interests: ['Risograph', 'Chapbooks', 'Sulaimani Tea', 'Indie Comics'],
    likedUser: true,
  },
  {
    id: 'coy_28',
    name: 'Varun Nair',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'sustainable agriculture researcher. soil microbiology, sourdough, and rainy cycling tours.',
    city: 'Wayanad, Kerala',
    interests: ['Soil Science', 'Fermentation', 'Monsoon Cycling', 'Spice Farms'],
    likedUser: false,
  },
  {
    id: 'coy_29',
    name: 'Mahira Chawla',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'vintage jewellery archivist in jaipur. jadau craftsmanship, block printing, and spiced kulhad chai.',
    city: 'C-Scheme, Jaipur',
    interests: ['Jadau Jewellery', 'Block Printing', 'Kulhad Chai', 'Haveli Tours'],
    likedUser: false,
  },
  {
    id: 'coy_30',
    name: 'Nikhil Mathur',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'documentary editor in andheri. loves satyajit ray films and knows every midnight sandwich stall.',
    city: 'Andheri West, Mumbai',
    interests: ['Cinema Editing', 'Midnight Stalls', 'Satyajit Ray', 'Filter Kaapi'],
    likedUser: false,
  },
  {
    id: 'coy_31',
    name: 'Lavanya Sundaram',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    bio: 'carnatic violinist & cognitive acoustics researcher. passionate about raga geometry and spicy rasam.',
    city: 'Besant Nagar, Chennai',
    interests: ['Carnatic Violin', 'Acoustics', 'Beach Walks', 'Filter Coffee'],
    likedUser: true,
  },
  {
    id: 'coy_32',
    name: 'Tenzin Norbu',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'tibetan thangka painter & mountaineer. natural mineral pigments, quiet meditation, and butter tea.',
    city: 'McLeod Ganj, Dharamshala',
    interests: ['Thangka Art', 'Mineral Pigments', 'Trekking', 'Butter Tea'],
    likedUser: false,
  },
];

export function seed(): void {
  const db = getDb();

  console.log('🌱 Seeding Coy database with authentic Indian profiles...');

  const transaction = db.transaction(() => {
    // Clear existing data for fresh seed
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM swipes').run();
    db.prepare('DELETE FROM profiles').run();
    db.prepare('DELETE FROM user_account').run();

    // Insert logged-in user "me" (Arjun Mehta, 23, Bangalore)
    db.prepare(`
      INSERT INTO user_account (id, name, age, photo, bio, city)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'me',
      'Arjun Mehta',
      23,
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'industrial design student & 35mm film photographer. usually at church street bookstores or brewing pour-over.',
      'Indiranagar, Bangalore'
    );

    // Insert mock profiles
    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, name, age, photo, bio, city, interests, liked_user, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let likedCount = 0;
    const now = new Date().toISOString();

    for (const p of mockIndianProfiles) {
      if (p.likedUser) likedCount++;
      insertProfile.run(
        p.id,
        p.name,
        p.age,
        p.photo,
        p.bio,
        p.city,
        JSON.stringify(p.interests),
        p.likedUser ? 1 : 0,
        now
      );
    }

    console.log(`✓ Inserted ${mockIndianProfiles.length} Indian profiles (${likedCount} marked as already liked user)`);
    console.log(`✓ Inserted user "me" profile (Arjun Mehta, Indiranagar, Bangalore)`);
  });

  transaction();
  console.log('✨ Seed complete. Ready for Indian aesthetic demo.');
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seed();
}

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

const mockProfiles: SeedProfile[] = [
  {
    id: 'coy_1',
    name: 'Maya Lin',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'cooper union architecture. mostly wandering lower manhattan searching for warm cardamom buns.',
    city: 'Lower East Side, NY',
    interests: ['Architecture', 'Film 35mm', 'Cardamom Buns', 'Ceramics'],
    likedUser: true,
  },
  {
    id: 'coy_2',
    name: 'Lucas Vance',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'lighting designer for indie theatre. spending sundays hunting 70s soul vinyl and good espresso.',
    city: 'Greenpoint, Brooklyn',
    interests: ['Stage Lighting', 'Vinyl Records', 'Espresso', 'Darkrooms'],
    likedUser: false,
  },
  {
    id: 'coy_3',
    name: 'Nina Chen',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'fine arts junior. printmaking by day, film developing at 2am. lets swap reading recommendations.',
    city: 'Providence, RI',
    interests: ['Printmaking', 'Risograph', 'Art History', 'Tea'],
    likedUser: true,
  },
  {
    id: 'coy_4',
    name: 'Samuel Osei',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'documentary audio producer. obsessive about natural reverb, self-published zines, and bodega cats.',
    city: 'Crown Heights, Brooklyn',
    interests: ['Audio Fieldwork', 'Modular Synthesizers', 'Bouldering'],
    likedUser: false,
  },
  {
    id: 'coy_5',
    name: 'Priya Sharma',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: 'urban planner thinking about pocket parks and bike lanes. usually found with an iced oat cortado.',
    city: 'Cambridge, MA',
    interests: ['Urbanism', 'Cycling', 'Specialty Coffee', 'Architecture'],
    likedUser: true,
  },
  {
    id: 'coy_6',
    name: 'Mateo Cruz',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'culinary school grad doing pastry at a quiet bakery in soho. amateur analog synth tinkerer.',
    city: 'SoHo, NY',
    interests: ['Laminated Pastry', 'Analog Audio', 'Night Biking'],
    likedUser: true,
  },
  {
    id: 'coy_7',
    name: 'Chloe Bennett',
    age: 20,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    bio: 'nyu comparative lit. reading joan didion in washington square, big fan of rainy afternoon walks.',
    city: 'Greenwich Village, NY',
    interests: ['Literature', 'Used Bookstores', 'Film Photography', 'Jazz'],
    likedUser: false,
  },
  {
    id: 'coy_8',
    name: 'Elena Rostova',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'industrial design student. i make wooden chairs that look uncomfortable but are surprisingly cozy.',
    city: 'Clinton Hill, Brooklyn',
    interests: ['Woodworking', 'Minimalism', 'Museums', 'Drafting'],
    likedUser: false,
  },
  {
    id: 'coy_9',
    name: 'David Kim',
    age: 26,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'landscape architect. obsessed with native moss, brutalist buildings, and late night spicy ramen.',
    city: 'Long Island City, NY',
    interests: ['Landscape Design', 'Brutalism', 'Ramen', 'Botanical Gardens'],
    likedUser: true,
  },
  {
    id: 'coy_10',
    name: 'Zoe Moreau',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    bio: 'art history sophomore. spending an ungodly amount of time in museum archives and charcoal sketching.',
    city: 'Upper West Side, NY',
    interests: ['Archival Research', 'Charcoal Drawing', 'Cinema', 'Espresso'],
    likedUser: false,
  },
  {
    id: 'coy_11',
    name: 'Tariq Al-Mansoor',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'mechanical engineering grad. building a custom dual-boiler espresso machine from salvage parts.',
    city: 'New Haven, CT',
    interests: ['Machining', 'Coffee Roasting', 'Vintage Watches'],
    likedUser: false,
  },
  {
    id: 'coy_12',
    name: 'Ingrid Lindholm',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    bio: 'sustainable textiles apprentice. obsessed with natural indigo dye, wool weaving, and quiet fika.',
    city: 'Portland, ME',
    interests: ['Textiles', 'Indigo Dyeing', 'Nordic Design', 'Ceramics'],
    likedUser: true,
  },
  {
    id: 'coy_13',
    name: 'Aaron Weiss',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    bio: 'freelance documentary editor. i know every late night diner within a four-mile radius.',
    city: 'Ridgewood, Queens',
    interests: ['Film Editing', 'Late Night Diners', 'Acoustic Guitar'],
    likedUser: false,
  },
  {
    id: 'coy_14',
    name: 'Camille Dupont',
    age: 20,
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    bio: 'columbia journalism. collecting vintage postcards and interviewing subway accordion players.',
    city: 'Morningside Heights, NY',
    interests: ['Journalism', 'French Cinema', 'Vintage Postcards'],
    likedUser: true,
  },
  {
    id: 'coy_15',
    name: 'Marcus Hayes',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    bio: 'runner and ceramicist. working on a series of terracotta mugs that always sell out at markets.',
    city: 'Bed-Stuy, Brooklyn',
    interests: ['Half Marathons', 'Wheel Throwing', 'Specialty Coffee'],
    likedUser: false,
  },
  {
    id: 'coy_16',
    name: 'Hannah Stern',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'publishing assistant by day, sourdough obsessive by weekend. will cook you soup when tired.',
    city: 'Cobble Hill, Brooklyn',
    interests: ['Book Publishing', 'Wild Fermentation', 'Flea Markets'],
    likedUser: true,
  },
  {
    id: 'coy_17',
    name: 'Felix Meyer',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&w=800&q=80',
    bio: 'coffee roaster and botanical illustrator. i can identify northeastern trees from their bark alone.',
    city: 'Hudson Valley, NY',
    interests: ['Botanical Art', 'Single Origin Coffee', 'Hiking'],
    likedUser: false,
  },
  {
    id: 'coy_18',
    name: 'Aaliyah Jackson',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    bio: 'dance student at juilliard. contemporary improv, thrifted wool sweaters, and black drip coffee.',
    city: 'Harlem, NY',
    interests: ['Contemporary Dance', 'Thrifting', 'Dark Roast', 'Poetry'],
    likedUser: false,
  },
  {
    id: 'coy_19',
    name: 'Leo Tanaka',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    bio: 'studying acoustic ecology. recording ambient rainfall and attempting to master hand-pulled noodles.',
    city: 'East Williamsburg, NY',
    interests: ['Field Recording', 'Handmade Noodles', 'Ambient Music'],
    likedUser: true,
  },
  {
    id: 'coy_20',
    name: 'Claire Dupont',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'botany student. my apartment has 36 houseplants and counting. always happy to trade cuttings.',
    city: 'Park Slope, Brooklyn',
    interests: ['Horticulture', 'Greenhouses', 'Herbology', 'Cycling'],
    likedUser: false,
  },
  {
    id: 'coy_21',
    name: 'Dev Patel',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80',
    bio: 'finishing a thesis on modernist book design. highly passionate about heavy cotton paper stocks.',
    city: 'Somerville, MA',
    interests: ['Typography', 'Book Binding', 'Film Stills', 'Pour-Over'],
    likedUser: false,
  },
  {
    id: 'coy_22',
    name: 'Sophie Laurent',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'vintage fashion archivist. hunting 90s wool coats and drinking herbal chamomile tea at 1am.',
    city: 'East Village, NY',
    interests: ['Vintage Archives', 'Textile History', 'Herbalism'],
    likedUser: true,
  },
  {
    id: 'coy_23',
    name: 'Kai Takahashi',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'industrial designer. sketches in ballpoint pen only. perpetually on the hunt for bitter matcha.',
    city: 'Williamsburg, NY',
    interests: ['Product Design', 'Uji Matcha', 'Fixed Gear Bikes'],
    likedUser: false,
  },
  {
    id: 'coy_24',
    name: 'Mia Rossi',
    age: 20,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'creative writing major. scribbling poems on cafe napkins and listening to bill evans on repeat.',
    city: 'Ithaca, NY',
    interests: ['Poetry', 'Jazz Piano', 'Cold Brew', 'Stationery'],
    likedUser: false,
  },
  {
    id: 'coy_25',
    name: 'Rowan Thorne',
    age: 26,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'furniture conservator. wood shavings in every jacket pocket. obsessed with clean shaker joinery.',
    city: 'Hudson, NY',
    interests: ['Furniture Restoration', 'Hand Tools', 'Cast Iron'],
    likedUser: true,
  },
  {
    id: 'coy_26',
    name: 'Nadia Hassan',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: 'public health researcher. enthusiastic about bouldering, union square greenmarket, and chai.',
    city: 'Union Square, NY',
    interests: ['Public Health', 'Bouldering', 'Farmer Markets', 'Cardamom'],
    likedUser: false,
  },
  {
    id: 'coy_27',
    name: 'Oscar Zhang',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'computational linguistics. tournament chess player, mediocre bassist, avid secondhand reader.',
    city: 'Cambridge, MA',
    interests: ['Chess', 'Linguistics', 'Electric Bass', 'Paperbacks'],
    likedUser: false,
  },
  {
    id: 'coy_28',
    name: 'Leila Morin',
    age: 21,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    bio: 'risograph printer and illustrator. making small folded art books and drinking black filter coffee.',
    city: 'DUMBO, Brooklyn',
    interests: ['Risograph Printing', 'Zines', 'Bookbinding'],
    likedUser: false,
  },
  {
    id: 'coy_29',
    name: 'Gabriel Silva',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'cinematographer. chasing magic hour light with a 16mm bolex. lets go get late night tacos.',
    city: 'Bushwick, Brooklyn',
    interests: ['16mm Bolex', 'Color Grading', 'Mexican Food'],
    likedUser: false,
  },
  {
    id: 'coy_30',
    name: 'Tessa Ward',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'marine biology grad. fascinated by bioluminescent algae and chilly early morning ocean swims.',
    city: 'Woods Hole, MA',
    interests: ['Marine Ecology', 'Ocean Swimming', 'Scientific Drawing'],
    likedUser: true,
  },
  {
    id: 'coy_31',
    name: 'Ethan Morales',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'apprentice luthier. restoring acoustic guitars and spending way too much time in record crates.',
    city: 'Astoria, Queens',
    interests: ['Acoustic Guitars', 'Lutherie', 'Folk Records'],
    likedUser: false,
  },
  {
    id: 'coy_32',
    name: 'Sasha Vane',
    age: 22,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    bio: 'neurolinguistics senior. competitive pub trivia, dark chocolate, and long walks across bridges.',
    city: 'Prospect Heights, Brooklyn',
    interests: ['Cognitive Science', 'Pub Trivia', 'Urban Walking'],
    likedUser: false,
  },
];

export function seed(): void {
  const db = getDb();

  console.log('🌱 Seeding Coy database...');

  const transaction = db.transaction(() => {
    // Clear existing data for fresh seed
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM swipes').run();
    db.prepare('DELETE FROM profiles').run();
    db.prepare('DELETE FROM user_account').run();

    // Insert logged-in user "me"
    db.prepare(`
      INSERT INTO user_account (id, name, age, photo, bio, city)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'me',
      'Julian Bell',
      23,
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'design student & analog photographer. usually reading essays and searching for good espresso.',
      'Brooklyn, NY'
    );

    // Insert mock profiles
    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, name, age, photo, bio, city, interests, liked_user, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let likedCount = 0;
    const now = new Date().toISOString();

    for (const p of mockProfiles) {
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

    console.log(`✓ Inserted ${mockProfiles.length} profiles (${likedCount} marked as already liked user)`);
    console.log(`✓ Inserted user "me" profile`);
  });

  transaction();
  console.log('✨ Seed complete. Ready for demo.');
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seed();
}

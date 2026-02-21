/**
 * Database Seeding Script
 *
 * This script wipes the database and fills it with fresh data for testing.
 * IMPORTANT: These accounts are for DEMO and TESTING purposes only.
 *
 * It creates:
 * - 3 Demo accounts (Demo, Alice, Bob) which have pre-set passwords.
 * - 100 random profiles with locations in New York to test the feed.
 * - Initial matches and messages for the Demo user so you can test the chat right away.
 */
import * as argon2 from 'argon2';

if (process.env.DATABASE_URL?.includes('${')) {
  process.env.DATABASE_URL = `postgres://${process.env.POSTGRES_USER || 'app'}:${process.env.POSTGRES_PASSWORD || ''}@localhost:${process.env.DB_PORT || '5430'}/${process.env.POSTGRES_DB || 'app'}`;
}

const sql = Bun.sql;

async function seed() {
  console.log('Starting seed...');

  // 1. CLEAN SLATE
  await sql`TRUNCATE TABLE USERS, INTERESTS, PHOTOS, SWIPES, MESSAGES, REPORTS, BLOCKS, LOGINS CASCADE`;

  // 2. INTERESTS
  const interestList = [
    'Anime',
    'Thrifting',
    'Gaming',
    'K-Pop',
    'Streetwear',
    'Mental Health',
    'Sustainability',
    'Coding',
    'Photography',
    'Skateboarding',
    'Vinyl Records',
    'Astrology',
    'Web3',
    'Climate Action',
    'Concerts',
    'Hiking',
    'Yoga',
    'Art',
    'Coffee',
    'Travel',
    'Baking',
    'Podcasts',
    'TikTok',
    'Memes',
    'Dogs',
    'Cats',
  ];

  for (const name of interestList) {
    await sql`INSERT INTO INTERESTS (INTEREST_NAME, IS_APPROVED) VALUES (${name}, TRUE) ON CONFLICT (INTEREST_NAME) DO UPDATE SET IS_APPROVED = TRUE`;
  }
  const allInterests = await sql`SELECT INTEREST_ID FROM INTERESTS`;

  // 3. GENERATE HERO USERS
  const hashedPw = await argon2.hash('123456');
  const heroUsers = [
    {
      email: 'demo@example.com',
      name: 'Demo User',
      gender: 'male',
      orient: 'straight',
      pref: '{female}',
      lat: 40.7128,
      long: -74.006,
    },
    {
      email: 'alice@example.com',
      name: 'Alice Smith',
      gender: 'female',
      orient: 'straight',
      pref: '{male}',
      lat: 40.7128,
      long: -74.006,
    },
    {
      email: 'bob@example.com',
      name: 'Bob Jones',
      gender: 'male',
      orient: 'straight',
      pref: '{female}',
      lat: 40.73,
      long: -73.99,
    },
  ];

  for (const u of heroUsers) {
    const [user] = await sql`
      INSERT INTO USERS (
        EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, 
        LATITUDE, LONGITUDE, PREF_GENDERS, IS_ONBOARDED, PREF_DISTANCE_RADIUS_KM, IS_ACTIVE
      )
      VALUES (
        ${u.email}, ${hashedPw}, ${u.name}, ${u.gender}::T_GENDER, ${u.orient}::T_ORIENTATION, 
        '1995-01-01', 'Demo user for LoveFinder. Swiping, matching, and chatting!', 
        ${u.lat}, ${u.long}, ${u.pref}::T_GENDER[], TRUE, 100, TRUE
      )
      RETURNING USER_ID
    `;

    // Add Photo for Hero
    await sql`
      INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY) 
      VALUES (${user.user_id}, ${`https://picsum.photos/seed/${u.email}/600/800`}, TRUE)
    `;

    // Add 5 random interests
    const shuffled = [...allInterests].sort(() => 0.5 - Math.random());
    for (const int of shuffled.slice(0, 5)) {
      await sql`INSERT INTO USER_INTERESTS (USER_ID, INTEREST_ID) VALUES (${user.user_id}, ${int.interest_id})`;
    }
  }

  // 4. BULK GENERATE 200 USERS
  console.log('👥 Generating 200 bulk users...');
  const genders = ['male', 'female', 'nonbinary'];
  const orients = [
    'straight',
    'straight',
    'bisexual',
    'pansexual',
    'bisexual',
    'pansexual',
  ]; // Weighted towards multi-gender attraction for better feed density

  for (let i = 1; i <= 200; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const orient = orients[Math.floor(Math.random() * orients.length)];
    // Keep them closer to New York center to ensure they are within range
    const lat = 40.7128 + (Math.random() * 0.1 - 0.05);
    const long = -74.006 + (Math.random() * 0.1 - 0.05);

    let pref = '{male,female,nonbinary}';
    if (orient === 'straight') pref = gender === 'male' ? '{female}' : '{male}';

    const [user] = await sql`
      INSERT INTO USERS (
        EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, 
        LATITUDE, LONGITUDE, PREF_GENDERS, IS_ONBOARDED, ALLOW_MESSAGES_FROM_STRANGERS,
        PREF_DISTANCE_RADIUS_KM, PREF_MIN_AGE, PREF_MAX_AGE, IS_ACTIVE
      )
      VALUES (
        ${`user${i}@test.com`}, ${hashedPw}, ${`User ${i}`}, ${gender}::T_GENDER, 
        ${orient}::T_ORIENTATION, '1998-05-20', 'Looking for someone special!', ${lat}, ${long}, ${pref}::T_GENDER[], TRUE,
        ${i % 5 === 0}, 200, 18, 100, TRUE
      ) RETURNING USER_ID
    `;

    const shuffled = [...allInterests].sort(() => 0.5 - Math.random());
    for (const int of shuffled.slice(0, 4)) {
      await sql`INSERT INTO USER_INTERESTS (USER_ID, INTEREST_ID) VALUES (${user.user_id}, ${int.interest_id})`;
    }

    await sql`
      INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY) 
      VALUES (${user.user_id}, ${`https://picsum.photos/seed/user${i}/600/800`}, TRUE)
    `;
  }

  // 5. GENERATE SWIPES & MATCHES for Demo User
  console.log('🔥 Populating Demo User data...');
  const demoId = (
    await sql`SELECT USER_ID FROM USERS WHERE EMAIL = 'demo@example.com'`
  )[0].user_id;
  const aliceId = (
    await sql`SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'`
  )[0].user_id;
  const bobId = (
    await sql`SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'`
  )[0].user_id;

  // Ensure Demo User has broad preferences to see everyone
  await sql`UPDATE USERS SET PREF_GENDERS = '{male,female,nonbinary}', PREF_DISTANCE_RADIUS_KM = 500 WHERE USER_ID = ${demoId}`;

  // Make Alice and Bob match with Demo
  await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${aliceId}, 'like'), (${aliceId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${bobId}, 'like'), (${bobId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;

  await sql`INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT) VALUES (${aliceId}, ${demoId}, 'Hey! I am Alice. How is it going?')`;
  await sql`INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT) VALUES (${bobId}, ${demoId}, 'Yo! Nice profile.')`;

  // Get a pool of users to interact with
  const pool = await sql`SELECT USER_ID FROM USERS WHERE EMAIL NOT IN ('demo@example.com', 'alice@example.com', 'bob@example.com') LIMIT 100`;

  for (let i = 0; i < pool.length; i++) {
    const otherId = pool[i].user_id;
    if (i < 20) {
      // 20 Matches (Mutual likes)
      await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${otherId}, 'like'), (${otherId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;
      if (i % 3 === 0) {
        await sql`INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT) VALUES (${otherId}, ${demoId}, 'Hey there! We matched!')`;
      }
    } else if (i < 40) {
      // 20 Incoming Likes (They liked you)
      await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${otherId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;
    } else if (i < 60) {
      // 20 Outgoing Likes (You liked them)
      await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${otherId}, 'like') ON CONFLICT DO NOTHING`;
    }
    // The rest (40-100) will be "new" and appear in the feed
  }

  // Add a user with onboarding left
  await sql`
    INSERT INTO USERS ( EMAIL, PASSWORD_HASH)
    VALUES ( 'pending@example.com', ${hashedPw} )
  `;

  console.log('✅ Seed complete!');
  console.log('Demo Login: demo@example.com / 123456');
  console.log('Alice Login: alice@example.com / 123456');
  console.log('Bob Login: bob@example.com / 123456');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

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

// Manually interpolate DATABASE_URL if it's a template (Bun's --env-file doesn't do it)
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
        LATITUDE, LONGITUDE, PREF_GENDERS, IS_ONBOARDED, PREF_DISTANCE_RADIUS_KM
      )
      VALUES (
        ${u.email}, ${hashedPw}, ${u.name}, ${u.gender}::T_GENDER, ${u.orient}::T_ORIENTATION, 
        '1995-01-01', 'Demo user for LoveFinder. Swiping, matching, and chatting!', 
        ${u.lat}, ${u.long}, ${u.pref}::T_GENDER[], TRUE, 100
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

  // 4. BULK GENERATE 100 USERS
  console.log('👥 Generating bulk users...');
  const genders = ['male', 'female', 'nonbinary'];
  const orients = ['straight', 'gay', 'bisexual', 'pansexual'];

  for (let i = 1; i <= 100; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const orient = orients[Math.floor(Math.random() * orients.length)];
    const lat = 40.7 + (Math.random() * 0.2 - 0.1);
    const long = -74.0 + (Math.random() * 0.2 - 0.1);

    let pref = '{male,female,nonbinary}';
    if (orient === 'straight') pref = gender === 'male' ? '{female}' : '{male}';

    const [user] = await sql`
      INSERT INTO USERS (EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, LATITUDE, LONGITUDE, PREF_GENDERS, IS_ONBOARDED, ALLOW_MESSAGES_FROM_STRANGERS)
      VALUES (
        ${`user${i}@test.com`}, ${hashedPw}, ${`User ${i}`}, ${gender}::T_GENDER, 
        ${orient}::T_ORIENTATION, '1998-05-20', 'Looking for someone special!', ${lat}, ${long}, ${pref}::T_GENDER[], TRUE,
        ${i % 10 === 0}
      ) RETURNING USER_ID
    `;

    const shuffled = [...allInterests].sort(() => 0.5 - Math.random());
    for (const int of shuffled.slice(0, 3)) {
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

  // Make Alice and Bob match with Demo
  await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${aliceId}, 'like'), (${aliceId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${bobId}, 'like'), (${bobId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;

  await sql`INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT) VALUES (${aliceId}, ${demoId}, 'Hey! I am Alice. How is it going?')`;
  await sql`INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT) VALUES (${bobId}, ${demoId}, 'Yo! Nice profile.')`;

  const females =
    await sql`SELECT USER_ID FROM USERS WHERE GENDER = 'female' AND EMAIL NOT IN ('demo@example.com', 'alice@example.com') LIMIT 30`;

  for (let i = 0; i < females.length; i++) {
    const otherId = females[i].user_id;
    if (i < 5) {
      // "Both Liked" (Match)
      await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${otherId}, 'like'), (${otherId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;

      // Add a message
      await sql`
        INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT)
        VALUES (${otherId}, ${demoId}, 'Hey! I saw your profile and loved it.')
      `;
    } else if (i < 10) {
      // "You Liked"
      await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${demoId}, ${otherId}, 'like') ON CONFLICT DO NOTHING`;
    } else if (i < 15) {
      // "They Liked"
      await sql`INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES (${otherId}, ${demoId}, 'like') ON CONFLICT DO NOTHING`;
    }
  }

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

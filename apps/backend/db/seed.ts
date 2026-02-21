import * as argon2 from 'argon2';

const sql = Bun.sql;

async function seed() {
  console.log('Starting seed...');

  // 1. CLEAN SLATE
  await sql`TRUNCATE TABLE USERS, INTERESTS, PHOTOS, SWIPES, MESSAGES, REPORTS, BLOCKS, LOGINS CASCADE`;

  // 2. INTERESTS
  const interestList = [
    'Hiking',
    'Photography',
    'Coding',
    'Coffee',
    'Travel',
    'Yoga',
    'Gaming',
    'Cooking',
    'Music',
    'Art',
    'Surfing',
    'Politics',
    'Reading',
    'Dancing',
    'Wine',
    'Dogs',
    'Cats',
    'Fitness',
    'Fashion',
    'Movies',
    'Netflix',
    'Tattoos',
    'Spirituality',
    'Board Games',
    'Sushi',
  ];

  for (const name of interestList) {
    await sql`INSERT INTO INTERESTS (INTEREST_NAME) VALUES (${name}) ON CONFLICT DO NOTHING`;
  }
  const allInterests = await sql`SELECT INTEREST_ID FROM INTERESTS`;

  // 3. GENERATE HERO USERS
  const hashedPw = await argon2.hash('password123');
  const heroUsers = [
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
    {
      email: 'charlie@example.com',
      name: 'Charlie Day',
      gender: 'nonbinary',
      orient: 'pansexual',
      pref: '{male,female,nonbinary}',
      lat: 40.75,
      long: -73.98,
    },
  ];

  for (const u of heroUsers) {
    await sql`
      INSERT INTO USERS (EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, LATITUDE, LONGITUDE, PREF_GENDERS, IS_ONBOARDED)
      VALUES (${u.email}, ${hashedPw}, ${u.name}, ${u.gender}::T_GENDER, ${u.orient}::T_ORIENTATION, '1995-01-01', 'Hero user bio', ${u.lat}, ${u.long}, ${u.pref}::T_GENDER[], TRUE)
    `;
  }

  // 4. BULK GENERATE 100 USERS (Keep it fast for demo)
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
      INSERT INTO USERS (EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, LATITUDE, LONGITUDE, PREF_GENDERS, IS_ONBOARDED)
      VALUES (
        ${`user${i}@test.com`}, ${hashedPw}, ${`User ${i}`}, ${gender}::T_GENDER, 
        ${orient}::T_ORIENTATION, '1998-05-20', 'Bulk generated bio', ${lat}, ${long}, ${pref}::T_GENDER[], TRUE
      ) RETURNING USER_ID
    `;

    // Add 3 random interests
    const shuffled = [...allInterests].sort(() => 0.5 - Math.random());
    for (const int of shuffled.slice(0, 3)) {
      await sql`INSERT INTO USER_INTERESTS (USER_ID, INTEREST_ID) VALUES (${user.user_id}, ${int.interest_id})`;
    }

    // Add Photo
    await sql`
      INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY) 
      VALUES (${user.user_id}, ${`https://picsum.photos/seed/${user.user_id}/600/800`}, TRUE)
    `;
  }

  // 5. GENERATE SWIPES & MATCHES
  console.log('🔥 Generating swipes and matches...');
  const users = await sql`SELECT USER_ID FROM USERS LIMIT 50`;

  for (const me of users) {
    const others =
      await sql`SELECT USER_ID FROM USERS WHERE USER_ID != ${me.user_id} ORDER BY RANDOM() LIMIT 10`;
    for (const other of others) {
      const type = Math.random() > 0.3 ? 'like' : 'dislike';
      await sql`
        INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) 
        VALUES (${me.user_id}, ${other.user_id}, ${type}::T_SWIPE_TYPE)
        ON CONFLICT DO NOTHING
      `;

      // Force a match 40% of the time if it was a like
      if (type === 'like' && Math.random() > 0.6) {
        await sql`
          INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) 
          VALUES (${other.user_id}, ${me.user_id}, 'like'::T_SWIPE_TYPE)
          ON CONFLICT DO NOTHING
        `;

        // Add a message for the match
        await sql`
          INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MESSAGE_CONTENT) 
          VALUES (${me.user_id}, ${other.user_id}, 'Hey! We matched on the seed script!')
        `;
      }
    }
  }

  console.log('✅ Seed complete! Log in with alice@example.com / password123');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

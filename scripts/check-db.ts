
const sql = Bun.sql;

async function check() {
    const usersCount = await sql`SELECT COUNT(*) FROM users`;
    console.log('Total Users:', usersCount[0].count);

    const alice = await sql`SELECT user_id, email, gender, pref_genders, pref_distance_radius_km, latitude, longitude FROM users WHERE email='alice@example.com'`;
    console.log('Alice:', JSON.stringify(alice[0], null, 2));

    if (alice[0]) {
        const swiped = await sql`SELECT COUNT(*) FROM swipes WHERE swiper_id = ${alice[0].user_id}`;
        console.log('Swipes by Alice:', swiped[0].count);

        const matchableCount = await sql`
        SELECT COUNT(*) FROM users other
        WHERE other.user_id <> ${alice[0].user_id}
          AND other.gender = ANY(${alice[0].pref_genders})
    `;
        console.log('Potential Matches for Alice (Gender filter only):', matchableCount[0].count);

        const others = await sql`
        SELECT 
            u.user_id, 
            u.full_name, 
            u.gender,
            u.latitude,
            u.longitude,
            earth_distance(
              ll_to_earth(u.latitude, u.longitude),
              ll_to_earth(${alice[0].latitude}, ${alice[0].longitude})
            ) / 1000 as dist
        FROM users u
        WHERE u.user_id <> ${alice[0].user_id}
          AND u.is_onboarded = true
          AND u.is_active = true
    `;
        console.log('\nSample of others and distances:');
        others.slice(0, 5).forEach(o => console.log(` - ${o.full_name}: ${o.gender}, dist: ${o.dist ? o.dist.toFixed(2) : 'null'}km` || 'null'));

        const filtered = others.filter(o =>
            o.dist <= alice[0].pref_distance_radius_km &&
            alice[0].pref_genders.split(',').map(s => s.replace(/[{}]/g, '')).includes(o.gender)
        );
        console.log('\nFiltered users (JS logic):', filtered.length);

        if (filtered.length > 0) {
            console.log('First matchable user:', filtered[0].full_name);
        }
    }
}

check().catch(console.error).finally(() => process.exit());

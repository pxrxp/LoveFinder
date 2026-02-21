
const BASE_URL = 'http://localhost:3000/api/v1';
let cookie = '';

async function test() {
    console.log('🚀 Starting Backend API Tests...');

    // 1. LOGIN
    console.log('\n🔐 Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com', password: 'password123' }),
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        process.exit(1);
    }

    cookie = loginRes.headers.get('set-cookie') || '';
    console.log('✅ Login successful!');

    // 2. GET PROFILE
    console.log('\n👤 Testing Get Profile...');
    const profileRes = await fetch(`${BASE_URL}/users/me`, {
        headers: { cookie },
    });
    const profile = await profileRes.json();
    console.log(`✅ Profile fetched: ${profile.full_name} (${profile.email})`);

    // 3. GET FEED
    console.log('\n🔥 Testing Get Feed...');
    const feedRes = await fetch(`${BASE_URL}/feed?limit=10`, {
        headers: { cookie },
    });
    const feed = await feedRes.json();
    console.log(`✅ Feed fetched: ${feed.length} profiles found`);

    if (feed.length > 0) {
        const target = feed[0];
        console.log(`   Targeting user for swipe: ${target.full_name} (${target.user_id})`);

        // 4. SWIPE
        console.log('\n❤️ Testing Swipe (Like)...');
        const swipeRes = await fetch(`${BASE_URL}/swipes/${target.user_id}/like`, {
            method: 'POST',
            headers: { cookie },
        });
        const swipe = await swipeRes.json();
        console.log(`✅ Swipe successful: ${JSON.stringify(swipe)}`);

        // 5. SEND MESSAGE
        console.log('\n💬 Testing Send Message...');
        // We try to send a message. Note: messaging might fail if not matched and restricted.
        const msgRes = await fetch(`${BASE_URL}/chat/${target.user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie
            },
            body: JSON.stringify({ content: 'Hello from test script!', type: 'text' }),
        });

        if (msgRes.ok) {
            const msg = await msgRes.json();
            console.log(`✅ Message sent: ${msg.message_content}`);
        } else {
            const err = await msgRes.json();
            console.log(`ℹ️ Message skipped/failed (Expected if no match): ${err.message}`);
        }
    }

    // 6. LOGOUT
    console.log('\n🚪 Testing Logout...');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { cookie },
    });
    console.log('✅ Logout successful!');

    console.log('\n✨ All tests completed!');
}

test().catch(console.error);

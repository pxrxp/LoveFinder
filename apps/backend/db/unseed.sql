/**
 * Database Unseeding Script
 *
 * This script deletes all demo and bulk test users created by the seeding script.
 * It will remove:
 * - Demo accounts: demo, Alice, Bob, pending
 * - Bulk users: user1@test.com → user200@test.com
 */
if (process.env.DATABASE_URL?.includes('${')) {
  process.env.DATABASE_URL = `postgres://${process.env.POSTGRES_USER || 'app'}:${process.env.POSTGRES_PASSWORD || ''}@localhost:${process.env.DB_PORT || '5430'}/${process.env.POSTGRES_DB || 'app'}`;
}

const sql = Bun.sql;

async function unseed() {
  console.log('Starting unseed...');

  // List of demo emails
  const demoEmails = ['demo@example.com', 'alice@example.com', 'bob@example.com', 'pending@example.com'];

  // Bulk user emails
  for (let i = 1; i <= 200; i++) {
    demoEmails.push(`user${i}@test.com`);
  }

  // Fetch user IDs to delete
  const usersToDelete = await sql`
    SELECT USER_ID FROM USERS WHERE EMAIL IN (${sql.join(demoEmails, ',')})
  `;

  if (usersToDelete.length === 0) {
    console.log('No users found to delete.');
    process.exit(0);
  }

  const userIds = usersToDelete.map(u => u.user_id);

  console.log(`Deleting ${userIds.length} users...`);

  // Delete all related data first if CASCADE is not enabled
  await sql`
    DELETE FROM PHOTOS WHERE UPLOADER_ID IN (${sql.join(userIds, ',')})
  `;
  await sql`
    DELETE FROM USER_INTERESTS WHERE USER_ID IN (${sql.join(userIds, ',')})
  `;
  await sql`
    DELETE FROM SWIPES WHERE SWIPER_ID IN (${sql.join(userIds, ',')}) OR RECEIVER_ID IN (${sql.join(userIds, ',')})
  `;
  await sql`
    DELETE FROM MESSAGES WHERE SENDER_ID IN (${sql.join(userIds, ',')}) OR RECEIVER_ID IN (${sql.join(userIds, ',')})
  `;

  // Finally delete users
  await sql`
    DELETE FROM USERS WHERE USER_ID IN (${sql.join(userIds, ',')})
  `;

  console.log('✅ Unseed complete!');
  process.exit(0);
}

unseed().catch((e) => {
  console.error(e);
  process.exit(1);
});

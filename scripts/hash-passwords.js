const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function generateUserHashes() {
  const users = [
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'frontdesk', password: 'frontdeskpassword', role: 'frontdesk' },
    { username: 'housekeeper', password: 'housekeeperpassword', role: 'housekeeping' },
    { username: 'maintenance', password: 'maintenancepassword', role: 'maintenance' }
  ];

  console.log('Please copy the following JSON content into app/data/users.json:');
  const usersWithHashes = [];
  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    usersWithHashes.push({
      id: usersWithHashes.length + 1,
      username: user.username,
      password: hashedPassword,
      role: user.role
    });
  }
  console.log(JSON.stringify(usersWithHashes, null, 2));
}

generateUserHashes();
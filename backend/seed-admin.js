require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./src/config/db');
const User = require('./src/models/User');

(async () => {
  await sequelize.sync();
  const passwordHash = await bcrypt.hash('changeme123', 10);
  const [user, created] = await User.findOrCreate({
    where: { email: 'derek@aadesigns.com' },
    defaults: { passwordHash, name: 'Derek' },
  });
  console.log(created ? 'Admin user created' : 'Admin user already exists');
  process.exit(0);
})();
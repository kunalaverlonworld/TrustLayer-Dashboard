const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://yamank_db_user:pIT64itUbsmofps6@offerghst-db.ih3a5dj.mongodb.net/trustlayer?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const users = await User.find({});
  console.log('Total Users:', users.length);
  for (const u of users) {
    console.log(`- Email: "${u.email}", Name: "${u.name}", CompanyId: "${u.companyId}"`);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);

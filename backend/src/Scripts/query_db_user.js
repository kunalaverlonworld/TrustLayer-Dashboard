const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://yamank_db_user:pIT64itUbsmofps6@offerghst-db.ih3a5dj.mongodb.net/trustlayer?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Company = mongoose.model('Company', new mongoose.Schema({}, { strict: false }));
  
  const user = await User.findOne({ email: 'averlonworld@gmail.com' });
  console.log('User Record:', user);
  
  if (user) {
    const company = await Company.findById(user.companyId);
    console.log('Company Record:', company);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);

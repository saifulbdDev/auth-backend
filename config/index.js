require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://saiful57139:saiful953@cluster0.bm49tvn.mongodb.net/',
  JWT_SECRET: process.env.JWT_SECRET || 'MyAwesomeSuperSecret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '338968124078-hp7057rqq867tpscts6an72abfifhald.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI 
};
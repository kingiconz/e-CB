import 'dotenv/config';

const config = {
  jwtSecret: process.env.JWT_SECRET,
};

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export default config;
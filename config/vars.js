module.exports = {
  PORT: process.env.PORT || 8080,
  SECRET: process.env.SECRET || 'something',
  BCRYPTSALT: process.env.BCRYPTSALT || 10,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'root',
  DB_HOST: process.env.DB_HOST || 'localhost'
};
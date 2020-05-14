module.exports = {
    PORT: process.env.PORT || 8000,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'development',
    API_TOKEN: process.env.API_TOKEN || 'false-api-token',
    DATABASE_URL: process.env.DATABASE_URL /*||  'postgresql://dunder_mifflin@localhost/blogful' */,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL /* || 'postgresql://dunder_mifflin@localhost/blogful-test' */
  }
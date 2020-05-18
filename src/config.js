module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TOKEN: process.env.API_TOKEN || 'false-api-token',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://admin@localhost/TipsDeck',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL  || 'postgresql://admin@localhost/TipsDeck-test',
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api"
  }
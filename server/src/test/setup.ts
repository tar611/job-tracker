// Runs before every test file. Provides a fake JWT secret so routes/auth.ts
// can sign/verify tokens without needing a real .env in CI.
process.env.JWT_SECRET = "test-secret";

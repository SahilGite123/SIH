// Admin Configuration - Keep these credentials secure
// In production, these should be environment variables

export const ADMIN_CONFIG = {
  EMAIL: "admin@careeradvisor.com",
  PASSWORD: "AdminCareer2024!",
  NAME: "System Administrator"
};

// Function to validate admin credentials
export const isValidAdminCredentials = (email, password) => {
  return email === ADMIN_CONFIG.EMAIL && password === ADMIN_CONFIG.PASSWORD;
};

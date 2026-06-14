export const credentials = {
  admin: {
    email: process.env["ADMIN_EMAIL"]!,
    password: process.env["ADMIN_PASS"]!,
  },
  user: {
    email: process.env["USER_EMAIL"]!,
    password: process.env["USER_PASS"]!,
  },
};
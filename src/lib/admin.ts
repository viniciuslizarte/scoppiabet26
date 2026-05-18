export function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const currentEmail = email?.toLowerCase().trim();
  if (!adminEmail || !currentEmail) return false;
  return adminEmail === currentEmail;
}

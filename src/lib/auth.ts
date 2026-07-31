export const ALLOWED_ADMIN_EMAILS = [
  "martinfernandocedres@gmail.com",
  "katherineliliansilvalong@gmail.com",
  "kamalusosanjose@gmail.com",
];

export function isAllowedAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export interface AdminUser {
  email: string;
  name?: string;
  avatarUrl?: string;
}

const MOCK_ADMIN_KEY = "kamaluso_admin_session";

export function getLocalAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(MOCK_ADMIN_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored) as AdminUser;
    if (isAllowedAdminEmail(user.email)) return user;
  } catch (e) {
    console.error("Error reading admin session", e);
  }
  return null;
}

export function setLocalAdminUser(user: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_ADMIN_KEY, JSON.stringify(user));
}

export function removeLocalAdminUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MOCK_ADMIN_KEY);
}

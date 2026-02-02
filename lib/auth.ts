export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || ''
  return password === adminPassword
}


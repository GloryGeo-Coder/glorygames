// Runtime and build use this non-owner role. Maintenance credentials stay outside
// the public Worker, including its build settings.
export const RUNTIME_DATABASE_ROLE = "wga_runtime";

function isRuntimeUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      ["postgres:", "postgresql:"].includes(url.protocol) &&
      /^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/i.test(url.hostname) &&
      decodeURIComponent(url.username) === RUNTIME_DATABASE_ROLE &&
      Boolean(url.password) &&
      url.pathname === "/neondb" &&
      (!url.port || url.port === "5432")
    );
  } catch {
    return false;
  }
}

export function hasUsableRuntimeDatabaseUrl(value = process.env.DATABASE_URL) {
  return isRuntimeUrl(value);
}

export function getRuntimeDatabaseUrl(value = process.env.DATABASE_URL) {
  if (!isRuntimeUrl(value)) {
    throw new Error("The restricted runtime database connection is not configured.");
  }
  return value;
}

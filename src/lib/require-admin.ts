import { auth } from "./auth";

/** Returns true when the current request has a valid admin session. */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.id;
}

/** The admin user id from the session, or null. */
export async function adminId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized — please log in" }, { status: 401 });
}

export function badRequest(error: string, details?: unknown) {
  return Response.json({ error, details }, { status: 400 });
}

export function notFound() {
  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function readJson(req: Request): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

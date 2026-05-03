import { headers } from "next/headers";

export async function getRequestIp() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("cf-connecting-ip") ??
    null
  );
}

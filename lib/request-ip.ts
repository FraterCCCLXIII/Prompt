import { headers } from "next/headers";

function shouldTrustProxyHeaders() {
  return process.env.PROMPT_TRUST_PROXY_HEADERS === "true";
}

export function getClientIpFromHeaders(requestHeaders: Headers) {
  if (!shouldTrustProxyHeaders()) {
    return null;
  }

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

export async function getRequestIp() {
  return getClientIpFromHeaders(await headers());
}

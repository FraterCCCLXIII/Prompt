const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

type VerifyTurnstileInput = {
  token: string;
  ipAddress?: string | null;
};

function getTurnstileSecret() {
  return process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
}

export async function verifyTurnstileToken({ token, ipAddress }: VerifyTurnstileInput) {
  const secret = getTurnstileSecret();

  if (!secret) {
    return {
      ok: false,
      error: "Captcha is not configured yet. Please try again shortly.",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (ipAddress) {
    body.set("remoteip", ipAddress);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Captcha verification failed. Please try again.",
    };
  }

  const result = (await response.json()) as TurnstileVerifyResponse;

  if (!result.success) {
    const hasTokenIssue = result["error-codes"]?.some((code) =>
      [
        "missing-input-response",
        "invalid-input-response",
        "timeout-or-duplicate",
      ].includes(code),
    );

    return {
      ok: false,
      error: hasTokenIssue
        ? "Please complete the captcha challenge."
        : "Captcha verification failed. Please try again.",
    };
  }

  return { ok: true as const };
}

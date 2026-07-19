"use client";

import Script from "next/script";

type TurnstileCaptchaProps = {
  siteKey: string;
};

export function TurnstileCaptcha({ siteKey }: TurnstileCaptchaProps) {
  return (
    <div className="pt-1">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-size="normal"
      />
    </div>
  );
}

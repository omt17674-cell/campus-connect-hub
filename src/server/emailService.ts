/**
 * GSFC University Campus Connect Hub — Email Service
 *
 * Server-side only. Never import from frontend/VITE code.
 * Uses: Nodemailer SMTP (self-hosted, no external APIs)
 *
 * Required environment variables (server-side, no VITE_ prefix):
 *   SMTP_HOST               — SMTP server hostname
 *   SMTP_PORT               — SMTP port (587 for TLS, 465 for SSL)
 *   SMTP_USER               — SMTP username / email
 *   SMTP_PASSWORD           — SMTP password or app password
 *   EMAIL_FROM              — Sender email address
 *   EMAIL_FROM_NAME         — Sender display name
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ──────────────────────────────────────────────────────────────
// Email Config from environment (SMTP or Resend)
// ──────────────────────────────────────────────────────────────

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Campus Connect Hub";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const isSmtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
const isResendConfigured = Boolean(RESEND_API_KEY && RESEND_API_KEY.startsWith("re_"));
const isEmailConfigured = isSmtpConfigured || isResendConfigured;

// ──────────────────────────────────────────────────────────────
// Template Loader & Renderer
// ──────────────────────────────────────────────────────────────

function loadTemplate(filename: string): string {
  try {
    const templatePath = join(__dirname, "email", "templates", filename);
    return readFileSync(templatePath, "utf-8");
  } catch {
    try {
      const altPath = join(process.cwd(), "src", "server", "email", "templates", filename);
      return readFileSync(altPath, "utf-8");
    } catch {
      return "";
    }
  }
}

function renderOtpTemplate(template: string, otp: string, name?: string): string {
  const digits = otp.split("");
  let html = template
    .replace(/\{\{otp\}\}/g, otp)
    .replace(/\{\{d1\}\}/g, digits[0] || "")
    .replace(/\{\{d2\}\}/g, digits[1] || "")
    .replace(/\{\{d3\}\}/g, digits[2] || "")
    .replace(/\{\{d4\}\}/g, digits[3] || "")
    .replace(/\{\{d5\}\}/g, digits[4] || "")
    .replace(/\{\{d6\}\}/g, digits[5] || "");

  if (name) {
    html = html.replace(/\{\{#if name\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/gs, `$1`);
    html = html.replace(/\{\{name\}\}/g, name);
  } else {
    html = html.replace(/\{\{#if name\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/gs, `$2`);
  }

  return html;
}

// ──────────────────────────────────────────────────────────────
// Plain-text fallback (when HTML fails to load)
// ──────────────────────────────────────────────────────────────

function buildFallbackHtml(heading: string, otp: string, name?: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#1A3C6E,#0E2342);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#fff;font-size:20px;margin:0;">CAMPUS CONNECT HUB</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:0.1em;">GSFC University</p>
      </div>
      ${name ? `<p style="color:#475569;">Hello <strong>${name}</strong>,</p>` : ""}
      <h2 style="color:#1A3C6E;font-size:18px;">${heading}</h2>
      <p style="color:#64748B;margin-top:8px;">Your one-time verification code is:</p>
      <div style="background:#F0F7FF;border:2px solid #BFDBFE;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
        <span style="font-family:monospace;font-size:36px;font-weight:900;letter-spacing:0.3em;color:#1A3C6E;">${otp}</span>
      </div>
      <p style="color:#92400E;background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:12px;font-size:13px;">
        ⏱️ <strong>Valid for 10 minutes.</strong> Do not share this code.
      </p>
      <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;" />
      <p style="font-size:12px;color:#94A3B8;">If you did not request this code, you may safely ignore this email.</p>
      <p style="font-size:12px;color:#1A3C6E;font-weight:700;margin-top:16px;">Campus Connect Hub · GSFC University · Vadodara, Gujarat</p>
    </div>`;
}

// ──────────────────────────────────────────────────────────────
// Dispatch via Nodemailer SMTP
// ──────────────────────────────────────────────────────────────

async function dispatchViaSmtp(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { sent: true, provider: `SMTP (${SMTP_HOST})` };
  } catch (err: any) {
    return { sent: false, provider: "SMTP", error: err?.message };
  }
}

// ──────────────────────────────────────────────────────────────
// Dispatch via Resend API
// ──────────────────────────────────────────────────────────────

async function dispatchViaResend(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  try {
    const fromAddress = EMAIL_FROM.includes("@") ? EMAIL_FROM : "onboarding@resend.dev";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${fromAddress}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { sent: false, provider: "Resend", error: data.message || `HTTP ${res.status}` };
    }
    return { sent: true, provider: "Resend API" };
  } catch (err: any) {
    return { sent: false, provider: "Resend", error: err?.message };
  }
}

// ──────────────────────────────────────────────────────────────
// Core Dispatch
// ──────────────────────────────────────────────────────────────

async function dispatchEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; provider: string; configured: boolean; error?: string }> {
  if (!isEmailConfigured) {
    console.warn("[Email] No email provider configured (SMTP or Resend). Email not sent.");
    return { sent: false, provider: "none", configured: false, error: "No email provider configured" };
  }

  const maskedTo = payload.to.replace(/(?<=.{2}).*(?=@)/, "***");
  console.log(`[Email] Dispatching email to ${maskedTo}`);

  let result: { sent: boolean; provider: string; error?: string };
  if (isSmtpConfigured) {
    result = await dispatchViaSmtp(payload);
  } else {
    result = await dispatchViaResend(payload);
  }

  if (result.sent) {
    console.log(`[Email] ✓ Sent via ${result.provider} to ${maskedTo}`);
    return { sent: true, provider: result.provider, configured: true };
  }

  console.error(`[Email] Dispatch failed: ${result.error}`);
  return { sent: false, provider: result.provider, configured: true, error: result.error };
}

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────

export async function sendRegistrationOTP(
  to: string,
  otp: string,
  name?: string,
): Promise<{ sent: boolean; provider: string; configured: boolean }> {
  const templateRaw = loadTemplate("registration-otp.html");
  const html = templateRaw
    ? renderOtpTemplate(templateRaw, otp, name)
    : buildFallbackHtml("Registration Verification Code", otp, name);

  const text = `Your Campus Connect Hub registration verification code is: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.\n\nIf you did not request this, please ignore this email.\n\n— Campus Connect Hub, GSFC University`;

  return dispatchEmail({
    to,
    subject: "Campus Connect Hub — Registration Verification Code",
    html,
    text,
  });
}

export async function sendPasswordResetOTP(
  to: string,
  otp: string,
): Promise<{ sent: boolean; provider: string; configured: boolean }> {
  const templateRaw = loadTemplate("password-reset-otp.html");
  const html = templateRaw
    ? renderOtpTemplate(templateRaw, otp)
    : buildFallbackHtml("Password Reset Verification Code", otp);

  const text = `Your Campus Connect Hub password reset code is: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.\n\nIf you did not request a password reset, please ignore this email.\n\n— Campus Connect Hub, GSFC University`;

  return dispatchEmail({
    to,
    subject: "Campus Connect Hub — Password Reset Verification Code",
    html,
    text,
  });
}

export const emailService = {
  sendRegistrationOTP,
  sendPasswordResetOTP,
  isConfigured: isEmailConfigured,
  provider: isSmtpConfigured ? "SMTP" : isResendConfigured ? "Resend" : "none",
};

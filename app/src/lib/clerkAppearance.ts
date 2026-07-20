import type { Appearance } from "@clerk/nextjs/server";

/**
 * Shared dark-theme appearance config for all Clerk components.
 * Applied in layout.tsx (ClerkProvider) so it covers both full-page
 * components AND the modal opened from the landing page.
 *
 * `variables` sets Clerk design tokens.
 * `elements` targets specific rendered DOM elements for hard overrides
 * that tokens don't reliably reach (OTP boxes, Google button, etc.).
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#7c3aed",
    colorBackground: "#0d1224",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "#1e2740",
    colorInputText: "#f1f5f9",
    colorNeutral: "#94a3b8",
    colorDanger: "#f87171",
    colorSuccess: "#34d399",
    borderRadius: "12px",
    fontFamily: "inherit",
    fontSize: "15px",
  },

  elements: {
    /* ── Card / Root ───────────────────────────────────────── */
    rootBox: "w-full",
    card: `
      background: #0d1224 !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 0 60px rgba(124,58,237,0.15) !important;
      border-radius: 16px !important;
    `,

    /* ── Header ─────────────────────────────────────────────── */
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-slate-400",

    /* ── Social / OAuth buttons (Google etc.) ───────────────── */
    socialButtonsBlockButton: `
      background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      color: #f1f5f9 !important;
      border-radius: 10px !important;
      transition: all 0.2s;
    `,
    socialButtonsBlockButton__hover: `
      background: rgba(124,58,237,0.15) !important;
      border-color: rgba(124,58,237,0.4) !important;
    `,
    socialButtonsBlockButtonText: "text-slate-100 font-medium",
    socialButtonsBlockButtonArrow: "text-slate-400",

    /* ── Divider ─────────────────────────────────────────────── */
    dividerLine: "bg-white/10",
    dividerText: "text-slate-500",

    /* ── Form labels ─────────────────────────────────────────── */
    formFieldLabel: "text-slate-300 text-sm font-medium",
    formFieldHintText: "text-slate-500 text-xs",

    /* ── Text inputs (email, password) ───────────────────────── */
    formFieldInput: `
      background: #1e2740 !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      color: #f1f5f9 !important;
      border-radius: 10px !important;
      font-size: 15px !important;
      caret-color: #7c3aed !important;
    `,
    formFieldInput__focus: `
      border-color: #7c3aed !important;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.25) !important;
      outline: none !important;
    `,
    formFieldInputShowPasswordButton: "text-slate-400 hover:text-slate-200",

    /* ── Error / hint text under inputs ─────────────────────── */
    formFieldErrorText: "text-red-400 text-xs mt-1",

    /* ── OTP / Verification code boxes ───────────────────────── */
    otpCodeFieldInput: `
      background: #1e2740 !important;
      border: 1.5px solid rgba(255,255,255,0.15) !important;
      color: #f1f5f9 !important;
      border-radius: 10px !important;
      font-size: 22px !important;
      font-weight: 700 !important;
      caret-color: #7c3aed !important;
      text-align: center !important;
    `,
    otpCodeField: "gap-2",

    /* ── Primary action button ───────────────────────────────── */
    formButtonPrimary: `
      background: linear-gradient(135deg, #7c3aed, #06b6d4) !important;
      color: #fff !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      border: none !important;
      transition: opacity 0.2s !important;
    `,
    formButtonPrimary__hover: "opacity-90",

    /* ── Footer links (sign-in / sign-up toggle) ─────────────── */
    footerActionLink: "text-violet-400 hover:text-violet-300 font-medium",
    footerActionText: "text-slate-500",
    footer: "hidden", /* hide Clerk branding footer */

    /* ── Internal "Back" / nav links ─────────────────────────── */
    identityPreviewText: "text-slate-200",
    identityPreviewEditButton: "text-violet-400 hover:text-violet-300",

    /* ── Alert / info banners ────────────────────────────────── */
    alertText: "text-slate-300",
    alertTextDanger: "text-red-400",

    /* ── Google account picker iframe overlay ────────────────── */
    // Forces the outer wrapper to stay on top and readable
    userPreviewMainIdentifier: "text-white font-semibold",
    userPreviewSecondaryIdentifier: "text-slate-400",
  },
};

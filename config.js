// ============================================================
//  TEHILLAH MOVEMENT — CENTRAL CONFIGURATION
//  Edit this file with your real keys before going live.
// ============================================================

const TEHILLAH_CONFIG = {

  // ── FIREBASE ──────────────────────────────────────────────
  // Get these from: https://console.firebase.google.com
  // Project Settings → Your Apps → Firebase SDK snippet → Config
  firebase: {
    apiKey:            "YOUR_FIREBASE_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId:             "YOUR_APP_ID"
  },

  // ── YOUTUBE DATA API v3 ───────────────────────────────────
  // Get from: https://console.cloud.google.com → APIs → YouTube Data API v3
  youtube: {
    apiKey:     "YOUR_YOUTUBE_API_KEY",
    channelId:  "YOUR_YOUTUBE_CHANNEL_ID",   // e.g. UCxxxxxxxxxxxxxxxxxxxxxxxx

    // Playlist IDs (create these in YouTube Studio)
    playlists: {
      worship:      "PLxxxxxxxxxxxxxxxxxxxxxxxxx",  // Worship Moments playlist
      messages:     "PLxxxxxxxxxxxxxxxxxxxxxxxxx",  // Messages & Teaching playlist
      testimonies:  "PLxxxxxxxxxxxxxxxxxxxxxxxxx",  // Testimonies playlist
      gloryEncounter: "PLxxxxxxxxxxxxxxxxxxxxxxxxx" // Glory Encounter playlist
    },

    // Your live stream video ID when you go live
    // Leave as null when not live — site will auto-detect
    liveVideoId: null
  },

  // ── EMAILJS ───────────────────────────────────────────────
  // Get from: https://www.emailjs.com (free — 200 emails/month)
  // Dashboard → Email Services → Add Service
  emailjs: {
    publicKey:  "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId:  "YOUR_EMAILJS_SERVICE_ID",

    // Template IDs — create these in EmailJS dashboard
    templates: {
      bookingConfirmation: "template_booking",    // Sent when a session is booked
      donationReceipt:     "template_donation",   // Sent after giving
      volunteerReceived:   "template_volunteer",  // Volunteer app received
      prayerReceived:      "template_prayer",     // Prayer request received
      inviteReceived:      "template_invite",     // Invite request received
      contactReply:        "template_contact"     // Contact form submission
    }
  },

  // ── MPESA (Daraja API) ────────────────────────────────────
  // Get from: https://developer.safaricom.co.ke
  // NOTE: M-Pesa STK Push needs a server — use a Cloud Function
  // or a simple Node.js proxy. See SETUP_GUIDE.md for details.
  mpesa: {
    businessShortcode: "522533",
    accountReference:  "TEHILLAH",
    // Add your consumer key/secret in Firebase Cloud Functions
    // (never expose them in frontend code)
  },

  // ── SITE SETTINGS ─────────────────────────────────────────
  site: {
    name:     "Tehillah Movement",
    tagline:  "Hosting His Presence. Raising Vessels. Releasing Revival.",
    email:    "info@tehillahmovement.org",
    phone:    "+254 700 000 000",
    location: "Nairobi, Kenya",
    adminEmail: "admin@tehillahmovement.org"
  }
};

// Export for use across all pages
if (typeof module !== 'undefined') module.exports = TEHILLAH_CONFIG;

// ============================================================
//  TEHILLAH MOVEMENT — EMAIL SERVICE (EmailJS)
//  Sends: booking confirmations, donation receipts,
//         volunteer notifications, prayer confirmations
// ============================================================

const EmailService = {

  _ready: false,

  // ── INIT ──────────────────────────────────────────────────
  init() {
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS not loaded. Add the script tag to your HTML.');
      return;
    }
    emailjs.init(TEHILLAH_CONFIG.emailjs.publicKey);
    this._ready = true;
  },

  async _send(templateId, params) {
    if (!this._ready) { this.init(); }
    if (!this._ready) {
      console.warn('EmailJS not ready — email not sent.');
      return false;
    }
    try {
      await emailjs.send(
        TEHILLAH_CONFIG.emailjs.serviceId,
        templateId,
        params
      );
      return true;
    } catch (err) {
      console.error('Email send failed:', err);
      return false;
    }
  },

  // ── BOOKING CONFIRMATION ──────────────────────────────────
  async sendBookingConfirmation({ name, email, session, date, seats, passCode }) {
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.bookingConfirmation,
      {
        to_name:    name,
        to_email:   email,
        session,
        date,
        seats,
        pass_code:  passCode,
        ministry:   TEHILLAH_CONFIG.site.name,
        reply_to:   TEHILLAH_CONFIG.site.email,
        // Tip: in EmailJS template use {{to_name}}, {{session}} etc.
      }
    );
  },

  // ── DONATION RECEIPT ──────────────────────────────────────
  async sendDonationReceipt({ name, email, amount, fund, method, refId }) {
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.donationReceipt,
      {
        to_name:   name || 'Beloved Partner',
        to_email:  email,
        amount:    `KES ${Number(amount).toLocaleString()}`,
        fund,
        method,
        ref_id:    refId || '—',
        ministry:  TEHILLAH_CONFIG.site.name,
        reply_to:  TEHILLAH_CONFIG.site.email,
      }
    );
  },

  // ── VOLUNTEER APPLICATION RECEIVED ───────────────────────
  async sendVolunteerReceived({ name, email, department }) {
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.volunteerReceived,
      {
        to_name:    name,
        to_email:   email,
        department,
        ministry:   TEHILLAH_CONFIG.site.name,
        reply_to:   TEHILLAH_CONFIG.site.email,
      }
    );
  },

  // ── PRAYER REQUEST RECEIVED ───────────────────────────────
  async sendPrayerConfirmation({ name, email }) {
    if (!email) return false;
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.prayerReceived,
      {
        to_name:   name || 'Friend',
        to_email:  email,
        ministry:  TEHILLAH_CONFIG.site.name,
        reply_to:  TEHILLAH_CONFIG.site.email,
      }
    );
  },

  // ── INVITE REQUEST RECEIVED ───────────────────────────────
  async sendInviteConfirmation({ contactName, email, orgName, eventType, location, dates }) {
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.inviteReceived,
      {
        to_name:    contactName,
        to_email:   email,
        org_name:   orgName,
        event_type: eventType,
        location,
        dates,
        ministry:   TEHILLAH_CONFIG.site.name,
        reply_to:   TEHILLAH_CONFIG.site.adminEmail,
      }
    );
  },

  // ── CONTACT FORM REPLY ────────────────────────────────────
  async sendContactConfirmation({ name, email, subject }) {
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.contactReply,
      {
        to_name:   name,
        to_email:  email,
        subject,
        ministry:  TEHILLAH_CONFIG.site.name,
        reply_to:  TEHILLAH_CONFIG.site.email,
      }
    );
  },

  // ── NOTIFY ADMIN OF NEW SUBMISSION ───────────────────────
  async notifyAdmin({ type, details }) {
    // Reuse the contact template to ping admin
    return this._send(
      TEHILLAH_CONFIG.emailjs.templates.contactReply,
      {
        to_name:   'Admin',
        to_email:  TEHILLAH_CONFIG.site.adminEmail,
        subject:   `New ${type} received`,
        message:   JSON.stringify(details, null, 2),
        ministry:  TEHILLAH_CONFIG.site.name,
        reply_to:  TEHILLAH_CONFIG.site.email,
      }
    );
  }
};

// Auto-init when script loads
document.addEventListener('DOMContentLoaded', () => EmailService.init());
window.EmailService = EmailService;

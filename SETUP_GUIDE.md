# Tehillah Movement Website — Complete Setup Guide

Everything you need to go from files on your computer to a fully live website.

---

## What's Already Built

| Layer | Technology | What it does |
|---|---|---|
| Public website | 12 HTML pages | Everything visitors see |
| Admin panel | 11 HTML pages | Full management dashboard |
| Database | Firebase Firestore | Bookings, donations, prayer, volunteers |
| Login | Firebase Auth | Secure admin sign-in |
| Emails | EmailJS | Auto confirmation emails |
| Videos/Live | YouTube Data API v3 | Auto-load videos, detect live streams |

---

## STEP 1 — Set Up Firebase (15 minutes)

Firebase is your database. It is free to start.

### 1.1 Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `tehillah-movement`
4. Disable Google Analytics (optional)
5. Click **Create project**

### 1.2 Create a Web App

1. In your Firebase project, click the **</>** (Web) icon
2. App nickname: `Tehillah Website`
3. Check **"Also set up Firebase Hosting"**
4. Click **Register app**
5. You will see a config object like this — **copy it**:

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tehillah-movement.firebaseapp.com",
  projectId: "tehillah-movement",
  storageBucket: "tehillah-movement.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 1.3 Paste into config.js

Open `tehillah/config.js` and replace the firebase section:

```js
firebase: {
  apiKey:            "AIzaSyXXXXXXXX...",   // ← paste yours
  authDomain:        "tehillah-movement.firebaseapp.com",
  projectId:         "tehillah-movement",
  storageBucket:     "tehillah-movement.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abcdef..."
},
```

### 1.4 Enable Firestore Database

1. In Firebase Console → **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you can secure it later)
4. Select a location closest to Kenya: `europe-west1` or `us-central1`
5. Click **Enable**

### 1.5 Create Admin Login

1. In Firebase Console → **Build → Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Click **Users tab → Add user**
5. Email: `admin@tehillahmovement.org`
6. Password: choose a strong password (minimum 8 characters)
7. Click **Add user**

> That is now your admin login. Use it at `tehillah/admin/login.html`

### 1.6 Set Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, replace with:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public can CREATE (submit forms) but not read others' data
    match /bookings/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /donations/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /prayerRequests/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /testimonies/{doc} {
      allow create: if true;
      // Only approved testimonies are readable publicly
      allow read: if resource.data.approved == true || request.auth != null;
      allow update, delete: if request.auth != null;
    }
    match /volunteers/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /messages/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /taxiBookings/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

Click **Publish**.

---

## STEP 2 — Set Up YouTube API (10 minutes)

### 2.1 Create API Key

1. Go to **https://console.cloud.google.com**
2. Create a new project or select existing
3. Go to **APIs & Services → Library**
4. Search **"YouTube Data API v3"** → Click it → **Enable**
5. Go to **APIs & Services → Credentials**
6. Click **+ Create Credentials → API key**
7. Copy the API key

### 2.2 Get Your Channel ID

1. Go to your YouTube channel
2. Click your profile picture → **YouTube Studio**
3. Left menu → **Settings → Channel → Advanced settings**
4. Copy the **Channel ID** (starts with UC...)

### 2.3 Create Playlists (optional but recommended)

In YouTube Studio → **Content → Playlists → New playlist**. Create:
- Worship Moments
- Messages & Teaching
- Testimonies
- Glory Encounter

Copy each playlist ID from the URL (starts with PL...).

### 2.4 Paste into config.js

```js
youtube: {
  apiKey:    "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ← paste yours
  channelId: "UCxxxxxxxxxxxxxxxxxxxxxxxx",              // ← paste yours
  playlists: {
    worship:        "PLxxxxxxxxxxxxxxxxxxxxxxxxx",
    messages:       "PLxxxxxxxxxxxxxxxxxxxxxxxxx",
    testimonies:    "PLxxxxxxxxxxxxxxxxxxxxxxxxx",
    gloryEncounter: "PLxxxxxxxxxxxxxxxxxxxxxxxxx"
  },
  liveVideoId: null
}
```

> When you go live, set `liveVideoId: "YOUR_LIVE_VIDEO_ID"` and the site will auto-embed your live stream. Set it back to `null` when the stream ends.

### 2.5 Restrict Your API Key (important for security)

In Google Cloud Console → Credentials → Click your API key → Under **Application restrictions**:
- Select **HTTP referrers**
- Add: `yourdomain.com/*` and `www.yourdomain.com/*`
- Under **API restrictions** → Restrict to **YouTube Data API v3**
- Save

---

## STEP 3 — Set Up EmailJS (10 minutes)

EmailJS sends automatic emails from the browser. Free up to 200 emails/month.

### 3.1 Create Account

1. Go to **https://www.emailjs.com** → Sign up free
2. Dashboard → **Email Services → Add New Service**
3. Choose **Gmail** (or your ministry email provider)
4. Connect your `info@tehillahmovement.org` account
5. Copy the **Service ID** (e.g. `service_abc123`)

### 3.2 Create Email Templates

Go to **Email Templates → Create New Template**. Create these 6 templates:

---

**Template 1: Booking Confirmation** (ID: `template_booking`)
```
Subject: Your Glory Encounter Pass — {{session}}

Dear {{to_name}},

Your session has been confirmed!

Session: {{session}}
Date: {{date}}
Seats: {{seats}}
Pass Code: {{pass_code}}

Show this pass code at the sanctuary entrance.
God bless you and we look forward to seeing you!

— Tehillah Movement
```

---

**Template 2: Donation Receipt** (ID: `template_donation`)
```
Subject: Thank you for your gift — {{ministry}}

Dear {{to_name}},

Thank you for your generous gift!

Amount: {{amount}}
Fund: {{fund}}
Method: {{method}}
Reference: {{ref_id}}

Your giving is making a difference in the Kingdom.
"He who is generous will himself be blessed." — Proverbs 22:9

— Tehillah Movement
```

---

**Template 3: Volunteer Received** (ID: `template_volunteer`)
```
Subject: Volunteer Application Received — {{ministry}}

Dear {{to_name}},

We have received your volunteer application for the {{department}} department!

Our team will be in touch within 3–5 working days.
Thank you for your heart to serve!

— Tehillah Movement
```

---

**Template 4: Prayer Received** (ID: `template_prayer`)
```
Subject: We Are Praying With You — {{ministry}}

Dear {{to_name}},

Your prayer request has been received by our intercessory team.
We are standing with you in faith. God hears every prayer.

"Cast all your anxiety on Him because He cares for you." — 1 Peter 5:7

— Tehillah Movement Intercession Team
```

---

**Template 5: Invite Received** (ID: `template_invite`)
```
Subject: Invite Request Received — {{ministry}}

Dear {{to_name}},

Thank you for inviting Tehillah Movement to {{org_name}} in {{location}}!

Event: {{event_type}}
Dates: {{dates}}

Our scheduling team will contact you within 5–7 working days.

— Tehillah Movement
```

---

**Template 6: Contact Reply** (ID: `template_contact`)
```
Subject: Message Received — {{ministry}}

Dear {{to_name}},

Thank you for reaching out to Tehillah Movement regarding: {{subject}}

We have received your message and will respond within 2–3 working days.

God bless you!
— Tehillah Movement
```

---

### 3.3 Get Your Public Key

EmailJS Dashboard → **Account → General** → Copy **Public Key**

### 3.4 Paste into config.js

```js
emailjs: {
  publicKey:  "user_XXXXXXXXXXXXXXXXXXXX",  // ← paste yours
  serviceId:  "service_XXXXXXXXX",           // ← paste yours
  templates: {
    bookingConfirmation: "template_booking",
    donationReceipt:     "template_donation",
    volunteerReceived:   "template_volunteer",
    prayerReceived:      "template_prayer",
    inviteReceived:      "template_invite",
    contactReply:        "template_contact"
  }
}
```

---

## STEP 4 — Deploy to Firebase Hosting (10 minutes)

Your site will go live at `https://tehillah-movement.web.app` (free) or your custom domain.

### 4.1 Install Firebase CLI

Open your terminal (Command Prompt on Windows, Terminal on Mac):

```bash
npm install -g firebase-tools
```

> If you don't have Node.js, download it first from https://nodejs.org

### 4.2 Login and Initialize

```bash
firebase login
cd tehillah          # navigate to your website folder
firebase init hosting
```

When prompted:
- **Which project?** → Select `tehillah-movement`
- **Public directory?** → Type `.` (just a dot — the current folder)
- **Single-page app?** → `No`
- **Overwrite index.html?** → `No`

### 4.3 Deploy

```bash
firebase deploy
```

Your site is now live at:
- `https://tehillah-movement.web.app`
- `https://tehillah-movement.firebaseapp.com`

### 4.4 Add a Custom Domain (optional)

1. Firebase Console → Hosting → **Add custom domain**
2. Enter: `tehillahmovement.org`
3. Follow the DNS verification steps (add TXT record to your domain registrar)
4. Firebase handles SSL automatically — your site will be HTTPS

---

## STEP 5 — Test Everything

Once deployed, test each flow:

| Test | Where | What to check |
|---|---|---|
| Admin login | `/admin/login.html` | Signs in with Firebase credentials |
| Book a session | `/glory-encounter.html` | Booking appears in Firebase Console → Firestore |
| Submit donation | `/give.html` | Donation appears in Firestore, receipt email sent |
| Submit prayer | `/prayer.html` | Prayer request appears in Firestore |
| Volunteer apply | `/volunteer.html` | Application appears in Firestore |
| Watch Live | `/media.html` | YouTube videos load, live stream detected |
| Admin bookings | `/admin/bookings.html` | Shows real bookings from Firestore |
| Admin donations | `/admin/donations.html` | Shows real donations from Firestore |

---

## STEP 6 — Going Live Checklist

Before announcing the website publicly:

- [ ] All keys in `config.js` filled in (Firebase, YouTube, EmailJS)
- [ ] Admin login tested with real Firebase credentials
- [ ] Test booking form — check Firestore for the record
- [ ] Test donation form — check receipt email
- [ ] Test prayer request — check admin prayer page
- [ ] YouTube videos loading on `/media.html`
- [ ] Custom domain connected and SSL working
- [ ] All pages reviewed on mobile phone
- [ ] Firestore security rules published (Step 1.6)

---

## Folder Structure

```
tehillah/
├── config.js              ← ALL your API keys go here
├── firebase-service.js    ← Firebase database functions
├── youtube-service.js     ← YouTube API functions
├── email-service.js       ← EmailJS email functions
├── styles.css             ← Shared styles (all pages)
├── layout.js              ← Shared nav + footer
├── main.js                ← Shared animations + countdown
│
├── index.html             ← Homepage
├── about.html
├── glory-encounter.html   ← Bookings → Firebase
├── revival-release.html
├── adullam.html
├── events.html
├── media.html             ← Videos → YouTube API
├── give.html              ← Donations → Firebase
├── volunteer.html
├── invite.html
├── prayer.html            ← Prayer → Firebase
├── contact.html
│
└── admin/
    ├── login.html         ← Firebase Auth
    ├── index.html         ← Live stats from Firebase
    ├── bookings.html      ← Real booking data
    ├── events.html
    ├── donations.html     ← Real donation data
    ├── volunteers.html
    ├── prayer.html        ← Real prayer requests
    ├── media.html
    ├── messages.html
    ├── users.html
    └── settings.html
```

---

## Common Questions

**Q: How do I go live on YouTube?**
Start your stream in YouTube Studio. The `/media.html` page auto-detects it within 60 seconds. To force it, set `liveVideoId: "your-video-id"` in `config.js`.

**Q: How does the admin team log in?**
Add each admin as a user in Firebase Console → Authentication → Users. They use their email/password at `/admin/login.html`.

**Q: Can I change the capacity per session?**
Yes — go to `/admin/settings.html` → Bookings → Session Capacities. Or update the `MAX_CAPACITY` value in `glory-encounter.html` and `revival-release.html`.

**Q: How do I approve a testimony?**
In Firebase Console → Firestore → `testimonies` collection → find the document → set `approved: true`. Or build this directly into the admin panel testimonies page.

**Q: Is it free?**
- Firebase: Free tier (Spark plan) — up to 50,000 reads/day, 20,000 writes/day. Free for most ministries.
- YouTube API: Free — 10,000 units/day quota.
- EmailJS: Free — 200 emails/month. Paid plans from $9/month for more.
- Firebase Hosting: Free — up to 10 GB storage, 360 MB/day transfer.

**Q: What if I need help?**
Contact a web developer with this guide and the project files. Everything is well-documented and any developer can pick it up.

---

## Support

If you run into issues:
- Firebase docs: https://firebase.google.com/docs
- YouTube API docs: https://developers.google.com/youtube/v3
- EmailJS docs: https://www.emailjs.com/docs/

God bless the work of your hands. 🙏

// ============================================================
//  TEHILLAH MOVEMENT — FIREBASE SERVICE
//  Handles: Auth, Firestore DB, all CRUD operations
// ============================================================

import { initializeApp }          from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs,
         doc, updateDoc, query, where, orderBy,
         limit, onSnapshot, serverTimestamp,
         getDoc, deleteDoc }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword,
         signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── INIT ──────────────────────────────────────────────────
const app  = initializeApp(TEHILLAH_CONFIG.firebase);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── AUTH ──────────────────────────────────────────────────

export const TehillahAuth = {

  async login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: cred.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async logout() {
    await signOut(auth);
    sessionStorage.removeItem('tehillah_admin');
    window.location.href = 'login.html';
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  currentUser() {
    return auth.currentUser;
  }
};

// ── BOOKINGS ──────────────────────────────────────────────

export const BookingsService = {

  /** Save a new booking and return the generated pass code */
  async create(data) {
    const passCode = generatePassCode(data.session, data.date);
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...data,
      passCode,
      status: 'confirmed',
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, passCode };
  },

  /** Get all bookings (admin) */
  async getAll(filters = {}) {
    let q = collection(db, 'bookings');
    const constraints = [orderBy('createdAt', 'desc')];
    if (filters.session) constraints.push(where('session', '==', filters.session));
    if (filters.status)  constraints.push(where('status', '==', filters.status));
    const snap = await getDocs(query(q, ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /** Listen to bookings in real-time (admin dashboard) */
  listenAll(callback) {
    return onSnapshot(
      query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50)),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },

  /** Get session capacity counts for a given date */
  async getCapacity(date) {
    const snap = await getDocs(
      query(collection(db, 'bookings'),
        where('date', '==', date),
        where('status', 'in', ['confirmed', 'pending'])
      )
    );
    const counts = {};
    snap.docs.forEach(d => {
      const s = d.data().session;
      counts[s] = (counts[s] || 0) + (d.data().seats || 1);
    });
    return counts;
  },

  async updateStatus(id, status) {
    await updateDoc(doc(db, 'bookings', id), { status, updatedAt: serverTimestamp() });
  },

  async delete(id) {
    await deleteDoc(doc(db, 'bookings', id));
  }
};

// ── DONATIONS ─────────────────────────────────────────────

export const DonationsService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'donations'), {
      ...data,
      status: 'completed',
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getAll(filters = {}) {
    const constraints = [orderBy('createdAt', 'desc')];
    if (filters.fund)   constraints.push(where('fund', '==', filters.fund));
    if (filters.method) constraints.push(where('method', '==', filters.method));
    const snap = await getDocs(query(collection(db, 'donations'), ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  listenRecent(callback) {
    return onSnapshot(
      query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(20)),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },

  async getMonthlyTotal() {
    const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
    const snap = await getDocs(
      query(collection(db, 'donations'), where('createdAt', '>=', start))
    );
    return snap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
  }
};

// ── PRAYER REQUESTS ───────────────────────────────────────

export const PrayerService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'prayerRequests'), {
      ...data,
      status: 'unread',
      prayedOver: false,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getAll(filters = {}) {
    const constraints = [orderBy('createdAt', 'desc')];
    if (filters.status)   constraints.push(where('status', '==', filters.status));
    if (filters.category) constraints.push(where('category', '==', filters.category));
    const snap = await getDocs(query(collection(db, 'prayerRequests'), ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  listenUnread(callback) {
    return onSnapshot(
      query(collection(db, 'prayerRequests'), where('status', '==', 'unread'), orderBy('createdAt', 'desc')),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },

  async markPrayed(id) {
    await updateDoc(doc(db, 'prayerRequests', id), {
      prayedOver: true, status: 'read', prayedAt: serverTimestamp()
    });
  },

  async getUnreadCount() {
    const snap = await getDocs(
      query(collection(db, 'prayerRequests'), where('status', '==', 'unread'))
    );
    return snap.size;
  }
};

// ── TESTIMONIES ───────────────────────────────────────────

export const TestimonyService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'testimonies'), {
      ...data,
      approved: false,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getApproved() {
    const snap = await getDocs(
      query(collection(db, 'testimonies'), where('approved', '==', true), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getAll() {
    const snap = await getDocs(
      query(collection(db, 'testimonies'), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async approve(id) {
    await updateDoc(doc(db, 'testimonies', id), { approved: true });
  }
};

// ── VOLUNTEERS ────────────────────────────────────────────

export const VolunteerService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'volunteers'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getAll(filters = {}) {
    const constraints = [orderBy('createdAt', 'desc')];
    if (filters.status) constraints.push(where('status', '==', filters.status));
    if (filters.dept)   constraints.push(where('department', '==', filters.dept));
    const snap = await getDocs(query(collection(db, 'volunteers'), ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateStatus(id, status) {
    await updateDoc(doc(db, 'volunteers', id), { status, updatedAt: serverTimestamp() });
  },

  async getPendingCount() {
    const snap = await getDocs(
      query(collection(db, 'volunteers'), where('status', '==', 'pending'))
    );
    return snap.size;
  }
};

// ── EVENTS ────────────────────────────────────────────────

export const EventsService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'events'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getUpcoming() {
    const now = new Date().toISOString().split('T')[0];
    const snap = await getDocs(
      query(collection(db, 'events'),
        where('status', 'in', ['active', 'upcoming']),
        orderBy('startDate', 'asc')
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getAll() {
    const snap = await getDocs(
      query(collection(db, 'events'), orderBy('startDate', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async update(id, data) {
    await updateDoc(doc(db, 'events', id), { ...data, updatedAt: serverTimestamp() });
  }
};

// ── MESSAGES / INVITES ────────────────────────────────────

export const MessagesService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'messages'), {
      ...data,
      status: 'unread',
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getAll() {
    const snap = await getDocs(
      query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async markRead(id) {
    await updateDoc(doc(db, 'messages', id), { status: 'read' });
  },

  async getUnreadCount() {
    const snap = await getDocs(
      query(collection(db, 'messages'), where('status', '==', 'unread'))
    );
    return snap.size;
  }
};

// ── USERS (public profiles) ───────────────────────────────

export const UsersService = {

  async create(data) {
    const ref = await addDoc(collection(db, 'users'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getAll() {
    const snap = await getDocs(
      query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getById(id) {
    const snap = await getDoc(doc(db, 'users', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }
};

// ── DASHBOARD STATS ───────────────────────────────────────

export const StatsService = {

  /** Pull all dashboard numbers in one call */
  async getDashboard() {
    const [bookingsSnap, donationsSnap, volunteersSnap, prayerSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'bookings')),
      getDocs(collection(db, 'donations')),
      getDocs(collection(db, 'volunteers')),
      getDocs(query(collection(db, 'prayerRequests'), where('status', '==', 'unread'))),
      getDocs(collection(db, 'users'))
    ]);

    const totalDonations = donationsSnap.docs.reduce((s, d) => s + (d.data().amount || 0), 0);

    return {
      totalBookings:   bookingsSnap.size,
      totalDonations,
      totalVolunteers: volunteersSnap.size,
      unreadPrayer:    prayerSnap.size,
      totalUsers:      usersSnap.size
    };
  },

  /** Listen to live stats for dashboard */
  listenDashboard(callback) {
    // Watch bookings collection for real-time updates
    return onSnapshot(collection(db, 'bookings'), async () => {
      const stats = await StatsService.getDashboard();
      callback(stats);
    });
  }
};

// ── HELPERS ───────────────────────────────────────────────

function generatePassCode(session, date) {
  const sessionCodes = {
    'Morning Watch':    'AM',
    'Midmorning Watch': 'MM',
    'Afternoon Watch':  'AF',
    'Evening Watch':    'EV',
    'Night Watch':      'NW',
    'Midnight Watch':   'MN',
    'Pre-Dawn Watch':   'PD',
    'Dawn Watch':       'DW'
  };
  const code = sessionCodes[session] || 'XX';
  const dateStr = date ? date.replace(/-/g, '').slice(4) : '0000';
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `TH-${dateStr}-${code}-${rand}`;
}

// Export db for direct use if needed
export { db, auth };

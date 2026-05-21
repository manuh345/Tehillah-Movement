// Injects shared nav and footer into every page
(function() {
  const navHTML = `
  <nav id="main-nav">
    <a href="index.html" class="nav-logo">
      <div class="nav-logo-icon"></div>
      <span class="nav-logo-text">TEHILLAH</span>
    </a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="glory-encounter.html">Glory Encounter</a></li>
      <li><a href="adullam.html">Adullam</a></li>
      <li><a href="events.html">Events</a></li>
      <li><a href="media.html">Watch Live</a></li>
      <li><a href="volunteer.html">Serve</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="nav-cta">
      <a href="media.html" class="btn-watch">Watch Live</a>
      <a href="give.html" class="btn-give">Give</a>
    </div>
    <button class="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </nav>`;

  const footerHTML = `
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="nav-logo" style="margin-bottom:1rem;">
            <div class="nav-logo-icon"></div>
            <span class="nav-logo-text" style="font-size:1.3rem;">TEHILLAH</span>
          </div>
          <p>Hosting His Presence. Raising Vessels. Releasing Revival across the nations through unceasing worship and prayer.</p>
          <div class="social-links" style="margin-top:1.5rem;">
            <a href="#" title="Facebook">f</a>
            <a href="#" title="Instagram">in</a>
            <a href="#" title="YouTube">▶</a>
            <a href="#" title="Twitter">𝕏</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Movement</h4>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="glory-encounter.html">Glory Encounter</a></li>
            <li><a href="adullam.html">Adullam Vigil</a></li>
            <li><a href="events.html">Events</a></li>
            <li><a href="media.html">Watch Live</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <ul>
            <li><a href="volunteer.html">Volunteer</a></li>
            <li><a href="invite.html">Invite Tehillah</a></li>
            <li><a href="prayer.html">Prayer & Testimonies</a></li>
            <li><a href="give.html">Partner With Us</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:info@tehillahmovement.org">info@tehillahmovement.org</a></li>
            <li><a href="tel:+254700000000">+254 700 000 000</a></li>
            <li><a href="#">Nairobi, Kenya</a></li>
          </ul>
          <div style="margin-top:1.5rem;">
            <div class="badge">Subscribe to Updates</div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Tehillah Movement. All rights reserved.</span>
        <span style="color:var(--gold); font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:0.2em;">"Where Worship Ignites Revival"</span>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  const footerTarget = document.getElementById('footer-mount');
  if (footerTarget) footerTarget.outerHTML = footerHTML;
  else document.body.insertAdjacentHTML('beforeend', footerHTML);
})();

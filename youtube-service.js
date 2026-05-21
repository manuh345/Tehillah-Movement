// ============================================================
//  TEHILLAH MOVEMENT — YOUTUBE SERVICE
//  Fetches: Live streams, videos, playlists, channel info
// ============================================================

const YT = {

  BASE: 'https://www.googleapis.com/youtube/v3',

  get key()       { return TEHILLAH_CONFIG.youtube.apiKey; },
  get channelId() { return TEHILLAH_CONFIG.youtube.channelId; },
  get playlists() { return TEHILLAH_CONFIG.youtube.playlists; },

  // ── FETCH HELPER ────────────────────────────────────────
  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.BASE}/${endpoint}`);
    url.searchParams.set('key', this.key);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
    return res.json();
  },

  // ── LIVE STREAM ─────────────────────────────────────────
  /**
   * Checks if the channel is currently live.
   * Returns the live video object or null.
   */
  async getLiveStream() {
    try {
      // First check config override
      if (TEHILLAH_CONFIG.youtube.liveVideoId) {
        return await this.getVideoById(TEHILLAH_CONFIG.youtube.liveVideoId);
      }
      // Auto-detect live broadcast
      const data = await this.fetch('search', {
        part:       'snippet',
        channelId:  this.channelId,
        eventType:  'live',
        type:       'video',
        maxResults: 1
      });
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        return {
          id:          item.id.videoId,
          title:       item.snippet.title,
          description: item.snippet.description,
          thumbnail:   item.snippet.thumbnails?.high?.url,
          channelName: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          isLive:      true,
          embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&rel=0`,
          watchUrl:    `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      }
      return null;
    } catch (err) {
      console.warn('Live stream check failed:', err.message);
      return null;
    }
  },

  // ── UPCOMING STREAMS ────────────────────────────────────
  async getUpcomingStreams() {
    try {
      const data = await this.fetch('search', {
        part:       'snippet',
        channelId:  this.channelId,
        eventType:  'upcoming',
        type:       'video',
        maxResults: 5,
        order:      'date'
      });
      return (data.items || []).map(item => ({
        id:          item.id.videoId,
        title:       item.snippet.title,
        description: item.snippet.description,
        thumbnail:   item.snippet.thumbnails?.medium?.url,
        publishedAt: item.snippet.publishedAt,
        isUpcoming:  true,
        watchUrl:    `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (err) {
      console.warn('Upcoming streams fetch failed:', err.message);
      return [];
    }
  },

  // ── CHANNEL VIDEOS (latest) ──────────────────────────────
  async getLatestVideos(maxResults = 12) {
    try {
      const data = await this.fetch('search', {
        part:       'snippet',
        channelId:  this.channelId,
        type:       'video',
        order:      'date',
        maxResults
      });
      const ids = (data.items || []).map(i => i.id.videoId).join(',');
      if (!ids) return [];
      // Get full video details (duration, views etc.)
      const details = await this.fetch('videos', {
        part: 'snippet,contentDetails,statistics',
        id:   ids
      });
      return (details.items || []).map(v => this._formatVideo(v));
    } catch (err) {
      console.warn('Latest videos fetch failed:', err.message);
      return [];
    }
  },

  // ── PLAYLIST VIDEOS ──────────────────────────────────────
  async getPlaylistVideos(playlistId, maxResults = 12) {
    try {
      const data = await this.fetch('playlistItems', {
        part:       'snippet,contentDetails',
        playlistId,
        maxResults
      });
      const ids = (data.items || []).map(i => i.contentDetails.videoId).join(',');
      if (!ids) return [];
      const details = await this.fetch('videos', {
        part: 'snippet,contentDetails,statistics',
        id:   ids
      });
      return (details.items || []).map(v => this._formatVideo(v));
    } catch (err) {
      console.warn('Playlist videos fetch failed:', err.message);
      return [];
    }
  },

  // ── SEARCH VIDEOS ────────────────────────────────────────
  async searchVideos(query, maxResults = 12) {
    try {
      const data = await this.fetch('search', {
        part:       'snippet',
        channelId:  this.channelId,
        q:          query,
        type:       'video',
        maxResults
      });
      const ids = (data.items || []).map(i => i.id.videoId).join(',');
      if (!ids) return [];
      const details = await this.fetch('videos', {
        part: 'snippet,contentDetails,statistics',
        id:   ids
      });
      return (details.items || []).map(v => this._formatVideo(v));
    } catch (err) {
      console.warn('Search failed:', err.message);
      return [];
    }
  },

  // ── SINGLE VIDEO ─────────────────────────────────────────
  async getVideoById(videoId) {
    try {
      const data = await this.fetch('videos', {
        part: 'snippet,contentDetails,statistics,liveStreamingDetails',
        id:   videoId
      });
      if (!data.items || data.items.length === 0) return null;
      return this._formatVideo(data.items[0]);
    } catch (err) {
      console.warn('Video fetch failed:', err.message);
      return null;
    }
  },

  // ── CHANNEL INFO ─────────────────────────────────────────
  async getChannelInfo() {
    try {
      const data = await this.fetch('channels', {
        part: 'snippet,statistics',
        id:   this.channelId
      });
      if (!data.items || data.items.length === 0) return null;
      const ch = data.items[0];
      return {
        name:        ch.snippet.title,
        description: ch.snippet.description,
        thumbnail:   ch.snippet.thumbnails?.high?.url,
        subscribers: parseInt(ch.statistics.subscriberCount || 0),
        videoCount:  parseInt(ch.statistics.videoCount || 0),
        viewCount:   parseInt(ch.statistics.viewCount || 0),
        url:         `https://www.youtube.com/channel/${this.channelId}`
      };
    } catch (err) {
      console.warn('Channel info fetch failed:', err.message);
      return null;
    }
  },

  // ── ALL PLAYLISTS (category tabs) ────────────────────────
  async getAllCategoryVideos() {
    const [worship, messages, testimonies, glory] = await Promise.all([
      this.getPlaylistVideos(this.playlists.worship, 6),
      this.getPlaylistVideos(this.playlists.messages, 6),
      this.getPlaylistVideos(this.playlists.testimonies, 6),
      this.getPlaylistVideos(this.playlists.gloryEncounter, 6)
    ]);
    return { worship, messages, testimonies, glory };
  },

  // ── FORMAT VIDEO OBJECT ──────────────────────────────────
  _formatVideo(v) {
    return {
      id:          v.id,
      title:       v.snippet.title,
      description: v.snippet.description,
      thumbnail:   v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
      channelName: v.snippet.channelTitle,
      publishedAt: v.snippet.publishedAt,
      publishedAgo:this._timeAgo(v.snippet.publishedAt),
      duration:    this._formatDuration(v.contentDetails?.duration),
      views:       this._formatCount(parseInt(v.statistics?.viewCount || 0)),
      likes:       this._formatCount(parseInt(v.statistics?.likeCount || 0)),
      embedUrl:    `https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`,
      watchUrl:    `https://www.youtube.com/watch?v=${v.id}`,
      isLive:      v.snippet.liveBroadcastContent === 'live'
    };
  },

  // ── DURATION: PT1H24M38S → 1:24:38 ──────────────────────
  _formatDuration(iso) {
    if (!iso) return '';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  },

  // ── VIEW COUNT: 12345 → 12.3K ────────────────────────────
  _formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  },

  // ── TIME AGO ─────────────────────────────────────────────
  _timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7)   return `${d} days ago`;
    if (d < 30)  return `${Math.floor(d/7)} weeks ago`;
    if (d < 365) return `${Math.floor(d/30)} months ago`;
    return `${Math.floor(d/365)} years ago`;
  },

  // ── RENDER HELPERS (call from any page) ──────────────────

  /** Render a grid of video cards into a container element */
  renderVideoGrid(videos, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!videos || videos.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--white-dim);padding:3rem;">No videos found.</div>`;
      return;
    }

    container.innerHTML = videos.map(v => `
      <div class="media-card yt-card" data-id="${v.id}">
        <div class="media-thumb" onclick="YT.openVideo('${v.id}','${v.title.replace(/'/g,'')}')">
          <img src="${v.thumbnail}" alt="${v.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;"/>
          <div class="media-thumb-overlay">
            <div class="yt-play-btn">▶</div>
          </div>
          ${v.isLive ? '<div class="yt-live-badge">🔴 LIVE</div>' : ''}
          ${v.duration ? `<div class="media-duration">${v.duration}</div>` : ''}
        </div>
        <div class="media-info">
          <div class="media-category">${options.category || 'TEHILLAH'} · ${v.publishedAgo}</div>
          <div class="media-title">${v.title}</div>
          <div class="media-meta">👁 ${v.views} views</div>
        </div>
      </div>`).join('');
  },

  /** Open a video in a modal player */
  openVideo(videoId, title) {
    let modal = document.getElementById('ytPlayerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ytPlayerModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(6,9,26,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;padding:2rem;';
      modal.innerHTML = `
        <div style="width:100%;max-width:900px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <div id="ytModalTitle" style="font-family:'Cinzel',serif;font-size:1rem;color:var(--white);"></div>
            <button onclick="document.getElementById('ytPlayerModal').remove()" style="background:none;border:1px solid rgba(201,168,76,0.3);color:var(--gold);padding:0.4rem 0.9rem;cursor:pointer;font-size:0.8rem;font-family:'Cinzel',serif;">✕ CLOSE</button>
          </div>
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
            <iframe id="ytModalFrame" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }
    document.getElementById('ytModalTitle').textContent = title || '';
    document.getElementById('ytModalFrame').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  },

  /** Render the live player section */
  async renderLivePlayer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--white-dim);">Checking for live stream…</div>`;

    const live = await this.getLiveStream();

    if (live) {
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:1rem;">
          <div class="live-badge"><span class="live-dot"></span> LIVE NOW — ${live.title}</div>
        </div>
        <div class="player-frame">
          <iframe src="${live.embedUrl}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" style="width:100%;height:100%;position:absolute;inset:0;"></iframe>
        </div>
        <p style="text-align:center;color:var(--white-dim);font-size:0.85rem;margin-top:1rem;">
          Also watch on <a href="${live.watchUrl}" target="_blank" style="color:var(--gold);">YouTube →</a>
        </p>`;
    } else {
      // Not live — show latest video as featured
      const latest = await this.getLatestVideos(1);
      const v = latest[0];
      if (v) {
        container.innerHTML = `
          <div style="text-align:center;margin-bottom:1rem;">
            <div style="font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.2em;color:var(--white-dim);">LATEST UPLOAD · ${v.publishedAgo}</div>
          </div>
          <div class="player-frame" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
            <iframe src="${v.embedUrl}" frameborder="0" allowfullscreen allow="encrypted-media" style="position:absolute;inset:0;width:100%;height:100%;"></iframe>
          </div>
          <p style="text-align:center;color:var(--white-dim);font-size:0.85rem;margin-top:1rem;">
            Not live right now. <a href="https://www.youtube.com/channel/${this.channelId}" target="_blank" style="color:var(--gold);">Subscribe on YouTube →</a>
          </p>`;
      } else {
        container.innerHTML = `
          <div class="player-frame" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;">
              <div style="font-size:3rem;opacity:0.3;">▶</div>
              <div style="font-family:'Cinzel',serif;font-size:0.8rem;color:var(--white-dim);letter-spacing:0.15em;">NO LIVE STREAM RIGHT NOW</div>
              <a href="https://www.youtube.com/channel/${this.channelId}" target="_blank" class="btn-secondary" style="display:inline-block;padding:0.7rem 1.5rem;font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.15em;color:var(--gold);border:1px solid var(--gold);text-decoration:none;">Subscribe on YouTube</a>
            </div>
          </div>`;
      }
    }
  }
};

// Expose globally
window.YT_SERVICE = YT;

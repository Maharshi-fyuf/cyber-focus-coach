/**
 * router.js — Hash-based client-side router
 */

const CFC_ROUTER = (() => {
  let _currentPage = null;
  let _currentDestroyFn = null;

  const PAGES = {
    onboarding: OnboardingPage,
    dashboard:  DashboardPage,
    session:    SessionPage,
    roadmap:    RoadmapPage,
    logs:       LogsPage,
    review:     ReviewPage,
    settings:   SettingsPage,
  };

  async function navigate(page, params = {}) {
    if (_currentDestroyFn) {
      try { _currentDestroyFn(); } catch {}
    }

    _currentPage = page;
    const container = document.getElementById('app');
    container.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center"><div class="font-mono text-green" style="font-size:0.8rem">LOADING…</div></div>';

    const pageObj = PAGES[page];
    if (!pageObj) {
      container.innerHTML = `<div class="main-content"><h2>404 — Page not found: ${page}</h2></div>`;
      return;
    }

    try {
      await pageObj.render(container, params);
      _currentDestroyFn = pageObj.destroy ? () => pageObj.destroy() : null;
    } catch (err) {
      console.error(`[Router] Error rendering ${page}:`, err);
      container.innerHTML = `
        <div class="main-content" style="padding:40px">
          <div style="font-family:var(--font-mono);color:var(--accent-red)">
            <div style="font-size:1.2rem;margin-bottom:8px">⚠ Render Error</div>
            <div style="color:var(--text-muted);font-size:0.8rem">${err.message}</div>
            <button class="btn btn-ghost btn-sm" style="margin-top:16px" onclick="CFC_ROUTER.navigate('dashboard')">← Back to Dashboard</button>
          </div>
        </div>
      `;
    }

    // Update nav active state
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.classList.toggle('active', link.dataset.nav === page);
    });

    // Re-attach nav listeners after render
    _attachNavListeners();

    // Scroll to top
    window.scrollTo(0, 0);
  }

  function _attachNavListeners() {
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        navigate(link.dataset.nav);
      };
    });
  }

  function getCurrentPage() { return _currentPage; }

  return { navigate, getCurrentPage };
})();

window.CFC_ROUTER = CFC_ROUTER;

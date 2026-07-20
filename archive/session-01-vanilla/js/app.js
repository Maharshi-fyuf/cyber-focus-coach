/**
 * app.js — Application entry point
 * Initializes DB, seeds data, checks first launch, routes to correct page
 */

(async () => {
  console.log('[CFC] Booting Cyber Focus Coach…');

  try {
    // Open IndexedDB
    await CFC_DB.open();

    // Seed on first launch
    await seedDatabase();

    // Load user and settings into state
    await CFC_API.loadUser();
    await CFC_API.loadSettings();
    await CFC_API.loadStreaks();

    // Check onboarding
    const onboardingDone = localStorage.getItem('cfc_onboarding_done') === '1';

    if (!onboardingDone) {
      CFC_STATE.setState({ onboardingComplete: false });
      await CFC_ROUTER.navigate('onboarding');
    } else {
      CFC_STATE.setState({ onboardingComplete: true });
      await CFC_ROUTER.navigate('dashboard');
    }

    console.log('[CFC] Boot complete ✓');
  } catch (err) {
    console.error('[CFC] Boot failed:', err);
    document.getElementById('app').innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px">
        <div style="font-family:'JetBrains Mono',monospace;color:#ff4757;text-align:center;max-width:400px">
          <div style="font-size:3rem;margin-bottom:16px">⚠</div>
          <div style="font-size:1.2rem;margin-bottom:8px">Boot Failed</div>
          <div style="color:#8892a4;font-size:0.8rem;line-height:1.6">${err.message}</div>
          <div style="margin-top:24px;font-size:0.75rem;color:#4a5568">
            Ensure you're opening this in a Chromium-based browser (Chrome, Edge, Brave).<br>
            IndexedDB requires a real file server or localhost — it won't work over the file:// protocol in some browsers.
          </div>
          <button onclick="location.reload()" style="
            margin-top:16px;padding:8px 20px;
            background:rgba(0,255,136,0.15);border:1px solid rgba(0,255,136,0.35);
            color:#00ff88;border-radius:8px;cursor:pointer;
            font-family:'JetBrains Mono',monospace;font-size:0.8rem;
          ">↻ Retry</button>
        </div>
      </div>
    `;
  }
})();

/**
 * focus.js — Focus Detection Engine
 * Combines tab visibility, cursor idle detection, and optional webcam face detection
 * into a single confidence score (0-100).
 *
 * Signal weights (PRD §6.4):
 *   Tab visible      +20
 *   Cursor active    +15
 *   Face present     +40
 *   Face forward     +25 (within face present)
 *   Idle penalty     -30
 *   Tab hidden       -50
 *   Face missing     -40
 */

const CFC_FOCUS = (() => {
  let _active = false;
  let _stream = null;         // MediaStream from getUserMedia
  let _video  = null;         // hidden <video> element for detection
  let _canvas = null;         // offscreen canvas for frame capture
  let _intervalId = null;     // setInterval handle
  let _idleTimer  = 0;        // seconds since last cursor move
  let _lastMouseTime = Date.now();
  let _gracePeriodTimer = 0;  // seconds below threshold
  let _belowThreshold = false;

  // Settings (updated from CFC_STATE.settings)
  let _settings = {
    focus_threshold: 50,
    idle_threshold_seconds: 30,
    grace_period_seconds: 10,
    camera_enabled: false,
  };

  /* ---- Signal state ---- */
  const _signals = {
    tabVisible:    true,
    cursorActive:  true,
    cameraPresent: null,
    faceForward:   null,
  };

  /* ---- Confidence calculation ---- */
  function _computeConfidence(signals) {
    let score = 0;

    if (signals.tabVisible) {
      score += 20;
    } else {
      score -= 50;
    }

    if (signals.cursorActive) {
      score += 15;
    } else {
      score -= 30;
    }

    if (signals.cameraPresent === true) {
      score += 40;
      if (signals.faceForward === true) score += 25;
    } else if (signals.cameraPresent === false) {
      score -= 40;
    }
    // null = camera not enabled, no penalty

    return Math.max(0, Math.min(100, score));
  }

  /* ---- Pause reason builder ---- */
  function _buildPauseReason(signals) {
    if (!signals.tabVisible) {
      return {
        icon: '👁️',
        title: 'Tab Not Visible',
        reason: 'You switched away from the study session. <strong>Return to this tab</strong> to resume your focus timer.',
      };
    }
    if (!signals.cursorActive) {
      return {
        icon: '🖱️',
        title: 'Cursor Idle Detected',
        reason: `No cursor movement detected for ${_idleTimer}s. <strong>Move your mouse or interact</strong> with the study material to resume.`,
      };
    }
    if (signals.cameraPresent === false) {
      return {
        icon: '📷',
        title: 'Face Not Detected',
        reason: 'The webcam could not detect your face. <strong>Make sure your face is visible</strong> in front of the camera to resume.',
      };
    }
    return {
      icon: '⚠️',
      title: 'Focus Dropped',
      reason: 'Your focus confidence dropped below the threshold. Please return to your study material.',
    };
  }

  /* ---- Tab visibility ---- */
  function _setupVisibility() {
    document.addEventListener('visibilitychange', () => {
      _signals.tabVisible = document.visibilityState === 'visible';
      _evaluate();
    });
  }

  /* ---- Cursor idle detection ---- */
  function _setupIdle() {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointermove'].forEach(evt => {
      document.addEventListener(evt, () => {
        _lastMouseTime = Date.now();
        if (!_signals.cursorActive) {
          _signals.cursorActive = true;
          _evaluate();
        }
      }, { passive: true });
    });
  }

  /* ---- Camera / Face detection ---- */
  async function _startCamera() {
    if (!_settings.camera_enabled) return;
    try {
      _stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
      _video  = document.createElement('video');
      _video.srcObject = _stream;
      _video.setAttribute('playsinline', true);
      _video.muted = true;
      await _video.play();

      _canvas = document.createElement('canvas');
      _canvas.width  = 320;
      _canvas.height = 240;

      // Expose stream for webcam preview component
      window._cfcCameraStream = _stream;
      window._cfcCameraVideo  = _video;
      document.dispatchEvent(new CustomEvent('cfc:camera-ready'));

      console.log('[Focus] Camera started ✓');
    } catch (err) {
      console.warn('[Focus] Camera unavailable:', err.message);
      _signals.cameraPresent = null; // No penalty if camera explicitly unavailable
    }
  }

  function _stopCamera() {
    if (_stream) { _stream.getTracks().forEach(t => t.stop()); _stream = null; }
    _video  = null;
    _canvas = null;
    window._cfcCameraStream = null;
    window._cfcCameraVideo  = null;
  }

  /**
   * Lightweight face detection using pixel brightness analysis on the
   * center region of the frame (approximation when MediaPipe not available).
   * In production this would be replaced with MediaPipe FaceDetection WASM.
   */
  function _detectFaceFromFrame() {
    if (!_video || !_canvas) return;
    const ctx = _canvas.getContext('2d');
    ctx.drawImage(_video, 0, 0, 320, 240);
    // Sample center strip — skin tones tend to have higher R, moderate G, lower B
    const imageData = ctx.getImageData(80, 40, 160, 160);
    const { data } = imageData;
    let skinPixels = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Simplified Kovac skin detection
      if (r > 95 && g > 40 && b > 20 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          r > g && r > b) {
        skinPixels++;
      }
    }
    const skinRatio = skinPixels / total;
    _signals.cameraPresent = skinRatio > 0.08; // ≥8% skin pixels = face likely present
    _signals.faceForward   = skinRatio > 0.15;
  }

  /* ---- Main evaluation loop ---- */
  function _evaluate() {
    if (!_active) return;

    // Update idle state
    const idleSec = (Date.now() - _lastMouseTime) / 1000;
    _idleTimer = Math.round(idleSec);
    if (idleSec > _settings.idle_threshold_seconds) {
      _signals.cursorActive = false;
    }

    // Run face detection if camera active
    if (_settings.camera_enabled && _stream) {
      _detectFaceFromFrame();
    }

    const confidence = _computeConfidence(_signals);
    const threshold  = _settings.focus_threshold;

    // Update state
    CFC_STATE.setState({
      focusConfidence: confidence,
      focusSignals: { ..._signals },
    });

    // Dispatch event for any listeners
    document.dispatchEvent(new CustomEvent('cfc:confidence', { detail: { confidence, signals: { ..._signals } } }));

    // Grace period logic
    const sessionStatus = CFC_STATE.getField('sessionStatus');
    if (sessionStatus !== 'running') return;

    if (confidence < threshold) {
      _gracePeriodTimer++;
      if (_gracePeriodTimer >= _settings.grace_period_seconds) {
        // Pause the session
        const reason = _buildPauseReason(_signals);
        CFC_STATE.setState({ sessionStatus: 'paused', pauseReason: reason, showPauseModal: true });
        document.dispatchEvent(new CustomEvent('cfc:session-paused', { detail: reason }));
        CFC_API.pauseSession(reason.title).catch(() => {});
      }
    } else {
      if (_gracePeriodTimer > 0) { _gracePeriodTimer = 0; }
      // Auto-resume if paused by focus engine
      if (sessionStatus === 'paused' && CFC_STATE.getField('showPauseModal')) {
        CFC_STATE.setState({ sessionStatus: 'running', pauseReason: null, showPauseModal: false });
        document.dispatchEvent(new CustomEvent('cfc:session-resumed'));
        CFC_API.resumeSession().catch(() => {});
      }
    }
  }

  /* ---- Public API ---- */
  async function start(settings) {
    if (_active) return;
    _active = true;
    _settings = { ..._settings, ...settings };
    _setupVisibility();
    _setupIdle();
    if (_settings.camera_enabled) await _startCamera();
    // Sample every second
    _intervalId = setInterval(_evaluate, 1000);
    console.log('[Focus] Engine started ✓');
  }

  function stop() {
    _active = false;
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
    _stopCamera();
    _gracePeriodTimer = 0;
    console.log('[Focus] Engine stopped');
  }

  function updateSettings(settings) {
    _settings = { ..._settings, ...settings };
  }

  function getSignals() { return { ..._signals }; }

  return { start, stop, updateSettings, getSignals };
})();

window.CFC_FOCUS = CFC_FOCUS;

import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '../../styles/tokens.css';
import '../../styles/components.css';
import './living-controls.css';

// Experimental visual enhancements. Native HTML performs every essential action.
const effects = document.querySelector('#enable-effects');
const intensity = document.querySelector('#intensity');
const intensityValue = document.querySelector('#intensity-value');
const status = document.querySelector('#experiment-status');
const preferenceNote = document.querySelector('#preference-note');
const magnetic = document.querySelector('#magnetic-action');
const elastic = document.querySelector('#elastic-action');
const surfaceChoices = document.querySelector('#surface-choices');
const indicator = document.querySelector('#selection-indicator');
const frameMetric = document.querySelector('#lab-frame-metric');
let frameSamples = 0;
let elapsedFrameMs = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const forcedColors = window.matchMedia('(forced-colors: active)');

function isExpressive() {
  return effects.checked && Number(intensity.value) > 0
    && !reducedMotion.matches && !forcedColors.matches;
}
function clearMagnet() {
  magnetic.style.setProperty('--lm-magnet-x', '0px');
  magnetic.style.setProperty('--lm-magnet-y', '0px');
}
function updateSettings() {
  intensityValue.value = intensity.value;
  document.documentElement.dataset.labMotion = isExpressive() ? 'expressive' : 'quiet';
  if (reducedMotion.matches) {
    preferenceNote.textContent = 'Reduced motion is enabled at the operating-system level; effects are disabled.';
  } else if (forcedColors.matches) {
    preferenceNote.textContent = 'Forced-colour accessibility mode is active; decorative effects are disabled.';
  } else if (!effects.checked || Number(intensity.value) === 0) {
    preferenceNote.textContent = 'Conventional behaviour is active. All controls remain fully usable.';
  } else {
    preferenceNote.textContent = 'Expressive motion is active. Your system accessibility preferences take precedence.';
  }
  if (!isExpressive()) {
    clearMagnet();
    elastic.removeAttribute('data-pressed');
  }
}
effects.addEventListener('change', updateSettings);
intensity.addEventListener('input', updateSettings);
reducedMotion.addEventListener('change', updateSettings);
forcedColors.addEventListener('change', updateSettings);
updateSettings();

// LM-01: Cosmetic inner-face translation, never moving the hit area itself.
let scheduledFrame = 0;
magnetic.addEventListener('pointermove', event => {
  if (!isExpressive() || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
  const box = magnetic.getBoundingClientRect();
  const strength = Number(intensity.value) / 10;
  const x = Math.max(-1, Math.min(1, (event.clientX - box.left - box.width / 2) / (box.width / 2)));
  const y = Math.max(-1, Math.min(1, (event.clientY - box.top - box.height / 2) / (box.height / 2)));
  cancelAnimationFrame(scheduledFrame);
  const scheduledAt = performance.now();
  scheduledFrame = requestAnimationFrame(() => {
    // Local descriptive measurement only: scheduler delay is not an end-to-end input latency metric.
    if (frameMetric && frameSamples < 200) {
      frameSamples += 1;
      elapsedFrameMs += performance.now() - scheduledAt;
      frameMetric.textContent = `${frameSamples} samples · ${(elapsedFrameMs / frameSamples).toFixed(1)} ms mean scheduling delay (this device only)`;
    }
    magnetic.style.setProperty('--lm-magnet-x', (x * 10 * strength).toFixed(1) + 'px');
    magnetic.style.setProperty('--lm-magnet-y', (y * 8 * strength).toFixed(1) + 'px');
  });
});
magnetic.addEventListener('pointerleave', () => {
  cancelAnimationFrame(scheduledFrame);
  clearMagnet();
});
magnetic.addEventListener('blur', clearMagnet);

// LM-03: The click is native, never held until an animation completes.
function releaseElastic() {
  elastic.removeAttribute('data-pressed');
}
elastic.addEventListener('pointerdown', () => {
  if (isExpressive()) elastic.setAttribute('data-pressed', '');
});
for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'blur', 'keyup']) {
  elastic.addEventListener(type, releaseElastic);
}
elastic.addEventListener('keydown', event => {
  if (isExpressive() && (event.key === ' ' || event.key === 'Enter'))
    elastic.setAttribute('data-pressed', '');
});

// LM-02: a decorative indicator follows real radio states, not vice versa.
function updateSelectionIndicator() {
  const selected = surfaceChoices.querySelector('input[name="surface"]:checked');
  const label = selected?.closest('label');
  if (!label) return;
  const groupBounds = surfaceChoices.getBoundingClientRect();
  const labelBounds = label.getBoundingClientRect();
  indicator.style.left = (labelBounds.left - groupBounds.left) + 'px';
  indicator.style.width = labelBounds.width + 'px';
  surfaceChoices.dataset.indicatorReady = 'true';
}
surfaceChoices.addEventListener('change', event => {
  if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'surface') return;
  updateSelectionIndicator();
  status.textContent = 'LM-02: ' + event.target.value + ' selected. Native radio state changed immediately.';
});
window.addEventListener('resize', updateSelectionIndicator);
document.fonts.ready.then(updateSelectionIndicator);
requestAnimationFrame(updateSelectionIndicator);

// Accessibility of the underlying action is independent of visual enhancement.
document.querySelector('#baseline-action').addEventListener('click', () => {
  status.textContent = 'Control A: baseline action completed. No experimental motion required.';
});
magnetic.addEventListener('click', () => {
  status.textContent = 'LM-01: magnetic action completed. The clickable button never moved.';
});
elastic.addEventListener('click', () => {
  status.textContent = 'LM-03: elastic action completed immediately, independent of the rebound.';
});

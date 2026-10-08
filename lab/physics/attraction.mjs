/**
 * Meridian Lab 0.6 / LM-04: inertial visual attraction toward one of three fixed anchors.
 *
 * The UI uses native radios for selection and always updates semantic state immediately.
 * This bounded spring simulation is a purely visual enhancement. It is not a general
 * gravitational model, and its behaviour has not been validated in user studies.
 */
export function stepAttraction({ position, velocity }, target, deltaSeconds, options = {}) {
  if (![position, velocity, target, deltaSeconds].every(Number.isFinite)) {
    throw new TypeError('Attractor position, velocity, target and elapsed time must be finite numbers');
  }
  const stiffness = options.stiffness ?? 110;
  const damping = options.damping ?? 13;
  if (!(stiffness > 0 && damping >= 0)) {
    throw new RangeError('Attractor stiffness must be positive and damping nonnegative');
  }
  // Fixed upper timestep bounds integration instability after background-tab pauses.
  const dt = Math.max(0, Math.min(deltaSeconds, 1 / 30));
  const acceleration = (target - position) * stiffness - velocity * damping;
  const nextVelocity = velocity + acceleration * dt;
  const nextPosition = position + nextVelocity * dt;
  const settled = Math.abs(target - nextPosition) < 0.2 && Math.abs(nextVelocity) < 1.5;
  return settled
    ? { position: target, velocity: 0, settled: true }
    : { position: nextPosition, velocity: nextVelocity, settled: false };
}

export function anchorOffset(anchor, width) {
  if (!['west', 'center', 'east'].includes(anchor)) throw new RangeError('Unknown anchor: ' + anchor);
  if (!Number.isFinite(width)) throw new TypeError('Track width must be finite');
  // Keep the entire 62px visual mass in view even on small mobile screens.
  const travel = Math.max(0, Math.min(115, (width - 94) / 2));
  return anchor === 'west' ? -travel : anchor === 'east' ? travel : 0;
}

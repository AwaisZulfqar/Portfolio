/**
 * Page-scroll lock shared by the smooth-scroll driver and anything that takes
 * over a gesture (the badge drag). Lives outside React because both sides are
 * imperative and must not wait for a render to agree.
 */
type Locker = { stop: () => void; start: () => void };

let locker: Locker | null = null;
let locked = false;

export function registerScroller(next: Locker | null) {
  locker = next;
  if (next && locked) next.stop();
}

export function setScrollLocked(next: boolean) {
  if (next === locked) return;
  locked = next;
  if (next) locker?.stop();
  else locker?.start();
}

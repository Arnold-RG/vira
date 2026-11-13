import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextCarouselControl, shouldAutoplay } from './carousel.js';

test('pause/play toggle stops autoplay persistently, and navigate leaves it on Play', () => {
  let s = nextCarouselControl({ explicitPause: false }, 'init');
  assert.equal(s.explicitPause, false);
  assert.equal(s.label, 'Pause slideshow');
  assert.equal(s.text, 'Pause');
  assert.equal(
    shouldAutoplay({ explicitPause: s.explicitPause }),
    true
  );

  s = nextCarouselControl(s, 'toggle');
  assert.equal(s.explicitPause, true);
  assert.equal(s.label, 'Play slideshow');
  assert.equal(s.text, 'Play');
  // Hover and focus ending must not resume after an explicit pause.
  assert.equal(
    shouldAutoplay({
      explicitPause: s.explicitPause,
      hovering: false,
      focusWithin: false,
      hidden: false,
      dragging: false
    }),
    false
  );
  assert.equal(
    shouldAutoplay({ explicitPause: s.explicitPause, hovering: true }),
    false
  );

  s = nextCarouselControl(s, 'toggle');
  assert.equal(s.explicitPause, false);
  assert.equal(s.label, 'Pause slideshow');
  assert.equal(s.text, 'Pause');
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, hovering: true }), false);
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, focusWithin: true }), false);
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, hovering: false, focusWithin: false }), true);

  s = nextCarouselControl(s, 'navigate');
  assert.equal(s.explicitPause, true);
  assert.equal(s.label, 'Play slideshow');
  assert.equal(s.text, 'Play');
  assert.equal(
    shouldAutoplay({ explicitPause: s.explicitPause, hovering: false, focusWithin: false }),
    false
  );

  // A second navigate stays paused (Play state).
  s = nextCarouselControl(s, 'navigate');
  assert.equal(s.explicitPause, true);
  assert.equal(s.label, 'Play slideshow');
});

test('hover and focus only pause autoplay while they last, if the user has not paused', () => {
  const s = nextCarouselControl({ explicitPause: false }, 'init');
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, hovering: true }), false);
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, focusWithin: true }), false);
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, hidden: true }), false);
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause, dragging: true }), false);
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause }), true);
});

test('reduced motion starts on Play (autoplay off) and stays off across navigate', () => {
  let s = nextCarouselControl({ explicitPause: false }, 'reduceOn');
  assert.equal(s.explicitPause, true);
  assert.equal(s.label, 'Play slideshow');
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause }), false);
  s = nextCarouselControl(s, 'navigate');
  assert.equal(s.explicitPause, true);
  s = nextCarouselControl(s, 'toggle');
  assert.equal(s.explicitPause, false);
  assert.equal(s.label, 'Pause slideshow');
  assert.equal(shouldAutoplay({ explicitPause: s.explicitPause }), true);
});

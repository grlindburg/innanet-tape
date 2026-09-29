/*
 * a11y-helpers.js — shared accessibility helpers, loaded early in <head>.
 *
 * Provides the global trapFocus / removeTrapFocus that cart-notification.js
 * already calls but were previously undefined (ReferenceError), and backs the
 * modal/drawer keyboard handling added across the theme.
 *
 * Also exposes window.announce() for ARIA live-region status messages.
 * See docs/accessibility-assessment.md.
 */
(function () {
  'use strict';

  var FOCUSABLE = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'summary',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]'
  ].join(',');

  // Element focus was on before the trap engaged, so we can restore it.
  var lastFocusedBeforeTrap = null;
  var activeTrap = null;

  function getFocusable(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll(FOCUSABLE),
      function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
      }
    );
  }

  function onKeydown(event) {
    if (!activeTrap) return;
    if (event.key !== 'Tab' && event.keyCode !== 9) return;

    var focusable = getFocusable(activeTrap.container);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var current = document.activeElement;

    if (event.shiftKey) {
      if (current === first || !activeTrap.container.contains(current)) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Constrain Tab focus within `container`.
   * @param {HTMLElement} container        element to trap focus inside
   * @param {HTMLElement} [elementToFocus] element to focus first (defaults to container)
   */
  function trapFocus(container, elementToFocus) {
    if (!container) return;

    // Remember what to return to (only on the first trap in a stack).
    if (!activeTrap) {
      lastFocusedBeforeTrap = document.activeElement;
    }

    activeTrap = { container: container };
    document.addEventListener('keydown', onKeydown);

    var target = elementToFocus
      || getFocusable(container)[0]
      || container;

    // Make a non-interactive container programmatically focusable.
    if (target === container && !container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
    }
    // Defer so it works when called immediately on show.
    window.requestAnimationFrame(function () {
      try { target.focus(); } catch (e) { /* no-op */ }
    });
  }

  /**
   * Release the focus trap and restore focus.
   * @param {HTMLElement} [elementToFocus] explicit element to return focus to
   */
  function removeTrapFocus(elementToFocus) {
    document.removeEventListener('keydown', onKeydown);
    activeTrap = null;

    var target = elementToFocus || lastFocusedBeforeTrap;
    lastFocusedBeforeTrap = null;
    if (target && typeof target.focus === 'function') {
      try { target.focus(); } catch (e) { /* no-op */ }
    }
  }

  /**
   * Announce a message to assistive tech via a shared polite live region
   * (WCAG 4.1.3). Falls back silently if the region isn't present.
   * @param {string} message
   * @param {'polite'|'assertive'} [politeness='polite']
   */
  function announce(message, politeness) {
    var region = document.getElementById(
      politeness === 'assertive' ? 'a11y-status-assertive' : 'a11y-status'
    );
    if (!region) return;
    // Clear then set, so repeated identical messages are re-announced.
    region.textContent = '';
    window.requestAnimationFrame(function () {
      region.textContent = message;
    });
  }

  // Expose as globals (theme uses non-module scripts).
  window.trapFocus = trapFocus;
  window.removeTrapFocus = removeTrapFocus;
  window.announce = announce;
})();

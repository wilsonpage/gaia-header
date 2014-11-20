;(function(define){'use strict';define(function(require,exports,module){
/*jshint esnext:true*/

/**
 * Dependencies
 */

var Component = require('gaia-component');
var fontFit = require('./lib/font-fit');
var pressed = require('pressed');

// Load 'gaia-icons' font-family
require('gaia-icons');

/**
 * Supported action types
 *
 * @type {Object}
 */
var actionTypes = { menu: 1, back: 1, close: 1 };

/**
 * Register the component.
 *
 * @return {Element} constructor
 */
module.exports = Component.register('gaia-header', {

/**
 * Called when the element is first created.
 *
 * Here we create the shadow-root and
 * inject our template into it.
 *
 * @private
 */
created: function() {
  // Get els
  this.els = {
    actionButton: this.shadowRoot.querySelector('.action-button'),
    headings: this.querySelectorAll('h1,h2,h3,h4'),
    inner: this.shadowRoot.querySelector('.inner')
  };

  this.els.actionButton.addEventListener('click', e => this.onActionButtonClick(e));
  this.setupInteractionListeners();
  this.configureActionButton();
  this.runFontFit();
},

/**
 * Called when the element is
 * attached to the DOM.
 *
 * @private
 */
attached: function() {
  this.rerunFontFit();
},

/**
 * Called when one of the attributes
 * on the element changes.
 *
 * @private
 */
attributeChanged: function(attr) {
  debugger;
  if (attr === 'action') {
    this.configureActionButton();
    this.rerunFontFit();
  }
},

/**
 * Runs the logic to size and position
 * header text inside the available space.
 *
 * @private
 */
runFontFit: function() {
  for (var i = 0; i < this.els.headings.length; i++) {
    fontFit.reformatHeading(this.els.headings[i]);
    fontFit.observeHeadingChanges(this.els.headings[i]);
  }
},

/**
 * Rerun font-fit logic.
 *
 * TODO: We really need an official API for this.
 *
 * @private
 */
rerunFontFit: function() {
  for (var i = 0; i < this.els.headings.length; i++) {
    this.els.headings[i].textContent = this.els.headings[i].textContent;
  }
},

/**
 * Triggers the 'action' button
 * (used in testing).
 *
 * @public
 */
triggerAction: function() {
  if (this.isSupportedAction(this.getAttribute('action'))) {
    this.els.actionButton.click();
  }
},

/**
 * Configure the action button based
 * on the value of the `data-action`
 * attribute.
 *
 * @private
 */
configureActionButton: function() {
  var old = this.els.actionButton.getAttribute('icon');
  var type = this.getAttribute('action');
  var supported = this.isSupportedAction(type);
  this.els.actionButton.classList.remove('icon-' + old);
  this.els.actionButton.setAttribute('icon', type);
  this.els.inner.classList.toggle('supported-action', supported);
  if (supported) { this.els.actionButton.classList.add('icon-' + type); }
},

/**
 * Validate action against supported list.
 *
 * @private
 */
isSupportedAction: function(action) {
  return action && actionTypes[action];
},

/**
 * Handle clicks on the action button.
 *
 * Fired async to allow the 'click' event
 * to finish its event path before
 * dispatching the 'action' event.
 *
 * @param  {Event} e
 * @private
 */
onActionButtonClick: function(e) {
  var config = { detail: { type: this.getAttribute('action') } };
  var actionEvent = new CustomEvent('action', config);
  setTimeout(this.dispatchEvent.bind(this, actionEvent));
},

/**
 * Adds helper classes to allow us to style
 * specifically when a touch interaction is
 * taking place.
 *
 * We use this specifically to apply a
 * transition-delay when the user releases
 * their finger from a button so that they
 * can momentarily see the :active state,
 * reinforcing the UI has responded to
 * their touch.
 *
 * We bind to mouse events to facilitate
 * desktop usage.
 *
 * @private
 */
setupInteractionListeners: function() {
  pressed(this.els.inner, { scope: this, instant: true });
},

template: `
<style>

:host {
  display: block;

  --gaia-header-button-color:
    var(--header-button-color,
    var(--header-color,
    var(--link-color,
    inherit)));
}

/**
 * [hidden]
 */

:host[hidden] {
  display: none;
}

/** Reset
 ---------------------------------------------------------*/

::-moz-focus-inner { border: 0; }

/** Inner
 ---------------------------------------------------------*/

.inner {
  display: flex;
  min-height: 50px;
  direction: ltr;

  background:
    var(--header-background,
    var(--background,
    #fff));
}

/** Action Button
 ---------------------------------------------------------*/

/**
 * 1. Hidden by default
 */

.action-button {
  display: none; /* 1 */
  position: relative;
  width: 50px;
  font-size: 30px;
  margin: 0;
  padding: 0;
  align-items: center;
  background: none;
  cursor: pointer;
  border: 0;

  color:
    var(--header-action-button-color,
    var(--header-icon-color,
    var(--gaia-header-button-color)));
}

/**
 * .action-supported
 *
 * 1. For icon vertical-alignment
 */

.supported-action .action-button {
  display: flex; /* 1 */
}

/**
 * .pressed
 *
 * The pressed.js library adds a 'pressed'
 * class which we use instead of :active,
 * to give us more control over
 * interaction styling.
 */

.action-button.pressed {
  opacity: 0.2;
}

/**
 * .released
 *
 * The pressed.js library adds a 'released'
 * class for a few ms after the finger
 * leaves the button. This allows us
 * to style touchend interactions.
 */

.action-button.released {
  transition: opacity 200ms;
}

/** Action Button Icon
 ---------------------------------------------------------*/

/**
 * 1. To enable vertical alignment.
 */

.action-button:before {
  display: block;
}

/** Action Button Text
 ---------------------------------------------------------*/

/**
 * To provide custom localized content for
 * the action-button, we allow the user
 * to provide an element with the class
 * .l10n-action. This node is then
 * pulled inside the real action-button.
 *
 * Example:
 *
 *   <gaia-header action="back">
 *     <span class="l10n-action" aria-label="Back">Localized text</span>
 *     <h1>title</h1>
 *   </gaia-header>
 */

::content .l10n-action {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  font-size: 0;
}

/** Title
 ---------------------------------------------------------*/

/**
 * 1. Vertically center text. We can't use flexbox
 *    here as it breaks text-overflow ellipsis
 *    without an inner div.
 */

::content h1 {
  flex: 1;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
  line-height: 50px; /* 1 */
  font-weight: 300;
  font-style: italic;
  font-size: 24px;

  color:
    var(--header-title-color,
    var(--header-color,
    var(--title-color,
    var(--text-color,
    inherit))));
}

/**
 * .flush-left
 *
 * When the fitted text is flush with the
 * edge of the left edge of the container
 * we pad it in a bit.
 */

::content h1.flush-left {
  padding-left: 10px;
}

/**
 * .flush-right
 *
 * When the fitted text is flush with the
 * edge of the right edge of the container
 * we pad it in a bit.
 */

::content h1.flush-right {
  padding-right: 10px; /* 1 */
}

/** Buttons
 ---------------------------------------------------------*/

::content a,
::content button {
  box-sizing: border-box;
  display: flex;
  border: none;
  width: auto;
  height: auto;
  margin: 0;
  padding: 0 10px;
  font-size: 14px;
  line-height: 1;
  min-width: 50px;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  text-align: center;
  background: none;
  border-radius: 0;
  font-style: italic;
  cursor: pointer;

  color:
    var(--gaia-header-button-color);
}

/**
 * .pressed
 *
 * The pressed.js library adds a 'pressed'
 * class which we use instead of :active,
 * to give us more control over
 * interaction styling.
 */

::content a.pressed,
::content button.pressed {
  opacity: 0.2;
}

/**
 * .released
 *
 * The pressed.js library adds a 'released'
 * class for a few ms after the finger
 * leaves the button. This allows us
 * to style touchend interactions.
 */

::content a.released,
::content button.released {
  transition: opacity 200ms;
}

/**
 * [hidden]
 */

::content a[hidden],
::content button[hidden] {
  display: none;
}

/**
 * [disabled]
 */

::content a[disabled],
::content button[disabled] {
  pointer-events: none;
  opacity: 0.3;
}

/** Icon Buttons
 ---------------------------------------------------------*/

/**
 * Icons are a different color to text
 */

::content .icon,
::content [data-icon] {
  color:
    var(--header-icon-color,
    var(--gaia-header-button-color));
}

/** Icons
 ---------------------------------------------------------*/

[class^="icon-"]:before,
[class*="icon-"]:before {
  font-family: 'gaia-icons';
  font-style: normal;
  text-rendering: optimizeLegibility;
  font-weight: 500;
}

.icon-menu:before { content: 'menu'; }
.icon-close:before { content: 'close'; }
.icon-back:before { content: 'back'; }

</style>

<div class="inner">
  <button class="action-button">
    <content select=".l10n-action"></content>
  </button>
  <content select="h1,h2,h3,h4,a,button"></content>
</div>`
});

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-header',this));

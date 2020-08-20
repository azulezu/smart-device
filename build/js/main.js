'use strict';
(function () {

  var INPUTMASK_SELECTOR = '.feedback-form__field--phone input';
  var PHONE_TEMPLATE = '+7(999) 999-9999';
  var SCROLL_SELECTOR = '.banner__button';
  var SCROLL_POSITION = 'feedback';
  var SCROLL_SPEED = 1000; // msec
  var SCROLL_STEPS_COUNT = 100;

  var setSmoothScroll = function (button, anchor) {

    var isElementVisibleY = function (element) {
      var position = element.getBoundingClientRect();
      return position.top < window.innerHeight && position.bottom >= 0;
    };

    var getPositionYInDocument = function (element) {
      var position = element.getBoundingClientRect();
      return position.top + pageYOffset;
    };

    var scrollToPositionYInDocument = function (from, to, stepsCount) {
      var scrollLength = to - from;
      var step = scrollLength / stepsCount;

      // с замедлением в середине
      // var smoothTimeout = Math.round(SCROLL_SPEED / SCROLL_STEPS_COUNT * (Math.sin(Math.PI * stepsCount / SCROLL_STEPS_COUNT)));

      // равномерный скролл
      var smoothTimeout = SCROLL_SPEED / SCROLL_STEPS_COUNT;

      setTimeout(function () {
        window.scrollBy(0, step, {behavior: 'smooth'});
        from = from + step;
        if (stepsCount === 0) {
          if (!isElementVisibleY(anchor)) {
            button.removeEventListener('click', onButtonClick);
            button.dispatchEvent(new MouseEvent('click'));
          }
          return;
        }
        scrollToPositionYInDocument(from, to, stepsCount - 1);
      }, smoothTimeout);
    };

    var onButtonClick = function (evt) {
      evt.preventDefault();
      //  ❓ нативный способ
      // anchor.scrollIntoView({block: 'start', behavior: 'smooth'});
      if (isElementVisibleY(anchor)) {
        return;
      }
      // если не работает, прокручиваем самостоятельно
      var positionToScroll = getPositionYInDocument(anchor);
      scrollToPositionYInDocument(window.pageYOffset, positionToScroll, SCROLL_STEPS_COUNT);
    };

    if (button && anchor) {
      button.addEventListener('click', onButtonClick);
    }
    return;
  };

  var setInputMask = function () {
    var fieldSelector = document.querySelector(INPUTMASK_SELECTOR);
    var phoneInputMask = new window.Inputmask({
      mask: PHONE_TEMPLATE,
      placeholder: ' ',
      jitMasking: true,
    });
    phoneInputMask.mask(fieldSelector);
  };

  // ----------------------------------------------------
  setInputMask();
  setSmoothScroll(document.querySelector(SCROLL_SELECTOR),
      document.getElementById(SCROLL_POSITION));
})();

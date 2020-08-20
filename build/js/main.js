'use strict';
(function () {

  var SCROLL_SELECTOR = '.banner__button';
  var SCROLL_POSITION = 'feedback';
  var SCROLL_SPEED = 10;
  var SCROLL_STEP = 500;


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
      var smoothTimeout = Math.round(SCROLL_SPEED * (1 - Math.sin(Math.PI / 2 * step / stepsCount)));

      setTimeout(function () {
        if (from >= to + window.innerHeight) { // +экран
          return;
        }

        window.scrollBy(0, step);
        from = from + step;
        scrollToPositionYInDocument(from, to, stepsCount - 1);
        if (stepsCount === 0) {
          if (!isElementVisibleY(anchor)) {
            button.removeEventListener('click', onButtonClick);
            button.dispatchEvent(new MouseEvent('click'));
          }
        }
      }, smoothTimeout ? smoothTimeout : 1);
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
      scrollToPositionYInDocument(window.pageYOffset, positionToScroll, SCROLL_STEP);
    };

    if (button && anchor) {
      button.addEventListener('click', onButtonClick);
    }
    return;
  };

  // var pageHeader = document.querySelector('.page-header');
  // var headerToggle = document.querySelector('.page-header__toggle');
  //
  // pageHeader.classList.remove('page-header--nojs');
  //
  // headerToggle.addEventListener('click', function () {
  //   if (pageHeader.classList.contains('page-header--closed')) {
  //     pageHeader.classList.remove('page-header--closed');
  //     pageHeader.classList.add('page-header--opened');
  //   } else {
  //     pageHeader.classList.add('page-header--closed');
  //     pageHeader.classList.remove('page-header--opened');
  //   }
  //
  //   addUploadProcessing();

  // ----------------------------------------------------
  setSmoothScroll(document.querySelector(SCROLL_SELECTOR),
      document.getElementById(SCROLL_POSITION));
})();

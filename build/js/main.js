'use strict';
(function () {

  var INPUTMASK_SELECTOR = '[type=tel]';
  var PHONE_TEMPLATE = '+7(999) 999-9999';
  // var PHONE_REGEXP = /^\+7\([0-9]{3}\) [0-9]{3}\-[0-9]{4}$/;
  var PHONE_LENGTH = 10;

  var FEEDBACK = '.feedback';

  var MODAL_WINDOW = '.popup';
  var MODAL_CLOSE = '.modal__close';
  var MODAL_LINK = '.contacts__button';
  var OVERLAY = '.overlay';
  var ESCAPE = 27;

  var SCROLL_SELECTOR = '.banner__button';
  var SCROLL_POSITION = 'feedback';
  var SCROLL_SPEED = 1000; // msec
  var SCROLL_STEPS_COUNT = 100;

  var ACCORDION_SELECTOR = '.accordion__container';

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
  }; // setSmoothScroll

  // ----------------------------------------------------
  var checkStorageSupport = function () {
    try {
      localStorage.setItem('test', 'test');
      if (localStorage.getItem('test') === 'test') {
        localStorage.removeItem('test');
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }; // checkStorageSupport

  var setFocus = function (form) {
    form.userName.focus();
    if (isStorageSupport) {
      // если есть запись в хранилище, фокус на следующее поле
      var savedName = localStorage.getItem('name');
      if (savedName) {
        form.userName.value = savedName;
        form.tel.focus();
        var savedPhone = localStorage.getItem('tel');
        if (savedPhone) {
          form.tel.value = savedPhone;
          form.question.focus();
          var savedQuestion = localStorage.getItem('question');
          if (savedQuestion) {
            form.question.value = savedQuestion;
          }
        }
      }
    }
  }; // setFocus

  var writeFormToStorage = function (form) {
    var isFormValid = form.checkValidity();
    if (isFormValid && isStorageSupport) {
      localStorage.setItem('name', form.userName.value);
      localStorage.setItem('tel', form.tel.value);
      localStorage.setItem('question', form.question.value);
    }
    return isFormValid;
  }; // writeFormToStorage

  var setFeedback = function (form) {
    form.addEventListener('submit', function (evt) {
      writeFormToStorage(evt.target);
    });
  }; // setFeedback

  // ----------------------------------------------------
  var setModal = function (modalLink, modalWindow) {
    if (!modalLink || !modalWindow || !overlay) {
      return;
    }
    modalLink.addEventListener('click', function (event) {
      event.preventDefault();
      overlay.classList.add('js-class__show');
      modalWindow.classList.add('js-class__show');
      body.classList.add('js-class__no-scroll');
      setFocus(modalWindow.querySelector('form'));

      //  проверка, запись и закрытие
      modalWindow.addEventListener('submit', function (evt) {
        if (writeFormToStorage(evt.target)) {
          overlay.classList.remove('js-class__show');
          modalWindow.classList.remove('js-class__show');
          body.classList.remove('js-class__no-scroll');
        }
      });

      // скрыть по крестику
      var modalClose = modalWindow.querySelector(MODAL_CLOSE);
      modalClose.addEventListener('click', function (evt) {
        evt.preventDefault();
        modalWindow.classList.remove('js-class__show');
        overlay.classList.remove('js-class__show');
        body.classList.remove('js-class__no-scroll');
      });

      //  скрыть по эскейпу
      window.addEventListener('keydown', function (evt) {
        if (evt.keyCode === ESCAPE) {
          evt.preventDefault();
          modalWindow.classList.remove('js-class__show');
          overlay.classList.remove('js-class__show');
          body.classList.remove('js-class__no-scroll');
        }
      });

      //  скрыть по клику

      // иначе сразу срабатывают обработчик, кот. устанавливается ниже
      var isOverlayClickFirstRun = true;
      //
      var onOverlayClick = function (evt) {
        if (isOverlayClickFirstRun) {
          isOverlayClickFirstRun = false;
          return;
        }
        //  попадает ли клик в координаты окна?
        var wrapperClientRect = modalWindow.firstElementChild.getBoundingClientRect();
        if (evt.clientX > wrapperClientRect.left && evt.clientX < wrapperClientRect.right
          && evt.clientY > wrapperClientRect.top && evt.clientY < wrapperClientRect.bottom) {
          return;
        }
        modalWindow.classList.remove('js-class__show');
        overlay.classList.remove('js-class__show');
        body.classList.remove('js-class__no-scroll');
        document.removeEventListener('click', onOverlayClick);
        isOverlayClickFirstRun = true;
      };
      document.addEventListener('click', onOverlayClick);

    });
  }; // setModal

  // ----------------------------------------------------
  var addPhoneValidation = function (inputElement) {

    var checkPhoneValidity = function () {
      var rawValue = inputElement.inputmask.unmaskedvalue();
      if (rawValue.length !== PHONE_LENGTH) {
        inputElement.setCustomValidity('В поле нужно ввести ' + PHONE_LENGTH + ' цифр');
      // } else if (!PHONE_REGEXP.test(inputElement.value)) {
      //   inputElement.setCustomValidity('Номер должен соответствовать формату ' + PHONE_TEMPLATE);
      } else {
        inputElement.setCustomValidity('');
      }
    };

    inputElement.addEventListener('change', function () {
      checkPhoneValidity();
    });

    inputElement.addEventListener('input', function (evt) {
      checkPhoneValidity();
      evt.target.reportValidity();
    });
  }; // addPhoneValidation

  var setInputMask = function (inputElements, template) {
    // var phoneMasks = [];
    inputElements.forEach(function (inputElement) {
      inputElement.removeAttribute('pattern');
      inputElement.removeAttribute('minlength');
      inputElement.removeAttribute('maxlength');
      addPhoneValidation(inputElement);
      var phoneMask = new window.Inputmask({
        mask: template,
        placeholder: ' ',
        jitMasking: true,
      });
      // phoneMasks.push(phoneMask);
      phoneMask.mask(inputElement);
    });
  }; // setInputMask

  // ----------------------------------------------------
  var setAccordion = function (accordion) {
    var inputElements = [];

    var rollUp = function (radios) {
      var unSelectedBtn = null;
      var selectedBtn = null;
      radios.forEach(function (radio) {
        if (!radio.checked) {
          unSelectedBtn = radio;
        } else {
          selectedBtn = radio;
        }
      });
      selectedBtn.removeAttribute('checked');
      unSelectedBtn.setAttribute('checked', 'checked');
    };

    var accordionElement = document.querySelector(accordion);
    if (!accordionElement) {
      return;
    }
    inputElements = accordionElement.querySelectorAll(accordion + ' input');
    inputElements.forEach(function (inputElement) {
      var id = inputElement.id;
      var labelElement = accordionElement.querySelector('label[for=' + id + ']');
      if (labelElement) {
        labelElement.addEventListener('click', function () {
          rollUp(inputElements);
        });
      }
    });
  };

  // ----------------------------------------------------
  var overlay = document.querySelector(OVERLAY);
  var body = document.querySelector('body');
  var isStorageSupport = checkStorageSupport();

  setInputMask(document.querySelectorAll(INPUTMASK_SELECTOR), PHONE_TEMPLATE);
  setSmoothScroll(document.querySelector(SCROLL_SELECTOR),
      document.getElementById(SCROLL_POSITION));
  setFeedback(document.querySelector(FEEDBACK + ' ' + 'form'));
  setModal(document.querySelector(MODAL_LINK), document.querySelector(MODAL_WINDOW));
  setAccordion(ACCORDION_SELECTOR);
})();

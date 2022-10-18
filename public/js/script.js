const canvas = document.getElementById('canvas');
const root = document.querySelector(':root');

const isMobile = () => {
  return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
    navigator.userAgent
  );
};

const clearSlideTransitions = element => {
  element.classList.remove('slideUp');
  element.classList.remove('slideDown');
};

const slideDown = (elementId, node = null) => {
  const element = node ? node : document.getElementById(elementId);

  clearSlideTransitions(element);
  element.classList.add('slideDown');
};

const slideUp = (elementId, node = null) => {
  const element = node ? node : document.getElementById(elementId);

  clearSlideTransitions(element);
  element.classList.add('slideUp');
};

const show = elementId =>
  document.getElementById(elementId).classList.remove('hidden');

const hide = elementId =>
  document.getElementById(elementId).classList.add('hidden');

const displayMessage = (message, duration = 2000) => {
  const msg = document.createElement('p');
  msg.innerText = message;
  document.getElementById('msg-area').style.setProperty('max-height', '5rem');
  window.setTimeout(() => {
    document.getElementById('msg-area').appendChild(msg);
    slideDown('msg-area');
  }, 400);

  window.setTimeout(() => {
    slideUp('msg-area');
    window.setTimeout(
      () =>
        document
          .getElementById('msg-area')
          .style.setProperty('max-height', '0'),
      500
    );

    window.setTimeout(
      () => (document.getElementById('msg-area').innerHTML = ''),
      500
    );
  }, duration);
};

const resetPixelsClasses = element => {
  const corner = [...element.classList].find(c =>
    c.match(/top|bottom|right|left/)
  );

  element.setAttribute('class', 'pixel');
  if (corner) element.classList.add(corner);
};

const cancelEvent = event => (event.target.onpointerenter = '');

const setColorBg = event => {
  resetPixelsClasses(event.target);
  event.target.classList.add(
    `bg-${document
      .getElementById('color-picker')
      .getAttribute('current-color')}`
  );
};

const setRandomBg = event => {
  resetPixelsClasses(event.target);

  event.target.classList.add('random-bg');
  event.target.style.setProperty('--h-value', Math.round(Math.random() * 300));
};

const resetBg = event => resetPixelsClasses(event.target);

const setGradientBg = event => {
  resetPixelsClasses(event.target);

  let mode;
  if (document.getElementById('progressive-darkening-mode').checked) {
    mode = 'darkening-bg';
  } else if (document.getElementById('progressive-lighten-mode').checked) {
    mode = 'lighten-bg';
  }
  event.target.classList.add(mode);

  const currentColor = document
    .getElementById('color-picker')
    .getAttribute('current-color');

  const startValue = mode === 'darkening-bg' ? 100 : 0;
  const stopValue = mode === 'darkening-bg' ? 0 : 100;

  let hValue;
  let sValue = 96;
  const lValue =
    parseInt(event.target.style.getPropertyValue('--l-value')) || startValue;

  if (currentColor === 'black') {
    hValue = 0;
    sValue = 0;
  } else {
    hValue = currentColor;
  }

  if (lValue !== stopValue) {
    let newValue;
    if (mode === 'darkening-bg') {
      newValue = lValue >= 10 ? lValue - 10 : stopValue;
    } else if (mode === 'lighten-bg') {
      newValue = lValue < 90 ? lValue + 10 : stopValue;
    }

    event.target.style.setProperty('--h-value', `${hValue}`);
    event.target.style.setProperty('--s-value', `${sValue}%`);
    event.target.style.setProperty('--l-value', `${newValue}%`);
    if (newValue === stopValue) cancelEvent(event);
  }
};

const touchScreenHandler = event => {
  let startPixel = document.elementFromPoint(
    event.touches[0].clientX,
    event.touches[0].clientY
  );

  event.target.ontouchmove = event => {
    event.preventDefault();
    let currentPixel = document.elementFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY
    );

    if (startPixel != currentPixel) {
      currentPixel.dispatchEvent(new Event('pointerenter'));
      startPixel = currentPixel;
    }
  };
};

const resetColorPicker = () => {
  document
    .getElementById('color-picker')
    .setAttribute('current-color', 'black');
  const pickedColor = document.querySelector('.picked-color');
  if (pickedColor) pickedColor.classList.remove('picked-color');

  document.querySelector('.color[color="black"]').classList.add('picked-color');
};

const renderColorPicker = () => {
  const colorPicker = document.getElementById('color-picker');
  let span;
  let hValue;
  let lValue = 46;

  for (let i = 0; i < 13; i++) {
    span = document.createElement('span');
    span.classList.add('color');

    hValue = 30 * i;
    if (i === 12) {
      span.style.setProperty('--s-value', '0%');
      hValue = 0;
      lValue = 0;
    }
    span.setAttribute('color', `${i === 12 ? 'black' : hValue}`);
    span.style.setProperty('--h-value', `${hValue}`);
    span.style.setProperty('--l-value', `${lValue}%`);

    colorPicker.appendChild(span);
  }

  resetColorPicker();
};

const changeColor = event => {
  const colorsStylesheet = document.createElement('style');
  document.getElementsByTagName('head')[0].appendChild(colorsStylesheet);

  const pickedColor = event.target.getAttribute('color');
  const hValue = event.target.style.getPropertyValue('--h-value');
  const lValue = event.target.style.getPropertyValue('--l-value');

  document.querySelector('.picked-color').classList.remove('picked-color');
  event.target.classList.add('picked-color');

  /** The current-color attrb is used to dynamically set pen color */
  document
    .getElementById('color-picker')
    .setAttribute('current-color', pickedColor);

  if (!colorsStylesheet.innerText.match(`bg-${pickedColor}`)) {
    colorsStylesheet.append(
      `.bg-${pickedColor} { background-color: hsl(${hValue}, 66%, ${lValue}) }`
    );
  }
};

const getState = elementId =>
  document.getElementById(elementId).getAttribute('state');

const setState = (elementId, state, visible, hidden) => {
  const element = document.getElementById(elementId);
  element.setAttribute('state', state);

  if (state === 'visible') {
    visible(element);
  } else if (state === 'hidden') {
    hidden(element);
  }
};

const toggleState = (elementId, setStateHandler) => {
  const toggle = {
    visible: 'hidden',
    hidden: 'visible',
  };

  setStateHandler(toggle[getState(elementId)]);
};

const toggleInstructions = () =>
  toggleState('instructions', setInstructionsState);

const rotateInstructionsIcon = direction => {
  const toggleIcon = document.querySelector('.toggle-instructions');
  if (direction === 'up') {
    toggleIcon.classList.remove('rotate-down');
    toggleIcon.classList.add('rotate-up');
  } else if (direction === 'down') {
    toggleIcon.classList.remove('rotate-up');
    toggleIcon.classList.add('rotate-down');
  }
};

const toggleInstructionsHeader = (state, headerId = 'instructions-h') => {
  const header = document.getElementById(headerId);
  if (state === 'visible') {
    header.classList.add('slideDown');
    header.classList.remove('hidden', 'slideUp');
  } else if (state === 'hidden') {
    header.classList.add('slideUp');
    window.setTimeout(() => {
      header.classList.add('hidden');
    }, 200);
  }
};

const setInstructionsState = state => {
  setState(
    'instructions',
    state,
    instructionsArea => {
      document.querySelectorAll('#instructions-content > *').forEach(el => {
        slideDown(null, el);
      });

      show('instructions-content');
      toggleInstructionsHeader('visible');
      rotateInstructionsIcon('up');

      instructionsArea.classList.remove('no-margin-top');
      document
        .querySelector('#instructions h3')
        .classList.remove('no-margin-top');
    },
    instructionsArea => {
      document.querySelectorAll('#instructions-content > *').forEach(el => {
        slideUp(null, el);
      });

      window.setTimeout(() => {
        hide('instructions-content');
        toggleInstructionsHeader('hidden');
        rotateInstructionsIcon('down');

        window.setTimeout(() => {
          instructionsArea.classList.add('no-margin-top');
          document
            .querySelector('#instructions h3')
            .classList.add('no-margin-top');
        }, 200);
      }, 350);
    }
  );
};

const setGridState = state => {
  setState(
    'grid-state',
    state,
    () => root.style.setProperty('--square-border-w', '1px'),
    () => root.style.setProperty('--square-border-w', '0px')
  );
};

const setSquareSize = (size, totalColumns) => {
  root.style.setProperty('--square-size', `${size}px`);
  root.style.setProperty('--squares-per-row', `${totalColumns}`);
};

const validateAndSetSquareSize = (size, squaresPerRow) => {
  const inputField = document.getElementById('number-of-columns');
  let totalColumns;
  if (size * squaresPerRow > Math.round(canvas.clientWidth)) {
    totalColumns = Math.round(canvas.clientWidth / (size + 1));

    inputField.classList.add('red-bg');
    displayMessage(
      `${squaresPerRow} columns does not fit your screen :( we're using ${totalColumns} instead.`,
      3500
    );

    if (isMobile() && !/landscape/.test(screen.orientation.type)) {
      window.setTimeout(() => {
        displayMessage(
          'Try changing to landscape orientation to get more space for your canvas',
          3500
        );
      }, 4200);
    }
  } else totalColumns = squaresPerRow;
  setSquareSize(size, totalColumns);

  window.setTimeout(() => {
    inputField.classList.remove('red-bg');
  }, 2000);
  document.getElementById('number-of-columns').value = totalColumns;

  return totalColumns;
};

const calculateSquareSize = squaresPerRow => {
  let size = Math.round((0.9 * window.innerWidth) / squaresPerRow) - 1;

  return size;
};

const fitContent = element => {
  element.style.setProperty('width', 'fit-content');
  element.style.setProperty('height', 'fit-content');
};

/** resizeTimer will be used to prevent the resize event to be triggered
 * multiple times while window is being resized.
 */
var resizeTimer = false;
const resizeCanvas = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const squaresPerRow = parseInt(
      root.style.getPropertyValue('--squares-per-row')
    );

    const size = calculateSquareSize(squaresPerRow);
    setSquareSize(size, squaresPerRow);
  }, 300);
};

const addRoundCorner = (element, canvas) => {
  const corner = {
    0: 'top-left',
    [canvas.columns - 1]: 'top-right',
    [canvas.columns * canvas.rows - 1]: 'bottom-right',
    [canvas.columns * canvas.rows - canvas.columns]: 'bottom-left',
  };

  element.classList.add(`${corner[element.id]}`);
};

const renderGrid = (squaresPerRow, totalRows, elementId = 'canvas') => {
  const canvasElement = document.getElementById(elementId);

  let div;
  for (let i = 0; i < squaresPerRow * totalRows; i++) {
    div = document.createElement('div');
    div.setAttribute('id', i);
    div.classList.add('pixel');

    if (
      i === 0 ||
      i === squaresPerRow - 1 ||
      i === squaresPerRow * totalRows - 1 ||
      i === squaresPerRow * totalRows - squaresPerRow
    ) {
      addRoundCorner(div, { columns: squaresPerRow, rows: totalRows });
    }

    div.onpointerenter = setColorBg;

    if (isMobile()) {
      div.addEventListener('touchstart', touchScreenHandler);
    }
    canvasElement.appendChild(div);
  }
};

const renderCanvas = squaresPerRow => {
  canvas.innerHTML = '';
  document.getElementById('color-picker').innerHTML === ''
    ? renderColorPicker()
    : resetColorPicker();

  setGridState('visible');

  let size = calculateSquareSize(squaresPerRow);
  if (size < 10) size = 10;

  const totalColumns = validateAndSetSquareSize(size, squaresPerRow);
  let totalRows = Math.floor((0.9 * window.innerHeight) / size);
  if (totalRows < 2) totalRows = 2;
  else if (totalRows > 100) totalRows = totalColumns;

  renderGrid(totalColumns, totalRows);
  fitContent(canvas);

  document
    .getElementById('number-of-columns')
    .setAttribute('value', totalColumns);
};

const resetCanvas = () => {
  const inputField = document.getElementById('number-of-columns');
  const columns = parseInt(inputField.value);

  if (!columns) {
    inputField.setAttribute('placeholder', '');
    inputField.classList.add('red-bg');

    window.setTimeout(() => {
      inputField.classList.remove('red-bg');
      inputField.setAttribute('placeholder', '...');
    }, 200);
  } else if (columns <= 1) {
    inputField.value = '';
    displayMessage('Type in a positive number greater than 1', 'error');
  } else if (columns > 100) {
    inputField.value = '';
    displayMessage('Choose a number less than or equal to 100', 'error');
  } else {
    document.querySelectorAll('input[type="checkbox"]').forEach(box => {
      box.checked = false;
      box.disabled = false;
      slideDown('color-picker');
    });

    canvas.style.removeProperty('height');
    canvas.style.removeProperty('width');
    renderCanvas(columns);
  }
};

const initResetCanvasHandlers = () => {
  document.getElementById('reset-canvas-btn').onclick = resetCanvas;
  document.getElementById('number-of-columns').onchange = resetCanvas;
  document.getElementById('number-of-columns').onkeyup = e => {
    if (e.key === 'Enter') resetCanvas();
  };
};

const initColorModeHandler = mode => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => (cb.checked = false));
  const handler = {
    'random-color-mode': setRandomBg,
    'progressive-darkening-mode': setGradientBg,
    'progressive-lighten-mode': setGradientBg,
    'erase-mode': resetBg,
    default: setColorBg,
  };

  document.getElementById(mode).onchange = e => {
    if (e.target.id === 'toggle-grid') {
      toggleState('grid-state', setGridState);
    } else {
      let eventHandler;
      if (e.target.checked) {
        checkboxes.forEach(cb => {
          if (cb !== e.target && cb.id !== 'toggle-grid') {
            cb.disabled = true;
          }
        });

        if (mode === 'random-color-mode') slideUp('color-picker');

        eventHandler = handler[mode];
      } else {
        checkboxes.forEach(cb => {
          if (cb.id !== 'toggle-grid') {
            cb.disabled = false;
          }
        });

        if (mode === 'random-color-mode') slideDown('color-picker');

        eventHandler = handler.default;
      }

      document.querySelectorAll('.pixel').forEach(square => {
        square.onpointerenter = eventHandler;
      });
    }
  };
};

const initChangeColorHandler = () => {
  document
    .querySelectorAll('.color')
    .forEach(color => (color.onclick = changeColor));
};

const initToggleInstructionsHandler = () => {
  document.querySelector('.toggle-instructions').onclick = toggleInstructions;
};

const start = squaresPerRow => {
  setInstructionsState('visible');
  initToggleInstructionsHandler();
  renderCanvas(squaresPerRow);
  initResetCanvasHandlers();
  initChangeColorHandler();
  [
    'erase-mode',
    'random-color-mode',
    'progressive-darkening-mode',
    'progressive-lighten-mode',
    'toggle-grid',
  ].forEach(mode => initColorModeHandler(mode));

  if (!isMobile()) window.onresize = resizeCanvas;
  else screen.orientation.onchange = resizeCanvas;
};

start(30);

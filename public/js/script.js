const canvas = document.getElementById('canvas');
const root = document.querySelector(':root');

const isMobile = () => {
  return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
    navigator.userAgent
  );
};

const toggleVisibility = elementId => {
  const element = document.getElementById(elementId);

  if (element.style.visibility === 'hidden') {
    element.style.visibility = '';
  } else {
    element.style.visibility = 'hidden';
  }
};

const displayMessage = (message, type) => {
  const msg = document.createElement('p');
  msg.innerText = message;
  msg.classList.add(type);
  document.getElementById('msg-area').appendChild(msg);
  toggleVisibility('msg-area');

  window.setTimeout(() => {
    toggleVisibility('msg-area');
    document.getElementById('msg-area').innerHTML = '';
  }, 2000);
};

const resetClasses = element => {
  element.setAttribute('class', 'pixel');
};

const cancelEvent = event => (event.target.onpointerenter = '');

const setColorBg = event => {
  resetClasses(event.target);
  // event.target.classList.add(
  //   `bg-${document.getElementById('current-color').getAttribute('color')}`
  // );
  event.target.classList.add(`bg-0`);
};

const setRandomBg = event => {
  resetClasses(event.target);

  event.target.classList.add('random-bg');
  event.target.style.setProperty('--h-value', Math.round(Math.random() * 300));
};

const resetBg = event => resetClasses(event.target);

const setDarkeningBg = event => {
  resetClasses(event.target);

  event.target.classList.add('darkening-bg');

  const currentColor = document
    .getElementById('current-color')
    .getAttribute('color');

  let hValue;
  let sValue = 96;
  const lValue =
    parseInt(event.target.style.getPropertyValue('--l-value')) || 100;

  if (currentColor === 'black') {
    hValue = 0;
    sValue = 0;
  } else {
    hValue = currentColor;
  }

  if (lValue !== 0) {
    let newValue = lValue >= 10 ? lValue - 10 : 0;
    event.target.style.setProperty('--h-value', `${hValue}`);
    event.target.style.setProperty('--s-value', `${sValue}%`);
    event.target.style.setProperty('--l-value', `${newValue}%`);
    if (newValue === 0) cancelEvent(event);
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

const setSquaresSize = squaresPerRow => {
  const canvasWidth = canvas.clientWidth;

  let size = Math.round(canvasWidth / squaresPerRow) - 1;

  root.style.setProperty('--square-size', `${size}px`);
  root.style.setProperty('--squares-per-row', `${squaresPerRow}`);

  return size;
};

const resizeCanvas = () => {
  const squaresPerRow = parseInt(
    document.getElementById('number-of-columns').value
  );

  setSquaresSize(squaresPerRow);
  canvas.style.setProperty('height', 'fit-content');
};

const renderColorPicker = () => {
  const colorsArea = document.getElementById('change-color');
  let span;
  let hValue;
  let lValue = 46;

  for (let i = 0; i < 13; i++) {
    span = document.createElement('span');
    span.classList.add('color-picker');
    span.classList.add('color');

    hValue = 30 * i;
    if (i === 12) {
      hValue = 0;
      lValue = 0;
    }
    span.setAttribute('color', `${i === 12 ? 'black' : hValue}`);
    span.style.setProperty('--h-value', `${hValue}`);
    span.style.setProperty('--l-value', `${lValue}%`);

    colorsArea.appendChild(span);
  }
};

const resetColorDisplay = () => {
  document.getElementById('current-color').setAttribute('color', 'black');
  document.getElementById('current-color').removeAttribute('style');
};

const renderCanvas = squaresPerRow => {
  // resetColorDisplay();
  renderColorPicker();
  canvas.innerHTML = '';

  const size = setSquaresSize(squaresPerRow);
  const canvasHeight = canvas.clientHeight;

  let div;
  for (let i = 0; i < squaresPerRow * Math.floor(canvasHeight / size); i++) {
    div = document.createElement('div');
    div.setAttribute('id', i);
    div.classList.add('pixel');
    div.onpointerenter = setColorBg;

    if (isMobile()) {
      div.addEventListener('touchstart', touchScreenHandler);
    }
    canvas.appendChild(div);
  }

  document
    .getElementById('number-of-columns')
    .setAttribute('value', squaresPerRow);
};

const resetCanvas = () => {
  const inputField = document.getElementById('number-of-columns');
  const columns = parseInt(inputField.value);

  if (!columns) {
    inputField.setAttribute('placeholder', '');
    window.setTimeout(() => {
      inputField.setAttribute('placeholder', 'Number of Columns');
    }, 200);
  } else if (columns <= 0) {
    inputField.value = '';
    displayMessage('Type in a positive number', 'error');
  } else if (columns > 100) {
    inputField.value = '';
    displayMessage('Choose a number less than or equal to 100', 'error');
  } else {
    document.querySelectorAll('input[type="checkbox"]').forEach(box => {
      box.checked = false;
      box.dispatchEvent(new Event('change'));
    });

    canvas.style.removeProperty('height');
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
  const handler = {
    'random-color-mode': setRandomBg,
    'progressive-darkening-mode': setDarkeningBg,
    'erase-mode': resetBg,
    default: setColorBg,
  };

  document.getElementById(mode).onchange = e => {
    let eventHandler;
    if (e.target.checked) {
      checkboxes.forEach(cb => {
        if (cb !== e.target) {
          cb.disabled = true;
        }
      });

      if (mode === 'random-color-mode') toggleVisibility('change-color');

      eventHandler = handler[mode];
    } else {
      checkboxes.forEach(cb => (cb.disabled = false));

      if (mode === 'random-color-mode') toggleVisibility('change-color');

      eventHandler = handler.default;
    }

    document.querySelectorAll('.pixel').forEach(square => {
      square.onpointerenter = eventHandler;
    });
  };
};

const changeColor = () => {
  const colorsStylesheet = document.createElement('style');
  document.getElementsByTagName('head')[0].appendChild(colorsStylesheet);

  const colorDisplay = document.getElementById('current-color');
  const currentHueVal =
    parseInt(colorDisplay.style.getPropertyValue('--h-value')) || 0;

  let lValue = '46%';
  let newHueVal = 0;
  if (colorDisplay.getAttribute('color') !== 'black' && currentHueVal < 300) {
    newHueVal = currentHueVal + 30;
  } else if (currentHueVal >= 300) {
    /** Back to black after going through all color options */
    lValue = '0%';
    newHueVal = 'black';
  }

  colorDisplay.style.setProperty('--l-value', lValue);
  colorDisplay.style.setProperty(
    '--h-value',
    newHueVal === 'black' ? 0 : newHueVal
  );

  /** The color attrb in colorDisplay is used to dynamically set pen color */
  colorDisplay.setAttribute('color', newHueVal);

  if (!colorsStylesheet.innerText.match(`bg-${newHueVal}`)) {
    colorsStylesheet.append(
      `.bg-${newHueVal} { background-color: hsl(${newHueVal}, 66%, ${lValue}) }`
    );
  }
};

const initChangeColorHandler = () => {
  document.getElementById('change-color-btn').onclick = changeColor;
};

const start = squaresPerRow => {
  renderCanvas(squaresPerRow);
  initResetCanvasHandlers();
  // initChangeColorHandler();
  ['erase-mode', 'random-color-mode', 'progressive-darkening-mode'].forEach(
    mode => initColorModeHandler(mode)
  );
  window.onresize = resizeCanvas;
};

start(30);

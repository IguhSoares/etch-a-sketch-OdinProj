const canvas = document.getElementById('canvas');
const root = document.querySelector(':root');

const renderCanvas = squaresPerRow => {
  canvas.innerHTML = '';
  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;

  let size = Math.round(canvasWidth / squaresPerRow) - 1;

  root.style.setProperty('--square-size', `${size}px`);
  root.style.setProperty('--squares-per-row', `${squaresPerRow}`);

  const setBlackBg = event => {
    event.target.classList.add('black-bg');
    event.target.onmouseenter = null;
  };

  let div;
  for (let i = 0; i < squaresPerRow * Math.floor(canvasHeight / size); i++) {
    div = document.createElement('div');
    div.setAttribute('id', i);
    div.classList.add('pixel');
    // div.onmouseenter = setBlackBg;
    canvas.appendChild(div);
  }
};

renderCanvas(30);

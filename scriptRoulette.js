const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 220;

const betsContainer = document.getElementById('betsContainer');
const betSelect = document.getElementById('betSelect');
const betAmountInput = document.getElementById('betAmount');
const placeBetBtn = document.getElementById('placeBetBtn');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
const balanceDiv = document.getElementById('balance');


// Europese roulette nummers en kleuren (standaard volgorde)
const rouletteNumbers = [
  { num: 0, color: 'green' },
  { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' }, { num: 4, color: 'black' },
  { num: 21, color: 'red' }, { num: 2, color: 'black' }, { num: 25, color: 'red' }, { num: 17, color: 'black' },
  { num: 34, color: 'red' }, { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
  { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' }, { num: 8, color: 'black' },
  { num: 23, color: 'red' }, { num: 10, color: 'black' }, { num: 5, color: 'red' }, { num: 24, color: 'black' },
  { num: 16, color: 'red' }, { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
  { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' }, { num: 22, color: 'black' },
  { num: 18, color: 'red' }, { num: 29, color: 'black' }, { num: 7, color: 'red' }, { num: 28, color: 'black' },
  { num: 12, color: 'red' }, { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' }
];

// Inzetten (keuzes)
const betsOptions = [
  { name: 'Rood', type: 'color', value: 'red' },
  { name: 'Zwart', type: 'color', value: 'black' },
  { name: 'Even', type: 'parity', value: 'even' },
  { name: 'Oneven', type: 'parity', value: 'odd' },
];

// Voeg getallen 0 t/m 36 toe
for (let i = 0; i <= 36; i++) {
  betsOptions.push({ name: i.toString(), type: 'number', value: i });
}

let balance = parseInt(localStorage.getItem('casinoBalance')) || 1000;
let currentBets = [];

function updateBalance() {
  balanceDiv.textContent = `Saldo: €${balance}`;
  localStorage.setItem('casinoBalance', balance);
}

function updateBetsDisplay() {
  betsContainer.innerHTML = '';
  if (currentBets.length === 0) {
    betsContainer.textContent = 'Je hebt nog geen inzetten geplaatst.';
    spinBtn.disabled = true;
    return;
  }
  currentBets.forEach((bet) => {
    const div = document.createElement('div');
    div.classList.add('betItem');
    div.textContent = `${bet.name} - €${bet.amount}`;
    betsContainer.appendChild(div);
  });
  spinBtn.disabled = false;
}

function resetResult() {
  resultDiv.textContent = '';
}

function isRedNumber(n) {
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  return redNumbers.includes(n);
}

function isBlackNumber(n) {
  const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
  return blackNumbers.includes(n);
}

function checkWin(bet, outcome) {
  if (bet.type === 'number') {
    return bet.value === outcome.num;
  } else if (bet.type === 'color') {
    if (outcome.num === 0) return false;
    if (bet.value === 'red') return isRedNumber(outcome.num);
    if (bet.value === 'black') return isBlackNumber(outcome.num);
  } else if (bet.type === 'parity') {
    if (outcome.num === 0) return false;
    if (bet.value === 'even') return outcome.num % 2 === 0;
    if (bet.value === 'odd') return outcome.num % 2 !== 0;
  }
  return false;
}

// **Hier is de aangepaste multiplier: geeft alleen winst, niet inzet**
function getPayoutMultiplier(bet) {
  if (bet.type === 'number') return 35; // winst = 35x inzet
  return 1; // winst = 1x inzet (dus totaal 2x inzet)
}

// Roulette wiel tekenen
function drawWheel(rotation) {
  const segmentCount = rouletteNumbers.length;
  const arcSize = (2 * Math.PI) / segmentCount;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < segmentCount; i++) {
    const seg = rouletteNumbers[i];
    const startAngle = i * arcSize + rotation;
    const endAngle = startAngle + arcSize;

    // Segment kleur
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.fill();

    // Segment rand
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nummer tekst
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arcSize / 2 + Math.PI / 2);
    ctx.fillStyle = seg.color === 'black' ? 'white' : 'black';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(seg.num, 0, -radius + 30);
    ctx.restore();
  }

  // Pijl bovenaan
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 10);
  ctx.lineTo(centerX - 15, centerY - radius + 20);
  ctx.lineTo(centerX + 15, centerY - radius + 20);
  ctx.closePath();
  ctx.fillStyle = '#e33';
  ctx.fill();
}

drawWheel(0);

function getWinningIndex(rotation) {
  const segmentCount = rouletteNumbers.length;
  const normRotation = rotation % (2 * Math.PI);
  const angle = (3 * Math.PI / 2 - normRotation + 2 * Math.PI) % (2 * Math.PI);
  return Math.floor(angle / ((2 * Math.PI) / segmentCount));
}

// Animatievariabelen
let rotation = 0;
let angularVelocity = 0;
let spinning = false;
let animationFrameId;

function animate() {
  if (!spinning) return;
  rotation += angularVelocity;
  rotation %= 2 * Math.PI;

  // Remmen
  angularVelocity *= 0.97;

  drawWheel(rotation);

  if (angularVelocity < 0.002) {
    spinning = false;
    cancelAnimationFrame(animationFrameId);
    // Bepaal winnaar en toon resultaat
    const winIndex = getWinningIndex(rotation);
    const outcome = rouletteNumbers[winIndex];

    let totalWin = 0;
    let winBets = [];

    currentBets.forEach(bet => {
      if (checkWin(bet, outcome)) {
        const multiplier = getPayoutMultiplier(bet);
        const totalReturn = bet.amount * (1 + multiplier); // inzet + winst
        totalWin += totalReturn;
        winBets.push(`${bet.name} (uitbetaling: €${totalReturn})`);
      }
    });

    if (totalWin > 0) {
      balance += totalWin;
      resultDiv.style.color = '#0f0';
      resultDiv.textContent = `🎉 Uitkomst: ${outcome.num} (${outcome.color}) - Je hebt gewonnen! ${winBets.join(', ')}`;
    } else {
      resultDiv.style.color = '#f44';
      resultDiv.textContent = `😞 Uitkomst: ${outcome.num} (${outcome.color}) - Helaas, geen winst.`;
    }

    updateBalance();

    currentBets = [];
    updateBetsDisplay();
    spinBtn.disabled = true;
    placeBetBtn.disabled = false;
    betAmountInput.disabled = false;
    betSelect.disabled = false;
  } else {
    animationFrameId = requestAnimationFrame(animate);
  }
}

// Vullen select menu met keuzes
function populateBetSelect() {
  betsOptions.forEach(bet => {
    const opt = document.createElement('option');
    opt.value = JSON.stringify(bet);
    opt.textContent = bet.name;
    betSelect.appendChild(opt);
  });
}

populateBetSelect();

betAmountInput.addEventListener('input', () => {
  placeBetBtn.disabled = betAmountInput.value <= 0 || betAmountInput.value > balance || spinning;
  resetResult();
});

betSelect.addEventListener('change', () => {
  resetResult();
});

placeBetBtn.addEventListener('click', () => {
  if(spinning) return;

  const selectedBet = JSON.parse(betSelect.value);
  const amount = Number(betAmountInput.value);

  if (amount <= 0 || amount > balance) return;

  // Voeg toe aan huidige inzetten (samenvoegen als dezelfde)
  let found = false;
  currentBets = currentBets.map(bet => {
    if (bet.type === selectedBet.type && bet.value === selectedBet.value) {
      found = true;
      return { ...bet, amount: bet.amount + amount };
    }
    return bet;
  });
  if (!found) {
    currentBets.push({ ...selectedBet, amount });
  }

  balance -= amount;
  updateBalance();
  updateBetsDisplay();

  betAmountInput.value = '';
  placeBetBtn.disabled = true;
  resetResult();
});

spinBtn.addEventListener('click', () => {
  if (currentBets.length === 0 || spinning) return;

  spinning = true;
  angularVelocity = (Math.random() * 0.2) + 0.3; // start snelheid
  placeBetBtn.disabled = true;
  betAmountInput.disabled = true;
  betSelect.disabled = true;
  spinBtn.disabled = true;
  resetResult();
  animate();
});

updateBalance();
updateBetsDisplay();

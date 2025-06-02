let deck = [];
let playerHand = [];
let dealerHand = [];
let balance = 0;

function loadBalance() {
  balance = parseInt(localStorage.getItem('casinoBalance')) || 1000;
  updateBalanceDisplay();
}

function saveBalance() {
  localStorage.setItem('casinoBalance', balance);
}

function updateBalanceDisplay() {
  document.getElementById("balance").textContent = `Saldo: €${balance}`;
}

function startGame() {
  deck = createDeck();
  shuffle(deck);
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  updateUI();
  checkForBlackjack();
}

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard() {
  return deck.pop();
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;
  for (let card of hand) {
    if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else if (card.value === 'A') {
      aces++;
      score += 11;
    } else {
      score += parseInt(card.value);
    }
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function updateUI() {
  document.getElementById("player-cards").innerHTML = renderCards(playerHand);
  document.getElementById("dealer-cards").innerHTML = renderCards(dealerHand);
  document.getElementById("player-score").textContent = `Score: ${calculateScore(playerHand)}`;
  document.getElementById("dealer-score").textContent = `Score: ${calculateScore(dealerHand)}`;
  document.getElementById("message").textContent = "";
  updateBalanceDisplay();
}

function renderCards(hand) {
  return hand.map(card => `<div class="card">${card.value}${card.suit}</div>`).join('');
}

function hit() {
  if (playerHand.length === 0) return;
  playerHand.push(drawCard());
  updateUI();
  const score = calculateScore(playerHand);
  if (score > 21) {
    endGame("Je hebt verloren", false);
  }
}

function stand() {
  let dealerScore = calculateScore(dealerHand);
  while (dealerScore < 17) {
    dealerHand.push(drawCard());
    dealerScore = calculateScore(dealerHand);
  }
  updateUI();
  checkWinner();
}

function checkWinner() {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);
  if (dealerScore > 21 || playerScore > dealerScore) {
    endGame("Je hebt gewonnen!", true);
  } else if (playerScore < dealerScore) {
    endGame("Dealer heeft gewonnen!", false);
  } else {
    endGame("Gelijkspel", null);
  }
}

function endGame(message, won) {
  document.getElementById("message").textContent = message;

  if (won === true) {
    balance += 100;
  } else if (won === false) {
    balance -= 100;
  }
  saveBalance();
  updateBalanceDisplay();

  playerHand = [];
  dealerHand = [];
}

function checkForBlackjack() {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);
  if (playerScore === 21) {
    endGame("Blackjack! Jij wint!", true);
  } else if (dealerScore === 21) {
    endGame("Dealer heeft Blackjack!", false);
  }
}

loadBalance();

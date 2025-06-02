// script.js
let deck = [];
let playerHand = [];
let dealerHand = [];

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
    endGame("Je verliest! 🫣");
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
    endGame("Je wint! 🎉");
  } else if (playerScore < dealerScore) {
    endGame("Dealer wint! 😢");
  } else {
    endGame("Gelijkspel 🤝");
  }
}

function endGame(message) {
  document.getElementById("message").textContent = message;
  playerHand = [];
  dealerHand = [];
}

function checkForBlackjack() {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);
  if (playerScore === 21) {
    endGame("Blackjack! Jij wint! 🥳");
  } else if (dealerScore === 21) {
    endGame("Dealer heeft Blackjack! 😞");
  }
}

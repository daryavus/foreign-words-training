const flipCard = document.querySelector('.flip-card');
const cardFront = document.querySelector('#card-front');
const cardBack = document.querySelector('#card-back');

const arrowPrev = document.querySelector('#back');
const arrowNext = document.querySelector('#next');

const studyContent = document.querySelector('.study-cards');
const studyMode = document.querySelector('#study-mode');
const countWord = document.querySelector('#current-word');
const totalWord = document.querySelector('#total-word');
const studyProgress = document.querySelector('#words-progress');
const shuffleButton = document.querySelector('#shuffle-words');

const examButton = document.querySelector('#exam');
const examMode = document.querySelector('#exam-mode');
const countPercent = document.querySelector('#correct-percent');
const examProgress = document.querySelector('#exam-progress');

const timer = document.querySelector('#time');

const cards = [
  {
    english: "apple",
    russian: "яблоко",
    example: "I ate a juicy apple for breakfast.",
  },
  {
    english: "book",
    russian: "книга",
    example: "She read an interesting book before bed.",
  },
  {
    english: "forest",
    russian: "лес",
    example: "We took a long walk in the forest.",
  },
  {
    english: "sea",
    russian: "море",
    example: "The sea was calm and blue today.",
  },
  {
    english: "flower",
    russian: "цветок",
    example: "He gave her a beautiful red flower.",
  },
];

let currentPosition = 0;
let shuffledIndexes = [];

totalWord.textContent = cards.length;

function initCards() {
  shuffledIndexes = [...Array(cards.length).keys()];
  currentPosition = 0;
}

function shuffleCards() {
  // Алгоритм Фишера-Йетса
  for (let i = shuffledIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
  }
  currentPosition = 0;
}

function createCard() {
  const cardIndex = shuffledIndexes[currentPosition];
  const { english, russian, example } = cards[cardIndex];

  flipCard.classList.remove('active');
  cardFront.querySelector('h1').textContent = english;
  cardBack.querySelector('div h1').textContent = russian;
  cardBack.querySelector('div p span').textContent = example;

  studyProgress.value = 20 * (currentPosition + 1);
  countWord.textContent = currentPosition + 1;

  updateButtons();
}

function updateButtons() {
  arrowPrev.disabled = currentPosition <= 0;
  arrowNext.disabled = currentPosition >= cards.length - 1;
}

initCards();
createCard();

flipCard.addEventListener('click', () => flipCard.classList.toggle('active'));

arrowNext.addEventListener('click', () => {
  if (currentPosition < cards.length - 1) {
    currentPosition++;
    createCard();
  }
});

arrowPrev.addEventListener('click', () => {
  if (currentPosition > 0) {
    currentPosition--;
    createCard();
  }
});

shuffleButton.addEventListener('click', () => {
  shuffleCards();
  createCard();
});

// Режим проверки знаний

let flippedCards = [];
let matchedPairs = [];
let canFlip = true;
let timerInterval;
let seconds = 0;

function createExamCardElements() {
  const allCards = [];
  
  cards.forEach(item => {

    allCards.push({
      content: item.english,
      pairId: item.english,
      type: 'word'
    });

    allCards.push({
      content: item.russian,
      pairId: item.english,
      type: 'translation'
    });
  });

  return allCards;
}

function renderExamCards() {
  const container = document.getElementById('exam-cards');
  container.innerHTML = '';
  
  const allCards = createExamCardElements();
  const shuffledCards = [...allCards];
  
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }

  shuffledCards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.textContent = card.content;
    cardEl.dataset.pairId = card.pairId;
    cardEl.dataset.content = card.content;
    cardEl.dataset.index = index;
    
    cardEl.addEventListener('click', handleCardClick);
    container.appendChild(cardEl);
  });
}

function handleCardClick(e) {
  if (!canFlip) return;
  
  const clickedCard = e.target;
  
  if (clickedCard.classList.contains('fade-out') || 
      (flippedCards.length === 1 && clickedCard === flippedCards[0])) {
    return;
  }
  
  if (flippedCards.length === 0) {
    clickedCard.classList.add('correct');
    flippedCards.push(clickedCard);
    return;
  }
  
  if (flippedCards.length === 1) {
    flippedCards.push(clickedCard);
    canFlip = false;
    
    const [firstCard, secondCard] = flippedCards;
    const isMatch = firstCard.dataset.pairId === secondCard.dataset.pairId;
    
    if (isMatch) {
      secondCard.classList.add('correct');
      firstCard.classList.add('fade-out');
      secondCard.classList.add('fade-out');
      matchedPairs.push(firstCard.dataset.pairId);
      
      const percent = Math.round((matchedPairs.length / cards.length) * 100);
      countPercent.textContent = percent;
      examProgress.value = percent;
      
      checkExamCompletion();
    } else {
      secondCard.classList.add('wrong');
      
      setTimeout(() => {
        firstCard.classList.remove('correct');
        secondCard.classList.remove('wrong');
      }, 500);
    }
    
    setTimeout(() => {
      flippedCards = [];
      canFlip = true;
    }, 500);
  }
}

function startTimer() {
  seconds = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(function() {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timer.textContent = `${mins}:${secs}`;
  }, 1000);
}

function resetExam() {
  clearInterval(timerInterval);
  timer.textContent = '00:00';
  matchedPairs = [];
  countPercent.textContent = '0';
  examProgress.value = '0';
}

function checkExamCompletion() {
  if (matchedPairs.length === cards.length) {
    clearInterval(timerInterval);
    setTimeout(() => {
      alert(`Поздравляем! Вы успешно завершили проверку за ${timer.textContent}!`);
    }, 500);
  }
}

examButton.addEventListener('click', function() {
  studyMode.classList.add('hidden');
  examMode.classList.remove('hidden');
  studyContent.classList.add('hidden');
  
  resetExam();
  renderExamCards();
  startTimer();
});

/* ==========================================================================
   ROCK PAPER SCISSORS
   How it works:
   1. The player clicks one of the three buttons.
   2. The computer picks randomly.
   3. We compare the picks, show a message, add the round to the history,
      and give a point to the winner. (A tie adds no points to anyone.)
   4. "Reset game" puts everything back to the starting state.
   ========================================================================== */


/* ---------- Settings ---------- */

// The message shown before any round has been played (and after a reset).
// Keep this the same as the starting text of the data-message element in index.html.
const INTRO_MESSAGE = 'Pick a move to start.'

// How many past rounds to keep on screen. Older rounds drop off the bottom
// so the page doesn't grow forever. (Scores still count every round.)
const MAX_HISTORY = 10


/* ---------- Grab the page elements we need to work with ---------- */

// All three Rock / Paper / Scissors buttons (they each have a data-selection attribute)
const selectionButtons = document.querySelectorAll('[data-selection]')

// The two score numbers on screen
const computerScoreSpan = document.querySelector('[data-computer-score]')
const yourScoreSpan = document.querySelector('[data-your-score]')

// The line of text that announces who won each round
const messageEl = document.querySelector('[data-message]')

// The "Previous rounds" section (hidden until the first round) and the list inside it
const historySection = document.querySelector('[data-history-section]')
const historyList = document.querySelector('[data-history]')

// The "Reset game" button
const resetButton = document.querySelector('[data-reset]')


/* ---------- Game data ---------- */

// The three possible moves. Each one stores:
//   name  - matches the data-selection value on the HTML buttons
//   emoji - what gets displayed in the round history
//   beats - the name of the move it defeats
// To change the rules or add a move (e.g. Lizard, Spock), this is the main list to edit
// (you would also add a matching button in index.html).
const SELECTIONS = [
  {
    name: 'rock',
    emoji: '✊🏽',
    beats: 'scissors'
  },
  {
    name: 'paper',
    emoji: '✋🏽',
    beats: 'rock'
  },
  {
    name: 'scissors',
    emoji: '✌🏽',
    beats: 'paper'
  }
]

// Which highlight style each side's pick gets for each possible round result.
// The names ("winner", "loser", "tie") are CSS classes in styles.css.
const PICK_STYLES = {
  win:  { you: 'winner', computer: 'loser' },
  lose: { you: 'loser',  computer: 'winner' },
  tie:  { you: 'tie',    computer: 'tie' }
}


/* ---------- Listen for clicks ---------- */

// Attach a click handler to each of the three move buttons
selectionButtons.forEach(selectionButton => {
  selectionButton.addEventListener('click', e => {
    // Read which move this button stands for (e.g. "rock") from its data-selection attribute
    const selectionName = selectionButton.dataset.selection

    // Look up the full move object (name, emoji, beats) that matches that name
    const selection = SELECTIONS.find(selection => selection.name === selectionName)

    // Play a round with the player's choice
    makeSelection(selection)
  })
})

// Clicking "Reset game" starts over
resetButton.addEventListener('click', resetGame)


/* ---------- Game functions ---------- */

// Plays one full round: the computer picks, we decide who won, then update the screen and scores.
function makeSelection(selection) {
  // The computer's random pick
  const computerSelection = randomSelection()

  // Work out who won. If both are false, the round was a tie.
  const yourWinner = isWinner(selection, computerSelection)
  const computerWinner = isWinner(computerSelection, selection)

  // Boil that down to one word: 'win', 'lose' or 'tie' (from the player's point of view)
  const outcome = yourWinner ? 'win' : computerWinner ? 'lose' : 'tie'

  // Update the message and the round history
  showMessage(outcome, selection, computerSelection)
  addRoundResult(selection, computerSelection, outcome)

  // Give a point to whoever won
  if (yourWinner) incrementScore(yourScoreSpan)
  if (computerWinner) incrementScore(computerScoreSpan)
}

// Adds 1 to a score on screen.
// The score is stored as text in the page, so we convert it to a number,
// add 1, and write it back.
function incrementScore(scoreSpan) {
  scoreSpan.textContent = Number(scoreSpan.textContent) + 1
}

// Writes the result of the round into the message line above the scoreboard.
function showMessage(outcome, yourSelection, computerSelection) {
  // Remove last round's color, then apply this round's (win / lose / tie colors are in styles.css)
  messageEl.classList.remove('win', 'lose', 'tie')
  messageEl.classList.add(outcome)

  if (outcome === 'tie') {
    messageEl.textContent = `It's a tie! You both chose ${yourSelection.name}.`
  } else if (outcome === 'win') {
    messageEl.textContent = `You win! ${capitalize(yourSelection.name)} beats ${yourSelection.beats}.`
  } else {
    messageEl.textContent = `Computer wins. ${capitalize(computerSelection.name)} beats ${computerSelection.beats}.`
  }
}

// Adds one row to the round history: your pick on the left, the computer's on the right.
function addRoundResult(yourSelection, computerSelection, outcome) {
  // One row holds both picks
  const row = document.createElement('div')
  row.classList.add('round')

  // Screen readers can't see the colors, so give each row a text description.
  // role="img" makes the row read as a single item using this label.
  row.setAttribute('role', 'img')
  row.setAttribute(
    'aria-label',
    `You chose ${yourSelection.name}. Computer chose ${computerSelection.name}. ` +
      (outcome === 'win' ? 'You won.' : outcome === 'lose' ? 'Computer won.' : 'Tie.')
  )

  // Add the two picks, each styled according to the outcome (winner / loser / tie)
  row.append(
    createPick(yourSelection, PICK_STYLES[outcome].you),
    createPick(computerSelection, PICK_STYLES[outcome].computer)
  )

  // Newest round goes on top, and the history section becomes visible
  historyList.prepend(row)
  historySection.hidden = false

  // Drop the oldest rounds if there are more than MAX_HISTORY
  while (historyList.children.length > MAX_HISTORY) {
    historyList.lastElementChild.remove()
  }
}

// Builds the little box showing one emoji pick. "style" is 'winner', 'loser' or 'tie'.
function createPick(selection, style) {
  const div = document.createElement('div')
  div.textContent = selection.emoji
  div.classList.add('result-selection', style)
  return div
}

// Puts the game back to its starting state.
function resetGame() {
  yourScoreSpan.textContent = '0'
  computerScoreSpan.textContent = '0'

  // Remove every round row and hide the history section again
  historyList.replaceChildren()
  historySection.hidden = true

  // Restore the starting message with neutral styling
  messageEl.classList.remove('win', 'lose', 'tie')
  messageEl.textContent = INTRO_MESSAGE
}

// Returns true if "selection" beats "opponentSelection", otherwise false.
// Example: rock "beats" scissors, so isWinner(rock, scissors) is true.
function isWinner(selection, opponentSelection) {
  return selection.beats === opponentSelection.name
}

// Picks one of the three moves at random for the computer.
function randomSelection() {
  // Math.random() gives a decimal from 0 up to (not including) 1.
  // Multiplying by 3 and rounding down gives 0, 1 or 2 - a valid position in the list.
  const randomIndex = Math.floor(Math.random() * SELECTIONS.length)
  return SELECTIONS[randomIndex]
}

// Turns "rock" into "Rock" so messages start with a capital letter.
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

document.addEventListener('DOMContentLoaded', function() {
  var player1Labels = document.querySelectorAll('#player1-icons label');
  var player2Labels = document.querySelectorAll('#player2-icons label');
  var userHand = document.getElementById('user-hand');
  var computerHand = document.getElementById('computer-hand');
  var resultMessage = document.querySelector('#message h2');
  var userChoiceInput = document.getElementById('user-choice');
  var computerChoiceInput = document.getElementById('computer-choice');
  var modeSwitch = document.getElementById('mode-switch');
  var isTwoPlayer = modeSwitch.checked;

  // Popup elements
  var cheatPopup = document.getElementById('cheat-popup');
  var cheatMessage = document.getElementById('cheat-message');
  var closeBtn = document.querySelector('.close-btn');

  var player1Score = 0;
  var player2Score = 0;

  var player1ScoreValue = document.getElementById('player1-score-value');
  var player2ScoreValue = document.getElementById('player2-score-value');

  var player1ScoreLabel = document.querySelector('#player1-score h3');
  var player2ScoreLabel = document.querySelector('#player2-score h3');

  var autoResetTimeout;
  var popupTimeout;
  
  // Add boolean flags to track player choices
  var player1HasChosen = false;
  var player2HasChosen = false;
  var player1Choice = null;
  var player2Choice = null;
  var gameInProgress = false;

  // Close button for the popup
  closeBtn.addEventListener('click', function() {
    cheatPopup.style.display = 'none';
  });

  // Close popup when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === cheatPopup) {
      cheatPopup.style.display = 'none';
    }
  });

  // Show popup function
  function showCheatPopup(playerNum) {
    // Clear any existing popup timeout
    clearTimeout(popupTimeout);
    
    // Update message based on which player tried to cheat
    if (playerNum === 1) {
      cheatMessage.textContent = "Player 1, don't try to cheat! We know you would change your choice just to win in a rock paper scissor game.";
    } else {
      cheatMessage.textContent = "Player 2, don't try to cheat! We know you would change your choice just to win in a rock paper scissor game.";
    }
    
    // Show the popup
    cheatPopup.style.display = 'block';
    
    // Auto-close after 3 seconds
    popupTimeout = setTimeout(function() {
      cheatPopup.style.display = 'none';
    }, 3000);
  }

  modeSwitch.addEventListener('change', function() {
    if (gameInProgress) return; // Prevent changing mode during a game
    
    isTwoPlayer = modeSwitch.checked;
    resetGame();
    resetScores();
    updateScoreLabels();
  });

  function updateScoreLabels() {
    if (isTwoPlayer) {
      player1ScoreLabel.textContent = 'Player 1';
      player2ScoreLabel.textContent = 'Player 2';
      document.getElementById('player2-icons').style.display = 'flex';
    } else {
      player1ScoreLabel.textContent = 'Player';
      player2ScoreLabel.textContent = 'Computer';
      document.getElementById('player2-icons').style.display = 'none';
    }
  }

  function resetScores() {
    player1Score = 0;
    player2Score = 0;
    player1ScoreValue.textContent = player1Score;
    player2ScoreValue.textContent = player2Score;
  }

  // Player 1 Selection
  player1Labels.forEach(function(label) {
    label.addEventListener('click', function() {
      if (player1HasChosen || gameInProgress) {
        // Show cheat popup for player 1
        showCheatPopup(1);
        return;
      } 
      
      var userChoice = this.getAttribute('data-choice');
      handlePlayer1Choice(userChoice);
    });
  });

  // Player 2 Selection
  player2Labels.forEach(function(label) {
    label.addEventListener('click', function() {
      if (player2HasChosen || gameInProgress) {
        // Show cheat popup for player 2
        showCheatPopup(2);
        return;
      }
      
      var player2Choice = this.getAttribute('data-choice');
      handlePlayer2Choice(player2Choice);
    });
  });

  // Keyboard Controls
  document.addEventListener('keydown', function(event) {
    var key = event.key.toLowerCase();
    
    if (!isTwoPlayer) {
      if (gameInProgress && ['q', 'a', 'z'].includes(key)) {
        // Show cheat popup for single player
        showCheatPopup(1);
        return;
      }
      
      if (!gameInProgress && ['q', 'a', 'z'].includes(key)) {
        var userChoice = keyToChoice(key);
        handlePlayer1Choice(userChoice);
      }
    } else {
      // Check if player 1 is trying to cheat
      if (player1HasChosen && ['q', 'a', 'z'].includes(key)) {
        showCheatPopup(1);
        return;
      }
      
      // Check if player 2 is trying to cheat
      if (player2HasChosen && ['m', 'k', 'i'].includes(key)) {
        showCheatPopup(2);
        return;
      }
      
      // Normal key handling
      if (!player1HasChosen && ['q', 'a', 'z'].includes(key)) {
        var userChoice = keyToChoice(key);
        handlePlayer1Choice(userChoice);
      }
      
      if (!player2HasChosen && ['m', 'k', 'i'].includes(key)) {
        var player2Choice = keyToChoice(key);
        handlePlayer2Choice(player2Choice);
      }
    }
  });

  function keyToChoice(key) {
    var mapping = {
      'q': 'rock',
      'a': 'paper',
      'z': 'scissors',
      'm': 'rock',
      'k': 'paper',
      'i': 'scissors'
    };
    return mapping[key];
  }

  function handlePlayer1Choice(userChoice) {
    // If player already chose, ignore subsequent attempts
    if (player1HasChosen) return;
    
    userChoiceInput.value = userChoice;
    
    if (!isTwoPlayer) {
      // Single-player mode - lock the game immediately
      gameInProgress = true;
      
      var choices = ['rock', 'paper', 'scissors'];
      var computerChoice = choices[Math.floor(Math.random() * choices.length)];
      computerChoiceInput.value = computerChoice;

      // Update Hands
      updateHand(userHand, userChoice);
      updateHand(computerHand, computerChoice);

      // Determine Winner
      var result = determineWinner(userChoice, computerChoice);
      resultMessage.setAttribute('data-result', result);

      // Show Message
      document.getElementById('message').style.display = 'block';

      // Stop Animations
      userHand.classList.add('stopped');
      computerHand.classList.add('stopped');

      // Update Scores
      if (result === "You win!") {
        player1Score++;
      } else if (result === "Computer wins!") {
        player2Score++;
      }

      player1ScoreValue.textContent = player1Score;
      player2ScoreValue.textContent = player2Score;

      // Automatically reset the game after 3 seconds
      autoResetTimeout = setTimeout(resetGame, 3000);
    } else {
      // Two-player mode - lock player 1's choice
      player1Choice = userChoice;
      player1HasChosen = true;
      
      // Don't show hand yet, just indicate choice was made
      userHand.classList.add('choice-made');
      
      // Add visual indicator that player 1 has locked in choice
      document.getElementById('player1-icons').classList.add('choice-locked');
      
      // Check if both players have made choices
      checkBothPlayersChosen();
    }
  }

  function handlePlayer2Choice(choice) {
    // If player already chose, ignore subsequent attempts
    if (player2HasChosen) return;
    
    if (isTwoPlayer) {
      player2Choice = choice;
      player2HasChosen = true;
      
      // Don't show hand yet, just indicate choice was made
      computerHand.classList.add('choice-made');
      
      // Add visual indicator that player 2 has locked in choice
      document.getElementById('player2-icons').classList.add('choice-locked');
      
      // Check if both players have made choices
      checkBothPlayersChosen();
    }
  }
  
  function checkBothPlayersChosen() {
    if (player1HasChosen && player2HasChosen) {
      // Lock the game once both players have chosen
      gameInProgress = true;
      
      // Now reveal both hands simultaneously
      updateHand(userHand, player1Choice);
      updateHand(computerHand, player2Choice);
      
      // Stop animations
      userHand.classList.add('stopped');
      computerHand.classList.add('stopped');
      
      // Show result
      determineAndShowResult();
    }
  }

  function determineAndShowResult() {
    var result = determineWinner(player1Choice, player2Choice);
    resultMessage.setAttribute('data-result', result);

    // Show Message
    document.getElementById('message').style.display = 'block';

    // Update Scores
    if (result === "Player 1 wins!") {
      player1Score++;
    } else if (result === "Player 2 wins!") {
      player2Score++;
    }

    player1ScoreValue.textContent = player1Score;
    player2ScoreValue.textContent = player2Score;

    // Automatically reset the game after 3 seconds
    autoResetTimeout = setTimeout(resetGame, 3000);
  }

  function updateHand(handElement, choice) {
    // Remove previous classes
    handElement.classList.remove('rock', 'paper', 'scissors');
    // Add new class
    handElement.classList.add(choice);

    // Reset finger styles
    var fingers = handElement.querySelectorAll('.finger');
    fingers.forEach(function(finger) {
      finger.style.width = '';
      finger.style.left = '';
      finger.style.borderLeft = '';
      finger.style.borderRadius = '';
      finger.style.transform = '';
    });

    if (choice === 'paper') {
      fingers.forEach(function(finger) {
        finger.style.left = '124px';
        finger.style.left = 'calc(124px + var(--dif))';
        finger.style.width = '80px';
        finger.style.borderLeft = '0';
        finger.style.borderRadius = '0 20px 20px 0';
      });
    } else if (choice === 'scissors') {
      var finger1 = handElement.querySelector('.finger-1');
      var finger2 = handElement.querySelector('.finger-2');
      finger1.style.width = '130px';
      finger1.style.transform = 'rotate(-5deg)';
      finger2.style.width = '130px';
      finger2.style.transform = 'rotate(5deg)';
    }
    // For rock, no changes needed
  }

  function determineWinner(user, computer) {
    if (user === computer) {
      return "It's a tie!";
    } else if (
      (user === 'rock' && computer === 'scissors') ||
      (user === 'paper' && computer === 'rock') ||
      (user === 'scissors' && computer === 'paper')
    ) {
      return isTwoPlayer ? "Player 1 wins!" : "You win!";
    } else {
      return isTwoPlayer ? "Player 2 wins!" : "Computer wins!";
    }
  }

  function resetFingerStyles(handElement) {
    var fingers = handElement.querySelectorAll('.finger');
    fingers.forEach(function(finger) {
      finger.style.width = '';
      finger.style.left = '';
      finger.style.borderLeft = '';
      finger.style.borderRadius = '';
      finger.style.transform = '';
    });
  }

  window.resetGame = function() {
    // Clear any existing timeouts
    clearTimeout(autoResetTimeout);
    clearTimeout(popupTimeout);
    
    // Hide popup if it's showing
    cheatPopup.style.display = 'none';

    // Reset Hands
    userHand.classList.remove('rock', 'paper', 'scissors', 'stopped', 'choice-made');
    computerHand.classList.remove('rock', 'paper', 'scissors', 'stopped', 'choice-made');
    
    // Reset both hands back to rock position
    userHand.classList.add('rock');
    computerHand.classList.add('rock');
    
    // Reset fingers to default rock position
    resetFingerStyles(userHand);
    resetFingerStyles(computerHand);
    
    // Hide Message
    document.getElementById('message').style.display = 'none';
    
    // Restart Animations
    userHand.style.animation = 'handShake 2s infinite';
    computerHand.style.animation = 'handShake2 2s infinite';

    // Reset choices
    player1Choice = null;
    player2Choice = null;
    player1HasChosen = false;
    player2HasChosen = false;
    gameInProgress = false;

    // Remove locked choice indicators
    document.getElementById('player1-icons').classList.remove('choice-locked');
    document.getElementById('player2-icons').classList.remove('choice-locked');

    // Update icons display
    if (isTwoPlayer) {
      document.getElementById('player1-icons').style.display = 'flex';
      document.getElementById('player2-icons').style.display = 'flex';
    } else {
      document.getElementById('player1-icons').style.display = 'flex';
      document.getElementById('player2-icons').style.display = 'none';
    }

    // Update score labels
    updateScoreLabels();
  }

  // Initialize score labels on page load
  updateScoreLabels();
});
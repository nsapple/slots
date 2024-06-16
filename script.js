/**
 * Setup
 */
const debugEl = document.getElementById('debug');
// Mapping of indexes to icons: start from banana in middle of initial position and then upwards
const iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"];
// Width of the icons
const icon_width = 79;
// Height of one icon in the strip
const icon_height = 79;
// Number of icons in the strip
const num_icons = 9;
// Max-speed in ms for animating one icon down
const time_per_icon = 100;
// Holds icon indexes
let indexes = [0, 0, 0];

// New variables for capy coins and password
let capyCoins = 0;
let passwordEntered = false;

// Listen for CTRL Q key combination
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'q') {
    const password = prompt('Enter password:');
    if (password === 'CAPY') {
      passwordEntered = true;
      const coinsToAdd = parseInt(prompt('Enter the number of capy coins to add:'));
      if (!isNaN(coinsToAdd) && coinsToAdd > 0) {
        capyCoins += coinsToAdd;
        alert(`You have added ${coinsToAdd} capy coins.`);
      } else {
        alert('Invalid input. Please enter a positive number.');
      }
    }
  }
});


/** 
 * Roll one reel
 */
const roll = (reel, offset = 0, target = null) => {
  // Minimum of 2 + the reel offset rounds
  let delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

  const style = getComputedStyle(reel);
  // Current background position
  const backgroundPositionY = parseFloat(style["background-position-y"]);

  // Rigged?
  if (target) {
    // calculate delta to target
    const currentIndex = backgroundPositionY / icon_height;
    delta = target - currentIndex + (offset + 2) * num_icons;
  }

  // Return promise so we can wait for all reels to finish
  return new Promise((resolve, reject) => {


    const
    // Target background position
    targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
    // Normalized background position, for reset
    normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    // Delay animation with timeout, for some reason a delay in the animation property causes stutter
    setTimeout(() => {
      // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
      reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
      // Set background position
      reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
    }, offset * 150);

    // After animation
    setTimeout(() => {
      // Reset position, so that it doesn't get higher without limit
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      // Resolve this promise
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);

  });
};


/**
 * Roll all reels, when promise resolves roll again
 */
function rollAll() {
  if (passwordEntered && capyCoins > 0) {
    // Deduct 1 capy coin for spinning the wheel
    capyCoins--;

    const reelsList = document.querySelectorAll('.slots > .reel');

    // rig the outcome for every 3rd roll, if targets is set to null, the outcome will not get rigged by the roll function
    const targets = null;
    if (!window.timesRolled) window.timesRolled = 0;
    window.timesRolled++;

    debugEl.textContent = 'rolling...';

    Promise

    // Activate each reel, must convert NodeList to Array for this with spread operator
    .all([...reelsList].map((reel, i) => roll(reel, i, targets ? targets[i] : null)))

    // When all reels done animimating (all promises solve)
    .then(deltas => {
      // add up indexes
      deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
      debugEl.textContent = indexes.map(i => iconMap[i]).join(' - ');
      // Play a random losing sound
      const losingSounds = ["perfect-fart.mp3", "wet-fart_1.mp3", "wrong-answer-sound-effect.mp3", "downer_noise.mp3", "mwahahaha.mp3", "erm-what-the-sigmaa.mp3", "crazy-realistic-knocking-sound-trim.mp3", "bazinga.swf.mp3", "999-social-credit-siren.mp3", "bonk_7zPAD7C.mp3"];
      const randomSound = losingSounds[Math.floor(Math.random() * losingSounds.length)];
      const audio = new Audio(randomSound);
      audio.play();
    });
  } else {
    alert('You need at least 1 capy coin to spin the wheel.');
  }
};

// Button click event listener
document.getElementById('spinButton').addEventListener('click', function() {
  if (passwordEntered && capyCoins > 0) {
    rollAll();
  } else {
    alert('You need at least 1 capy coin to spin the wheel.');
  }
});

// Remove the kickoff

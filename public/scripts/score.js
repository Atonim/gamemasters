export default class Score {
  constructor() {
    this.restartButtonElement = document.getElementById("restartButton");
    this.exitButtonElement = document.getElementById("exitButton");
    this.scoreLines = document.querySelectorAll('.score');
    this.names = document.querySelectorAll('.name');
    this.scores = JSON.parse(localStorage.getItem('game.scoreTable'));

    this.restartButtonElement.addEventListener("click", this.restart);
    this.exitButtonElement.addEventListener("click", this.exit);

    this.renderScore();
  }

  exit() {
    window.location.href = '/';
  }
  restart() {
    window.location.href = '/gamescreen';
  }

  renderScore() {
    if (window.localStorage['game.level'] === 'level_1') {
      this.restartButtonElement.innerHTML = 'NEXT'
      window.localStorage['game.level'] = 'level_2';
    }
    else {
      window.localStorage['game.level'] = 'level_1';
    }

    this.scoreLines.forEach(line => line.innerHTML = '0');
    this.names.forEach(name => name.innerHTML = 'Unknown');
    if (this.scores.length > 0) {
      for (let x = 0; x < this.scores.length; x++) {
        this.names[x].innerHTML = this.scores[x].name
        this.scoreLines[x].innerHTML = this.scores[x].score;
      }
    }

  }
}

const score = new Score();

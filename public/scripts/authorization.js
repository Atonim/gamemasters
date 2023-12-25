let usernameElement = document.getElementById("username")
let startButtonElement = document.getElementById("startButton")
let formElement = document.getElementById("form")

usernameElement.addEventListener("input", checkUsernameInput)
formElement.addEventListener("submit", saveUsername)

function checkUsernameInput(event) {
  if (usernameElement.value.length === 0) {
    startButtonElement.setAttribute("disabled", "disable")
  } else {
    startButtonElement.removeAttribute("disabled")
  }
}

function saveUsername(event) {
  window.localStorage['game.level'] = 'level_1';
  localStorage["game.username"] = usernameElement.value
  if (localStorage["game.scoreTable"] === undefined) {
    localStorage["game.scoreTable"] = JSON.stringify([])
  }
}

function readUsername(event) {
  if (localStorage["game.username"]) {
    usernameElement.value = localStorage["game.username"];
  }

}

readUsername();
checkUsernameInput();
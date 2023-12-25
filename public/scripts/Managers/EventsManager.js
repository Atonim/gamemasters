import { Actions, Control, Levels, GameStates } from "../enums.js";
import { sm } from "./SoundManager.js";

export let events_manager = new class EventsManager {
  /* Класс менеджера собитий */

  constructor() {
    this.action = Actions.move_right;
    this.level = Levels[window.localStorage['game.level']];
    //this.level = Levels['level_1'];
    this.game_state = GameStates.stop;
    this.is_end_game = false;

    this.btn_start = document.getElementById("start");

    document.body.addEventListener("keydown", this.onKeyDown);
    this.btn_start.addEventListener('click', this.startGame);
  }

  onKeyDown(event) {
    /* Метод, осуществляющий обработку нажатия клавиши */

    let action = Control[event.keyCode];
    if (action && events_manager.game_state !== GameStates.stop) {
      // Запускаем новое действие
      events_manager.action = Actions[action];
    }
  }
  startGame(event) {
    events_manager.game_state = GameStates.start;
  }
}
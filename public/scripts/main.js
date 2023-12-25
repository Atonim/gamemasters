import { GameManager } from "./Managers/GameManager.js";
import { events_manager } from "./Managers/EventsManager.js";


let game_manager = new GameManager(events_manager);

function updateWorld() {
    game_manager.update();
}

game_manager.play(updateWorld);
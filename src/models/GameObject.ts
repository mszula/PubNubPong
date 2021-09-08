import GameSettings from "./GameSettings"
import Position from "./Position"

export interface GameObject extends Position {
    width: number
    height: number
    gameSettings: GameSettings
}

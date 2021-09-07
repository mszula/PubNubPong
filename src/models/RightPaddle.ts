import Position from "./Position"
import GameSettings from "./GameSettings"
import Paddle from "./Paddle"
import Ball from "./Ball"
import { PaddlePositionEnum } from "../enum/PaddlePositionEnum"

export default class RightPaddle extends Paddle {
    public checkGoal(ball: Ball, gameSettings: GameSettings): boolean {
        return ball.x > gameSettings.canvas.width
    }

    public getStartCoordinates(gameSettings: GameSettings): Position {
        return {
            x: gameSettings.canvas.width - gameSettings.grid * 3,
            y: gameSettings.canvas.height / 2 - gameSettings.paddleHeight / 2,
        }
    }

    public getXAfterBounce(ball: Ball): number {
        return this.x - ball.width
    }

    public getPaddlePosition(): PaddlePositionEnum {
        return PaddlePositionEnum.Right
    }
}

import Position from "./Position"
import GameSettings from "./GameSettings"
import Paddle from "./Paddle"
import Ball from "./Ball"
import { PaddlePositionEnum } from "../enum/PaddlePositionEnum"

export default class LeftPaddle extends Paddle {
  public checkGoal(ball: Ball): boolean {
    return ball.x < 0
  }

  public getStartCoordinates(gameSettings: GameSettings): Position {
    return {
      x: gameSettings.grid * 2,
      y: (gameSettings.canvas.height - gameSettings.canvas.playerInfoGap) / 2 - gameSettings.paddleHeight / 2,
    }
  }

  public getXAfterBounce(): number {
    return this.x + this.width
  }

  public getPaddlePosition(): PaddlePositionEnum {
    return PaddlePositionEnum.Left
  }
}

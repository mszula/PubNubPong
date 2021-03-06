import { GameObject } from "./GameObject"
import Position from "./Position"
import Communication from "../communication"
import MovePaddleMessage from "./message/MovePaddleMessage"
import { PongSignalsEnum } from "../enum/PongEventsEnum"
import Ball from "./Ball"
import GameSettings from "./GameSettings"
import { PaddlePositionEnum } from "../enum/PaddlePositionEnum"
import PaddlePosition from "./PaddlePosition"

const publishPeriod = 500

export default abstract class Paddle implements GameObject {
  x: number
  y: number
  width: number
  height: number
  gameSettings: GameSettings
  private velocity: number
  private lastPublishTime: number = 0

  constructor(gameSettings: GameSettings) {
    this.x = this.getStartCoordinates(gameSettings).x
    this.y = this.getStartCoordinates(gameSettings).y
    this.width = gameSettings.grid
    this.height = gameSettings.paddleHeight
    this.velocity = 0
    this.gameSettings = gameSettings
  }

  public move(position: PaddlePosition) {
    this.x = position.x
    this.y = position.y
    this.velocity = position.velocity
  }

  public setVelocity(velocity: number, communication: Communication) {
    this.velocity = velocity

    this.publish(communication, true)
  }

  public updatePosition(communication?: Communication): Paddle {
    if (this.velocity !== 0) {
      this.y += this.velocity

      const minPaddleY = this.gameSettings.grid + this.gameSettings.canvas.playerInfoGap
      const maxPaddleY = this.gameSettings.canvas.height - this.gameSettings.grid - this.gameSettings.paddleHeight
      if (this.y < minPaddleY) {
        this.y = minPaddleY
      } else if (this.y > maxPaddleY) {
        this.y = maxPaddleY
      }

      if (communication) {
        this.publish(communication)
      }
    }

    return this
  }

  public publish(communication: Communication, force?: boolean) {
    if (this.lastPublishTime + publishPeriod < Date.now() || force) {
      communication.publish({
        type: PongSignalsEnum.MovePaddle,
        x: this.x,
        y: this.y,
        v: this.velocity,
        position: this.getPaddlePosition(),
      } as MovePaddleMessage)
      this.lastPublishTime = Date.now()
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillRect(this.x, this.y, this.width, this.height)
  }

  abstract checkGoal(ball: Ball, gameSettings: GameSettings): boolean

  abstract getStartCoordinates(gameSettings: GameSettings): Position

  abstract getXAfterBounce(ball: Ball): number

  abstract getPaddlePosition(): PaddlePositionEnum
}

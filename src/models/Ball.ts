import Communication from "../communication"
import { PongSignalsEnum } from "../enum/PongEventsEnum"
import GameSettings from "./GameSettings"
import { GameObject } from "./GameObject"
import BallPosition from "./BallPosition"
import MoveBallMessage from "./message/MoveBalllMessage"
import Paddle from "./Paddle"

const publishPeriod = 200

export default class Ball implements GameObject {
  x: number = 0
  y: number = 0
  width: number
  height: number
  xVelocity: number = 0
  yVelocity: number = 0
  moving: boolean = false
  gameSettings: GameSettings
  private lastPublishTime: number = 0

  constructor(gameSettings: GameSettings) {
    this.reset(gameSettings)
    this.width = gameSettings.grid
    this.height = gameSettings.grid
    this.gameSettings = gameSettings
    this.xVelocity = this.gameSettings.ballSpeed
    this.yVelocity = -this.gameSettings.ballSpeed
  }

  public reset(gameSettings: GameSettings) {
    this.x = gameSettings.canvas.width / 2
    this.y = gameSettings.canvas.height / 2
    this.moving = false
  }

  public serve(communication: Communication) {
    this.moving = true

    this.publish(communication, true)
  }

  public move(position: BallPosition) {
    this.x = position.x
    this.y = position.y
    this.xVelocity = position.xVelocity
    this.yVelocity = position.yVelocity
    this.moving = position.moving
  }

  public updatePosition(communication: Communication): Ball {
    if (this.moving) {
      this.x += this.xVelocity
      this.y += this.yVelocity

      if (this.y < this.width + this.gameSettings.canvas.playerInfoGap) {
        this.y = this.width + this.gameSettings.canvas.playerInfoGap
        this.yVelocity *= -1
      } else if (this.y + this.width > this.gameSettings.canvas.height - this.width) {
        this.y = this.gameSettings.canvas.height - this.width * 2
        this.yVelocity *= -1
      }

      this.publish(communication)
    }

    return this
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillRect(this.x, this.y, this.width, this.height)
  }

  public bounce(paddle: Paddle, communication?: Communication | null) {
    this.xVelocity *= -1
    this.x = paddle.getXAfterBounce(this)

    if (communication) {
      this.publish(communication, true)
    }
  }

  private publish(communication: Communication, force?: boolean) {
    if ((communication.isHost && this.lastPublishTime + publishPeriod < Date.now()) || force) {
      communication.publish({
        type: PongSignalsEnum.MoveBall,
        x: this.x,
        y: this.y,
        d: this.xVelocity,
        c: this.yVelocity,
        m: this.moving,
      } as MoveBallMessage)
      this.lastPublishTime = Date.now()
    }
  }
}

import Communication from "./communication"
import { PaddlePositionEnum } from "./enum/PaddlePositionEnum"
import { PongSignalsEnum, PongEventsEnum } from "./enum/PongEventsEnum"
import Ball from "./models/Ball"
import GameSettings from "./models/GameSettings"
import MoveBallMessage from "./models/message/MoveBalllMessage"
import MovePaddleMessage from "./models/message/MovePaddleMessage"
import Player from "./models/Player"
import PlayerInfoMessage from "./models/message/PlayerInfoMessage"
import { collides } from "./helper/collides"
import GoalMessage from "./models/message/GoalMessage"
import LeftPaddle from "./models/LeftPaddle"
import RightPaddle from "./models/RightPaddle"

export class Pong {
  private readonly communication: Communication
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D

  private readonly gameSettings: GameSettings
  private readonly ball: Ball
  private readonly me: Player
  private readonly opponent: Player
  private renderGame: boolean

  constructor(canvas: HTMLCanvasElement, gameSettings: GameSettings, communication: Communication, me: Player) {
    this.canvas = canvas
    this.communication = communication
    this.gameSettings = gameSettings
    this.me = me
    this.renderGame = false

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Canvas error!")
    }
    this.context = context

    this.ball = new Ball(this.gameSettings)

    if (this.me.paddle.getPaddlePosition() === PaddlePositionEnum.Left) {
      this.opponent = new Player(new RightPaddle(this.gameSettings), "")
    } else {
      this.opponent = new Player(new LeftPaddle(this.gameSettings), "")
    }

    this.addListeners()
  }

  public startGame(): this {
    this.renderGame = true
    this.communication.publish({
      type: PongSignalsEnum.PlayerInfo,
      name: this.me.name,
    } as PlayerInfoMessage)

    if (this.communication.isHost) {
      this.ball.serve(this.communication)
    }

    return this
  }

  public stopGame(): this {
    this.renderGame = false

    return this
  }

  public gameLoop(): this {
    requestAnimationFrame(() => this.renderGame && this.gameLoop())

    this.context.fillStyle = "white"

    if (collides(this.ball, this.me.paddle)) {
      this.ball.bounce(this.me.paddle, this.communication)
    } else if (collides(this.ball, this.opponent.paddle)) {
      this.ball.bounce(this.opponent.paddle)
    }

    const myGoal = this.me.paddle.checkGoal(this.ball, this.gameSettings)
    const opponentGoal = this.opponent.paddle.checkGoal(this.ball, this.gameSettings)
    if (myGoal || opponentGoal) {
      this.ball.reset(this.gameSettings)

      if (this.communication.isHost) {
        setTimeout(() => {
          this.ball.serve(this.communication)
        }, 1000)
      }

      if (myGoal) {
        this.communication.publish({
          type: PongSignalsEnum.Goal,
          opponentPoints: this.me.points,
        } as GoalMessage)
        this.opponent.goal()
      }
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.ball.updatePosition(this.communication).draw(this.context)

    this.me.paddle.updatePosition(this.communication).draw(this.context)
    this.opponent.paddle.updatePosition(this.communication).draw(this.context)

    this.context.fillStyle = "grey"
    this.context.fillRect(
      0,
      this.gameSettings.canvas.playerInfoGap,
      this.gameSettings.canvas.width,
      this.gameSettings.grid
    )
    this.context.fillRect(
      0,
      this.gameSettings.canvas.height - this.gameSettings.grid,
      this.gameSettings.canvas.width,
      this.gameSettings.canvas.height
    )

    this.drawPlayersInfo()

    return this
  }

  public getOpponentName(): string {
    return this.opponent.name
  }

  private addListeners() {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          this.me.paddle.setVelocity(-this.gameSettings.paddleSpeed)
          break
        case "ArrowDown":
          this.me.paddle.setVelocity(this.gameSettings.paddleSpeed)
          break
      }
    })

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        this.me.paddle.setVelocity(0)
      }
    })

    addEventListener(PongEventsEnum.MovePaddle, ((e: CustomEvent<MovePaddleMessage>) => {
      this.opponent.paddle.move({ ...e.detail })
    }) as EventListener)

    addEventListener(PongEventsEnum.MoveBall, ((e: CustomEvent<MoveBallMessage>) => {
      this.ball.move({ ...e.detail, xVelocity: e.detail.d, yVelocity: e.detail.c, moving: e.detail.m })
    }) as EventListener)

    addEventListener(PongEventsEnum.PlayerInfo, ((e: CustomEvent<PlayerInfoMessage>) => {
      this.opponent.updatePlayerInfo({ ...e.detail })
    }) as EventListener)

    addEventListener(PongEventsEnum.Goal, ((e: CustomEvent<GoalMessage>) => {
      this.me.goal()
      this.opponent.updatePoints(e.detail.opponentPoints)
    }) as EventListener)
  }

  private drawPlayersInfo() {
    this.context.font = '16px "Press Start 2P"'
    this.context.textBaseline = "top"

    let leftScreen = this.me
    let rightScreen = this.opponent

    if (this.me.paddle.getPaddlePosition() === PaddlePositionEnum.Right) {
      leftScreen = this.opponent
      rightScreen = this.me
    }

    this.context.textAlign = "left"
    this.context.fillText(leftScreen.name, 5, 5)

    this.context.textAlign = "right"
    this.context.fillText(rightScreen.name, this.gameSettings.canvas.width - 5, 5)

    this.context.textAlign = "center"
    this.context.fillText(`${leftScreen.points} : ${rightScreen.points}`, this.gameSettings.canvas.width / 2, 5)
  }
}

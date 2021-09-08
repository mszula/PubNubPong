import Pubnub, { generateUUID, PresenceEvent, SignalEvent } from "pubnub"
import MovePaddleMessage from "./models/message/MovePaddleMessage"
import { PongEventsEnum, PongSignalsEnum } from "./enum/PongEventsEnum"
import PongMessage from "./models/message/PongMessage"
import HelloOpponentMesssage from "./models/message/HelloOpponentMesssage"
import MoveBallMessage from "./models/message/MoveBalllMessage"
import PlayerInfoMessage from "./models/message/PlayerInfoMessage"
import LeftTheGameMesssage from "./models/message/LeftTheGameMesssage"
import GoalMessage from "./models/message/GoalMessage"

export default class Communication {
  isHost: boolean
  private pubnub: Pubnub
  readonly channelId: string
  readonly uuid: string

  constructor(channelId: string, isHost: boolean) {
    this.uuid = generateUUID()
    this.channelId = channelId
    this.isHost = isHost

    this.pubnub = new Pubnub({
      publishKey: String(import.meta.env.VITE_PUBNUB_PUBLISH_KEY),
      subscribeKey: String(import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY),
      uuid: this.uuid,
    })
  }

  public subscribe(): this {
    this.pubnub.subscribe({
      channels: [this.getChannelName()],
      withPresence: true,
    })

    window.addEventListener("beforeunload", () => {
      this.pubnub.unsubscribe({
        channels: [this.getChannelName()],
      })
    })

    this.pubnub.addListener({
      signal: (signal: SignalEvent): void => {
        if (signal.publisher === this.uuid) {
          return
        }

        switch (signal.message.type) {
          case PongSignalsEnum.MovePaddle:
            dispatchEvent(
              new CustomEvent<MovePaddleMessage>(PongEventsEnum.MovePaddle, {
                detail: { ...signal.message },
              })
            )
            break
          case PongSignalsEnum.MoveBall:
            dispatchEvent(
              new CustomEvent<MoveBallMessage>(PongEventsEnum.MoveBall, {
                detail: { ...signal.message },
              })
            )
            break
          case PongSignalsEnum.PlayerInfo:
            dispatchEvent(
              new CustomEvent<PlayerInfoMessage>(PongEventsEnum.PlayerInfo, {
                detail: { ...signal.message },
              })
            )
            break
          case PongSignalsEnum.Goal:
            dispatchEvent(
              new CustomEvent<GoalMessage>(PongEventsEnum.Goal, {
                detail: { ...signal.message },
              })
            )
            break
        }
      },
      presence: (event: PresenceEvent) => {
        if (event.uuid === this.uuid) {
          return
        }

        switch (event.action) {
          case "join":
            dispatchEvent(
              new CustomEvent<HelloOpponentMesssage>(PongEventsEnum.HelloOpponent, {
                detail: { type: PongEventsEnum.HelloOpponent },
              })
            )
            break
          case "leave":
            dispatchEvent(
              new CustomEvent<LeftTheGameMesssage>(PongEventsEnum.LeftTheGame, {
                detail: { type: PongEventsEnum.LeftTheGame },
              })
            )
            break
        }
      },
    })

    return this
  }

  public publish(message: PongMessage): this {
    this.pubnub.signal({
      channel: this.getChannelName(),
      message: { ...message },
    })

    return this
  }

  public async checkPresence(): Promise<number> {
    const hereNow = await this.pubnub.hereNow({
      channels: [this.getChannelName()],
    })

    return hereNow.totalOccupancy
  }

  private getChannelName(): string {
    return `pong.${this.channelId}`
  }
}

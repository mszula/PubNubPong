import Pubnub, { generateUUID, MessageEvent, PresenceEvent } from "pubnub"
import MovePaddleMessage from "./models/message/MovePaddleMessage"
import { PongEventsEnum } from "./enum/PongEventsEnum"
import PongMessage from "./models/message/PongMessage"
import HelloOpponentMesssage from "./models/message/HelloOpponentMesssage"
import MoveBallMessage from "./models/message/MoveBalllMessage"
import PlayerInfoMessage from "./models/message/PlayerInfoMessage"
import LeftTheGameMesssage from "./models/message/LeftTheGameMesssage"
import GoalMessage from "./models/message/GoalMessage"

export default class Communication {
    isHost: boolean
    private pubnub: Pubnub
    private channelId: string
    private uuid: string

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
            message: (messageEvent: MessageEvent): void => {
                if (messageEvent.message.uuid === this.uuid) {
                    return
                }

                switch (messageEvent.message.type) {
                    case PongEventsEnum.MovePaddle:
                        dispatchEvent(
                            new CustomEvent<MovePaddleMessage>(PongEventsEnum.MovePaddle, {
                                detail: { ...messageEvent.message },
                            })
                        )
                        break
                    case PongEventsEnum.MoveBall:
                        dispatchEvent(
                            new CustomEvent<MoveBallMessage>(PongEventsEnum.MoveBall, {
                                detail: { ...messageEvent.message },
                            })
                        )
                        break
                    case PongEventsEnum.PlayerInfo:
                        dispatchEvent(
                            new CustomEvent<PlayerInfoMessage>(PongEventsEnum.PlayerInfo, {
                                detail: { ...messageEvent.message },
                            })
                        )
                        break
                    case PongEventsEnum.Goal:
                        dispatchEvent(
                            new CustomEvent<GoalMessage>(PongEventsEnum.Goal, {
                                detail: { ...messageEvent.message },
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
                                detail: { type: PongEventsEnum.HelloOpponent, uuid: event.uuid },
                            })
                        )
                        break
                    case "leave":
                        dispatchEvent(
                            new CustomEvent<LeftTheGameMesssage>(PongEventsEnum.LeftTheGame, {
                                detail: { type: PongEventsEnum.LeftTheGame, uuid: event.uuid },
                            })
                        )
                        break
                }
            },
            status: (event: any) => {
                console.log(event)
                console.log("[STATUS: " + event.category + "] connected to channels: " + event.affectedChannels)
            },
        })

        return this
    }

    public publish(message: PongMessage): this {
        this.pubnub.publish({
            channel: this.getChannelName(),
            message: { ...message, uuid: this.uuid },
        })

        return this
    }

    public async checkPresence(): Promise<boolean> {
        const hereNow = await this.pubnub.hereNow({
            channels: [this.getChannelName()],
        })

        return hereNow.totalOccupancy > 0
    }

    private getChannelName(): string {
        return `pong.${this.channelId}`
    }
}

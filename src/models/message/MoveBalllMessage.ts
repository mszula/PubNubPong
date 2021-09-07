import { PongEventsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface MoveBallMessage extends PongMessage {
    type: PongEventsEnum.MoveBall
    x: number
    y: number
    xVelocity: number
    yVelocity: number
    moving: boolean
}

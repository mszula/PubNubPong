import { PaddlePositionEnum } from "../../enum/PaddlePositionEnum"
import { PongEventsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface MovePaddleMessage extends PongMessage {
    type: PongEventsEnum.MovePaddle
    x: number
    y: number
    position: PaddlePositionEnum
}

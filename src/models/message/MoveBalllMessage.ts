import { PongSignalsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface MoveBallMessage extends PongMessage {
    type: PongSignalsEnum.MoveBall
    x: number
    y: number
    d: number
    c: number
    m: boolean
}

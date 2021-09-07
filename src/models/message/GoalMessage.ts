import { PongEventsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface GoalMessage extends PongMessage {
    type: PongEventsEnum.Goal
    opponentPoints: number
}

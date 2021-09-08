import { PongSignalsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface GoalMessage extends PongMessage {
  type: PongSignalsEnum.Goal
  opponentPoints: number
}

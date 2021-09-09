import { PaddlePositionEnum } from "../../enum/PaddlePositionEnum"
import { PongSignalsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface MovePaddleMessage extends PongMessage {
  type: PongSignalsEnum.MovePaddle
  x: number
  y: number
  v: number
  position: PaddlePositionEnum
}

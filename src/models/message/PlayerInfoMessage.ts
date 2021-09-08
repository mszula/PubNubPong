import { PongSignalsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface PlayerInfoMessage extends PongMessage {
  type: PongSignalsEnum.PlayerInfo
  name: string
}

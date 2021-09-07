import { PongEventsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface PlayerInfoMessage extends PongMessage {
    type: PongEventsEnum.PlayerInfo
    name: string
}

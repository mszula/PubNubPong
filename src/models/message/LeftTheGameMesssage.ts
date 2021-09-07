import { PongEventsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface LeftTheGameMessage extends PongMessage {
    type: PongEventsEnum.LeftTheGame
}

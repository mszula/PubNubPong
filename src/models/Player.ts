import PlayerInfoMessage from "./message/PlayerInfoMessage"
import Paddle from "./Paddle"

export default class Player {
    name: string
    points: number
    paddle: Paddle

    constructor(paddle: Paddle, name: string) {
        this.paddle = paddle
        this.name = name
        this.points = 0
    }

    public updatePlayerInfo(playerInfoMessage: PlayerInfoMessage) {
        this.name = playerInfoMessage.name
    }

    public updatePoints(points: number) {
        this.points = points
    }

    public goal() {
        this.points++
    }
}

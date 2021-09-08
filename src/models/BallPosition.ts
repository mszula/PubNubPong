import Position from "./Position"

export default interface BallPosition extends Position {
  xVelocity: number
  yVelocity: number
  moving: boolean
}

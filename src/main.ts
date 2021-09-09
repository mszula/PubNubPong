import "./style.css"
import { Pong } from "./pong"
import Communication from "./communication"
import { generateChannelId } from "./helper/generateChannelId"
import { PongEventsEnum } from "./enum/PongEventsEnum"
import Player from "./models/Player"
import LeftPaddle from "./models/LeftPaddle"
import RightPaddle from "./models/RightPaddle"
import GameSettings from "./models/GameSettings"

const gameSettings = {
  grid: 15,
  paddleHeight: 80,
  ballSpeed: 5,
  paddleSpeed: 6,
  canvas: {
    height: 615,
    width: 750,
    playerInfoGap: 30,
  },
} as GameSettings

const getUrlChannelId = (): string | null => {
  const currentUrl = new URLSearchParams(window.location.search)
  return currentUrl.get("id")
}

const replaceChannelIdInUrl = (channelId: string) => {
  const currentUrl = new URLSearchParams(window.location.search)
  currentUrl.set("id", channelId)
  history.replaceState(null, "", `?${currentUrl.toString()}`)
}

const dialogStart = document.getElementById("dialogStart") as HTMLElement
const nameInput = document.getElementById("nameInput") as HTMLInputElement
const createGameButton = document.getElementById("startGame") as HTMLButtonElement
const canvas = document.getElementById("pong") as HTMLCanvasElement
canvas.height = gameSettings.canvas.height
canvas.width = gameSettings.canvas.width
// canvas.style.transform = `scale(${window.innerHeight / gameSettings.canvas.height - 0.1})`

const urlChannelId = getUrlChannelId()
if (urlChannelId) {
  const communication = new Communication(urlChannelId, false)
  communication.checkPresence().then((totalOccupancy: number) => {
    if (totalOccupancy === 0 || totalOccupancy === 2) {
      let roomError
      if (totalOccupancy === 0) {
        roomError = document.getElementById("emptyRoomError") as HTMLElement
      } else {
        roomError = document.getElementById("fullRoomError") as HTMLElement
      }
      roomError.style.display = "block"
      replaceChannelIdInUrl("")
    } else {
      createGameButton.textContent = "Join"
    }
  })
}

createGameButton.onclick = () => {
  dialogStart.style.display = "none"
  let pong: Pong | null = null

  if (getUrlChannelId()) {
    pong = prepareGameAsOpponent()
    pong.startGame().gameLoop()
  } else {
    pong = prepareGameAsHost()
    const urlInput = document.getElementById("urlInput") as HTMLInputElement
    urlInput.value = window.location.href
    urlInput.onclick = () => {
      navigator.clipboard.writeText(urlInput.value).then(() => {
        const copiedBalloon = document.getElementById("copiedBalloon") as HTMLInputElement
        copiedBalloon.style.display = "block"

        setTimeout(() => {
          copiedBalloon.style.display = "none"
        }, 2000)
      })
    }
    const dialogWaiting = document.getElementById("dialogWaiting") as HTMLElement
    dialogWaiting.style.display = "flex"

    addEventListener(PongEventsEnum.HelloOpponent, (() => {
      dialogWaiting.style.display = "none"

      pong?.startGame().gameLoop()
    }) as EventListener)
  }

  addEventListener(PongEventsEnum.LeftTheGame, (() => {
    pong?.stopGame()

    const opponentNameSpan = document.getElementById("opponentName") as HTMLElement
    opponentNameSpan.innerHTML = pong?.getOpponentName() || ""

    const dialogLeftTheGame = document.getElementById("dialogLeftTheGame") as HTMLElement
    dialogLeftTheGame.style.display = "flex"
  }) as EventListener)
}

const prepareGameAsHost = (): Pong => {
  const channelId = generateChannelId()
  replaceChannelIdInUrl(channelId)

  return new Pong(
    canvas,
    gameSettings,
    new Communication(channelId, true).subscribe(),
    new Player(new LeftPaddle(gameSettings), nameInput.value)
  )
}

const prepareGameAsOpponent = (): Pong => {
  const channelId = getUrlChannelId() || ""

  return new Pong(
    canvas,
    gameSettings,
    new Communication(channelId, false).subscribe(),
    new Player(new RightPaddle(gameSettings), nameInput.value)
  )
}

// requestAnimationFrame(pong.gameLoop);

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
        height: 585,
        width: 750,
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

const nameInput = document.getElementById("nameInput") as HTMLInputElement
const createGameButton = document.getElementById("startGame")
if (createGameButton === null) {
    throw new Error("Massive error")
}

const urlChannelId = getUrlChannelId()
if (urlChannelId) {
    const communication = new Communication(urlChannelId, false)
    communication.checkPresence().then((isPresent: boolean) => {
        if (!isPresent) {
            const emptyRoomError = document.getElementById("emptyRoomError")
            if (emptyRoomError === null) {
                throw new Error("Massive error")
            }
            emptyRoomError.style.display = "block"
            replaceChannelIdInUrl("")
        } else {
            createGameButton.textContent = "Join"
        }
    })
}

const dialogStart = document.getElementById("dialog-start") as HTMLDialogElement
// @ts-ignore
dialogStart.showModal()

createGameButton.onclick = () => {
    let pong: Pong | null = null

    if (getUrlChannelId()) {
        pong = prepareGameAsOpponent()
        pong.startGame().gameLoop()
    } else {
        pong = prepareGameAsHost()
        const dialogWaiting = document.getElementById("dialog-waiting") as HTMLDialogElement
        // @ts-ignore
        dialogWaiting.showModal()

        addEventListener(PongEventsEnum.HelloOpponent, (() => {
            dialogWaiting.remove()

            pong?.startGame().gameLoop()
        }) as EventListener)
    }

    addEventListener(PongEventsEnum.LeftTheGame, (() => {
        pong?.stopGame()

        const opponentNameSpan = document.getElementById("opponentName")
        if (opponentNameSpan) {
            opponentNameSpan.innerHTML = pong?.getOpponentName() || ""
        }

        const dialogLeftTheGame = document.getElementById("dialogLeftTheGame") as HTMLDialogElement
        // @ts-ignore
        dialogLeftTheGame.showModal()
    }) as EventListener)
}

const prepareGameAsHost = (): Pong => {
    const channelId = generateChannelId()
    replaceChannelIdInUrl(channelId)

    return new Pong(
        gameSettings,
        new Communication(channelId, true).subscribe(),
        new Player(new LeftPaddle(gameSettings), nameInput.value)
    )
}

const prepareGameAsOpponent = (): Pong => {
    const channelId = getUrlChannelId() || ""

    return new Pong(
        gameSettings,
        new Communication(channelId, false).subscribe(),
        new Player(new RightPaddle(gameSettings), nameInput.value)
    )
}

// requestAnimationFrame(pong.gameLoop);

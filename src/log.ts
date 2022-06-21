const isLog = true

let logElement: HTMLElement | null = null

export const log = async (text: string) => {
    if (!logElement) logElement = document.getElementById('log')
    if (!logElement) return

    logElement.innerHTML = text

    if (!isLog) return

    await new Promise(resolve => setTimeout(() => resolve(''), 0))

    // await new Promise(requestAnimationFrame)
    // await new Promise(requestAnimationFrame)
}

import { ASD } from '../findCode'

const getAngle = (x1: number, y1: number, x2: number, y2: number) =>
    (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI

export const getAngleFromRectsLines = (rectList: ASD[][]) => {
    let angleSum = 0
    let angleCount = 0

    for (let i = 0; i < rectList.length; i++) {
        const rects = rectList[i]

        for (let j = 0; j < rects.length; j++) {
            const rect = rects[j].rect

            if (j < rects.length - 1) {
                angleSum += getAngle(rect.x, rect.y, rects[j + 1].rect.x, rects[j + 1].rect.y)
                angleCount++
            }
        }
    }

    return Math.round(angleSum / angleCount)
}

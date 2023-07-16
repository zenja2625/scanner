import { ASD } from '../findCode'

const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

export const rectsListIsAfterLine = (
    list: ASD[],
    angle: number,
    getFitstLineY: (x: number) => number
) => {
    const rect = list[0].rect

    const lineX = angle > 0 ? rect.x + rect.width : rect.x
    const lineY = getFitstLineY(lineX)

    return lineY < rect.y && getDistance(rect.x, rect.y, lineX, lineY) <= rect.height * 1.5
}

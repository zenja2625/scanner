import { ASD, isHeightDifferentByPercent, isIntersect } from '../findCode'

export const sortRectsByLines = (rectsSortX: ASD[]) => {
    const rectList: ASD[][] = []

    for (let i = 0; i < rectsSortX.length; i++) {
        const sortRect = rectsSortX[i].rect

        if (
            sortRect.width > 50 ||
            sortRect.height > 50 ||
            sortRect.width < 4 ||
            sortRect.height < 10 ||
            sortRect.y <= 0 ||
            sortRect.y + sortRect.height >= 200
        )
            continue

        let seletedList = -1
        let minDeltaX = 1000

        for (let j = 0; j < rectList.length; j++) {
            const list = rectList[j]
            const rect = list[list.length - 1].rect

            if (
                !isHeightDifferentByPercent(rect.height, sortRect.height, 0.2) &&
                isIntersect(
                    [rect.y, rect.y + rect.height],
                    [sortRect.y, sortRect.y + sortRect.height]
                )
            ) {
                const deltaX = sortRect.x - rect.x
                if (minDeltaX > deltaX) {
                    seletedList = j
                    minDeltaX = deltaX
                }
            }
        }

        if (seletedList !== -1) {
            rectList[seletedList].push(rectsSortX[i])
        } else {
            rectList.push([rectsSortX[i]])
        }
    }

    return rectList.filter(list => list.length >= 3)
}

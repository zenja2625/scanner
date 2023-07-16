import cv, { Mat, Rect } from 'opencv-ts'

export type ASD = {
    rect: Rect
    contour: Mat
}

export const findContourRects = (src: Mat) => {
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()

    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    const rectsSortX: ASD[] = []

    for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i)
        const rect = cv.boundingRect(contour)

        let j = 0

        for (; j < rectsSortX.length; j++) {
            const sortRect = rectsSortX[j]

            if (sortRect.rect.x >= rect.x) break
        }

        rectsSortX.splice(j, 0, { rect, contour })
    }

    return rectsSortX
}

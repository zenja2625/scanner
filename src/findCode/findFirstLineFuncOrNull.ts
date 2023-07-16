import cv, { Mat } from 'opencv-ts'

export const findFirstLineFuncOrNull = (src: Mat, angle: number) => {
    const dsize = new cv.Size(src.cols, src.rows)
    const center = new cv.Point(src.cols / 2, src.rows / 2)
    const M = cv.getRotationMatrix2D(center, angle, 1)
    const rotate = new cv.Mat()

    cv.warpAffine(src, rotate, M, dsize)
    cv.threshold(rotate, rotate, 125, 255, cv.THRESH_BINARY)

    cv.erode(rotate, rotate, new cv.Mat.ones(1, 50, cv.CV_8U))
    cv.dilate(rotate, rotate, new cv.Mat.ones(1, 50, cv.CV_8U))
    cv.dilate(rotate, rotate, new cv.Mat.ones(3, 3, cv.CV_8U))

    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()

    cv.findContours(rotate, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let minYContourIndex = -1
    let minYContour = src.rows + 1

    for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i)
        const rect = cv.boundingRect(contour)
        if (rect.width > 70 && minYContour > rect.y) {
            minYContour = rect.y
            minYContourIndex = i
        }
    }

    const radians = (angle * Math.PI) / 180
    const tan = Math.tan(radians)

    return minYContourIndex !== -1
        ? (x: number) => Math.round((x - src.rows / 2) * tan + minYContour)
        : null
}

import cv, { Mat } from 'opencv-ts'
import { ASD } from '../findCode'

export const resizeAndReturnData = (src: Mat, rectList: ASD[][], size: number, angle: number) => {
    const numbe: number[][] = []



    for (let j = 0; j < rectList.length; j++) {
        const list = rectList[j]

        for (let i = 0; i < list.length; i++) {
            const { x, y, height, width } = list[i].rect
            const rect = new cv.Rect(x, y, width, height)
            const number = src.roi(rect)
            const asd: Mat = new cv.Mat()
            number.copyTo(asd)

            //Wrap to Recognize
            const dsize = new cv.Size(asd.cols, asd.rows)
            const center = new cv.Point(asd.cols / 2, asd.rows / 2)
            const M = cv.getRotationMatrix2D(center, angle, 1)
            cv.warpAffine(asd, asd, M, dsize)
            //!!!!!!!!!!!!!!!!!!!!!!!


            cv.bitwise_not(asd, asd)

            const scale = new cv.Mat(size, size, cv.CV_8UC1, new cv.Scalar(0))

            cv.resize(
                asd,
                scale,
                new cv.Size(
                    height > width ? width * (size / height) : size,
                    height < width ? height * (size / width) : size
                ),
                1,
                1,
                cv.INTER_NEAREST
            )

            
            const widthOffset = scale.cols < size ? size - scale.cols : 0

            cv.copyMakeBorder(
                scale,
                scale,
                0,
                scale.rows < size ? size - scale.rows : 0,
                Math.floor(widthOffset / 2),
                widthOffset - Math.floor(widthOffset / 2),
                cv.BORDER_CONSTANT,
                new cv.Scalar(255)
            )

            numbe.push(Array.from(scale.data))

            asd.delete()
            scale.delete()
        }
    }

    return numbe
}

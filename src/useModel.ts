import * as tf from '@tensorflow/tfjs'
import { useCallback, useEffect, useState } from 'react'
import cv, { Mat } from 'opencv-ts'
import { Rect } from './types'
import { log } from './log'

export const useModel = () => {
    const [model, setModel] = useState<tf.LayersModel | null>(null)

    useEffect(() => {
        const loadModel = async () => {
            const model = await tf.loadLayersModel('https://192.168.0.104:3000/model.json')

            const result = model.predict(tf.zeros([1, 30, 30, 1])) as tf.Tensor<tf.Rank>

            result.dataSync()
            result.dispose()

            setModel(model)
        }

        loadModel()
    }, [])

    const searchContours = useCallback(
        async (src: Mat, setImages: (mar: { name: string; value: Mat }[]) => void) => {
            if (!model) return

            const images: { name: string; value: Mat }[] = []

            const time = performance.now()

            // alert('Start')
            const threshold = new cv.Mat()

            const allRects: Rect[][] = []

            const numbers: number[][] = []

            // const time = performance.now()

            await log('Start')
            // await log('Start')

            for (let thresh = 250; thresh >= 0; thresh -= 10) {
                cv.threshold(src, threshold, thresh, 255, cv.THRESH_BINARY)

                const asd: Mat = new cv.Mat()
                threshold.copyTo(asd)
                images.push({ name: thresh.toString(), value: asd })

                let contours = new cv.MatVector()
                let hierarchy = new cv.Mat()

                cv.findContours(
                    threshold,
                    contours,
                    hierarchy,
                    cv.RETR_TREE,
                    cv.CHAIN_APPROX_SIMPLE
                )

                const rects: Array<Rect> = []
                const indexes: number[] = []

                for (let i = 0; i < contours.size(); i++) {
                    if (hierarchy.intPtr(0, i)[3] === -1) continue
                    if (indexes.findIndex(item => item === hierarchy.intPtr(0, i)[3]) !== -1)
                        continue
                    indexes.push(i)

                    const { x, y, width, height } = cv.boundingRect(contours.get(i))

                    if (height < 10 && width < 10) continue

                    rects.push({ x: x, y: y, width, height })
                }

                rects.sort((a, b) => {
                    const bottomA = a.y + a.height
                    const bottomB = b.y + b.height

                    return (bottomA >= b.y && a.y <= bottomB ? 0 : a.y - b.y) || a.x - b.x
                })

                // for (let i = 0; i < rects.length; i++) {
                //     const { x, y, height, width } = rects[i]
                //     const rect = new cv.Rect(x, y, width, height)
                //     const number = threshold.roi(rect)
                //     const asd: Mat = new cv.Mat()
                //     number.copyTo(asd)
                //     images.push(asd)
                // }

                let startIndex = 0
                let count = 0
                let asds = 0
                for (let i = 0; i < rects.length; i++) {
                    const { y, height } = rects[i]

                    if (count) {
                        const rect = rects[i - 1]

                        if (rect.y + rect.height > y) {
                            asds++
                            count++
                        } else {
                            if (count >= 4 && count <= 6) {
                                break
                            } else {
                                startIndex = i

                                count = 1
                            }
                        }
                    } else {
                        count = 1
                    }
                }
                const splice = rects.splice(startIndex, count)
                // alert(asds)
                tf.engine().startScope()
                if (splice.length) {
                    const tensors: tf.Tensor<tf.Rank>[] = []

                    // alert(splice.length)

                    for (let i = 0; i < splice.length; i++) {
                        const { x, y, width, height } = splice[i]

                        const rect = new cv.Rect(x, y, width, height)

                        const number = threshold.roi(rect)

                        //~~~~~~~~~~~~~~~~~~~~~~~~

                        // cv.resize(number, number, new cv.Size(30, 30), 1, 1, cv.INTER_AREA)

                        // images.push({ name: 'a', value: number })

                        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                        const normal: number[][][] = []
                        // alert('for')
                        // alert(number.rows + ' ' + number.cols)

                        for (let row = 0; row < 30; row++) {
                            const newRow: number[][] = []
                            for (let col = 0; col < 30; col++) {
                                if (row >= number.rows || col >= number.cols) {
                                    newRow.push([1])
                                } else {
                                    newRow.push([number.ucharPtr(row, col)[0] / 255])
                                }
                            }
                            normal.push(newRow)
                        }

                        // alert(normal.length)

                        const tensor = tf.tensor(normal, [30, 30, 1])
                        tensors.push(tensor)
                    }

                    // alert(tensors.length)
                    const batch = tf.stack(tensors)
                    // alert('sad')

                    const pr_tensor = model.predictOnBatch(batch)
                    const argMax = (pr_tensor as tf.Tensor<tf.Rank>).argMax(1).dataSync()
                    tf.engine().endScope()
                    const num: number[] = []

                    for (let i = 0; i < argMax.length; i++) {
                        const element = argMax[i]
                        num.push(element)

                        const { x, y, width, height } = splice[i]
                        const rect = new cv.Rect(x, y, width, height)

                        const number = new cv.Mat()
                        threshold.roi(rect).copyTo(number)

                        const back = new cv.Mat(30, 30, cv.CV_8UC1, new cv.Scalar(255))

                        for (let row = 0; row < number.rows; row++) {
                            for (let col = 0; col < number.cols; col++) {
                                back.ucharPtr(row, col)[0] = number.ucharPtr(row, col)[0]
                            }
                        }
                        //  cv.resize(number, number, new cv.Size(30, 30))

                        images.push({ name: element.toString(), value: back })
                    }

                    numbers.push(num)

                    // alert()

                    allRects.push(splice)
                }
            }

            await log(performance.now() - time + 'ms ')

            setImages(images)
        },
        [model]
    )

    return {
        isLoad: !!model,
        searchContours,
    }
}

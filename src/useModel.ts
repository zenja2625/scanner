import * as tf from '@tensorflow/tfjs'
import { useCallback, useEffect, useState } from 'react'
import cv, { Mat } from 'opencv-ts'
import { Rect, Sponsor } from './types'
import { log } from './log'
import { matchesCount } from './matchesCount'

export const useModel = () => {
    const [model, setModel] = useState<tf.LayersModel | null>(null)
    const [ids, setIds] = useState<{ number: number[]; name: string; phone: string | null }[]>([])

    useEffect(() => {
        const loadModel = async () => {
            const data = window.localStorage.getItem('data')

            if (data) {
                setIds(JSON.parse(data))
            }

            const model = await tf.loadLayersModel('/model.json')

            const result = model.predict(tf.zeros([1, 30, 30, 1])) as tf.Tensor<tf.Rank>

            result.dataSync()
            result.dispose()

            setModel(model)
        }

        loadModel()
    }, [])

    const searchContours = useCallback(
        async (
            src: Mat,
            setImages: (mar: { name: string; value: Mat }[]) => void,
            setMatchSponsors: (sponsor: Array<Sponsor>) => void
        ) => {
            if (!model) return

            let logs = ''

            const images: { name: string; value: Mat }[] = []

            const time = performance.now()

            // alert('Start')
            const threshold = new cv.Mat()

            // const time = performance.now()

            await log('Start')

            let allRectsCount = 0

            const numbe: number[][] = []

            for (let thresh = 170; thresh >= 0; thresh -= 10) {
                cv.threshold(src, threshold, thresh, 255, cv.THRESH_BINARY)

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
                const indexes = new Set<number>()

                for (let i = 0; i < contours.size(); i++) {
                    if (hierarchy.intPtr(0, i)[3] === -1) continue

                    if (indexes.has(hierarchy.intPtr(0, i)[3])) continue
                    indexes.add(i)

                    const { x, y, width, height } = cv.boundingRect(contours.get(i))
                    if (height < 10 && width < 10) continue
                    if (width / height > 3) continue

                    rects.push({ x: x, y: y, width, height })
                }

                rects.sort((a, b) => {
                    const bottomA = a.y + a.height
                    const bottomB = b.y + b.height

                    return (bottomA >= b.y && a.y <= bottomB ? 0 : a.y - b.y) || a.x - b.x
                })

                const sortRects: Rect[] = []

                let start = 0
                let count = 1

                for (let i = 1; i < rects.length; i++) {
                    const y = rects[i].y
                    const rect = rects[i - 1]

                    if (rect.y + rect.height > y) {
                        count++
                    } else {
                        if (count >= 4 && count <= 6) {
                            sortRects.push(...rects.slice(start, start + count))
                        }
                        start = i
                        count = 1
                    }
                }

                allRectsCount += sortRects.length

                for (let i = 0; i < sortRects.length; i++) {
                    const { x, y, height, width } = sortRects[i]
                    const rect = new cv.Rect(x, y, width, height)
                    const number = threshold.roi(rect)
                    const asd: Mat = new cv.Mat()
                    number.copyTo(asd)
                    //Delete
                    const scale = new cv.Mat(30, 30, cv.CV_8UC1, new cv.Scalar(0))

                    cv.resize(
                        number,
                        scale,
                        new cv.Size(
                            height > width ? width * (30 / height) : 30,
                            height < width ? height * (30 / width) : 30
                        ),
                        1,
                        1,
                        cv.INTER_NEAREST
                    )

                    const widthOffset = scale.cols < 30 ? 30 - scale.cols : 0

                    cv.copyMakeBorder(
                        scale,
                        scale,
                        0,
                        scale.rows < 30 ? 30 - scale.rows : 0,
                        Math.floor(widthOffset / 2),
                        widthOffset - Math.floor(widthOffset / 2),
                        cv.BORDER_CONSTANT,
                        new cv.Scalar(255)
                    )

                    // images.push({ name: '', value: asd })
                    images.push({ name: '', value: scale })

                    numbe.push(Array.from(scale.data))
                }
            }

            if (numbe.length) {
                await log('Create Tensor')

                const tensor = tf.tensor(numbe, [allRectsCount, 30, 30, 1])
                // const layerNormalizationLayer = tf.layers.layerNormalization()
                // layerNormalizationLayer.apply(tensor)

                await log('Start Predict')

                const pr_tensor = model.predictOnBatch(tensor)
                const argMax = Array.from((pr_tensor as tf.Tensor<tf.Rank>).argMax(1).dataSync())

                const matches: {
                    number: number[]
                    match: number
                    name: string
                    phone: string | null
                }[] = []

                for (let i = 0; i < allRectsCount; i++) {
                    images[i].name = argMax[i].toString()
                }

                for (let j = 0; j < ids.length; j++) {
                    const id = ids[j].number

                    const m = matchesCount(id, argMax)

                    matches.push({ number: id, match: m, name: ids[j].name, phone: ids[j].phone })
                }

                matches.sort((a, b) => b.match - a.match)
                // alert(JSON.stringify(matches, null, 4))

                const sponsors: Array<Sponsor> = []
                logs += '\n----------------'
                for (let i = 0; i < 3 && i < matches.length; i++) {
                    const element = matches[i]
                    if (element.match < 3) break
                    logs += '\n' + element.number.join('')

                    sponsors.push({
                        number: element.number.join(''),
                        name: element.name.split(' ').pop() || element.name,
                        phone: element.phone,
                    })
                }

                setMatchSponsors(sponsors.reverse())
                logs += '\n----------------'
            }

            logs += '\n' + allRectsCount

            await log(performance.now() - time + 'ms ' + logs)

            setImages(images)
        },
        [model, ids]
    )

    return {
        isLoad: !!model,
        isData: !!ids.length,
        setIds,
        searchContours,
    }
}

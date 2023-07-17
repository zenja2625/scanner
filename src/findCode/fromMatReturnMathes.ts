import { matchesCount } from '../matchesCount'
import * as tf from '@tensorflow/tfjs'
import cv, { Mat } from 'opencv-ts'
import {
  findContourRects,
  findFirstLineFuncOrNull,
  getAngleFromRectsLines,
  rectsListIsAfterLine,
  resizeAndReturnData,
  sortRectsByLines,
} from '../findCode'
import { ID } from '../types'

export const fromMatReturnMathes = (
  src: Mat,
  model: tf.LayersModel,
  ids: ID[]
) => {
  const gray = new cv.Mat()
  const thresh = new cv.Mat()

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)
  cv.adaptiveThreshold(
    gray,
    thresh,
    255,
    cv.ADAPTIVE_THRESH_MEAN_C,
    cv.THRESH_BINARY_INV,
    21,
    10
  )

  const rectsSortX = findContourRects(thresh)
  let rectList = sortRectsByLines(rectsSortX)
  const angle = getAngleFromRectsLines(rectList)

  const getFirstLineY = findFirstLineFuncOrNull(thresh, angle)

  rectList =
    getFirstLineY !== null
      ? rectList.filter((list) =>
          rectsListIsAfterLine(list, angle, getFirstLineY)
        )
      : []

  const numbe = resizeAndReturnData(thresh, rectList, 30)

  const draw = new cv.Mat(200, 200, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 0))

  if (!numbe.length)
    return {
      matches: [],
      draw,
    }

  const offset = tf.scalar(127.5)
  const tensor = tf
    .tensor(numbe, [numbe.length, 30, 30, 1])
    .sub(offset)
    .div(offset)

  const pr_tensor = model.predictOnBatch(tensor)
  const argMax = Array.from(
    (pr_tensor as tf.Tensor<tf.Rank>).argMax(1).dataSync()
  )

  let predictStartIndex = 0
  const matches: {
    number: number[]
    match: number
    recognizeString: string
    name: string
    phone: string | null
  }[] = []

  for (let i = 0; i < rectList.length; i++) {
    const length = rectList[i].length

    const predictCode = argMax.slice(
      predictStartIndex,
      predictStartIndex + length
    )
    predictStartIndex += length

    for (let j = 0; j < ids.length; j++) {
      const id = ids[j].number

      const m = matchesCount(id, predictCode)

      if (m >= 3) {
        matches.push({
          number: id,
          match: m,
          name: ids[j].name,
          phone: ids[j].phone,
          recognizeString: predictCode.filter((i) => i !== 10).join(''),
        })
      }
    }
  }

  matches.sort((a, b) => b.match - a.match)

  for (let i = 0; i < rectList.length; i++) {
    const list = rectList[i]

    for (let j = 0; j < list.length; j++) {
      const rect = list[j].rect
      cv.rectangle(
        draw,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        new cv.Scalar(255, 0, 0, 255),
        1
      )
    }
  }

  cv.line(
    draw,
    new cv.Point(0, getFirstLineY?.(0) || -1),
    new cv.Point(200, getFirstLineY?.(200) || -1),
    new cv.Scalar(255, 0, 0, 255)
  )

  return { matches, draw }
}

import cv from 'opencv-ts'
import * as tf from '@tensorflow/tfjs'
import { MessageType } from './workerTypes'
import { fromMatReturnMathes } from './findCode'

declare function postMessage(message: MessageType): void

cv.onRuntimeInitialized = () => {
  postMessage({
    type: 'OpenCVIsLoaded',
  })
}

let model: tf.LayersModel

tf.loadLayersModel(`${process.env.PUBLIC_URL}/model.json`).then((m) => {
  model = m

  const result = model.predict(tf.zeros([1, 30, 30, 1])) as tf.Tensor<tf.Rank>

  result.dataSync()
  result.dispose()

  postMessage({ type: 'ModelIsLoaded' } as MessageType)
})

onmessage = (e) => {
  const message = e.data as MessageType

  switch (message.type) {
    case 'FindMatches':
      try {
        const src = cv.matFromArray(200, 200, cv.CV_8UC4, message.src)
        const { matches, draw } = fromMatReturnMathes(src, model, message.ids)
        postMessage({
          type: 'ReturnMathes',
          matches: matches,
          draw: Array.from(draw.data),
        } as MessageType)

        draw.delete()
        src.delete()
      } catch (error) {
        postMessage({
          type: 'Error',
          message: (error as any).toString(),
        } as MessageType)
      }

      break
  }
}

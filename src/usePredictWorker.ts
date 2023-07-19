import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageType } from './workerTypes'
import { ID, Match } from './types'
import { log } from './log'

export const usePredictWorker = () => {
  const [isModelLoad, setIsModelLoad] = useState(false)
  const [isOpencvLoad, setIsOpencvLoad] = useState(false)

  const workerRef = useRef<Worker | null>(null)
  const promiseRef = useRef<Promise<Match[]> | null>(null)
  const resolveRef = useRef<
    ((value: Match[] | PromiseLike<Match[]>) => void) | null
  >(null)
  const rejectRef = useRef<((reason?: any) => void) | null>(null)

  useEffect(() => {
    if (workerRef.current === null) {
      const time = performance.now()

      workerRef.current = new Worker(new URL('./worker.ts', import.meta.url))

      workerRef.current.onmessage = (e) => {
        const message = e.data as MessageType

        switch (message.type) {
          case 'OpenCVIsLoaded':
            setIsOpencvLoad(true)
            log(`opencv ${Math.floor(performance.now() - time)}`)
            break
          case 'ModelIsLoaded':
            log(`model ${Math.floor(performance.now() - time)}`)

            setIsModelLoad(true)
            break
          case 'ReturnMathes':
            const canvas: HTMLCanvasElement | null = document.getElementById(
              'showMatches'
            ) as HTMLCanvasElement
            if (canvas) {
              const ctx = canvas.getContext('2d')

              if (ctx) {
                const uint8Array = new Uint8ClampedArray(message.draw)
                const imageData = new ImageData(uint8Array, 200, 200)
                canvas.height = imageData.height
                canvas.width = imageData.width

                ctx.putImageData(imageData, 0, 0)
              }
            }

            resolveRef.current?.(message.matches)
            resolveRef.current = null
            rejectRef.current = null

            break
          case 'Alert':
            alert(message.message)
            break
          case 'Error':
            resolveRef.current = null
            rejectRef.current?.(new Error(message.message))
            rejectRef.current = null
            promiseRef.current = null
            break
          case 'TensorflowMemory':
            const tensor = document.getElementById('tf')

            if (tensor) tensor.innerHTML = message.value
            break
        }
      }
    }
  }, [])

  const searchContours = useCallback((src: number[], ids: ID[]) => {
    const promise = new Promise<Match[]>(async (r, rej) => {
      if (promiseRef.current) await promiseRef.current

      resolveRef.current = r
      rejectRef.current = rej

      workerRef.current?.postMessage({
        type: 'FindMatches',
        src: src,
        ids,
      } as MessageType)
    })

    promiseRef.current = promise

    return promise
  }, [])

  return {
    isLoaded: isModelLoad && isOpencvLoad,
    searchContours,
  }
}

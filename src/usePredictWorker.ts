import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageType } from './workerTypes'
import cv, { Mat } from 'opencv-ts'
import { ID, Match } from './types'
import * as tf from '@tensorflow/tfjs'

export const usePredictWorker = () => {
    const [isModelLoad, setIsModelLoad] = useState(false)
    const [isOpencvLoad, setIsOpencvLoad] = useState(false)

    const workerRef = useRef<Worker | null>(null)
    const promiseRef = useRef<Promise<Match[]> | null>(null)
    const resolveRef = useRef<((value: Match[] | PromiseLike<Match[]>) => void) | null>(null)

    useEffect(() => {
        workerRef.current = new Worker(new URL('./worker.ts', import.meta.url))

        workerRef.current.onmessage = e => {
            const message = e.data as MessageType

            switch (message.type) {
                case 'OpenCVIsLoaded':
                    setIsOpencvLoad(true)
                    break
                case 'ModelIsLoaded':
                    setIsModelLoad(true)
                    break
                case 'ReturnMathes':
                    cv.imshow('showMatches', cv.matFromArray(200, 200, cv.CV_8UC4, message.draw))
                    resolveRef.current?.(message.matches)
                    resolveRef.current = null
                    break
                case 'Alert':
                    alert(message.message)
                    break
            }
        }
    }, [])

    const searchContours = useCallback((src: Mat, ids: ID[]) => {
        const promise = new Promise<Match[]>(async r => {
            if (promiseRef.current) await promiseRef.current

            resolveRef.current = r

            workerRef.current?.postMessage({
                type: 'FindMatches',
                src: Array.from(src.data),
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

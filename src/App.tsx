import React, { useEffect, useRef, useState } from 'react'
import { Rect } from './types'
import './App.css'

import cv from 'opencv-ts'
import { Selector } from './Selector'

function App() {
    const [selectors, setSelectors] = useState<Array<Rect>>([])

    const [cvLoad, setCvLoad] = useState(false)
    const ref = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvasGrayRef = useRef<HTMLCanvasElement | null>(null)
    const [margin, setMargin] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const width = 200
    const height = 200

    useEffect(() => {
        cv.onRuntimeInitialized = () => {
            setCvLoad(true)
        }

        // alert('useEffect')
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            let id = ''

            devices.forEach(function (device) {
                if (device.kind === 'videoinput') {
                    // alert(device.kind + ': ' + device.label + ' id = ' + device.deviceId)
                    id = device.deviceId
                }
            })
            navigator.mediaDevices.getUserMedia({ video: { deviceId: id } }).then(stream => {
                const video = document.querySelector('video')
                // включаем поток в магический URL
                if (video !== null) video.srcObject = stream
            })
            // alert(id)
        })
    }, [])

    return (
        <div className='App'>
            <header className='App-header'>
                <div
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        backgroundColor: !cvLoad ? 'red' : 'greenyellow',
                        left: 10,
                        bottom: 10,
                        zIndex: 1000,
                    }}
                ></div>
                <div
                    style={{
                        display: 'flex',
                        width: '100vw',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            backgroundColor: 'red',
                            width: `${width}px`,
                            height: `${height}px`,
                            overflow: 'hidden',
                        }}
                    >
                        <video
                            ref={ref}
                            onPlay={() => {
                                if (ref.current) {
                                    const { height, width } = ref.current.getBoundingClientRect()

                                    setMargin({
                                        x: width,
                                        y: height,
                                    })
                                }
                            }}
                            style={{
                                position: 'absolute',
                                top: `-${margin.y / 2 - height / 2}px`,
                                left: `-${margin.x / 2 - width / 2}px`,
                            }}
                            autoPlay
                        ></video>

                        <div></div>
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            top: 350,
                        }}
                    >
                        <canvas
                            style={{
                                width: '400px',
                                height: '400px',
                            }}
                            ref={canvasGrayRef}
                        ></canvas>
                        {selectors.map(selector => (
                            <Selector {...selector} />
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => {
                        const wrapper = document.getElementById('wrapper')


                        const isEqualHeight = (rect1: Rect, rect2: Rect, procent: number) => {
                            if (rect1.height > rect2.height)
                                return ((rect1.height - rect2.height) / rect2.height) * 100 >= 80
                            else if (rect1.height < rect2.height)
                                return ((rect2.height - rect1.height) / rect1.height) * 100 >= 80

                            return true
                        }

                        if (canvasRef.current && ref.current && wrapper && canvasGrayRef.current) {
                            wrapper.innerHTML = ''
                            const canvas = canvasRef.current
                            const canvasGray = canvasGrayRef.current
                            const video = ref.current

                            canvas.width = video.videoWidth
                            canvas.height = video.videoHeight
                            const context = canvas.getContext('2d')
                            if (context) {
                                context.drawImage(video, 0, 0)

                                let src = cv.imread(canvas)

                                const rect = new cv.Rect(
                                    canvas.width / 2 - 100,
                                    canvas.height / 2 - 100,
                                    width,
                                    height
                                )
                                src = src.roi(rect)

                                cv.resize(src, src, new cv.Size(0, 0), 2, 2)

                                cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)

                                cv.threshold(src, src, 120, 255, cv.THRESH_BINARY)

                                let M = new cv.Mat.ones(2, 2, cv.CV_8U)
                                let anchor = new cv.Point(-1, -1)

                                cv.erode(
                                    src,
                                    src,
                                    M,
                                    anchor,
                                    1,
                                    cv.BORDER_CONSTANT,
                                    cv.morphologyDefaultBorderValue()
                                )

                                cv.imshow(canvasGray, src)

                                let contours = new cv.MatVector()
                                let hierarchy = new cv.Mat()

                                cv.findContours(
                                    src,
                                    contours,
                                    hierarchy,
                                    cv.RETR_TREE,
                                    cv.CHAIN_APPROX_SIMPLE
                                )

                                const rects: Array<Rect> = []

                                const isIn = (rect1: Rect, rect2: Rect) => {
                                    return (
                                        rect1.x >= rect2.x &&
                                        rect1.y <= rect2.y &&
                                        rect1.x + rect1.width <= rect2.x + rect2.width &&
                                        rect1.y + rect1.height <= rect2.y + rect2.height
                                    )
                                }


                                const indexes: number[] = []

                                for (let i = 0; i < contours.size(); i++) {
                                    if (hierarchy.intPtr(0, i)[3] === -1) continue

                                    if (indexes.findIndex(item => item === hierarchy.intPtr(0, i)[3]) !== -1) continue
                                    indexes.push(i)

                                    const { x, y, width, height } = cv.boundingRect(contours.get(i))

                                    // alert(JSON.stringify(cv.boundingRect(contours.get(i))))
                                    const contourRect = { x, y, width, height }

                                    let isAdd = true

                                    for (let j = 0; j < rects.length; j++) {
                                        const rect = rects[j]

                                        if (rect.width >= width && rect.height >= height) {
                                            if (isIn(contourRect, rect)) {
                                                isAdd = false
                                                break
                                            }
                                        }
                                    }

                                    rects.push({ x, y, width, height })

                                    // hierarchy.intPtr(0, i)[3] === 0 &&
                                    //     alert(hierarchy.intPtr(0, i)[3] === 0)
                                    // alert(hierarchy.intPtr(0, i)[3]);
                                }


                                rects.sort((a, b) => {
                                    const bottomA = a.y + a.height
                                    const bottomB = b.y + b.height

                                    return (
                                        (bottomA >= b.y && a.y <= bottomB ? 0 : a.y - b.y) ||
                                        a.x - b.x
                                    )
                                })

                                const newRects: Rect[] = []

                                for (let i = 0; i < rects.length; i++) {
                                    const rect1 = rects[i];
                                    

                                }

                                // rects.reduce()

                                // rects.sort((a, b) => a.y - b.y || a.x - b.x)

                                for (let i = 0; i < rects.length; i++) {
                                    const { x, y, width, height } = rects[i]

                                    const rect = new cv.Rect(x, y, width, height)
                                    const lupa = src.roi(rect)

                                    const cnv = document.createElement('canvas')
                                    cnv.style.height = `${height}px`
                                    cv.imshow(cnv, lupa)

                                    wrapper.append(cnv)
                                }

                                setSelectors(rects)
                            }
                        }
                    }}
                >
                    Screen
                </button>
                <div
                    id='wrapper'
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: '100vw',
                    }}
                ></div>
                {/* <canvas
                    style={{
                        position: 'absolute',
                        left: 'calc(50vw - 100px)',
                        bottom: 0,
                    }}
                    ref={canvasRef}
                ></canvas> */}
                <canvas
                    style={{
                        display: 'none',
                    }}
                    ref={canvasRef}
                ></canvas>
            </header>
        </div>
    )
}

export default App

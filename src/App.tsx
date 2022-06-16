import React, { useEffect, useRef, useState } from 'react'
import './App.css'

import cv, { Mat } from 'opencv-ts'

function App() {
    const [cvLoad, setCvLoad] = useState(false)
    const ref = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
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
                        left: 0,
                        top: 0,
                    }}
                ></div>
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
                    <div
                        style={{
                            backgroundColor: 'transparent',
                            width: '70px',
                            height: '30px',
                            position: 'absolute',
                            top: 'calc(50% - 15px)',
                            left: 'calc(50% - 35px)',
                            border: '2px solid lightgreen',
                        }}
                    ></div>
                </div>
                <button
                    onClick={() => {
                        const wrapper = document.getElementById('wrapper')

                        if (canvasRef.current && ref.current && wrapper) {
                            wrapper.innerHTML = ''
                            const canvas = canvasRef.current
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

                                cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
                                cv.threshold(src, src, 120, 255, cv.THRESH_BINARY)

                                // let M = new cv.Mat.ones(2, 2, cv.CV_8U)
                                // let anchor = new cv.Point(-1, -1)

                                // cv.erode(
                                //     src,
                                //     src,
                                //     M,
                                //     anchor,
                                //     1,
                                //     cv.BORDER_CONSTANT,
                                //     cv.morphologyDefaultBorderValue()
                                // )

                                let contours = new cv.MatVector()
                                let hierarchy = new cv.Mat()

                                cv.findContours(
                                    src,
                                    contours,
                                    hierarchy,
                                    cv.RETR_TREE,
                                    cv.CHAIN_APPROX_SIMPLE
                                )

                                for (let i = 0; i < contours.size(); i++) {
                                    const { x, y, width, height } = cv.boundingRect(contours.get(i))



                                    if (hierarchy.intPtr(0, i)[3] === -1) continue

                                    hierarchy.intPtr(0, i)[3] === 0 &&
                                        alert(hierarchy.intPtr(0, i)[3] === 0)
                                    // alert(hierarchy.intPtr(0, i)[3]);
                                    const rect = new cv.Rect(x, y, width, height)
                                    const lupa = src.roi(rect)

                                    const cnv = document.createElement('canvas')
                                    cv.imshow(cnv, lupa)

                                    wrapper.append(cnv)

                      
                                }

                
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

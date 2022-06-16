import React, { useEffect, useRef, useState } from 'react'
import './App.css'

import cv, { Mat } from 'opencv-ts'

function App() {
    const ref = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [margin, setMargin] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const width = 200
    const height = 200

    useEffect(() => {
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
                        if (canvasRef.current && ref.current) {
                            const canvas = canvasRef.current
                            const video = ref.current

                            canvas.width = video.videoWidth
                            canvas.height = video.videoHeight
                            const context = canvas.getContext('2d')
                            if (context) {
                                context.drawImage(video, 0, 0)

                                const imgData = context.getImageData(
                                    canvas.width / 2 - 100,
                                    canvas.height / 2 - 100,
                                    200,
                                    200
                                )

                                let src = cv.imread(canvas)

                                const rect = new cv.Rect(
                                    canvas.width / 2 - 100,
                                    canvas.height / 2 - 100,
                                    width,
                                    height
                                )
                                src = src.roi(rect)

                                cv.imshow(canvas, src)

                                // let pixels = imgData.data

                                // for (var i = 0; i < pixels.length; i += 4) {

                                //   let lightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;

                                //   lightness = lightness > 120 ? 255 : 0

                                //   pixels[i] = lightness;
                                //   pixels[i + 1] = lightness;
                                //   pixels[i + 2] = lightness;

                                // }

                                // context.clearRect(0, 0, canvas.width, canvas.height)
                                // context.putImageData(imgData, 0, 0)
                            }

                            // let canvas = document.getElementById(canvasInputId)
                            // let ctx = canvas.getContext('2d')
                            // let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        }
                    }}
                >
                    Screen
                </button>
                <canvas
                    style={{
                        position: 'absolute',
                        left: 'calc(50vw - 100px)',
                        bottom: 0,
                    }}
                    ref={canvasRef}
                ></canvas>
            </header>
        </div>
    )
}

export default App

import React, { useEffect, useRef, useState } from 'react'
import { Rect } from './types'
import './App.css'

import cv, { Mat } from 'opencv-ts'
import { Selector } from './Selector'
import { searchContours } from './searchContours'

function App() {
    const [selectors] = useState<Array<Rect>>([])
    // const [selectors, _setSelectors] = useState<Array<Rect>>([])

    const [cvLoad, setCvLoad] = useState(false)
    const ref = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvasGrayRef = useRef<HTMLCanvasElement | null>(null)
    const [margin, setMargin] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const width = 200
    const height = 200

    const [images, setImages] = useState<{ name: string; value: Mat }[]>([])

    useEffect(() => {
        const wrapper = document.getElementById('wrapper')

        if (images.length && wrapper) {
            wrapper.innerHTML = ''

            for (let i = 0; i < images.length; i++) {
                const image = images[i]

                const canvas = document.createElement('canvas')
                canvas.height = 60
                canvas.width = 60
                cv.imshow(canvas, image.value)

                const wrap = document.createElement('div')
                wrap.style.position = 'relative'
                // wrap.style.width = '30px'
                // wrap.style.height = '30px'
                const text = document.createElement('div')
                text.innerHTML = image.name
                text.style.position = 'absolute'
                text.style.bottom = '0'
                text.style.right = '0'
                text.style.zIndex = '10000'
                text.style.color = 'chartreuse'

                wrap.append(canvas, text)

                wrapper.append(wrap)
            }

            // alert(images.length)
        }
    }, [images])

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

    const onClick = () => {
        const video = ref.current
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (!video || !canvas || !context) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        let src = cv.imread(canvas)
        const rect = new cv.Rect(canvas.width / 2 - 100, canvas.height / 2 - 100, width, height)
        src = src.roi(rect)

        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)

        searchContours(src, setImages)
    }

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
                <button onClick={onClick}>Screen</button>
                <div
                    id='wrapper'
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: '100vw',
                        alignItems: 'flex-start',
                        gap: '1px',
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

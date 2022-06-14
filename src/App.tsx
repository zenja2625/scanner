import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import logo from './logo.svg'
import './App.css'

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
                </div>
                <button
                    onClick={() => {
                        if (canvasRef.current && ref.current) {
                            const canvas = canvasRef.current
                            const video = ref.current

                            canvas.width = video.videoWidth
                            canvas.height = video.videoHeight
                            canvas.getContext('2d')?.drawImage(video, 0, 0)
                        }
                    }}
                >
                    Screen
                </button>
                <canvas ref={canvasRef}></canvas>
            </header>
        </div>
    )
}

export default App

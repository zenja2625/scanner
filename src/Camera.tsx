import cv, { Mat } from 'opencv-ts'
import {
    forwardRef,
    ForwardRefRenderFunction,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import { Coors } from './types'

type Size = { width: number; height: number }
type CameraRef = { getScreen: () => Mat | null }

const CameraFn: ForwardRefRenderFunction<CameraRef, Size> = ({ height, width }, ref) => {
    const [offset, setOffset] = useState<Coors>({ left: 0, top: 0 })
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        const startStream = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = devices.filter(devise => devise.kind === 'videoinput')
            const deviceId = videoDevices[videoDevices.length - 1]?.deviceId || null

            if (!deviceId) return
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId, width: 1280, height: 720 },
            })
            if (videoRef.current !== null) videoRef.current.srcObject = stream
        }

        startStream()
    }, [])

    useImperativeHandle(ref, () => ({
        getScreen: () => {
            const video = videoRef.current

            if (!video) return null

            let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4)
            video.height = video.videoHeight
            video.width = video.videoWidth
            const capture = new cv.VideoCapture(video)

            capture.read(src)
            const rect = new cv.Rect(video.width / 2 - 100, video.height / 2 - 100, width, height)
            src = src.roi(rect)
            cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)

            return src
        },
    }))

    return (
        <div
            style={{
                position: 'relative',
                overflow: 'hidden',
                height: `${height}px`,
                width: `${width}px`,
            }}
        >
            <video
                ref={videoRef}
                onPlay={e => {
                    const { videoHeight, videoWidth } = e.currentTarget

                    setOffset({
                        left: videoWidth / 2 - height / 2,
                        top: videoHeight / 2 - width / 2,
                    })
                }}
                style={{
                    position: 'absolute',
                    top: `-${offset.top}px`,
                    left: `-${offset.left}px`,
                }}
                autoPlay
            ></video>
        </div>
    )
}

export const Camera = forwardRef(CameraFn)

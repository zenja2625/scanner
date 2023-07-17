import cv, { Mat } from 'opencv-ts'
import {
    forwardRef,
    ForwardRefRenderFunction,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import refresh from './refresh.svg'
import { Coors } from './types'

type Size = { width: number; height: number }
type CameraRef = { getScreen: () => Promise<Mat | null> }

const CameraFn: ForwardRefRenderFunction<CameraRef, Size> = ({ height, width }, ref) => {
    const [loadCamera, setLoadCamera] = useState(false)
    const [showRefresh, setShowRefresh] = useState(true)
    const [offset, setOffset] = useState<Coors>({ left: 0, top: 0 })
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const startStream = useCallback(async () => {
        setLoadCamera(true)

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(devise => devise.kind === 'videoinput')
        const deviceId = videoDevices[videoDevices.length - 1]?.deviceId || null

        if (deviceId) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId, width: 1280, height: 720 },
            })
            if (videoRef.current !== null) {
                setShowRefresh(false)
                videoRef.current.srcObject = stream
            }
        }

        setLoadCamera(false)
    }, [])

    useEffect(() => {
        startStream()
    }, [startStream])

    useImperativeHandle(ref, () => ({
        getScreen: async () => {
            const video = videoRef.current

            if (!video) return null

            const bitmap = await createImageBitmap(video)
            const c1 = document.getElementById('show') as HTMLCanvasElement
            c1.height = 200
            c1.width = 200
            const ctx = c1.getContext('2d')
            ctx?.drawImage(bitmap, offset.left, offset.top, 200, 200, 0, 0, 200, 200)
            bitmap.close()

            const img = cv.imread('show')

            return img
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
            {showRefresh && (
                <div
                    onTouchStart={async () => {
                        startStream()
                    }}
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '40px',
                        position: 'absolute',
                        zIndex: 1,
                        backgroundColor: 'black',
                    }}
                >
                    <img
                        src={refresh}
                        className={'refresh' + (loadCamera ? ' refresh-load' : '')}
                        draggable='false'
                        alt=''
                    />
                </div>
            )}
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
                // autoPlay
            ></video>
            <canvas
                id='showMatches'
                style={{
                    position: 'absolute',
                    height: '100%',
                    // backgroundColor: 'yellow',
                }}
            ></canvas>
        </div>
    )
}

export const Camera = forwardRef(CameraFn)

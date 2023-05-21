import { ElementRef, useEffect, useRef, useState } from 'react'
import { Sponsor } from './types'
import './App.css'
import cv, { Mat } from 'opencv-ts'
import { useModel } from './useModel'
import { Card } from './Card'
import { SeletedSponsorList } from './SeletedSponsorList'
import { Camera } from './Camera'
import { isDebug } from './index'
import { useGoogleApi } from './useGoogleApi'

type CameraRef = ElementRef<typeof Camera>

function App() {
    const { access, authorize, saveImageToGoogleDrive } = useGoogleApi()

    const [cvLoad, setCvLoad] = useState(false)

    const [listOpen, setListOpen] = useState(false)
    const [matchSponsors, setMatchSponsors] = useState<Array<Sponsor>>([])
    const [sponsors, setSponsors] = useState<Array<Sponsor>>([])

    const [, setImages] = useState<{ name: string; value: Mat }[]>([])

    const { isLoad, isData, searchContours, setIds } = useModel()

    const cameraRef = useRef<CameraRef>(null)

    useEffect(() => {
        cv.onRuntimeInitialized = () => {
            setCvLoad(true)
        }

        // alert('useEffect')
        // navigator.mediaDevices.enumerateDevices().then(function (devices) {
        //     let id = ''

        //     devices.forEach(function (device) {
        //         if (device.kind === 'videoinput') {
        //             // alert(device.kind + ': ' + device.label + ' id = ' + device.deviceId)
        //             id = device.deviceId
        //         }
        //     })
        //     navigator.mediaDevices
        //         .getUserMedia({ video: { deviceId: id, width: 1280, height: 720 } })
        //         .then(stream => {
        //             const video = document.querySelector('video')
        //             // включаем поток в магический URL
        //             if (video !== null) video.srcObject = stream
        //         })
        //     // alert(id)
        // })
    }, [])

    // const canvasRef = useRef<HTMLCanvasElement>(null)

    if (!isData) {
        return (
            <div className='App'>
                <header className='App-header' style={{ justifyContent: 'center' }}>
                    <input
                        type='file'
                        onChange={e => {
                            const fileReader = new FileReader()
                            if (e.target.files) {
                                fileReader.readAsText(e.target.files[0], 'UTF-8')
                                fileReader.onload = e => {
                                    if (e.target?.result) {
                                        const data = (
                                            JSON.parse(e.target.result.toString()) as any[]
                                        ).map(item => ({
                                            ...item,
                                            number: (item.number as string)
                                                .split('')
                                                .map(n => parseInt(n)),
                                        }))

                                        setIds(data)
                                        window.localStorage.setItem('data', JSON.stringify(data))
                                    }
                                }
                            }
                        }}
                    />
                </header>
            </div>
        )
    }

    return (
        <>
            <div className='wrapper'>
                <Camera ref={cameraRef} height={200} width={200} />
                <div
                    onClick={() => authorize()}
                    className={'list-button google-button' + (access ? ' google-button-auth' : '')}
                >
                    G
                </div>
                {/* <canvas
                    ref={canvasRef}
                    style={{
                        // width: '200px',
                        // height: '200px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        // backgroundColor: 'white',
                    }}
                    width={200}
                    height={200}
                ></canvas> */}

                {/* <div
                    onClick={() => {
                        const src = new cv.Mat(200, 200, cv.CV_8UC3, new cv.Scalar(0, 255, 0))

                        cv.rectangle(
                            src,
                            new cv.Point(50, 50),
                            new cv.Point(150, 150),
                            new cv.Scalar(255, 0, 0),
                            3
                        )

                        if (canvasRef.current) {
                            // alert('show')
                            cv.imshow(canvasRef.current, src)
                            canvasRef.current.toBlob(blob => console.log(blob))
                        }
                        saveImageToGoogleDrive(src)
                    }}
                    className='list-button'
                >
                    Google Drive
                </div> */}
                <div className='card-wrapper'>
                    <div className='list-button' onClick={() => setListOpen(true)}>
                        Список
                    </div>
                    <div className='card-list-wrapper'>
                        <div className='card-list'>
                            {sponsors
                                .filter((_, index) => index > sponsors.length - 1 - 3)
                                .map(({ number: code, name, phone }) => (
                                    <Card key={code} number={code} name={name} phone={phone} />
                                ))}
                        </div>
                        <div className='card-list'>
                            {matchSponsors.map(({ number: code, name, phone }) => {
                                const isSelected =
                                    sponsors.findIndex(sponsor => sponsor.number === code) !== -1

                                return (
                                    <Card
                                        isSelected={isSelected}
                                        setSponsor={sponsor => {
                                            if (!isSelected) setSponsors(prev => [...prev, sponsor])
                                        }}
                                        key={code}
                                        number={code}
                                        name={name}
                                        phone={phone}
                                    />
                                )
                            })}
                        </div>
                    </div>
                    {sponsors.length}
                </div>
                <div className='button-wrapper'>
                    <div
                        onClick={() => {
                            const src = cameraRef.current?.getScreen()

                            if (src) {
                                searchContours(src, setImages, setMatchSponsors)
                                saveImageToGoogleDrive(src)
                                //!!!!!!!!!!!!!!!!!!!
                            }
                        }}
                        className='button'
                    >
                        <div className='button-center'></div>
                    </div>
                </div>
            </div>
            {listOpen && (
                <SeletedSponsorList
                    clear={() => setSponsors([])}
                    removeSponsor={sponsorCode =>
                        setSponsors(prev => prev.filter(sponsor => sponsor.number !== sponsorCode))
                    }
                    sponsors={sponsors}
                    close={() => setListOpen(false)}
                />
            )}
            <div
                style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    backgroundColor: !cvLoad || !isLoad ? 'red' : 'greenyellow',
                    left: 10,
                    bottom: 10,
                    zIndex: 1000,
                }}
            ></div>
            {isDebug && (
                <div
                    id='log'
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        color: 'white',
                    }}
                ></div>
            )}
        </>
    )
}

export default App

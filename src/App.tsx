import { ElementRef, useEffect, useRef, useState } from 'react'
import { ID, Sponsor } from './types'
import './App.css'
import cv, { Mat } from 'opencv-ts'
import { useModel } from './useModel'
import { Card } from './Card'
import { SeletedSponsorList } from './SeletedSponsorList'
import { Camera } from './Camera'
import { isDebug } from './index'
import { useGoogleApi } from './useGoogleApi'
import { usePredictWorker } from './usePredictWorker'
import { log } from './log'

type CameraRef = ElementRef<typeof Camera>

function App() {
  const [isButtonWait, setIsButtonWait] = useState(false)
  const stopLoopRef = useRef(false)
  const [isRecord, setIsRecord] = useState(false)

  const { access, authorize, saveImageToGoogleDrive } = useGoogleApi()

  const [cvLoad, setCvLoad] = useState(false)

  const [listOpen, setListOpen] = useState(false)
  const [matchSponsors, setMatchSponsors] = useState<Array<Sponsor>>([])
  const [sponsors, setSponsors] = useState<Array<Sponsor>>([])
  const [ids, setIds] = useState<ID[]>([])

  const [, setImages] = useState<{ name: string; value: Mat }[]>([])

  const { isLoaded, searchContours } = usePredictWorker()
  // const { isLoad, isData, searchContours, setIds: setIds1 } = useModel()

  const cameraRef = useRef<CameraRef>(null)

  // useEffect(() => {
  //     const foo = async () => {
  //         const time = performance.now()

  //         const src = await cameraRef.current?.getScreen()

  //         if (src) {
  //             const matches = await searchContours(src, ids)

  //             const sponsors: Array<Sponsor> = []
  //             for (let i = 0; i < 3 && i < matches.length; i++) {
  //                 const element = matches[i]

  //                 sponsors.push({
  //                     number: element.number.join(''),
  //                     name: element.name.split(' ').pop() || element.name,
  //                     phone: element.phone,
  //                 })
  //             }

  //             setMatchSponsors(sponsors.reverse())

  //             if (matches[0] && matches[0].number.join('') === matches[0].recognizeString) {
  //                 setSponsors(prev => {
  //                     const element = matches[0]
  //                     const index = prev.findIndex(
  //                         item => item.number === element.number.join('')
  //                     )

  //                     if (index === -1) {
  //                         return [
  //                             ...prev,
  //                             {
  //                                 number: element.number.join(''),
  //                                 name: element.name.split(' ').pop() || element.name,
  //                                 phone: element.phone,
  //                             },
  //                         ]
  //                     }

  //                     return prev
  //                 })
  //             }
  //         }

  //         await log(Math.floor(performance.now() - time) + 'ms ')
  //         // saveImageToGoogleDrive(src)
  //         //!!!!!!!!!!!!!!!!!!!
  //     }

  //     if (isRecord) {
  //         foo()
  //     }
  // }, [isRecord])

  useEffect(() => {
    const data = window.localStorage.getItem('data')

    if (data) {
      setIds(JSON.parse(data))
    }
    cv.onRuntimeInitialized = () => {
      setCvLoad(true)
    }
  }, [])

  if (!ids.length) {
    return (
      <div className="App">
        <header className="App-header" style={{ justifyContent: 'center' }}>
          <input
            type="file"
            onChange={(e) => {
              const fileReader = new FileReader()
              if (e.target.files) {
                fileReader.readAsText(e.target.files[0], 'UTF-8')
                fileReader.onload = (e) => {
                  if (e.target?.result) {
                    const data = (
                      JSON.parse(e.target.result.toString()) as any[]
                    ).map((item) => ({
                      ...item,
                      number: (item.number as string)
                        .split('')
                        .map((n) => parseInt(n)),
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
      <canvas
        id="show"
        style={{
          position: 'absolute',
          top: '205px',
          backgroundColor: 'red',
          display: 'none',
        }}
      ></canvas>

      <div className="wrapper">
        <Camera ref={cameraRef} height={200} width={200} />
        <div
          onClick={() => authorize()}
          className={
            'list-button google-button' + (access ? ' google-button-auth' : '')
          }
        >
          G
        </div>
        <div className="card-wrapper">
          <div className="list-button" onClick={() => setListOpen(true)}>
            Список
          </div>
          <div className="card-list-wrapper">
            <div className="card-list">
              {sponsors
                .filter((_, index) => index > sponsors.length - 1 - 3)
                .map(({ number: code, name, phone }) => (
                  <Card key={code} number={code} name={name} phone={phone} />
                ))}
            </div>
            <div className="card-list">
              {matchSponsors.map(({ number: code, name, phone }) => {
                const isSelected =
                  sponsors.findIndex((sponsor) => sponsor.number === code) !==
                  -1

                return (
                  <Card
                    isSelected={isSelected}
                    setSponsor={(sponsor) => {
                      if (!isSelected) setSponsors((prev) => [...prev, sponsor])
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
        <div className="button-wrapper">
          <div
            onClick={async () => {
              if (!isRecord) {
                setIsRecord(true)

                await new Promise<void>(async (r) => {
                  while (true) {
                    //!!!!!!!!!!!!!!!!!!!!

                    const time = performance.now()

                    const src = await cameraRef.current?.getScreen()

                    if (src) {
                      const matches = await searchContours(src, ids)

                      const sponsors: Array<Sponsor> = []
                      for (let i = 0; i < 3 && i < matches.length; i++) {
                        const element = matches[i]

                        sponsors.push({
                          number: element.number.join(''),
                          name: element.name.split(' ').pop() || element.name,
                          phone: element.phone,
                        })
                      }

                      setMatchSponsors(sponsors.reverse())

                      if (
                        matches[0] &&
                        matches[0].number.join('') ===
                          matches[0].recognizeString
                      ) {
                        setSponsors((prev) => {
                          const element = matches[0]
                          const index = prev.findIndex(
                            (item) => item.number === element.number.join('')
                          )

                          if (index === -1) {
                            return [
                              ...prev,
                              {
                                number: element.number.join(''),
                                name:
                                  element.name.split(' ').pop() || element.name,
                                phone: element.phone,
                              },
                            ]
                          }

                          return prev
                        })
                      }
                    }

                    await log(Math.floor(performance.now() - time) + 'ms ')

                    //!!!!!!

                    if (stopLoopRef.current) {
                      break
                    }
                  }

                  r()
                })

                setIsRecord(false)
                stopLoopRef.current = false
              } else {
                stopLoopRef.current = true
              }
              // if (!cvLoad || !isLoaded) return
            }}
            className={`button ${isRecord ? 'button-press' : ''}`}
          >
            <div className="button-center"></div>
          </div>
        </div>
      </div>
      {listOpen && (
        <SeletedSponsorList
          clear={() => setSponsors([])}
          removeSponsor={(sponsorCode) =>
            setSponsors((prev) =>
              prev.filter((sponsor) => sponsor.number !== sponsorCode)
            )
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
          backgroundColor: !cvLoad || !isLoaded ? 'red' : 'greenyellow',
          left: 10,
          bottom: 10,
          zIndex: 1000,
        }}
      ></div>
      {isDebug && (
        <div
          id="log"
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

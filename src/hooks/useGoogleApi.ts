import { useEffect, useRef, useState } from 'react'

const CLIENT_ID = '332017304322-eeq5c6hbnu1m8i4kmq0laj8m8s712ftq.apps.googleusercontent.com'
const API_KEY = 'AIzaSyBxtIakFEEXuswuHCuPU61IWzcihlFgpro'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const SCOPES = 'https://www.googleapis.com/auth/drive'

export const useGoogleApi = () => {
    const [access, setAccess] = useState(false)

    const tokenClientRef = useRef<any>()
    const googleRef = useRef<any>()
    const gapiRef = useRef<any>()

    const authorize = async () => {
        if (gapiRef.current.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClientRef.current.requestAccessToken({ prompt: '' }) //consent
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClientRef.current.requestAccessToken({ prompt: '' })
        }
    }

    //any as Mat
    const saveImageToGoogleDrive = async (src: any) => {
        const accessToken = gapiRef.current.client?.getToken()?.access_token

        if (!accessToken) return

        // const form = new FormData()

        // const canvas = document.createElement('canvas')
        // canvas.width = 200
        // canvas.height = 200

        // cv.imshow(canvas, src)
        // canvas.toBlob(blob => {
        //     if (!blob) return

        //     const file = new File([blob], 'filename.png', { type: 'image/png' })

        //     const metadata = {
        //         name: 'filename.png',
        //         mimeType: 'image/png',
        //         parents: ['1cqJMCtdVp1_C-hMRv65EebSynEu60BYz'],
        //     }
        //     form.append(
        //         'metadata',
        //         new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        //     )
        //     form.append('file', file)

        //     fetch('https://www.googleapis.com/upload/drive/v3/files?&fields=id', {
        //         method: 'POST',
        //         headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        //         body: form,
        //     }).then(res => {
        //         console.log('res', res)
        //     })
        // })
    }

    useEffect(() => {
        let script = document.createElement('script')
        script.onload = () => {
            console.log('Google gsi load')
            googleRef.current = (window as any).google

            tokenClientRef.current = googleRef.current.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (e: any) => {
                    console.log('Callbafk')
                    setAccess(true)
                    console.log(e)
                },
            })
            // console.log(google)
        }
        script.src = 'https://accounts.google.com/gsi/client'
        document.body.appendChild(script)

        script = document.createElement('script')
        script.onload = () => {
            console.log('Google api load')
            gapiRef.current = (window as any).gapi

            gapiRef.current.load('client', async () => {
                await gapiRef.current.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                })
            })
            // console.log(gapi)
        }
        script.src = 'https://apis.google.com/js/api.js'
        document.body.appendChild(script)
    }, [])

    return {
        access,
        authorize,
        saveImageToGoogleDrive,
    }
}

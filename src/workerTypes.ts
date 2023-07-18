import { ID } from './types'

export type MessageType =
    | {
          type: 'OpenCVIsLoaded'
      }
    | {
          type: 'ModelIsLoaded'
      }
    | {
          type: 'FindMatches'
          src: number[]
          ids: ID[]
      }
    | {
          type: 'ReturnMathes'
          matches: {
              number: number[]
              match: number
              recognizeString: string
              name: string
              phone: string | null
          }[]
          draw: number[]
      }
    | {
          type: 'Alert'
          message: string
      }

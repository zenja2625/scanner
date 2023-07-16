export type Rect = {
    x: number
    y: number
    height: number
    width: number
}

export type Sponsor = {
    number: string
    name: string
    phone: string | null
}

export type Coors = {
    left: number
    top: number
}
export type ID = {
    number: number[]
    name: string
    phone: string | null
}

export type Match = {
    number: number[]
    match: number
    recognizeString: string
    name: string
    phone: string | null
}

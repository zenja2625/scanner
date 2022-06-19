import { CSSProperties, FC } from 'react'
import { Rect } from './types'

export const Selector: FC<Rect> = ({
    x,
    y,
    height,
    width,
}) => {
    const style: CSSProperties = {
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
        height: `${height}px`,
        width: `${width}px`,
        border: '1px solid lightgreen',

    }

    return <div style={style}></div>
}

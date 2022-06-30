import { CSSProperties, FC } from 'react'
import { Sponsor } from './types'

export const Card: FC<{ setSponsor?: (sponsor: Sponsor) => void, isSelected?: boolean } & Sponsor> = ({
    code,
    name,
    isSelected,
    setSponsor,
}) => {
    const style: CSSProperties = {
        backgroundColor: isSelected ? 'gray' : 'white'
    }

    return (
        <div style={style} onClick={() => setSponsor && setSponsor({ code, name })} className='card'>
            <div>{code}</div>
            <div>{name}</div>
        </div>
    )
}

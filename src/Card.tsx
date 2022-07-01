import { CSSProperties, FC } from 'react'
import { Sponsor } from './types'

export const Card: FC<{ setSponsor?: (sponsor: Sponsor) => void, isSelected?: boolean } & Sponsor> = ({
    number,
    name,
    phone,
    isSelected,
    setSponsor,
}) => {
    const style: CSSProperties = {
        backgroundColor: isSelected ? 'gray' : !phone ? 'orangered' : 'white'
    }

    return (
        <div style={style} onClick={() => setSponsor && phone && setSponsor({ number, name, phone })} className='card'>
            <div>{number}</div>
            <div>{name}</div>
        </div>
    )
}

import { FC } from 'react'
import { Card } from './Card'
import { Sponsor } from './types'

export const SeletedSponsorList: FC<{
    sponsors: Array<Sponsor>
    removeSponsor: (sponsorCode: string) => void
    clear: () => void
    close: () => void
}> = ({ sponsors, removeSponsor, close, clear }) => {
    const message =
        'Привет📦 твой заказ Орифлейм пришёл.  🕒 Мы работаем: Понедельник, Среда и Пятница с 15:00 до 17:30. До встречи 💄 '

    return (
        <div className='card-list-wrapper'>
            <div className='card-list-background'></div>
            <div className='card-list'>
                <a
                    href={`sms:${sponsors.map(s => s.phone).join(';')}?body=${message}`}
                    // href={`sms:+37126251813;+37126105872?body=hello%20there`}
                    className='a-button'
                    onClick={() => {
                        clear()
                        close()
                    }}
                >
                    <button className='card-list-button'>Отправить</button>
                </a>

                <div style={{ overflowY: 'auto' }}>
                    {sponsors
                        .slice()
                        .reverse()
                        .map(({ number: code, name, phone }) => (
                            <div key={code} className='card-list-element'>
                                <Card number={code} name={name} phone={phone} />
                                <button onClick={() => removeSponsor(code)}>X</button>
                            </div>
                        ))}
                </div>

                <button className='card-list-button' onClick={close}>
                    Закрыть
                </button>
            </div>
        </div>
    )
}

import { FC } from 'react'
import { Card } from './Card'
import { Sponsor } from './types'

export const SeletedSponsorList: FC<{
    sponsors: Array<Sponsor>
    removeSponsor: (sponsorCode: string) => void
    clear: () => void
    close: () => void
}> = ({ sponsors, removeSponsor, close, clear }) => {
    // const message =
    //     'Привет📦 твой заказ Орифлейм пришёл.  🕒 Мы работаем: Понедельник, Среда и Пятница с 15:00 до 17:30. До встречи 💄 '
    const message = 'Привет📦заказ Орифлейм пришёл. ВНИМАНИЕ ❗ Новый адрес: ул. Saules 23(2.stāvs) Мы работаем: Пон., Среда и Пятница 15:00-17:30💄'

    return (
        <div className='popup'>
            <div className='popup-background'></div>
            <div className='popup-card-wrapper'>
                <a
                    href={`sms:${sponsors.map(s => s.phone).join(';')}?body=${message}`}
                    // href={`sms:+37126251813;+37126105872?body=hello%20there`}
                    className='a-button'
                    onClick={() => {
                        clear()
                        close()
                    }}
                >
                    <div className='list-button'>Отправить</div>
                </a>

                <div className='popup-card-list'>
                    {sponsors
                        .slice()
                        .reverse()
                        .map(({ number: code, name, phone }) => (
                            <div key={code} className='card-list-element'>
                                <Card number={code} name={name} phone={phone} />
                                <div className='list-button delete-button' onClick={() => removeSponsor(code)}>
                                    ❌
                                </div>
                            </div>
                        ))}
                </div>

                <button className='list-button' onClick={close}>
                    Закрыть
                </button>
            </div>
        </div>
    )
}

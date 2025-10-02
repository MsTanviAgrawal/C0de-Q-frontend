import React from 'react'
import { useTranslation } from 'react-i18next'

const Taglist = ({tag}) => {
  const { t } = useTranslation()

  return (
    <div className='tag'>
        <h5>{tag.tagName}</h5>
        <p>{t(`tags.descriptions.${tag.tagName}`) || tag.tagDesc}</p>
    </div>
  )
}

export default Taglist

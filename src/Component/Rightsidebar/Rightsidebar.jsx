import React from 'react'
import '../Rightsidebar/Rightsidebar.css'
import Widget from '../Rightsidebar/Widget'
import Widgettag from '../Rightsidebar/Widgettag'

const Rightsidebar = () => {
    return (
        <>
            <aside className="right-sidebar">
                <Widget />
                <Widgettag />
            </aside>
        </>
    )
}

export default Rightsidebar

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Askquestion from './Pages/Askquestion/Askquestion'
import Auth from './Pages/Auth/Auth'
import Question from './Pages/Question/Question'
import Displayquestion from './Pages/Question/Displayquestion'
import Tags from './Pages/Tags/Tags'
import Users from './Pages/Users/Users'
import Public from './Pages/Public/Public'
import Userprofile from './Pages/Userprofile/Userprofile'
import Subscription from './Pages/Subscription/Subscription'
import LoginHistory from './Pages/LoginHistory/LoginHistory'

const Allroutes = ({ slidein, handleslidein }) => {
  return (
   
      <Routes>
        
        <Route path='/' element={<Home slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Askquestion' element={<Askquestion />} />
        <Route path='/Auth' element={<Auth />} />
        <Route path='/Question' element={<Question slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Question/:id' element={<Displayquestion slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Tags' element={<Tags slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Users' element={<Users slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Users/:id' element={<Userprofile slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Public' element={<Public slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/Subscription' element={<Subscription slidein={slidein} handleslidein={handleslidein} />} />
        <Route path='/LoginHistory' element={<LoginHistory slidein={slidein} handleslidein={handleslidein} />} />
      </Routes>

  )
}

export default Allroutes

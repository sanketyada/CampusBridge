import React from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Layout from '../components/layout/Layout'
import Home from '../pages/Home'
import Collab from '../pages/Collab'
import Book from '../pages/Book'
import AiModel from '../pages/AiModel'
import Style from '../pages/Style'


function AppRoutes() {
  return (
    <>
      <Router>
        <Routes>
            <Route path='/' element={<Layout/>}>
            <Route path='/' element={<Home/>}/>
            <Route path='/collab' element={<Collab/>}/>
            <Route path='/ai_model' element={<AiModel/>}/>
            <Route path='/book' element={<Book/>}/>
            <Route path='/style' element={<Style/>}/>
            {/* <Route path='/profile' element={<Home/>}/> */}
            </Route>
        </Routes>
      </Router>
    </>
  )
}

export default AppRoutes

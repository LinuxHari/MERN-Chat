import React from 'react'
import AuthForm from './AuthForm'
import { useContext } from "react"
import { UserContext, UserContextProvider } from "../context/UserContext"
import Chat from './Chat'

const Routes = () => {
    const {username, id} = useContext(UserContext)

    if(username){
        return <Chat/>
    }

  return (
    <AuthForm/>
  )
}

export default Routes
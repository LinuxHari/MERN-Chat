import React, { useContext, useState } from 'react'
import axios from "axios"
import { UserContext } from '../context/UserContext'

const AuthForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login')

  const {setUsername: setName, setId} = useContext(UserContext)

  async function handleSubmit(e){
    e.preventDefault()
    const endpoint = isLoginOrRegister === "register"? "register" : "login"
    const {data} = await axios.post(`/${endpoint}`, {username, password})
    setName(username)
    setId(data.id)
  }

  return (
    <div className='bg-blue-50 h-screen flex items-center'>
      <form className="w-64 mx-auto mb-12 space-y-3" onSubmit={handleSubmit}>
        <input type="text" placeholder='username' className='block w-full rounded-sm p-2' value={username} onChange={e => setUsername(e.target.value)} autoComplete='off'/>
        <input type="password" placeholder='password' className='block w-full rounded p-2' value={password} onChange={e => setPassword(e.target.value)} autoComplete='off'/>
        <button className='bg-blue-500 text-white block w-full rounded-sm p-2'>{isLoginOrRegister === "register"? "Register": "Login"}</button>
        {
          isLoginOrRegister === "register" && (
            <div>Already a member? <button className='ml-1' onClick={() => setIsLoginOrRegister('login')}>Login here</button></div>
          )
        }
        {
          isLoginOrRegister === "login" && (
            <div>Don't have an account? <button className='ml-1' onClick={() => setIsLoginOrRegister('register')}>Register</button></div>
          )
        }

      </form>
    </div>
  )
}

export default AuthForm
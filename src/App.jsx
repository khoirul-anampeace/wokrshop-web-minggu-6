import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RegisterationForm from './components/RegistrationForm.jsx'
import EnhancedRegistrationForm from './components/EnhancedRegistrationForm.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    // <RegisterationForm />
    <EnhancedRegistrationForm />
  )
}

export default App

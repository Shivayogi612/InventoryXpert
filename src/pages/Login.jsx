import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <Card className="max-w-md w-full p-8 rounded-2xl shadow-xl">

        {/* LOGO + APP NAME */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2">
            <img src="logo (2).png" alt="logo" className="h-14 w-14" />
            <h1 className="font-semibold text-xl text-gray-900">
              InventoryXpert
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Smart Inventory Management System
          </p>
        </div>

        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
          Sign in to continue
        </h2>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
           <Input
  className="mt-1 text-gray-900 placeholder-gray-400"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  type="email"
  placeholder="you@example.com"
  required
/>

          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
  className="mt-1 text-gray-900 placeholder-gray-400"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  type="password"
  required
/>

          </div>

          {/* Submit */}
          <Button className="w-full transition-all hover:scale-[1.02]" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

      </Card>
    </div>
  )
}

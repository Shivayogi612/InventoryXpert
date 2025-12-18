
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading, role } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // User authorized but incorrect role
        return <Navigate to="/dashboard" replace />
    }

    return children
}

import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import SupplierOrders from './pages/SupplierOrders'
import AlertsPage from './pages/Alerts'
import Transactions from './pages/Transactions'
import AdvancedForecasting from './pages/AdvancedForecasting'
import { backgroundJobsService } from './services/backgroundJobs.service'

export default function App() {
  useEffect(() => {
    // Start background jobs when app initializes
    try {
      backgroundJobsService.startAllJobs()
    } catch (error) {
      console.error('Failed to start background jobs:', error)
    }

    // Clean up when app unmounts
    return () => {
      try {
        backgroundJobsService.stopAllJobs()
      } catch (error) {
        console.error('Failed to stop background jobs:', error)
      }
    }
  }, [])

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SupplierOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advanced-forecasting"
          element={
            <ProtectedRoute>
              <AdvancedForecasting />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
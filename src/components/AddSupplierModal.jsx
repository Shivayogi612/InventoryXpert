import React, { useMemo, useState } from 'react'
import { X, UserPlus, Mail, Phone, MapPin, Star, StickyNote } from 'lucide-react'
import Input from './ui/Input'
import Button from './ui/Button'
import { useSuppliers } from '../hooks/useSuppliers'

const initialForm = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  rating: '',
  notes: ''
}

export default function AddSupplierModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const { createSupplier, loading } = useSuppliers()

  const handleClose = () => {
    setForm(initialForm)
    setErrors({})
    onClose?.()
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const validationErrors = useMemo(() => errors, [errors])

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Supplier name is required'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (form.rating) {
      const ratingValue = Number(form.rating)
      if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        nextErrors.rating = 'Rating must be between 0 and 5'
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      contact_person: form.contact_person.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      rating: form.rating === '' ? null : Number(form.rating),
      is_active: true
    }

    try {
      await createSupplier(payload)
      onSuccess?.()
      handleClose()
    } catch (err) {
      // toast handled in hook
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content add-supplier-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span className="icon-badge">
              <UserPlus size={18} />
            </span>
            <div>
              <h2 className="modal-title">Add New Supplier</h2>
              <p className="modal-subtitle">Register a supplier to unlock purchase automations</p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <form className="supplier-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Supplier Name *</span>
                <Input
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="E.g. Atlas Components Inc."
                  required
                />
                {validationErrors.name && <p className="field-error">{validationErrors.name}</p>}
              </label>

              <label className="form-field">
                <span>Primary Contact</span>
                <Input
                  value={form.contact_person}
                  onChange={handleChange('contact_person')}
                  placeholder="Full name"
                />
              </label>

              <label className="form-field">
                <span>Email Address</span>
                <div className="with-icon">
                  <Mail size={16} />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="contact@supplier.com"
                  />
                </div>
                {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}
              </label>

              <label className="form-field">
                <span>Phone Number</span>
                <div className="with-icon">
                  <Phone size={16} />
                  <Input
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </label>

              <label className="form-field form-full">
                <span>Address</span>
                <div className="with-icon">
                  <MapPin size={16} />
                  <Input
                    value={form.address}
                    onChange={handleChange('address')}
                    placeholder="Street, City, State"
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Rating</span>
                <div className="with-icon">
                  <Star size={16} />
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange('rating')}
                    placeholder="4.5"
                  />
                </div>
                {validationErrors.rating && <p className="field-error">{validationErrors.rating}</p>}
              </label>

              <label className="form-field form-full">
                <span>Notes</span>
                <div className="textarea-wrapper">
                  <StickyNote size={16} />
                  <textarea
                    value={form.notes}
                    onChange={handleChange('notes')}
                    placeholder="Payment terms, preferred products, delivery windows..."
                  />
                </div>
              </label>
            </div>

            <div className="modal-actions">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Supplier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

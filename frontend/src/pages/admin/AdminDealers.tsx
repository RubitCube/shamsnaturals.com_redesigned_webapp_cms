import { useEffect, useMemo, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { adminAPI } from '../../services/api'

interface Dealer {
  id: number
  company_name: string
  contact_person: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  country: string
  description?: string
  latitude?: number
  longitude?: number
  is_active: boolean
}

interface CountryOption {
  id: number
  name: string
  is_active: boolean
}

interface StateOption {
  id: number
  name: string
  country_id: number
  is_active: boolean
}

const getInitialFormData = () => ({
  company_name: '',
  contact_person: '',
  email: '',
  phoneNumbers: [''],
  address: '',
  city: '',
  state: '',
  country: '',
  location_embed: '',
  website: '',
  is_active: true,
})

type DealerFormData = ReturnType<typeof getInitialFormData>

type PhoneArray = string[]

const parseDealerMetadata = (description?: string) => {
  if (!description) {
    return { location: '', website: '' }
  }

  try {
    const parsed = JSON.parse(description)
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        location: typeof parsed.location === 'string' ? parsed.location : '',
        website: typeof parsed.website === 'string' ? parsed.website : '',
      }
    }
  } catch (_error) {
    return { location: description, website: '' }
  }

  return { location: '', website: '' }
}

const buildDealerDescription = (location: string, website: string) => {
  if (!location && !website) {
    return ''
  }

  return JSON.stringify({ location, website })
}

const normalizePhoneForInput = (value?: string) => {
  if (!value) return ''
  return value.replace(/[^0-9]/g, '')
}

// Parse phone numbers for display (keeps + symbol and formatting)
const parsePhoneNumbersForDisplay = (value?: string): string[] => {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length) {
      const phones = parsed
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
      return phones
    }
  } catch (_error) {
    if (typeof value === 'string' && value.trim()) {
      return [value.trim()]
    }
  }

  return []
}

// Parse phone numbers for editing (removes + for PhoneInput component)
const parsePhoneNumbers = (value?: string): PhoneArray => {
  if (!value) return ['']

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length) {
      const phones = parsed
        .map((item) => (typeof item === 'string' ? normalizePhoneForInput(item) : ''))
        .filter(Boolean)
      return phones.length ? phones : ['']
    }
  } catch (_error) {
    const single = normalizePhoneForInput(value)
    if (single) {
      return [single]
    }
  }

  return ['']
}

const GOOGLE_MAPS_EMBED_BASE = 'https://www.google.com/maps/embed'

const extractLocationInfo = (raw: string) => {
  if (!raw) {
    return { embedHtml: '', text: '' }
  }

  const trimmed = raw.trim()

  const iframeMatch = trimmed.match(/<iframe[^>]*src=("|')(.*?)(\1)[^>]*><\/iframe>/i)
  if (iframeMatch) {
    const src = iframeMatch[2]
    if (src.startsWith(GOOGLE_MAPS_EMBED_BASE)) {
      return {
        embedHtml: `<iframe src="${src}" width="100%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
        text: '',
      }
    }
  }

  const urlMatch = trimmed.match(/https:\/\/www\.google\.com\/maps\/embed[^"'\s>]*/i)
  if (urlMatch) {
    return {
      embedHtml: `<iframe src="${urlMatch[0]}" width="100%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
      text: '',
    }
  }

  return { embedHtml: '', text: trimmed }
}

const AdminDealers = () => {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null)
  const [formData, setFormData] = useState<DealerFormData>(getInitialFormData)
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [states, setStates] = useState<StateOption[]>([])
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [statesLoading, setStatesLoading] = useState(false)
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null)
  const [pendingCountryName, setPendingCountryName] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [viewingDealer, setViewingDealer] = useState<Dealer | null>(null)
  const [statusChangeDealer, setStatusChangeDealer] = useState<Dealer | null>(null)

  const inputClassName = (hasError?: boolean) =>
    `mt-1 block w-full rounded-lg border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }

  useEffect(() => {
    fetchDealers()
  }, [])

  useEffect(() => {
    fetchCountries()
  }, [])

  useEffect(() => {
    if (!pendingCountryName || !countries.length) return
    const match = countries.find(
      (country) => country.name.toLowerCase() === pendingCountryName.toLowerCase()
    )
    if (match) {
      setSelectedCountryId(match.id)
      setPendingCountryName(null)
    }
  }, [countries, pendingCountryName])

  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId)
    } else {
      setStates([])
    }
  }, [selectedCountryId])

  const fetchDealers = async () => {
    try {
      const response = await adminAPI.dealers.getAll()
      setDealers(response.data)
    } catch (error) {
      console.error('Error fetching dealers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    setCountriesLoading(true)
    try {
      const response = await adminAPI.countries.getAll({
        per_page: 200,
        page: 1,
      })
      const fetchedCountries = (response.data?.data || []) as CountryOption[]
      setCountries(fetchedCountries)
    } catch (error) {
      console.error('Error fetching countries:', error)
      setCountries([])
    } finally {
      setCountriesLoading(false)
    }
  }

  const fetchStates = async (countryId: number) => {
    setStatesLoading(true)
    try {
      const response = await adminAPI.states.getByCountry(countryId, { per_page: 200, page: 1 })
      const fetchedStates = (response.data?.data || []) as StateOption[]
      setStates(fetchedStates)
    } catch (error) {
      console.error('Error fetching states:', error)
      setStates([])
    } finally {
      setStatesLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dealer?')) return

    try {
      await adminAPI.dealers.delete(id)
      fetchDealers()
    } catch (error) {
      alert('Error deleting dealer')
    }
  }

  const handleStatusToggle = (dealer: Dealer) => {
    setStatusChangeDealer(dealer)
  }

  const confirmStatusChange = async () => {
    if (!statusChangeDealer) return

    try {
      await adminAPI.dealers.update(statusChangeDealer.id, {
        ...statusChangeDealer,
        is_active: !statusChangeDealer.is_active,
      })
      fetchDealers()
      setStatusChangeDealer(null)
    } catch (error) {
      alert('Error updating dealer status')
      setStatusChangeDealer(null)
    }
  }

  const cancelStatusChange = () => {
    setStatusChangeDealer(null)
  }

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer)
    const { location, website } = parseDealerMetadata(dealer.description)
    const phoneNumbers = parsePhoneNumbers(dealer.phone)

    setFormData({
      company_name: dealer.company_name || '',
      contact_person: dealer.contact_person || '',
      email: dealer.email || '',
      phoneNumbers,
      address: dealer.address || '',
      city: dealer.city || dealer.state || '',
      state: dealer.state || '',
      country: dealer.country || '',
      location_embed: location,
      website,
      is_active: dealer.is_active !== false,
    })
    setStates([])
    setErrors({})
    if (dealer.country) {
      const match = countries.find(
        (country) => country.name.toLowerCase() === dealer.country.toLowerCase()
      )
      if (match) {
        setSelectedCountryId(match.id)
        setPendingCountryName(null)
      } else {
        setSelectedCountryId(null)
        setPendingCountryName(dealer.country)
      }
    } else {
      setSelectedCountryId(null)
      setPendingCountryName(null)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Filter out empty phone numbers and keep them with country codes
    const cleanedPhones = formData.phoneNumbers
      .map((phone) => phone.trim())
      .filter((phone) => phone.length > 0)

    const submissionData: Record<string, any> = {
      company_name: formData.company_name.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phoneNumbers: cleanedPhones, // Send as array, backend will handle JSON conversion
      address: formData.address.trim(),
      city: formData.state.trim(), // Use state as city
      state: formData.state.trim(),
      country: formData.country.trim(),
      location_embed: formData.location_embed.trim(),
      website: formData.website.trim(),
      is_active: formData.is_active,
    }

    console.log('Submitting dealer data:', submissionData)

    try {
      if (editingDealer) {
        await adminAPI.dealers.update(editingDealer.id, submissionData)
      } else {
        await adminAPI.dealers.create(submissionData)
      }
      fetchDealers()
      resetForm()
    } catch (error: any) {
      console.error('Error saving dealer:', error)
      alert(error.response?.data?.message || 'Error saving dealer')
    }
  }

  const openCreateModal = () => {
    setEditingDealer(null)
    setFormData(getInitialFormData())
    setSelectedCountryId(null)
    setStates([])
    setPendingCountryName(null)
    setErrors({})
    setShowModal(true)
  }

  const resetForm = () => {
    setShowModal(false)
    setEditingDealer(null)
    setFormData(getInitialFormData())
    setSelectedCountryId(null)
    setStates([])
    setPendingCountryName(null)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const sanitizedPhones = formData.phoneNumbers
      .map((phone) => phone.replace(/[^0-9]/g, ''))
      .filter(Boolean)

    if (!selectedCountryId) {
      newErrors.country = 'Please select a country/region.'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please select a state/emirate.'
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required.'
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Dealer name is required.'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.'
    }

    if (!sanitizedPhones.length) {
      newErrors.phone = 'At least one phone number is required.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (formData.website.trim() && !/^https?:\/\//i.test(formData.website.trim())) {
      newErrors.website = 'Website must start with http:// or https://'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const stateOptions = useMemo(() => {
    const activeStates = states.filter((state) => state.is_active)
    if (formData.state && !activeStates.some((state) => state.name === formData.state)) {
      return [
        ...activeStates,
        {
          id: -1,
          name: formData.state,
          country_id: selectedCountryId ?? -1,
          is_active: true,
        },
      ]
    }
    return activeStates
  }, [states, formData.state, selectedCountryId])

  const countryOptions = useMemo(() => {
    const activeCountries = countries.filter((country) => country.is_active)
    const selectedCountry = selectedCountryId
      ? countries.find((country) => country.id === selectedCountryId)
      : null

    if (selectedCountry && !selectedCountry.is_active) {
      if (!activeCountries.some((country) => country.id === selectedCountry.id)) {
        return [...activeCountries, selectedCountry]
      }
    } else if (!selectedCountry && formData.country) {
      const fallbackCountry = countries.find(
        (country) => country.name.toLowerCase() === formData.country.toLowerCase()
      )
      if (fallbackCountry && !activeCountries.some((country) => country.id === fallbackCountry.id)) {
        return [...activeCountries, fallbackCountry]
      }
    }

    return activeCountries
  }, [countries, selectedCountryId, formData.country])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dealers Management</h2>
        <button onClick={openCreateModal} className="btn-primary px-4 py-2">
          Add New Dealer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country (Region)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State (Community)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dealers.map((dealer, index) => {
              const { website } = parseDealerMetadata(dealer.description)
              const phoneNumbers = parsePhoneNumbersForDisplay(dealer.phone)
              const showCity =
                dealer.city &&
                dealer.state &&
                dealer.city.toLowerCase() !== dealer.state.toLowerCase()

              return (
                <tr 
                  key={dealer.id}
                  className={dealer.is_active ? 'bg-green-50' : 'bg-red-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dealer.company_name}</div>
                    <div className="text-sm text-gray-500">{dealer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dealer.contact_person || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{dealer.country || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{dealer.state || '—'}</div>
                    {showCity && <div className="text-sm text-gray-500">{dealer.city}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                    {website ? (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {website}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {phoneNumbers.length ? (
                      <div className="text-sm text-gray-500 space-y-1">
                        {phoneNumbers.map((phone, idx) => (
                          <div key={idx}>{phone}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(dealer)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                        dealer.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {dealer.is_active ? '● Active' : '● Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setViewingDealer(dealer)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(dealer)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dealer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingDealer ? 'Edit Dealer' : 'Add New Dealer'}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-6"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Select Countries (Region) *</label>
                  <select
                    required
                    value={selectedCountryId ?? ''}
                    onChange={(e) => {
                      const countryId = e.target.value ? Number(e.target.value) : null
                      setSelectedCountryId(countryId)
                      setStates([])
                      if (countryId) {
                        const country = countries.find((item) => item.id === countryId)
                        setFormData({
                          ...formData,
                          country: country?.name || '',
                          state: '',
                          city: '',
                        })
                      } else {
                        setFormData({ ...formData, country: '', state: '', city: '' })
                      }
                      clearError('country')
                      clearError('state')
                    }}
                    disabled={countriesLoading}
                    className={inputClassName(!!errors.country)}
                  >
                    <option value="">
                      {countriesLoading ? 'Loading regions...' : 'Select Countries (Region)'}
                    </option>
                    {countryOptions.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                        {!country.is_active ? ' (Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Dealer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Type dealer name..."
                    value={formData.contact_person}
                    onChange={(e) => {
                      setFormData({ ...formData, contact_person: e.target.value })
                      clearError('contact_person')
                    }}
                    className={inputClassName(!!errors.contact_person)}
                  />
                  {errors.contact_person && (
                    <p className="mt-1 text-xs text-red-600">{errors.contact_person}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Select State ( Emirates / Community ) *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ ...formData, state: value, city: value })
                      clearError('state')
                    }}
                    disabled={!selectedCountryId || statesLoading}
                    className={inputClassName(!!errors.state)}
                  >
                    <option value="">
                      {selectedCountryId
                        ? statesLoading
                          ? 'Loading states...'
                          : 'Select State ( Emirates / Community )'
                        : 'Select a country/region first'}
                    </option>
                    {stateOptions.map((state) => (
                      <option key={`${state.id}-${state.name}`} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                  {selectedCountryId && !statesLoading && stateOptions.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No states/emirates found for the selected region. Please add them from the CMS.
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Type company name..."
                    value={formData.company_name}
                    onChange={(e) => {
                      setFormData({ ...formData, company_name: e.target.value })
                      clearError('company_name')
                    }}
                    className={inputClassName(!!errors.company_name)}
                  />
                  {errors.company_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Type address..."
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value })
                      clearError('address')
                    }}
                    className={inputClassName(!!errors.address)}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Numbers *</label>
                  <div className="flex flex-col gap-3">
                    {formData.phoneNumbers.map((phoneValue, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <PhoneInput
                          country="ae"
                          value={phoneValue}
                          onChange={(value) => {
                            const next = [...formData.phoneNumbers]
                            next[index] = value
                            setFormData({ ...formData, phoneNumbers: next })
                            clearError('phone')
                          }}
                          placeholder="Type phone number..."
                          enableSearch
                          inputProps={{ required: index === 0, name: `phone-${index}` }}
                          containerClass="flex-1"
                          inputStyle={{
                            width: '100%',
                            borderRadius: '0.5rem',
                            borderColor: errors.phone ? '#f87171' : '#d1d5db',
                            backgroundColor: errors.phone ? '#fef2f2' : '#ffffff',
                            height: '42px',
                            fontSize: '14px',
                          }}
                          buttonStyle={{
                            borderRadius: '0.5rem 0 0 0.5rem',
                            borderColor: errors.phone ? '#f87171' : '#d1d5db',
                            backgroundColor: '#ffffff',
                          }}
                          dropdownStyle={{ borderRadius: '0.5rem', fontSize: '14px' }}
                        />
                        {formData.phoneNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = formData.phoneNumbers.filter((_, i) => i !== index)
                              setFormData({ ...formData, phoneNumbers: next.length ? next : [''] })
                              clearError('phone')
                            }}
                            className="px-2 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, ''] })}
                      className="self-start px-3 py-2 text-sm text-[#1f4b2b] border border-[#b8d2b0] rounded-lg hover:bg-[#ecf4e6]"
                    >
                      + Add another phone
                    </button>
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="Type email address..."
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      clearError('email')
                    }}
                    className={inputClassName(!!errors.email)}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Website Address</label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => {
                      setFormData({ ...formData, website: e.target.value })
                      clearError('website')
                    }}
                    className={inputClassName(!!errors.website)}
                  />
                  {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Location [ Add embed Google Map code here ]
                </label>
                <textarea
                  placeholder="Paste Google Map embed code or add internal notes..."
                  value={formData.location_embed}
                  onChange={(e) => {
                    setFormData({ ...formData, location_embed: e.target.value })
                    clearError('location_embed')
                  }}
                  className={`${inputClassName(!!errors.location_embed)} min-h-[120px]`}
                />
                {errors.location_embed && <p className="mt-1 text-xs text-red-600">{errors.location_embed}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Status</label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, is_active: true })
                    }}
                    className={`rounded-lg border px-3 py-1 text-sm font-medium transition ${
                      formData.is_active
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, is_active: false })
                    }}
                    className={`rounded-lg border px-3 py-1 text-sm font-medium transition ${
                      !formData.is_active
                        ? 'border-red-300 bg-red-100 text-red-700'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-dashed border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Fields marked with * are required. Ensure the country and state exist in the CMS before creating a dealer.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary rounded-lg px-4 py-2 text-sm shadow-sm transition"
                  >
                    {editingDealer ? 'Update Dealer' : 'Create Dealer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDealer && (() => {
        const { location, website } = parseDealerMetadata(viewingDealer.description)
        const { embedHtml, text } = extractLocationInfo(location)
        const phones = parsePhoneNumbersForDisplay(viewingDealer.phone)

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Dealer Details</h3>
                  <p className="text-sm text-gray-500">Review dealer information</p>
                </div>
                <button
                  onClick={() => setViewingDealer(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
                    <p className="text-base font-medium text-gray-900">{viewingDealer.company_name}</p>
                    <p className="text-sm text-gray-500">{viewingDealer.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dealer Name</p>
                    <p className="text-base text-gray-900">{viewingDealer.contact_person || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Country / State</p>
                    <p className="text-base text-gray-900">{viewingDealer.country || '—'}</p>
                    <p className="text-sm text-gray-600">{viewingDealer.state || '—'}</p>
                    {viewingDealer.city && viewingDealer.city.toLowerCase() !== (viewingDealer.state || '').toLowerCase() && (
                      <p className="text-sm text-gray-500">{viewingDealer.city}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {viewingDealer.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Numbers</p>
                    {phones.length > 0 ? (
                      <ul className="mt-1 space-y-1 text-sm text-gray-700">
                        {phones.map((phone, idx) => (
                          <li key={idx}>
                            <a
                              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                              className="text-primary-600 hover:underline"
                            >
                              {phone}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</p>
                    {website ? (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {website}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location Preview</p>
                    {embedHtml ? (
                      <div
                        className="overflow-hidden rounded-lg"
                        dangerouslySetInnerHTML={{ __html: embedHtml }}
                      />
                    ) : text ? (
                      <p className="text-sm text-gray-600">{text}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No location details provided.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setViewingDealer(null)
                        handleEdit(viewingDealer)
                      }}
                      className="px-4 py-2 border border-[#b8d2b0] text-[#1f4b2b] rounded-lg hover:bg-[#ecf4e6]"
                    >
                      Edit Dealer
                    </button>
                    <button
                      onClick={() => setViewingDealer(null)}
                      className="btn-primary px-4 py-2 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {statusChangeDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h3 className="text-lg font-semibold uppercase">
                Dealer : {statusChangeDealer.company_name}
              </h3>
              <button
                onClick={cancelStatusChange}
                className="text-white hover:text-gray-200 text-2xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="px-6 py-5">
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                CHANGE {statusChangeDealer.company_name.toUpperCase()} STATUS
              </h4>
              
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to change the {statusChangeDealer.company_name} Status?
              </p>
              
              <p className="text-sm text-gray-600">
                All the <strong>data</strong> under this dealer will {statusChangeDealer.is_active ? 'not be displayed' : 'be displayed'}.
              </p>
            </div>
            
            <div className="px-6 pb-5 flex items-center gap-3">
              <button
                onClick={confirmStatusChange}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded hover:bg-red-600 font-medium text-sm"
              >
                Yes, Make the Status {statusChangeDealer.is_active ? 'Inactive' : 'Active'}
              </button>
              <button
                onClick={cancelStatusChange}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
            
            <div className="px-6 pb-5">
              <button
                onClick={cancelStatusChange}
                className="w-full bg-gray-500 text-white px-4 py-2.5 rounded hover:bg-gray-600 font-medium text-sm uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDealers
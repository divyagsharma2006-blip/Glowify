import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Calendar, Mail, Phone, Edit2, Save, Users } from 'lucide-react'

interface UserData {
  fullName: string
  email: string
  phone: string
  age: string
  gender: string
  joinDate: string
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserData>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    joinDate: ''
  })
  const [editData, setEditData] = useState(profile)
  const [saveStatus, setSaveStatus] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Error fetching auth user:', authError)
      }

      const authUser = authData?.user
      if (!authUser) {
        const defaultData = {
          fullName: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1 234 567 8900",
          age: "28",
          gender: "female",
          joinDate: "January 2024"
        }
        setProfile(defaultData)
        setEditData(defaultData)
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      let finalProfileData = profileData

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // If profile doesn't exist, create a default one
        if (profileError.code === 'PGRST116') {
          const defaultProfile = {
            user_id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            phone: '',
            gender: 'female',
            age_group: ''
          }
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([defaultProfile])
            .select()
            .single()
          if (insertError) {
            console.error('Error creating profile:', insertError)
          } else {
            finalProfileData = newProfile
          }
        }
      }

      const formattedJoinDate = authUser?.created_at
        ? new Date(authUser.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })
        : 'Unknown'

      const mappedProfile = {
        fullName:
          finalProfileData?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'User',
        email: authUser.email || finalProfileData?.email || '',
        phone: finalProfileData?.phone || finalProfileData?.phone_number || '',
        age: finalProfileData?.age_group || finalProfileData?.age || '',
        gender: finalProfileData?.gender || 'female',
        joinDate: formattedJoinDate
      }

      setProfile(mappedProfile)
      setEditData(mappedProfile)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaveStatus('')
    setSaving(true)

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Error fetching auth user:', authError)
      setSaveStatus('Unable to save profile: auth error')
      setSaving(false)
      return
    }

    const userId = authData?.user?.id
    if (!userId) {
      console.error('Unable to save profile: missing user ID')
      setSaveStatus('Unable to save profile: missing user ID')
      setSaving(false)
      return
    }

    const updatedProfile = {
      user_id: userId,
      full_name: editData.fullName,
      email: editData.email,
      phone_number: editData.phone,
      gender: editData.gender,
      age_group: editData.age
    }

    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking profile existence:', existingError)
      setSaveStatus('Unable to save profile: ' + existingError.message)
      setSaving(false)
      return
    }

    let data
    let error

    if (existingProfile) {
      const updateResult = await supabase
        .from('user_profiles')
        .update(updatedProfile)
        .eq('user_id', userId)
        .select()
      data = updateResult.data
      error = updateResult.error
    } else {
      const insertResult = await supabase
        .from('user_profiles')
        .insert([updatedProfile])
        .select()
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      console.error('Error saving profile:', error)
      setSaveStatus('Unable to save profile: ' + error.message)
      setSaving(false)
      return
    }

    const savedProfile = Array.isArray(data) ? data[0] : data
    const mappedProfile = {
      fullName: savedProfile?.full_name || editData.fullName,
      email: savedProfile?.email || editData.email || profile.email,
      phone: savedProfile?.phone_number || savedProfile?.phone || editData.phone,
      age: savedProfile?.age_group || savedProfile?.age || editData.age,
      gender: savedProfile?.gender || editData.gender,
      joinDate: profile.joinDate
    }

    setProfile(mappedProfile)
    setEditData(mappedProfile)
    setIsEditing(false)
    setSaveStatus('Profile saved successfully!')
    setSaving(false)
  }

  const getSkinType = () => {
    // Simple logic based on age and gender for demo
    const age = parseInt(profile.age)
    if (age < 25) return "Combination/Oily"
    if (age < 35) return "Combination/Normal"
    if (age < 50) return "Normal/Dry"
    return "Mature/Dry"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-[32px] shadow-2xl p-8 xl:p-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                 style={{ backgroundColor: '#5fb3a2' }}>
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                  className="text-4xl font-bold border-b-2 focus:outline-none w-full"
                  style={{ borderColor: '#5fb3a2' }}
                />
              ) : (
                <h2 className="text-4xl font-bold" style={{ color: '#2e2e2e' }}>{profile.fullName}</h2>
              )}
              <p className="text-sm mt-1" style={{ color: '#6c8ebf' }}>Skin Care Enthusiast</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#5fb3a2' }}
            >
              {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              {saving ? 'Saving...' : isEditing ? 'Save' : 'Edit Profile'}
            </button>
            {saveStatus && (
              <span className={`text-sm ${saveStatus.includes('success') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {saveStatus}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail size={18} style={{ color: '#5fb3a2' }} />
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="flex-1 border-b focus:outline-none"
                  style={{ borderColor: '#e0e0e0' }}
                  onFocus={(e) => e.target.style.borderColor = '#5fb3a2'}
                />
              ) : (
                <span style={{ color: '#2e2e2e' }}>{profile.email}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} style={{ color: '#5fb3a2' }} />
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="flex-1 border-b focus:outline-none"
                  style={{ borderColor: '#e0e0e0' }}
                  onFocus={(e) => e.target.style.borderColor = '#5fb3a2'}
                />
              ) : (
                <span style={{ color: '#2e2e2e' }}>{profile.phone}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: '#5fb3a2' }} />
              {isEditing ? (
                <input
                  type="text"
                  value={editData.age}
                  onChange={(e) => setEditData({...editData, age: e.target.value})}
                  className="flex-1 border-b focus:outline-none"
                  style={{ borderColor: '#e0e0e0' }}
                  onFocus={(e) => e.target.style.borderColor = '#5fb3a2'}
                  placeholder="Age"
                />
              ) : (
                <span style={{ color: '#2e2e2e' }}>{profile.age} years old</span>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={18} style={{ color: '#5fb3a2' }} />
              {isEditing ? (
                <select
                  value={editData.gender}
                  onChange={(e) => setEditData({...editData, gender: e.target.value})}
                  className="flex-1 border-b focus:outline-none bg-transparent"
                  style={{ borderColor: '#e0e0e0' }}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <span style={{ color: '#2e2e2e' }}>{profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: '#5fb3a2' }} />
              <span style={{ color: '#2e2e2e' }}>Member since {profile.joinDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} style={{ color: '#5fb3a2' }} />
              <span style={{ color: '#2e2e2e' }}>Skin Type: {getSkinType()}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6" style={{ borderColor: '#f0f0f0' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#2e2e2e' }}>Skin Concerns</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {getSkinType() === "Combination/Oily" && (
              <>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Oil Control</span>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Pores</span>
              </>
            )}
            {getSkinType() === "Combination/Normal" && (
              <>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Balance</span>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Hydration</span>
              </>
            )}
            {getSkinType() === "Normal/Dry" && (
              <>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Hydration</span>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Fine Lines</span>
              </>
            )}
            {getSkinType() === "Mature/Dry" && (
              <>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Anti-aging</span>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#e8f5f2', color: '#5fb3a2' }}>Firmness</span>
              </>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#2e2e2e' }}>Recommended Routine</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg p-4" style={{ backgroundColor: '#fafaf7' }}>
              <h4 className="font-semibold mb-2" style={{ color: '#5fb3a2' }}>🌅 Morning Routine</h4>
              <ul className="space-y-1">
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Gentle Cleanser</li>
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Vitamin C Serum</li>
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Moisturizer</li>
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• SPF 50</li>
              </ul>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#fafaf7' }}>
              <h4 className="font-semibold mb-2" style={{ color: '#5fb3a2' }}>🌙 Evening Routine</h4>
              <ul className="space-y-1">
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Double Cleanse</li>
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Treatment Serum</li>
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Eye Cream</li>
                <li className="text-sm" style={{ color: '#2e2e2e' }}>• Night Cream</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
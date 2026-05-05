import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  type LucideIcon,
  User, Sparkles, X,
  Brain, Scan, FlaskConical, Home, Heart, Gamepad, Leaf, Sun, Flame, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import GlowPlay from './GlowPlay'
import Chatbot from './Chatbot'

const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || ''
const GROQ_API_TOKEN = import.meta.env.VITE_GROQ_API_TOKEN || ''
const useGroqKit = GROQ_API_URL.length > 0
import Quiz from './Quiz'
import FaceScanner from './FaceScanner'
import ChemicalDetails from './ChemicalDetails'
import HealthDetails from './HealthDetails'
import Profile from './Profile'

type DashboardPage = 'home' | 'quiz' | 'facescanner' | 'chemicals' | 'health' | 'profile' | 'glowplay'

// Helper functions to load/save period dates from database
const loadPeriodDates = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('period_starts')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error loading period dates:', error)
    return []
  }

  return data?.period_starts || []
}

const savePeriodDates = async (userId: string, dates: string[]) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ period_starts: dates })
    .eq('user_id', userId)

  if (error) {
    console.error('Error saving period dates:', error)
  }
}

interface DashboardProps {
  initialPage?: DashboardPage
}

export default function Dashboard({ initialPage = 'home' }: DashboardProps) {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState<DashboardPage>(initialPage)
  const [userName, setUserName] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [scanHistory, setScanHistory] = useState<any[]>([])
  const [scanSummary, setScanSummary] = useState<any>(null)
  const [routineTime, setRoutineTime] = useState<'morning' | 'night'>('morning')
  const [skinScore] = useState(82)
  const [personalizedKit, setPersonalizedKit] = useState<any>(null)
  const [showChatbot, setShowChatbot] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear())
  const [periodStarts, setPeriodStarts] = useState<string[]>([])

  const menuItems: Array<{ id: DashboardPage; icon: LucideIcon; label: string }> = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'quiz', icon: Brain, label: 'Fun Quiz' },
    { id: 'facescanner', icon: Scan, label: 'Face Scanner' },
    { id: 'glowplay', icon: Gamepad, label: 'GlowPlay' },
    { id: 'chemicals', icon: FlaskConical, label: 'Chemicals & Vitamins' },
    { id: 'health', icon: Heart, label: 'Health Details' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = Array.from({ length: 8 }, (_, idx) => new Date().getFullYear() - 4 + idx)

  const formatDateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getPredictedCycleDates = () => {
    return periodStarts.map((startDate) => {
      const base = new Date(startDate)
      const prediction = new Date(base)
      prediction.setDate(prediction.getDate() + 28)
      return prediction
    })
  }

  const predictedDates = getPredictedCycleDates().map((date) => formatDateKey(date.getFullYear(), date.getMonth(), date.getDate()))

  const togglePeriodStart = async (day: number) => {
    const dateKey = formatDateKey(calendarYear, calendarMonth, day)
    const newPeriodStarts = periodStarts.includes(dateKey)
      ? periodStarts.filter((d) => d !== dateKey)
      : [...periodStarts, dateKey]
    
    setPeriodStarts(newPeriodStarts)
    
    // Save to database
    const { data: user } = await supabase.auth.getUser()
    if (user.user?.id) {
      await savePeriodDates(user.user.id, newPeriodStarts)
    }
  }

  const renderCalendar = () => {
    const today = new Date()
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
      index < firstDay ? null : index - firstDay + 1
    )

    const currentMonthStarts = periodStarts.filter((key) => key.startsWith(`${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-`))
    const upcomingPrediction = getPredictedCycleDates().find((date) =>
      date.getFullYear() > calendarYear || (date.getFullYear() === calendarYear && date.getMonth() >= calendarMonth)
    )

    return (
      <div className="mt-6 rounded-[32px] bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">Calendar</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{monthNames[calendarMonth]} {calendarYear}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={calendarMonth}
              onChange={(e) => setCalendarMonth(Number(e.target.value))}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
            >
              {monthNames.map((name, index) => (
                <option key={name} value={index}>{name}</option>
              ))}
            </select>
            <select
              value={calendarYear}
              onChange={(e) => setCalendarYear(Number(e.target.value))}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
            >
              {years.map((yearOption) => (
                <option key={yearOption} value={yearOption}>{yearOption}</option>
              ))}
            </select>
            <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-medium">Today</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-500">
          {['S','M','T','W','T','F','S'].map((day) => (
            <span key={day} className="text-center font-semibold">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-3 text-center">
          {cells.map((day, index) => {
            const dateKey = day ? formatDateKey(calendarYear, calendarMonth, day) : ''
            const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear()
            const isPeriodStart = dateKey ? periodStarts.includes(dateKey) : false
            const isPredicted = dateKey ? predictedDates.includes(dateKey) : false

            return (
              <button
                key={index}
                type="button"
                onClick={() => day && togglePeriodStart(day)}
                className={`h-10 rounded-3xl flex flex-col items-center justify-center text-sm transition-all duration-200 ${
                  day
                    ? isPeriodStart
                      ? 'bg-rose-500 text-white shadow-lg hover:shadow-rose-500/30'
                      : isPredicted
                        ? 'bg-violet-100 text-violet-800 shadow-sm hover:bg-violet-200'
                        : isToday
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/20'
                          : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-transparent cursor-default'
                }`}            >
                <span>{day || ''}</span>
                {isPeriodStart && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />}
                {isPredicted && !isPeriodStart && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl bg-rose-50 p-4 text-sm text-slate-700 border border-rose-100 shadow-sm">
            <p className="font-semibold text-rose-700">Period start</p>
            <p className="mt-2 text-xs text-slate-600">Tap a date to mark the day your period began. Marked days stay visible across months.</p>
            {currentMonthStarts.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentMonthStarts.map((date) => (
                  <span key={date} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-700 shadow-sm">{date}</span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No period start recorded for this month.</p>
            )}
          </div>
          <div className="rounded-3xl bg-violet-50 p-4 text-sm text-slate-700 border border-violet-100 shadow-sm">
            <p className="font-semibold text-violet-700">Next predicted cycle</p>
            <p className="mt-2 text-xs text-slate-600">The calendar automatically predicts the next cycle 28 days after each period start.</p>
            {upcomingPrediction ? (
              <p className="mt-3 rounded-full bg-white px-3 py-2 text-sm font-medium text-violet-800 shadow-sm">{upcomingPrediction.toDateString()}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Add a period start to see predictions here.</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-gradient-to-r from-emerald-100 to-teal-100 p-4 text-sm text-slate-700 border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">Next appointment</p>
              <p className="mt-1 text-xs text-slate-600">Skin review scheduled for tomorrow at 11:00 AM.</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowChatbot(true)}
          className="mt-4 w-full rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 hover:from-slate-800 hover:to-slate-600 transition-all duration-200"
        >
          Open Skin Chat
        </button>
      </div>
    )
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user?.id) {
        return
      }

      const userId = user.user.id

      // Load period dates from database
      const periodDates = await loadPeriodDates(userId)
      setPeriodStarts(periodDates)

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const authFallbackName =
        user.user.user_metadata?.full_name ||
        user.user.email?.split('@')[0] ||
        'User'
      setUserName(authFallbackName.split(' ')[0])

      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

      const { data: scans, error: scanError } = await supabase
        .from('face_scans')
        .select('*')
        .eq('user_id', userId)
        .order('scanned_at', { ascending: false })

      if (scanError) {
        console.error('Scan fetch error:', scanError)
      }

      const summary = summarizeScans(scans || [])
      setScanSummary(summary)
      setProfile(profile)
      setScanHistory(scans || [])

      if (profile) {
        const name =
          profile.full_name ||
          profile.fullName ||
          profile.first_name ||
          profile.email ||
          authFallbackName
        setUserName(name.split(' ')[0])
      }

      await generatePersonalizedKit(profile, scans || [])
    }

    fetchUserData()
  }, [])

  const fetchGroqKit = async (profile: any, scans: any[]) => {
    if (!useGroqKit) return null

    try {
      const profileData = {
        gender: profile?.gender || 'unknown',
        age_group: profile?.age_group || profile?.age || 'unknown',
        water_intake: profile?.water_intake || 'unknown',
        stress_level: profile?.stress_level || 'unknown',
        sleep_hours: profile?.sleep_hours || 'unknown',
        pollution_exposure: profile?.pollution_exposure || 'unknown',
        skin_allergies: profile?.skin_allergies || 'unknown'
      }
      const scanSummaryText = scans.map(scan => scan.analysis_result || '').join(' ')
      const query = `*[_type == "skincareKitTemplate" && skinType == $skinType && condition == $condition][0]`;
      const params = {
        skinType: profileData.age_group,
        condition: profileData.skin_allergies,
        scanSummary: scanSummaryText
      }

      const url = new URL(GROQ_API_URL)
      url.searchParams.set('query', query)
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(`$${key}`, String(value))
      })

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...(GROQ_API_TOKEN ? { Authorization: `Bearer ${GROQ_API_TOKEN}` } : {})
        }
      })

      if (!response.ok) {
        throw new Error(`GROQ kit fetch failed: ${response.status}`)
      }

      const result = await response.json()
      const rawKit = result?.result || result
      if (!rawKit) return null

      return {
        ...rawKit,
        overview: rawKit.overview || rawKit.summary || rawKit.description || `A personalized kit designed for ${profileData.age_group} skin facing ${profileData.skin_allergies === 'Yes' ? 'sensitivity' : 'balanced conditions'}.`,
        recommendedProducts: rawKit.recommendedProducts || rawKit.products || rawKit.productTags || ['Hyaluronic acid cleanser', 'Vitamin C serum', 'SPF moisturizer'],
        recommendedProductDetails: rawKit.recommendedProductDetails || rawKit.recommendedIngredientsDetails || rawKit.productDetails || ['Choose gentle, non-comedogenic formulations that target your main concern.', 'Layer active ingredients carefully and always follow with hydration and SPF.'],
        morningRoutine: rawKit.morningRoutine || rawKit.dailyRoutine || ['Cleanse, treat, moisturize', 'Protect with SPF'],
        nightRoutine: rawKit.nightRoutine || rawKit.dailyRoutine || ['Remove makeup, nourish, repair overnight'],
        morningExtras: rawKit.morningExtras || rawKit.morningNotes || rawKit.morningTips || ['Use SPF and lightweight moisture to start your day.'],
        nightExtras: rawKit.nightExtras || rawKit.nightNotes || rawKit.nightTips || ['Apply targeted night repair products before bed.'],
        homeRemedies: rawKit.homeRemedies || rawKit.naturalRemedies || rawKit.remedySuggestions || ['Apply a face mask made from honey and avocado once a week to soothe and hydrate the skin'],
        remedyDetails: rawKit.remedyDetails || rawKit.homeRemedyDetails || rawKit.naturalRemedyNotes || ['These DIY remedies are designed to support hydration, calm inflammation, and keep your skin barrier balanced.'],
        aiInsights: rawKit.aiInsights || rawKit.highlights || [rawKit.overview || rawKit.summary || 'Your kit is built from a combination of profile and facial scan insights.']
      }
    } catch (err) {
      console.warn('GROQ kit fetch failed:', err)
      return null
    }
  }

  const summarizeScans = (scans: any[]) => {
    const latest = scans[0]
    const text = scans.map(scan => scan.analysis_result || '').join(' ').toLowerCase()
    const concerns = []
    if (/acne|pimple|blemish/.test(text)) concerns.push('Acne')
    if (/dry|dehydrated/.test(text)) concerns.push('Dryness')
    if (/red|redness|inflamed/.test(text)) concerns.push('Redness')
    if (/pigment|spot|uneven/.test(text)) concerns.push('Pigmentation')
    return {
      totalScans: scans.length,
      latestAnalysis: latest?.analysis_result || 'No scan data yet',
      concerns,
      lastScanAt: latest?.scanned_at || null
    }
  }

  const buildLocalKit = (profile: any, scans: any[]) => {
    const kit: any = {
      skinType: 'Combination',
      condition: 'Balanced',
      score: 82,
      recommendations: [],
      products: [],
      routine: [],
      highlights: []
    }

    if (profile?.gender === 'Female') {
      kit.score += 1
    } else if (profile?.gender === 'Male') {
      kit.score += 2
    }

    if (profile?.age_group === 'Below 13' || profile?.age_group === '13–18') {
      kit.skinType = 'Oily'
      kit.condition = 'Acne-prone'
      kit.score -= 8
      kit.productTags = ['salicylic acid', 'oil control']
    } else if (profile?.age_group === '18–25') {
      kit.skinType = 'Combination'
      kit.condition = 'Active'
      kit.score -= 2
      kit.productTags = ['lightweight moisturizer', 'vitamin C']
    } else if (profile?.age_group === '25–35') {
      kit.skinType = 'Combination'
      kit.condition = 'Fine lines'
      kit.score += 1
      kit.productTags = ['brightening serum', 'hydration']
    } else if (profile?.age_group === '35+') {
      kit.skinType = 'Dry'
      kit.condition = 'Mature'
      kit.score -= 3
      kit.productTags = ['rich moisturizer', 'retinol']
    }

    if (profile?.water_intake === 'Less than 1L') {
      kit.score -= 5
      kit.recommendations.push('Increase water intake', 'Use hydrating serum')
    }
    if (profile?.stress_level === 'High') {
      kit.score -= 4
      kit.recommendations.push('Apply calming toner', 'Take a stress-relief mask')
    }
    if (profile?.sleep_hours === 'Less than 5') {
      kit.score -= 4
      kit.recommendations.push('Use overnight repair cream', 'Prioritize sleep hygiene')
    }
    if (profile?.pollution_exposure === 'High') {
      kit.recommendations.push('Use antioxidant serum', 'Cleanse thoroughly twice a day')
    }
    if (profile?.skin_allergies === 'Yes') {
      kit.condition = 'Sensitive'
      kit.score -= 5
      kit.recommendations.push('Switch to fragrance-free formulas', 'Patch test new products')
    }

    if (scans.length > 0) {
      const scanText = scans.map(scan => scan.analysis_result || '').join(' ')
      const hasAcne = /acne|pimple|blemish/i.test(scanText)
      const hasDryness = /dry|dehydrated/i.test(scanText)
      const hasRedness = /red|redness|inflamed/i.test(scanText)
      const hasPigmentation = /pigment|spot|uneven/i.test(scanText)

      if (hasAcne) {
        kit.condition = 'Acne-prone'
        kit.score -= 7
        kit.recommendations.push('Use salicylic acid cleanser', 'Apply targeted spot treatment')
      }
      if (hasDryness) {
        kit.skinType = 'Dry'
        kit.score -= 6
        kit.recommendations.push('Apply hyaluronic acid', 'Seal with rich moisturizer')
      }
      if (hasRedness) {
        kit.condition = 'Sensitive'
        kit.score -= 5
        kit.recommendations.push('Use soothing gel', 'Avoid harsh exfoliants')
      }
      if (hasPigmentation) {
        kit.recommendations.push('Use vitamin C serum', 'Wear SPF every day')
      }
    }

    if (kit.recommendations.length === 0) {
      kit.recommendations = ['Stick to a gentle cleanser', 'Moisturize daily', 'Protect with SPF']
    }

    kit.products = [
      'Hydrating Cleanser',
      'Vitamin C Serum',
      'Hyaluronic Acid Moisturizer'
    ]

    kit.recommendedProducts = kit.products
    kit.morningRoutine = [
      'Cleanse with gentle cleanser',
      'Apply vitamin C serum for brightening',
      'Moisturize with SPF protection'
    ]
    kit.nightRoutine = [
      'Double cleanse to remove impurities',
      'Apply targeted repair treatment',
      'Use rich moisturizer for overnight hydration'
    ]

    kit.highlights = [
      `Skin type: ${kit.skinType}`,
      `Condition: ${kit.condition}`,
      `Based on ${scans.length} face scan${scans.length === 1 ? '' : 's'}`
    ]

    kit.overview = `This kit is tailored to ${kit.skinType} skin with ${kit.condition} conditions. It balances your routine with hydration, protection, and targeted actives.`
    kit.aiInsights = [
      `Your skin concerns are being addressed with a balanced regimen of gentle cleansing, serum treatment, and protective moisture.`,
      `Hydration and sensitivity support are prioritized based on your profile.`
    ]
    kit.morningExtras = [
      'Start with SPF and a gentle antioxidant serum to protect your skin all day.',
      'Use a light moisturizer before makeup to keep skin balanced.'
    ]
    kit.nightExtras = [
      'Finish with a nourishing repair cream to support overnight restoration.',
      'Include a soothing mask or hydrating serum for added recovery.'
    ]
    kit.ingredients = kit.productTags || ['Hyaluronic acid', 'Retinol', 'Vitamin C', 'Niacinamide']
    kit.recommendedProductDetails = [
      'Hyaluronic acid helps maintain moisture and supports a dewy skin barrier.',
      'Retinol works best at night to improve texture and reduce fine lines over time.',
      'Vitamin C brightens while providing antioxidant protection against environmental stress.'
    ]
    kit.homeRemedies = [
      'Apply a face mask made from honey and avocado once a week to soothe and hydrate the skin',
      'Use a cold compress or chilled cucumber slices to reduce dark circles and puffiness',
      'Exfoliate with a mixture of sugar and olive oil 1-2 times a week to improve skin texture'
    ]
    kit.remedyDetails = [
      'Use DIY remedies no more than 1-2 times per week and patch test first to avoid irritation.',
      'Apply masks after cleansing and remove gently with lukewarm water to preserve your skin barrier.',
      'Focus on calming ingredients like cucumber, honey, and oatmeal for sensitive or inflamed skin.'
    ]
    kit.notes = [
      'Avoid using fragranced products to minimize the risk of allergic reactions',
      'Be cautious when using retinol-based products, as they can increase sun sensitivity',
      'Patch test new products on a small area of skin before incorporating them into your routine'
    ]
    kit.tips = [
      { title: 'Stay hydrated', description: 'Drink at least 8 glasses of water a day' },
      { title: 'Maintain balance', description: 'Eat a diet rich in fruits, vegetables, and whole grains' },
      { title: 'Rest well', description: 'Get at least 7-8 hours of sleep each night' }
    ]
    kit.morningRoutine = [
      'Cleanse with gentle cleanser',
      'Apply vitamin C serum for brightening',
      'Moisturize with SPF protection'
    ]
    kit.nightRoutine = [
      'Double cleanse to remove impurities',
      'Apply retinol or targeted treatment',
      'Use rich moisturizer for overnight repair'
    ]

    kit.score = Math.max(40, Math.min(98, Math.round(kit.score)))
    return kit
  }

  const countMatches = (text: string, regex: RegExp) => {
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }

  const getConditionMetrics = (scans: any[], profile: any) => {
    const text = scans.map(scan => scan.analysis_result || '').join(' ').toLowerCase()
    const acneMatches = countMatches(text, /acne|pimple|blemish/g)
    const spotMatches = countMatches(text, /spot|pigment|hyperpigment|dark spot/g)
    const drynessMatches = countMatches(text, /dry|dehydrated/g)
    const lineMatches = countMatches(text, /line|wrinkle|fine line|fine lines/g)
    const circleMatches = countMatches(text, /dark circle|puffiness|undereye|eye bags/g)

    const acneCount = Math.min(15, 2 + acneMatches * 3 + (profile?.age_group === '13–18' ? 2 : 0))
    const darkSpots = Math.min(10, 1 + spotMatches * 2)
    const oilShine = Math.min(10, 3 + (text.includes('oil') || text.includes('shine') ? 3 : 0) + Math.max(0, 2 - drynessMatches))
    const wrinkles = Math.min(10, 2 + lineMatches * 2 + (profile?.age_group === '35+' ? 2 : 0))
    const darkCircles = Math.min(10, 1 + circleMatches * 3 + (profile?.sleep_hours === 'Less than 5' ? 2 : 0))
    const textureLabel = /rough|uneven/.test(text) ? 'Slightly Rough' : /smooth|clear/.test(text) ? 'Smooth' : 'Balanced'

    return {
      acneCount,
      darkSpots,
      oilShine,
      wrinkles,
      darkCircles,
      textureLabel
    }
  }

  const getProfileCards = (profile: any, scanSummary: any) => {
    const mainConcern = scanSummary?.concerns[0] || (profile?.skin_allergies === 'Yes' ? 'Sensitivity' : 'Aging/Wrinkles')
    const sunExposure = profile?.pollution_exposure === 'High' ? 'High (2-3 hours)' : profile?.pollution_exposure === 'Moderate' ? 'Moderate (1-2 hours)' : 'Low (<1 hour)'
    const currentRoutine = profile?.water_intake === 'Less than 1L' ? 'Hydration focus' : 'Balanced routine'
    const allergies = profile?.skin_allergies === 'Yes' ? 'Fragrance' : 'None'

    return {
      skinType: personalizedKit?.skinType || profile?.age_group || 'Combination',
      mainConcern,
      sunExposure,
      currentRoutine,
      allergies
    }
  }

  const generatePersonalizedKit = async (profile: any, scans: any[]) => {
    try {
      const groqKit = await fetchGroqKit(profile, scans)
      if (groqKit && groqKit.recommendations) {
        setPersonalizedKit(groqKit)
        return
      }
    } catch (err) {
      console.warn('GROQ AI generation failed, falling back to local kit.')
    }

    const localKit = buildLocalKit(profile, scans)
    setPersonalizedKit(localKit)
  }

  const renderPage = () => {
    switch(activePage) {
      case 'quiz':
        return <Quiz />
      case 'facescanner':
        return <FaceScanner onComplete={() => setActivePage('home')} />
      case 'glowplay':
        return <GlowPlay />
      case 'chemicals':
        return <ChemicalDetails />
      case 'health':
        return <HealthDetails />
      case 'profile':
        return <Profile />
      default:
        return <HomeContent />
    }
  }

  const HomeContent = () => {
    const profileCards = getProfileCards(profile, scanSummary)
    const scanMetrics = getConditionMetrics(scanHistory, profile)
    const chartData = [
      { name: 'Acne', value: scanMetrics.acneCount },
      { name: 'Dark Spots', value: scanMetrics.darkSpots },
      { name: 'Oil Shine', value: scanMetrics.oilShine },
      { name: 'Wrinkles', value: scanMetrics.wrinkles },
      { name: 'Dark Circles', value: scanMetrics.darkCircles }
    ]
    const ingredientList = personalizedKit?.ingredients || ['Hyaluronic acid', 'Retinol', 'Vitamin C', 'Niacinamide']
    const ingredientDetailList = personalizedKit?.recommendedProductDetails || personalizedKit?.ingredientDetails || ['Choose formulas that suit your skin type and support your main concern.', 'Pair actives with hydration and sun protection for the best results.']
    const remedyList = personalizedKit?.homeRemedies || [
      'Apply a face mask made from honey and avocado once a week to soothe and hydrate the skin',
      'Use a cold compress or chilled cucumber slices to reduce dark circles and puffiness',
      'Exfoliate with a mixture of sugar and olive oil 1-2 times a week to improve skin texture'
    ]
    const remedyDetailList = personalizedKit?.remedyDetails || personalizedKit?.naturalRemedyNotes || ['These DIY remedies support hydration, calm inflammation, and help strengthen your skin barrier when used consistently.']
    const noteList = personalizedKit?.notes || [
      'Avoid using fragranced products to minimize the risk of allergic reactions',
      'Be cautious when using retinol-based products, as they can increase sun sensitivity',
      'Patch test new products on a small area of skin before incorporating them into your routine'
    ]
    const tipList = personalizedKit?.tips || [
      { title: 'Stay hydrated', description: 'At least 8 glasses of water a day', color: '#5fb3a2' },
      { title: 'Maintain balance', description: 'Eat a balanced diet of fruits, vegetables and whole grains', color: '#6c8ebf' },
      { title: 'Sleep well', description: '7-8 hours per night helps reduce dark circles', color: '#5fb3a2' }
    ]
    const kitOverview = personalizedKit?.overview || personalizedKit?.summary || 'This personalized kit pulls your profile, scan history, and routine data together into a tailored recommendation.'
    const kitDetails = personalizedKit?.details || personalizedKit?.description || personalizedKit?.overview || 'Groq AI is customizing your recommendations based on your latest scan and health profile.'
    const recommendedProducts = personalizedKit?.recommendedProducts || personalizedKit?.products || ['Hydrating Cleanser', 'Vitamin C Serum', 'SPF Moisturizer']
    const insightList = personalizedKit?.aiInsights || personalizedKit?.highlights || []
    const routineExtras = routineTime === 'morning' ? personalizedKit?.morningExtras : personalizedKit?.nightExtras

    return (
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row gap-5 items-start">
          <div className="flex-1 rounded-[32px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div>
                <p className="text-xs uppercase font-semibold tracking-[0.2em] text-blue-700">Your Personalized Plan</p>
                <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Based on your scan results and questionnaire responses</h1>
                <p className="mt-3 text-sm text-slate-600">Hello {userName || 'Glow User'}, this plan uses your saved quiz answers and face scan history to tailor every recommendation.</p>
              </div>
            </div>

            <div className="mt-8 rounded-[32px] bg-gradient-to-r from-white to-blue-50 p-6 shadow-lg border border-blue-200">
              <p className="text-xs uppercase font-semibold tracking-[0.2em] text-blue-700">AI Kit Summary</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{kitOverview}</h2>
              <p className="mt-3 text-sm text-slate-600 max-w-3xl">{kitDetails}</p>

              {recommendedProducts.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs uppercase font-semibold tracking-[0.2em] text-slate-500">Recommended products</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {recommendedProducts.map((item: string, index: number) => (
                      <div key={index} className="rounded-3xl bg-gradient-to-r from-white to-slate-50 p-4 text-sm text-slate-900 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insightList.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs uppercase font-semibold tracking-[0.2em] text-slate-500">AI Insights</p>
                  <ul className="mt-3 space-y-2">
                    {insightList.map((insight: string, index: number) => (
                      <li key={index} className="rounded-3xl bg-gradient-to-r from-white to-slate-50 p-4 text-sm text-slate-700 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-blue-600" />
                          {insight}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
              <div className="rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-5 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Skin type</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{profileCards.skinType}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 p-5 shadow-lg border border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Main concern</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{profileCards.mainConcern}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 p-5 shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Sun exposure</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{profileCards.sunExposure}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 p-5 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">Allergies</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{profileCards.allergies}</p>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[360px] rounded-[32px] bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase font-semibold tracking-[0.2em] text-emerald-700">Score</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{personalizedKit?.score || skinScore}/100</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3 shadow-lg animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Your kit is customized to your user profile and face condition data.</p>
            <div className="mt-5 rounded-3xl bg-gradient-to-r from-white to-emerald-50 p-4 shadow-inner border border-emerald-200">
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out" style={{ width: `${personalizedKit?.score || skinScore}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            {renderCalendar()}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-[32px] border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">Skin Analysis Summary</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Based on your face scan results</h2>
              </div>
              <button
                onClick={() => setActivePage('facescanner')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <Scan size={16} /> New Scan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="rounded-[28px] p-5 bg-gradient-to-br from-orange-200 to-orange-100 shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Acne Count</p>
                <p className="mt-4 text-3xl font-bold text-slate-900">{scanMetrics.acneCount}</p>
              </div>
              <div className="rounded-[28px] p-5 bg-gradient-to-br from-fuchsia-200 to-purple-100 shadow-lg border border-fuchsia-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-700">Dark Spots</p>
                <p className="mt-4 text-3xl font-bold text-slate-900">{scanMetrics.darkSpots}</p>
              </div>
              <div className="rounded-[28px] p-5 bg-gradient-to-br from-cyan-200 to-sky-100 shadow-lg border border-cyan-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Oil Shine</p>
                <p className="mt-4 text-3xl font-bold text-slate-900">{scanMetrics.oilShine}/10</p>
              </div>
              <div className="rounded-[28px] p-5 bg-gradient-to-br from-red-200 to-pink-100 shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Wrinkles</p>
                <p className="mt-4 text-3xl font-bold text-slate-900">{scanMetrics.wrinkles}/10</p>
              </div>
              <div className="rounded-[28px] p-5 bg-gradient-to-br from-violet-200 to-indigo-100 shadow-lg border border-violet-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Dark Circles</p>
                <p className="mt-4 text-3xl font-bold text-slate-900">{scanMetrics.darkCircles}/10</p>
              </div>
              <div className="rounded-[28px] p-5 bg-gradient-to-br from-emerald-200 to-teal-100 shadow-lg border border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Skin Texture</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{scanMetrics.textureLabel}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">Face condition graph</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Progress over your latest scan data</h3>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">Most recent results</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} tickCount={6} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(95, 179, 162, 0.08)' }} />
                  <Bar dataKey="value" fill="#5fb3a2" barSize={34} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-[32px] border border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-slate-900">Daily Routines</h3>
            <p className="mt-2 text-sm text-slate-600">Personalized for {profileCards.skinType} skin</p>
            <div className="mt-5 rounded-3xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 border border-amber-200">
              <div className="grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-sm">
                <button
                  onClick={() => setRoutineTime('morning')}
                  className={`rounded-full py-2 text-sm font-semibold transition-all duration-200 ${
                    routineTime === 'morning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Morning
                </button>
                <button
                  onClick={() => setRoutineTime('night')}
                  className={`rounded-full py-2 text-sm font-semibold transition-all duration-200 ${
                    routineTime === 'night'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Night
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {(routineTime === 'morning' ? personalizedKit?.morningRoutine : personalizedKit?.nightRoutine)?.map((item: string, index: number) => (
                  <div key={index} className="rounded-3xl bg-gradient-to-r from-white to-amber-50 p-4 shadow-sm border border-amber-200 hover:shadow-md transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <p className="text-sm font-semibold text-slate-900">{item}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{routineTime === 'morning' ? 'Morning routine' : 'Night routine'}</p>
                  </div>
                ))}

                {routineExtras?.length > 0 && (
                  <div className="space-y-3">
                    <div className="rounded-3xl bg-gradient-to-r from-amber-200 to-orange-200 p-4 border border-amber-300">
                      <p className="text-sm font-semibold text-slate-900">{routineTime === 'morning' ? 'Morning Extras' : 'Night Extras'}</p>
                      <p className="mt-1 text-xs text-slate-600">Additional steps and notes to enhance this routine.</p>
                    </div>
                    {routineExtras.map((tip: string, index: number) => (
                      <div key={`extra-${index}`} className="rounded-3xl bg-gradient-to-r from-white to-amber-50 p-4 shadow-sm border border-amber-200 hover:shadow-md transition-all duration-200">
                        <p className="text-sm text-slate-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 rounded-[32px] p-6 shadow-lg border border-rose-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Recommended Ingredients</h3>
              <p className="mt-2 text-sm text-slate-600">Targeting your {profileCards.mainConcern.toLowerCase()}</p>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {ingredientList.map((ingredient: string, index: number) => (
                  <div key={index} className="rounded-3xl bg-gradient-to-r from-rose-100 to-pink-100 p-4 text-sm font-semibold text-slate-900 border border-rose-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-600" />
                      {ingredient}
                    </div>
                  </div>
                ))}
              </div>
              {ingredientDetailList.length > 0 && (
                <div className="mt-5 rounded-3xl bg-gradient-to-r from-rose-100 to-pink-100 p-4 text-sm text-slate-700 border border-rose-200 shadow-sm">
                  <p className="font-semibold text-slate-900">Ingredient details</p>
                  <ul className="mt-3 space-y-2">
                    {ingredientDetailList.map((detail: string, index: number) => (
                      <li key={`ingredient-detail-${index}`} className="rounded-2xl bg-gradient-to-r from-white to-rose-50 p-3 border border-rose-200 hover:shadow-sm transition-all duration-200">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-[32px] p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Natural Home Remedies</h3>
              <p className="mt-2 text-sm text-slate-600">Safe DIY alternatives for your skin concerns</p>
              <div className="mt-5 space-y-3">
                {remedyList.map((remedy: string, index: number) => (
                  <div key={index} className="rounded-3xl bg-gradient-to-r from-green-100 to-emerald-100 p-4 text-sm text-slate-700 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      {remedy}
                    </div>
                  </div>
                ))}
              </div>
              {remedyDetailList.length > 0 && (
                <div className="mt-5 rounded-3xl bg-gradient-to-r from-green-100 to-emerald-100 p-4 text-sm text-slate-700 border border-green-200 shadow-sm">
                  <p className="font-semibold text-slate-900">Remedy details</p>
                  <ul className="mt-3 space-y-2">
                    {remedyDetailList.map((detail: string, index: number) => (
                      <li key={`remedy-detail-${index}`} className="rounded-2xl bg-gradient-to-r from-white to-green-50 p-3 border border-green-200 hover:shadow-sm transition-all duration-200">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-[32px] p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Important Notes</h3>
              <p className="mt-2 text-sm text-slate-600">Based on your allergies and skin concerns</p>
              <ul className="mt-5 space-y-3">
                {noteList.map((note: string, index: number) => (
                  <li key={index} className="rounded-3xl bg-gradient-to-r from-purple-100 to-violet-100 p-4 text-sm text-slate-700 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-purple-600" />
                      {note}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-[32px] p-6 shadow-lg border border-cyan-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Lifestyle Tips</h3>
              <p className="mt-2 text-sm text-slate-600">Healthy habits for better skin</p>
              <div className="mt-5 space-y-3">
                {tipList.map((tip: any, index: number) => (
                  <div key={index} className="rounded-3xl bg-gradient-to-r from-cyan-100 to-blue-100 p-4 border border-cyan-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                    <p className="font-semibold text-slate-900">{tip.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#fafaf7' }}>
      {/* Always Visible Left Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto" style={{ borderRight: '1px solid #e5e7eb' }}>
        {/* Sidebar Header */}
        <div className="p-5 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#5fb3a2' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#2e2e2e' }}>Glowrify</h2>
          </div>
          <p className="text-xs" style={{ color: '#6c8ebf' }}>Your Personal Skin Care Companion</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activePage === item.id
                  ? 'shadow-sm'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: activePage === item.id ? '#5fb3a2' : 'transparent',
                color: activePage === item.id ? 'white' : '#2e2e2e'
              }}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
              {activePage === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={handleLogout}
            className="w-full mb-3 px-4 py-3 rounded-2xl border border-rose-300 text-rose-600 font-semibold bg-transparent hover:bg-rose-50 transition-all duration-200"
          >
            Log out
          </button>
          <p className="text-[10px] text-center" style={{ color: '#6c8ebf' }}>
            © 2026 Glowrify
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="px-6 py-3">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActivePage('profile')}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 hover:bg-slate-100"
                    style={{ backgroundColor: '#5fb3a2' }}
                    aria-label="Open profile"
                  >
                    <User size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </header>

        {/* Main Content */}
        <main className="px-6 py-5">
          {renderPage()}
        </main>
      </div>

      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setShowChatbot(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm hover:bg-slate-200"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
            <Chatbot />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        main > * {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        /* Custom scrollbar for sidebar */
        aside::-webkit-scrollbar {
          width: 4px;
        }

        aside::-webkit-scrollbar-track {
          background: #f0f0f0;
        }

        aside::-webkit-scrollbar-thumb {
          background: #5fb3a2;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
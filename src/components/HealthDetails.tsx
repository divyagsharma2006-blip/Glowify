import { useState, useEffect } from 'react'
import {
  Heart, Droplet, Moon, Activity, TrendingUp, TrendingDown,
  Minus, Sparkles, AlertCircle, Battery, Shield, Brain, Smile,
  Edit2, Save, Check, Plus, MinusCircle,
  Info, Droplets as HormoneIcon, Zap, Target, Flame,
  Apple, Wind, Star, Lightbulb
} from 'lucide-react'

interface HealthData {
  condition: string
  weightTrend: string
  sleepHours: number
  waterIntake: number
  stressLevel: number
  sugarIntake: number
}

// Comprehensive conditions database
const conditions = [
  // Skin Conditions
  { category: "Skin Conditions", name: "Acne Vulgaris", type: "skin", description: "Common inflammatory condition causing pimples, blackheads, and cysts" },
  { category: "Skin Conditions", name: "Rosacea", type: "skin", description: "Chronic facial redness, visible blood vessels, and sometimes small bumps" },
  { category: "Skin Conditions", name: "Eczema (Atopic Dermatitis)", type: "skin", description: "Dry, itchy, inflamed skin patches" },
  { category: "Skin Conditions", name: "Psoriasis", type: "skin", description: "Autoimmune condition causing rapid skin cell buildup, thick scales" },
  { category: "Skin Conditions", name: "Melasma", type: "skin", description: "Dark patches on skin, often triggered by hormones or sun exposure" },
  { category: "Skin Conditions", name: "Hyperpigmentation", type: "skin", description: "Dark spots or patches from excess melanin production" },
  { category: "Skin Conditions", name: "Seborrheic Dermatitis", type: "skin", description: "Scaly patches, red skin, stubborn dandruff" },
  { category: "Skin Conditions", name: "Perioral Dermatitis", type: "skin", description: "Red rash around the mouth, often with small bumps" },
  { category: "Skin Conditions", name: "Hidradenitis Suppurativa", type: "skin", description: "Chronic painful bumps under skin near sweat glands" },
  { category: "Skin Conditions", name: "Keratosis Pilaris", type: "skin", description: "Small, rough bumps on arms, thighs, or buttocks" },
  { category: "Skin Conditions", name: "Vitiligo", type: "skin", description: "Loss of skin color in patches" },
  { category: "Skin Conditions", name: "Alopecia Areata", type: "skin", description: "Patchy hair loss" },
  
  // Hormonal Conditions
  { category: "Hormonal Conditions", name: "PCOS (Polycystic Ovary Syndrome)", type: "hormonal", description: "Hormonal imbalance causing acne, hair growth, irregular periods" },
  { category: "Hormonal Conditions", name: "Thyroid Disorders", type: "hormonal", description: "Affects metabolism, skin texture, and hair health" },
  { category: "Hormonal Conditions", name: "Hypothyroidism", type: "hormonal", description: "Underactive thyroid causing dry skin, hair loss, fatigue" },
  { category: "Hormonal Conditions", name: "Hyperthyroidism", type: "hormonal", description: "Overactive thyroid causing warm, moist skin, hair thinning" },
  { category: "Hormonal Conditions", name: "Adrenal Fatigue", type: "hormonal", description: "Chronic stress affecting cortisol and skin health" },
  { category: "Hormonal Conditions", name: "Cushing's Syndrome", type: "hormonal", description: "High cortisol causing easy bruising, thin skin, acne" },
  { category: "Hormonal Conditions", name: "Addison's Disease", type: "hormonal", description: "Low cortisol causing hyperpigmentation, fatigue" },
  { category: "Hormonal Conditions", name: "Menopause", type: "hormonal", description: "Hormonal changes causing dry skin, thinning, hot flashes" },
  { category: "Hormonal Conditions", name: "Perimenopause", type: "hormonal", description: "Transition to menopause with hormonal fluctuations" },
  { category: "Hormonal Conditions", name: "Pregnancy", type: "hormonal", description: "Hormonal changes affecting skin (melasma, acne, glow)" },
  { category: "Hormonal Conditions", name: "Postpartum", type: "hormonal", description: "Post-pregnancy hormonal changes affecting skin and hair" },
  { category: "Hormonal Conditions", name: "Premenstrual Syndrome (PMS)", type: "hormonal", description: "Hormonal fluctuations causing cyclical acne and sensitivity" },
  { category: "Hormonal Conditions", name: "PMDD", type: "hormonal", description: "Severe PMS with significant hormonal skin effects" },
  
  // Metabolic Conditions
  { category: "Metabolic Conditions", name: "Diabetes", type: "metabolic", description: "Affects wound healing, skin infections, and circulation" },
  { category: "Metabolic Conditions", name: "Type 1 Diabetes", type: "metabolic", description: "Autoimmune diabetes affecting skin healing and hydration" },
  { category: "Metabolic Conditions", name: "Type 2 Diabetes", type: "metabolic", description: "Insulin resistance affecting skin texture and healing" },
  { category: "Metabolic Conditions", name: "Insulin Resistance", type: "metabolic", description: "Can trigger acne, hyperpigmentation, and skin tags" },
  { category: "Metabolic Conditions", name: "Metabolic Syndrome", type: "metabolic", description: "Combination of conditions affecting overall skin health" },
  
  // Autoimmune Conditions
  { category: "Autoimmune Conditions", name: "Lupus", type: "autoimmune", description: "Butterfly rash, photosensitivity, skin lesions" },
  { category: "Autoimmune Conditions", name: "Scleroderma", type: "autoimmune", description: "Hardening and tightening of skin" },
  { category: "Autoimmune Conditions", name: "Dermatomyositis", type: "autoimmune", description: "Rash, muscle weakness, skin changes" },
  
  // Nutritional/Deficiency Conditions
  { category: "Nutritional", name: "Iron Deficiency", type: "nutritional", description: "Pale skin, brittle nails, hair loss" },
  { category: "Nutritional", name: "Vitamin D Deficiency", type: "nutritional", description: "Affects skin barrier, healing, and immune function" },
  { category: "Nutritional", name: "Vitamin B12 Deficiency", type: "nutritional", description: "Hyperpigmentation, pale skin, mouth sores" },
  { category: "Nutritional", name: "Zinc Deficiency", type: "nutritional", description: "Acne, slow wound healing, hair loss" },
  { category: "Nutritional", name: "Omega-3 Deficiency", type: "nutritional", description: "Dry skin, inflammation, sensitivity" },
  
  // Other Related Conditions
  { category: "Other", name: "Chronic Stress", type: "other", description: "Triggers inflammation, acne, and premature aging" },
  { category: "Other", name: "Anxiety", type: "other", description: "Can trigger stress-related skin conditions" },
  { category: "Other", name: "Depression", type: "other", description: "Affects skin care habits and skin health" },
  { category: "Other", name: "Gut Health Issues", type: "other", description: "Gut-skin axis affects inflammation and acne" },
  { category: "Other", name: "Lymphatic Issues", type: "other", description: "Affects skin clarity and fluid retention" },
  { category: "Other", name: "None", type: "other", description: "No underlying health conditions" }
]

export default function HealthDetails() {
  const [isEditing, setIsEditing] = useState(false)
  const [healthData, setHealthData] = useState<HealthData>({
    condition: 'None',
    weightTrend: 'stable',
    sleepHours: 7,
    waterIntake: 6,
    stressLevel: 5,
    sugarIntake: 3
  })
  
  const [editData, setEditData] = useState<HealthData>(healthData)
  const [waterGoal] = useState(8)
  const [sleepGoal] = useState(8)
  const [sugarGoal] = useState(3)
  const [routineStreak, setRoutineStreak] = useState(4)
  const [selectedGoal, setSelectedGoal] = useState<'water' | 'sleep' | 'routine'>('water')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMyth, setSelectedMyth] = useState<number | null>(null)
  const [dailyTipIndex, setDailyTipIndex] = useState(0)
  const [cycleAware, setCycleAware] = useState(false)
  const [healthKit, setHealthKit] = useState<any>(null)
  const [loadingHealthKit, setLoadingHealthKit] = useState(false)
  const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || ''
  const GROQ_API_TOKEN = import.meta.env.VITE_GROQ_API_TOKEN || ''
  const useGroq = GROQ_API_URL.length > 0

  // Load saved health data
  useEffect(() => {
    const savedHealth = localStorage.getItem('healthData')
    if (savedHealth) {
      const parsed = JSON.parse(savedHealth)
      setHealthData({
        condition: parsed.condition ?? 'None',
        weightTrend: parsed.weightTrend ?? 'stable',
        sleepHours: parsed.sleepHours ?? 7,
        waterIntake: parsed.waterIntake ?? 6,
        stressLevel: parsed.stressLevel ?? 5,
        sugarIntake: parsed.sugarIntake ?? 3
      })
      setEditData({
        condition: parsed.condition ?? 'None',
        weightTrend: parsed.weightTrend ?? 'stable',
        sleepHours: parsed.sleepHours ?? 7,
        waterIntake: parsed.waterIntake ?? 6,
        stressLevel: parsed.stressLevel ?? 5,
        sugarIntake: parsed.sugarIntake ?? 3
      })
    }
  }, [])

  // Save health data
  useEffect(() => {
    localStorage.setItem('healthData', JSON.stringify(healthData))
    localStorage.setItem('healthRoutineStreak', String(routineStreak))
    localStorage.setItem('healthCycleAware', cycleAware ? '1' : '0')
    localStorage.setItem('healthDailyTipIndex', String(dailyTipIndex))
  }, [healthData, routineStreak, cycleAware, dailyTipIndex])

  useEffect(() => {
    const savedStreak = localStorage.getItem('healthRoutineStreak')
    if (savedStreak) setRoutineStreak(Number(savedStreak))
    const savedCycle = localStorage.getItem('healthCycleAware')
    if (savedCycle) setCycleAware(savedCycle === '1')
    const savedTip = localStorage.getItem('healthDailyTipIndex')
    if (savedTip) setDailyTipIndex(Number(savedTip))
  }, [])

  const fetchGroq = async (query: string, params?: Record<string, unknown>) => {
    if (!GROQ_API_URL) throw new Error('GROQ API URL is not configured.')
    const url = new URL(GROQ_API_URL)
    url.searchParams.set('query', query)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(`$${key}`, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...(GROQ_API_TOKEN ? { Authorization: `Bearer ${GROQ_API_TOKEN}` } : {})
      }
    })

    if (!response.ok) {
      throw new Error(`GROQ fetch failed (${response.status})`)
    }

    return await response.json()
  }

  const buildLocalHealthKit = (data: HealthData) => {
    const score = Math.round(
      Math.min(1, data.waterIntake / waterGoal) * 30 +
      Math.min(1, data.sleepHours / sleepGoal) * 30 +
      Math.max(0, (10 - data.stressLevel) / 10) * 20 +
      Math.max(0, (sugarGoal - data.sugarIntake) / sugarGoal) * 20
    )

    const dietSuggestion = data.condition.toLowerCase().includes('acne')
      ? 'Avoid dairy and processed sugar while adding more zinc-rich foods like pumpkin seeds and lentils.'
      : data.condition.toLowerCase().includes('dry')
      ? 'Add omega-3 foods like salmon, walnuts, and chia seeds to support skin hydration.'
      : data.condition.toLowerCase().includes('pigmentation')
      ? 'Increase vitamin C from citrus, berries, and leafy greens to support brighter skin.'
      : 'Focus on balanced meals with lean protein, colorful vegetables, and healthy fats for skin health.'

    return {
      dailyScore: Math.max(30, Math.min(100, score)),
      scoreAdvice: data.waterIntake < waterGoal
        ? `Drink ${waterGoal - data.waterIntake} more glasses of water to boost your score.`
        : data.sleepHours < sleepGoal
        ? `Get ${sleepGoal - data.sleepHours} more hours of sleep for better skin repair.`
        : 'Great job! Keep maintaining your routine for steady improvement.',
      dietSuggestion,
      mealSuggestion: data.condition.toLowerCase().includes('acne')
        ? 'Try a zinc-rich salad with spinach, pumpkin seeds, and grilled turkey today.'
        : data.condition.toLowerCase().includes('dry')
        ? 'Enjoy a salmon bowl with avocado and spinach to support hydration.'
        : data.condition.toLowerCase().includes('pigmentation')
        ? 'Have a berry smoothie with orange and kiwi for a vitamin C boost.'
        : 'Try a grilled chicken bowl with mixed greens and sweet potato for skin-friendly nutrition.',
      stressImpact: data.stressLevel >= 7
        ? 'Stress can increase acne due to cortisol and inflammation. Take a 1-minute breathing break.'
        : 'Your stress level is under control; keep your calm routine consistent.',
      weeklyReport: [
        { title: 'Acne trend', value: Math.max(0, 60 - data.stressLevel * 5) },
        { title: 'Spot reduction', value: Math.min(100, data.waterIntake * 12) },
        { title: 'Routine consistency', value: Math.min(100, routineStreak * 15) }
      ],
      myths: [
        { question: 'Oily skin doesn’t need moisturizer', answer: 'Myth', explanation: 'Even oily skin needs hydration; choose lightweight, non-comedogenic formulas.' },
        { question: 'You should wash your face twice per day', answer: 'Fact', explanation: 'A gentle morning and evening cleanse can help remove buildup without stripping skin.' },
        { question: 'Vitamin C and retinol cannot be used together', answer: 'Myth', explanation: 'They can work well when layered carefully or used on alternate nights.' }
      ],
      habitOptions: [
        { id: 'water', label: 'Drink 3L water', active: data.waterIntake >= 8 },
        { id: 'sleep', label: 'Sleep 7+ hrs', active: data.sleepHours >= 7 },
        { id: 'routine', label: 'Follow your routine', active: data.stressLevel <= 6 }
      ],
      dailyTip: data.stressLevel >= 7
        ? 'Quick tip: Try 4-7-8 breathing for one minute to calm cortisol spikes.'
        : 'Daily tip: Always use sunscreen after AHA/BHA to protect skin barrier health.',
      emergencyGuide: [
        { title: 'Sudden breakout', advice: 'Use a gentle spot treatment, avoid new products, and keep skin hydrated.' },
        { title: 'Sunburn', advice: 'Cool the skin with aloe and avoid harsh exfoliants until healed.' },
        { title: 'Irritation', advice: 'Pause active ingredients and use a soothing moisturizer with ceramides.' }
      ],
      hormoneGuide: data.condition.toLowerCase().includes('pcos') || data.condition.toLowerCase().includes('hormonal')
        ? 'Stress and hormones can raise acne risk. Short breathing sessions help lower cortisol quickly.'
        : 'Monitor your stress and sleep; hormonal balance affects skin even when no condition is present.'
    }
  }

  const fetchGroqHealthKit = async (data: HealthData) => {
    if (!useGroq) return null
    try {
      const query = `*[_type == "healthPlan" && condition == $condition][0]`
      const response = await fetchGroq(query, {
        condition: data.condition,
        sleepHours: data.sleepHours,
        waterIntake: data.waterIntake,
        stressLevel: data.stressLevel,
        sugarIntake: data.sugarIntake
      })

      const raw = response?.result || response
      if (!raw) return null

      return {
        ...raw,
        dailyScore: raw.dailyScore || raw.score || null,
        scoreAdvice: raw.scoreAdvice || raw.healthAdvice || 'Follow the habits below for a stronger skin score.',
        dietSuggestion: raw.dietSuggestion || raw.foodSuggestion || 'Balance your meals with skin-supporting nutrients.',
        mealSuggestion: raw.mealSuggestion || raw.mealPlan || 'Try a skin-friendly bowl with greens, lean protein, and healthy fats.',
        stressImpact: raw.stressImpact || raw.hormoneImpact || 'Stress can increase acne due to cortisol.',
        weeklyReport: raw.weeklyReport || raw.progressReport || [],
        myths: raw.myths || raw.mythFacts || [],
        habitOptions: raw.habitOptions || raw.habits || [],
        dailyTip: raw.dailyTip || raw.skinTip || 'Rotate your tips daily to keep your routine fresh.',
        emergencyGuide: raw.emergencyGuide || raw.quickGuide || [],
        hormoneGuide: raw.hormoneGuide || raw.stressHormoneNotes || ''
      }
    } catch (error) {
      console.warn('GROQ health fetch failed:', error)
      return null
    }
  }

  const generateHealthKit = async () => {
    setLoadingHealthKit(true)
    try {
      const groqKit = await fetchGroqHealthKit(healthData)
      if (groqKit) {
        setHealthKit(groqKit)
        setLoadingHealthKit(false)
        return
      }
    } catch (err) {
      console.warn('GROQ health generation failed, falling back to local health kit.', err)
    }

    setHealthKit(buildLocalHealthKit(healthData))
    setLoadingHealthKit(false)
  }

  useEffect(() => {
    generateHealthKit()
  }, [healthData])

  const handleSave = () => {
    setHealthData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(healthData)
    setIsEditing(false)
  }

  const updateWaterIntake = (change: number) => {
    const newValue = Math.max(0, Math.min(12, healthData.waterIntake + change))
    setHealthData({ ...healthData, waterIntake: newValue })
  }

  const updateSleepHours = (change: number) => {
    const newValue = Math.max(0, Math.min(12, healthData.sleepHours + change))
    setHealthData({ ...healthData, sleepHours: newValue })
  }

  const updateSugarIntake = (change: number) => {
    const newValue = Math.max(0, Math.min(10, healthData.sugarIntake + change))
    setHealthData({ ...healthData, sugarIntake: newValue })
  }

  // Get condition details
  const getConditionDetails = () => {
    return conditions.find(c => c.name === healthData.condition)
  }

  // Generate insights based on health data
  const getSkinImpacts = () => {
    const impacts = []
    const conditionDetails = getConditionDetails()
    
    if (conditionDetails && conditionDetails.name !== 'None') {
      switch(conditionDetails.type) {
        case 'skin':
          impacts.push({
            title: `${conditionDetails.name}`,
            description: conditionDetails.description,
            icon: AlertCircle,
            severity: 'high'
          })
          break
        case 'hormonal':
          impacts.push({
            title: 'Hormonal Imbalance',
            description: `${conditionDetails.name} can affect oil production, acne, and skin texture`,
            icon: HormoneIcon,
            severity: 'high'
          })
          break
        case 'metabolic':
          impacts.push({
            title: 'Metabolic Effects',
            description: conditionDetails.description,
            icon: Battery,
            severity: 'high'
          })
          break
        case 'autoimmune':
          impacts.push({
            title: 'Autoimmune Impact',
            description: conditionDetails.description,
            icon: Shield,
            severity: 'high'
          })
          break
        case 'nutritional':
          impacts.push({
            title: 'Nutritional Impact',
            description: conditionDetails.description,
            icon: Droplet,
            severity: 'medium'
          })
          break
      }
    }
    
    if (healthData.sleepHours < 7) {
      impacts.push({
        title: 'Sleep Deprivation',
        description: 'Poor sleep can cause dull skin, dark circles, and premature aging',
        icon: Moon,
        severity: 'high'
      })
    } else if (healthData.sleepHours >= 8) {
      impacts.push({
        title: 'Good Sleep',
        description: 'Adequate sleep helps skin repair and regenerate',
        icon: Moon,
        severity: 'positive'
      })
    }
    
    if (healthData.waterIntake < 6) {
      impacts.push({
        title: 'Dehydration',
        description: 'Low water intake can lead to dry, dull, and less elastic skin',
        icon: Droplet,
        severity: 'high'
      })
    } else if (healthData.waterIntake >= 8) {
      impacts.push({
        title: 'Well Hydrated',
        description: 'Good hydration keeps skin plump, glowing, and healthy',
        icon: Droplet,
        severity: 'positive'
      })
    }
    
    if (healthData.stressLevel >= 7) {
      impacts.push({
        title: 'High Stress',
        description: 'Stress triggers cortisol, which can worsen acne and inflammation',
        icon: Brain,
        severity: 'high'
      })
    } else if (healthData.stressLevel <= 3) {
      impacts.push({
        title: 'Low Stress',
        description: 'Low stress promotes healthier, clearer skin',
        icon: Smile,
        severity: 'positive'
      })
    }
    
    if (healthData.weightTrend === 'gain') {
      impacts.push({
        title: 'Weight Gain',
        description: 'May affect hormone balance and skin elasticity',
        icon: TrendingUp,
        severity: 'medium'
      })
    } else if (healthData.weightTrend === 'loss') {
      impacts.push({
        title: 'Weight Loss',
        description: 'Ensure proper nutrition to maintain skin health and elasticity',
        icon: TrendingDown,
        severity: 'low'
      })
    }
    
    return impacts
  }

  // Generate personalized wellness tips
  const getWellnessTips = () => {
    const tips = []
    const conditionDetails = getConditionDetails()
    
    if (conditionDetails && conditionDetails.name !== 'None') {
      if (conditionDetails.type === 'hormonal') {
        tips.push('🌿 Consider spearmint tea for hormonal acne (consult your doctor)')
        tips.push('💊 Omega-3 fatty acids may help balance hormones')
        tips.push('🏋️‍♀️ Regular exercise helps regulate hormone levels')
      }
      if (conditionDetails.type === 'skin') {
        tips.push('✨ Use gentle, fragrance-free products for sensitive skin')
        tips.push('🧴 Always patch test new products, especially with skin conditions')
        tips.push('🩺 Regular dermatologist visits are important for management')
      }
      if (conditionDetails.type === 'metabolic') {
        tips.push('🥗 Focus on low-glycemic foods to help stabilize blood sugar')
        tips.push('💊 Consider chromium and cinnamon supplements (consult your doctor)')
        tips.push('🏃‍♀️ Regular physical activity improves insulin sensitivity')
      }
      if (conditionDetails.name === 'PCOS (Polycystic Ovary Syndrome)') {
        tips.push('✨ Inositol supplements may help with PCOS symptoms (consult your doctor)')
        tips.push('🥑 Eat foods rich in zinc and magnesium')
        tips.push('🧘‍♀️ Stress management is crucial for PCOS')
      }
      if (conditionDetails.name === 'Thyroid Disorders') {
        tips.push('🥚 Eat selenium-rich foods like Brazil nuts for thyroid health')
        tips.push('💊 Consider vitamin D and zinc supplements (consult your doctor)')
        tips.push('🏃‍♀️ Regular exercise supports thyroid function')
      }
    }
    
    if (healthData.sleepHours < 7) {
      tips.push('🌙 Try to get 7-9 hours of sleep for optimal skin repair')
      tips.push('📵 Avoid screens 1 hour before bed for better sleep quality')
    }
    
    if (healthData.waterIntake < 8) {
      tips.push('💧 Aim for 8 glasses of water daily for hydrated, glowing skin')
      tips.push('🥒 Eat water-rich foods like cucumber and watermelon')
    }
    
    if (healthData.stressLevel >= 6) {
      tips.push('🧘‍♀️ Try 5 minutes of daily meditation to reduce stress')
      tips.push('🌿 Adaptogenic herbs like ashwagandha may help (consult your doctor)')
      tips.push('🎵 Practice deep breathing exercises for instant calm')
    }
    
    if (tips.length === 0) {
      tips.push('🌟 You\'re doing great! Keep maintaining your healthy habits')
      tips.push('🌿 Consistency is key for glowing, healthy skin')
      tips.push('💪 Your healthy lifestyle is showing in your skin!')
    }
    
    return tips.slice(0, 5)
  }

  const getWeightTrendIcon = () => {
    switch(healthData.weightTrend) {
      case 'gain': return <TrendingUp size={18} style={{ color: '#f44336' }} />
      case 'loss': return <TrendingDown size={18} style={{ color: '#4caf50' }} />
      default: return <Minus size={18} style={{ color: '#ff9800' }} />
    }
  }

  const getWeightTrendText = () => {
    switch(healthData.weightTrend) {
      case 'gain': return 'Weight Gain'
      case 'loss': return 'Weight Loss'
      default: return 'Weight Stable'
    }
  }

  const getConditionColor = () => {
    const conditionDetails = getConditionDetails()
    if (!conditionDetails || conditionDetails.name === 'None') return '#5fb3a2'
    switch(conditionDetails.type) {
      case 'skin': return '#e91e63'
      case 'hormonal': return '#9c27b0'
      case 'metabolic': return '#2196f3'
      case 'autoimmune': return '#f44336'
      case 'nutritional': return '#ff9800'
      default: return '#5fb3a2'
    }
  }

  const skinImpacts = getSkinImpacts()
  const wellnessTips = getWellnessTips()
  const conditionDetails = getConditionDetails()
  const planner = healthKit || buildLocalHealthKit(healthData)

  // Filter conditions by category
  const filteredConditions = selectedCategory === 'all' 
    ? conditions 
    : conditions.filter(c => c.category.toLowerCase().includes(selectedCategory))

  const categories = ['all', ...new Set(conditions.map(c => c.category.toLowerCase()))]

  return (
    <div className="space-y-8">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-bounce"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Heart className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Health Dashboard</h1>
              <p className="text-teal-100 mt-1">Track, analyze, and optimize your skin health</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium">Daily Score</span>
              </div>
              <div className="text-3xl font-bold">{planner.dailyScore}/100</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${planner.dailyScore}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <div className="text-3xl font-bold">{routineStreak}</div>
              <p className="text-xs text-teal-100 mt-1">days in a row</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">Goal</span>
              </div>
              <div className="text-lg font-bold capitalize">{selectedGoal}</div>
              <p className="text-xs text-teal-100 mt-1">current focus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Overview Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Health Overview</h3>
              <p className="text-sm text-slate-500">Your current health profile</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Condition</p>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getConditionColor() === '#e91e63' ? 'bg-pink-500' : getConditionColor() === '#9c27b0' ? 'bg-purple-500' : 'bg-teal-500'} animate-pulse`}></div>
              <p className="text-lg font-bold text-slate-900">{healthData.condition}</p>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {conditionDetails ? conditionDetails.description : 'No underlying conditions reported'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Weight Trend</p>
            <div className="flex items-center gap-3">
              {getWeightTrendIcon()}
              <p className="text-lg font-bold text-slate-900">{getWeightTrendText()}</p>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {healthData.weightTrend === 'gain' && 'May influence hormone levels and skin oiliness'}
              {healthData.weightTrend === 'loss' && 'Ensure adequate nutrition for skin health'}
              {healthData.weightTrend === 'stable' && 'Stable weight supports consistent skin health'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">AI Insight</p>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Personalized</span>
            </div>
            <p className="text-sm text-slate-700">
              {healthData.condition !== 'None'
                ? `Managing your ${healthData.condition} can help improve skin health`
                : 'Maintaining healthy habits supports glowing skin'}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Health Form (Edit Mode) */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-fadeIn">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
            <Edit2 size={20} style={{ color: '#5fb3a2' }} />
            Edit Health Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2e2e2e' }}>Condition</label>
              <div className="mb-2">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        selectedCategory === cat ? 'text-white' : ''
                      }`}
                      style={{
                        backgroundColor: selectedCategory === cat ? '#5fb3a2' : '#f5f9f8',
                        color: selectedCategory === cat ? 'white' : '#6c8ebf'
                      }}
                    >
                      {cat === 'all' ? 'All Conditions' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <select
                value={editData.condition}
                onChange={(e) => setEditData({...editData, condition: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:outline-none"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafaf7' }}
              >
                {filteredConditions.map((condition) => (
                  <option key={condition.name} value={condition.name}>
                    {condition.name} - {condition.description.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2e2e2e' }}>Weight Trend</label>
              <select
                value={editData.weightTrend}
                onChange={(e) => setEditData({...editData, weightTrend: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:outline-none"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafaf7' }}
              >
                <option value="stable">Stable</option>
                <option value="gain">Gaining</option>
                <option value="loss">Losing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2e2e2e' }}>Sleep Hours (per night)</label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={editData.sleepHours}
                onChange={(e) => setEditData({...editData, sleepHours: parseFloat(e.target.value)})}
                className="w-full p-2.5 border rounded-lg focus:outline-none"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafaf7' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2e2e2e' }}>Water Intake (glasses per day)</label>
              <input
                type="number"
                min="0"
                max="12"
                value={editData.waterIntake}
                onChange={(e) => setEditData({...editData, waterIntake: parseInt(e.target.value)})}
                className="w-full p-2.5 border rounded-lg focus:outline-none"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafaf7' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2e2e2e' }}>Junk Food / Sugar Intake</label>
              <input
                type="number"
                min="0"
                max="10"
                value={editData.sugarIntake}
                onChange={(e) => setEditData({...editData, sugarIntake: parseInt(e.target.value)})}
                className="w-full p-2.5 border rounded-lg focus:outline-none"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#fafaf7' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2e2e2e' }}>Stress Level (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={editData.stressLevel}
                onChange={(e) => setEditData({...editData, stressLevel: parseInt(e.target.value)})}
                className="w-full"
                style={{ accentColor: '#5fb3a2' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#6c8ebf' }}>
                <span>Low Stress</span>
                <span>Moderate</span>
                <span>High Stress</span>
              </div>
              <p className="text-sm mt-2 text-center font-semibold" style={{ color: '#5fb3a2' }}>
                Level: {editData.stressLevel}/10
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#5fb3a2', color: 'white' }}
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 border"
                style={{ borderColor: '#e5e7eb', color: '#6c8ebf' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

{/* Habit Tracker with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Water Intake Tracker */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl text-white shadow-lg">
                <Droplet className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Water Intake</h3>
                <p className="text-sm text-slate-500">Hydration matters</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{healthData.waterIntake}/{waterGoal}</p>
              <p className="text-xs text-slate-500">glasses</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => updateWaterIntake(-1)}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
            >
              <MinusCircle size={20} className="text-blue-500" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">{healthData.waterIntake}</div>
              <p className="text-sm text-slate-500">today</p>
            </div>
            <button
              onClick={() => updateWaterIntake(1)}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${(healthData.waterIntake / waterGoal) * 100}%` }}
            ></div>
          </div>

          <div className="mt-4 p-3 bg-white/50 rounded-xl border border-blue-100">
            <p className="text-sm text-center font-medium text-slate-700">
              {healthData.waterIntake >= waterGoal
                ? '🎉 Goal achieved! Your skin is thanking you!'
                : `${waterGoal - healthData.waterIntake} more glasses for optimal hydration`}
            </p>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl text-white shadow-lg">
                <Moon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sleep Quality</h3>
                <p className="text-sm text-slate-500">Rest & repair</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{healthData.sleepHours}/{sleepGoal}</p>
              <p className="text-xs text-slate-500">hours</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => updateSleepHours(-0.5)}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
            >
              <MinusCircle size={20} className="text-indigo-500" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-1">{healthData.sleepHours}</div>
              <p className="text-sm text-slate-500">last night</p>
            </div>
            <button
              onClick={() => updateSleepHours(0.5)}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${(healthData.sleepHours / sleepGoal) * 100}%` }}
            ></div>
          </div>

          <div className="mt-4 p-3 bg-white/50 rounded-xl border border-indigo-100">
            <p className="text-sm text-center font-medium text-slate-700">
              {healthData.sleepHours >= sleepGoal
                ? '😴 Perfect! Your skin is repairing beautifully'
                : `${(sleepGoal - healthData.sleepHours).toFixed(1)} more hours for optimal recovery`}
            </p>
          </div>
        </div>

        {/* Sugar / Junk Food Tracker */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl text-white shadow-lg">
                <Droplet className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sugar Control</h3>
                <p className="text-sm text-slate-500">Balance matters</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{healthData.sugarIntake}/{sugarGoal}</p>
              <p className="text-xs text-slate-500">servings</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => updateSugarIntake(-1)}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
            >
              <MinusCircle size={20} className="text-orange-500" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-1">{healthData.sugarIntake}</div>
              <p className="text-sm text-slate-500">today</p>
            </div>
            <button
              onClick={() => updateSugarIntake(1)}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${(healthData.sugarIntake / sugarGoal) * 100}%` }}
            ></div>
          </div>

          <div className="mt-4 p-3 bg-white/50 rounded-xl border border-orange-100">
            <p className="text-sm text-center font-medium text-slate-700">
              {healthData.sugarIntake <= sugarGoal
                ? '✅ Great control! Inflammation stays low'
                : '⚠️ Consider reducing for better skin clarity'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Health Planner */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 rounded-3xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-700 font-semibold">Daily Skin Health Score</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">{planner.dailyScore}/100</h3>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 p-3 shadow-lg animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-slate-600">{planner.scoreAdvice}</p>
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-slate-50 to-slate-100 p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Today’s highlight</p>
            <p className="mt-2 text-sm text-slate-700 font-medium">{planner.stressImpact}</p>
          </div>
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-white to-slate-50 p-4 border border-slate-200 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Today's meal</p>
            <p className="mt-2 text-sm text-slate-700 font-semibold">{planner.mealSuggestion}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-700 font-semibold">Food & Diet Suggestions</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Eat for your skin</h3>
          <p className="mt-3 text-sm text-slate-600">{planner.dietSuggestion}</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-3xl bg-gradient-to-r from-orange-100 to-amber-100 p-4 text-sm text-slate-700 border border-orange-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-orange-600" />
                {planner.mealSuggestion}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-3xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-700 font-semibold">Stress & Hormone Impact</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Why stress matters</h3>
          <p className="mt-3 text-sm text-slate-600">{planner.hormoneGuide}</p>
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-purple-100 to-violet-100 p-4 text-sm text-slate-700 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-purple-600" />
              {planner.stressImpact}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-emerald-700">Weekly Skin Progress</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Progress report</h3>
            </div>
            <span className="text-xs text-slate-500 bg-emerald-100 px-3 py-1 rounded-full">Updated daily</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planner.weeklyReport.map((item: any, index: number) => (
              <div key={index} className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.title}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}%</p>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500" style={{width: `${item.value}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-600">{planner.weeklyReport.length ? 'Your trends are based on tracker data and routine consistency.' : 'Keep tracking daily to get stronger trend signals.'}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 rounded-3xl p-6 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-rose-700">Mini Habit Builder</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Build better routines</h3>
          <div className="mt-5 space-y-3">
            {planner.habitOptions.map((habit: any) => (
              <button
                key={habit.id}
                onClick={() => {
                  setSelectedGoal(habit.id)
                  if (habit.id === 'routine') setRoutineStreak(routineStreak + 1)
                }}
                className={`w-full rounded-3xl p-4 text-left transition-all duration-300 transform hover:scale-105 ${
                  habit.active || selectedGoal === habit.id
                    ? 'bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-300 shadow-md'
                    : 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${habit.active || selectedGoal === habit.id ? 'bg-rose-500' : 'bg-slate-300'}`}>
                    <Target className={`w-4 h-4 ${habit.active || selectedGoal === habit.id ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{habit.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{habit.active ? 'Completed' : selectedGoal === habit.id ? 'Selected goal' : 'Tap to check in'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-rose-100 to-pink-100 p-4 text-sm text-slate-700 border border-rose-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <div>
                <p className="font-semibold text-slate-900">Current streak</p>
                <p className="mt-1">{routineStreak}-day streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-blue-700">Myth vs Fact</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Tap to reveal</h3>
          <div className="mt-5 space-y-3">
            {planner.myths.map((myth: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedMyth(selectedMyth === index ? null : index)}
                className="w-full rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-left transition-all duration-300 hover:shadow-md hover:scale-105 transform"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{myth.question}</p>
                  <span className={`text-xs uppercase transition-all duration-300 ${selectedMyth === index ? 'text-blue-700' : 'text-blue-600'}`}>
                    {selectedMyth === index ? 'Hide' : 'Reveal'}
                  </span>
                </div>
                {selectedMyth === index && (
                  <div className="mt-3 text-sm text-slate-600 animate-fade-in">
                    <p><strong className="text-blue-700">{myth.answer}</strong></p>
                    <p className="mt-2">{myth.explanation}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-green-700">Emergency Skin Guide</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Quick rescue steps</h3>
          <div className="mt-5 space-y-3">
            {planner.emergencyGuide.map((item: any, index: number) => (
              <div key={index} className="rounded-3xl bg-gradient-to-r from-green-100 to-emerald-100 p-4 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-slate-900">{item.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.advice}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-green-100 to-emerald-100 p-4 text-sm text-slate-700 border border-green-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-semibold text-slate-900">Cycle awareness</p>
                <p className="mt-2">{cycleAware ? 'Tracking cycle awareness helps predict breakout days and hormone shifts.' : 'Enable cycle awareness to get next-level hormone impact insights.'}</p>
                <button
                  onClick={() => setCycleAware(!cycleAware)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  {cycleAware ? 'Turn off' : 'Turn on'} cycle notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 rounded-3xl shadow-lg p-6 border border-violet-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-violet-700">Quick Skin Tip</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Today’s tip</h3>
          </div>
          {loadingHealthKit && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
              <span className="text-xs text-violet-700">Loading AI guidance...</span>
            </div>
          )}
        </div>
        <div className="mt-4 p-4 bg-gradient-to-r from-white to-violet-50 rounded-2xl border border-violet-200 shadow-sm">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">{planner.dailyTip}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-2">
          <Info size={16} style={{ color: '#ff9800' }} />
          <p className="text-xs" style={{ color: '#6c8ebf' }}>
            ⚠️ This is not medical advice. This information is for educational purposes only. Please consult with a healthcare professional for medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
          <Activity size={20} style={{ color: '#5fb3a2' }} />
          Skin Impact Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skinImpacts.map((impact, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg transition-all hover:shadow-md"
              style={{ 
                backgroundColor: impact.severity === 'positive' ? '#e8f5e9' :
                               impact.severity === 'high' ? '#ffebee' : '#fff3e0'
              }}
            >
              <div className="flex items-start gap-3">
                <impact.icon size={18} style={{ 
                  color: impact.severity === 'positive' ? '#4caf50' :
                         impact.severity === 'high' ? '#f44336' : '#ff9800'
                }} />
                <div>
                  <h4 className="text-sm font-semibold mb-1" style={{ color: '#2e2e2e' }}>{impact.title}</h4>
                  <p className="text-xs" style={{ color: '#6c8ebf' }}>{impact.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wellness Tips */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
          <Sparkles size={20} style={{ color: '#5fb3a2' }} />
          Personalized Wellness Tips
        </h3>
        
        <div className="space-y-3">
          {wellnessTips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg transition-all hover:translate-x-1"
              style={{ backgroundColor: '#fafaf7' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5fb3a2' }}>
                <Check size={12} className="text-white" />
              </div>
              <p className="text-sm" style={{ color: '#2e2e2e' }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-2">
          <Info size={16} style={{ color: '#ff9800' }} />
          <p className="text-xs" style={{ color: '#6c8ebf' }}>
            ⚠️ This is not medical advice. This information is for educational purposes only. 
            Please consult with a healthcare professional for medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .hover\\:translate-x-1:hover {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  )
}
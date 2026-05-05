import { useState } from 'react'
import {
  Search, Filter, X, Check, AlertCircle, Info,
  Sun, Moon, Shield, Droplet, Sparkles, Heart,
  Eye, Zap, Wind, ThumbsUp, ThumbsDown, Minus,
  ChevronDown, ChevronUp, Users, Activity, Flame
} from 'lucide-react'

interface Ingredient {
  id: number
  name: string
  type: string
  shortBenefit: string
  description: string
  benefits: string[]
  sideEffects: string[]
  usage: string[]
  doNotMix: string[]
  bestCombinations: string[]
  skinTypes: string[]
  concerns: string[]
  icon: any
  color: string
}

const ingredients: Ingredient[] = [
  {
    id: 1,
    name: "Niacinamide",
    type: "Vitamin B3",
    shortBenefit: "Controls oil, reduces redness, minimizes pores",
    description: "Niacinamide, also known as Vitamin B3, is a versatile skincare ingredient that helps build proteins in the skin and lock in moisture to prevent environmental damage.",
    benefits: [
      "Reduces inflammation and redness",
      "Minimizes appearance of pores",
      "Controls sebum production",
      "Improves skin barrier function",
      "Fades hyperpigmentation",
      "Reduces fine lines and wrinkles"
    ],
    sideEffects: [
      "Mild irritation (rare)",
      "Flushing (high concentrations)",
      "Temporary redness"
    ],
    usage: ["AM", "PM"],
    doNotMix: ["High pH acids", "Vitamin C (in same routine - use at different times)"],
    bestCombinations: ["Hyaluronic Acid", "Retinol", "Zinc", "Peptides"],
    skinTypes: ["Oily", "Combination", "Normal", "Sensitive"],
    concerns: ["Acne", "Oiliness", "Redness", "Large Pores", "Hyperpigmentation"],
    icon: Shield,
    color: "#5fb3a2"
  },
  {
    id: 2,
    name: "Hyaluronic Acid",
    type: "Humectant",
    shortBenefit: "Deep hydration, plumps skin, reduces fine lines",
    description: "Hyaluronic Acid is a powerful humectant that can hold up to 1000 times its weight in water, making it exceptional for hydration and plumping the skin.",
    benefits: [
      "Intense hydration",
      "Plumps and smooths skin",
      "Reduces appearance of fine lines",
      "Improves skin elasticity",
      "Suitable for all skin types",
      "Enhances absorption of other products"
    ],
    sideEffects: [
      "Rarely causes irritation",
      "Can dry out skin in dry climates (needs occlusive)",
      "Purging (rare)"
    ],
    usage: ["AM", "PM"],
    doNotMix: ["No major conflicts - works with almost everything"],
    bestCombinations: ["Vitamin C", "Retinol", "Niacinamide", "Ceramides"],
    skinTypes: ["All Skin Types"],
    concerns: ["Dryness", "Dehydration", "Fine Lines", "Aging"],
    icon: Droplet,
    color: "#6c8ebf"
  },
  {
    id: 3,
    name: "Vitamin C",
    type: "Antioxidant",
    shortBenefit: "Brightens skin, reduces dark spots, boosts collagen",
    description: "Vitamin C is a powerful antioxidant that protects skin from free radical damage, brightens complexion, and stimulates collagen production.",
    benefits: [
      "Brightens skin tone",
      "Reduces hyperpigmentation",
      "Boosts collagen production",
      "Protects from UV damage",
      "Improves skin texture",
      "Anti-aging benefits"
    ],
    sideEffects: [
      "Can cause irritation (especially L-Ascorbic Acid)",
      "Oxidation (turns yellow/brown)",
      "Stinging sensation"
    ],
    usage: ["AM"],
    doNotMix: ["Niacinamide (use at different times)", "Benzoyl Peroxide", "Retinol (AM/PM separation)"],
    bestCombinations: ["Vitamin E", "Ferulic Acid", "Hyaluronic Acid", "Sunscreen"],
    skinTypes: ["Normal", "Dry", "Combination", "Aging"],
    concerns: ["Hyperpigmentation", "Dullness", "Aging", "Sun Damage"],
    icon: Sparkles,
    color: "#5fb3a2"
  },
  {
    id: 4,
    name: "Retinol",
    type: "Retinoid",
    shortBenefit: "Anti-aging, smooths texture, reduces acne",
    description: "Retinol, a form of Vitamin A, is one of the most studied anti-aging ingredients that accelerates cell turnover and stimulates collagen production.",
    benefits: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture",
      "Fades hyperpigmentation",
      "Unclogs pores",
      "Treats acne",
      "Boosts collagen production"
    ],
    sideEffects: [
      "Irritation, redness, peeling",
      "Purging (initial breakout)",
      "Sun sensitivity",
      "Dryness"
    ],
    usage: ["PM only"],
    doNotMix: ["AHAs/BHAs", "Benzoyl Peroxide", "Vitamin C (use AM/PM separation)"],
    bestCombinations: ["Niacinamide", "Hyaluronic Acid", "Ceramides", "Peptides"],
    skinTypes: ["Normal", "Combination", "Oily", "Aging"],
    concerns: ["Aging", "Acne", "Texture", "Fine Lines", "Hyperpigmentation"],
    icon: Eye,
    color: "#6c8ebf"
  },
  {
    id: 5,
    name: "Salicylic Acid",
    type: "BHA",
    shortBenefit: "Exfoliates pores, treats acne, reduces blackheads",
    description: "Salicylic Acid is a beta-hydroxy acid that penetrates deep into pores to dissolve excess oil and dead skin cells, making it ideal for acne-prone skin.",
    benefits: [
      "Unclogs and minimizes pores",
      "Reduces blackheads and whiteheads",
      "Treats acne and breakouts",
      "Exfoliates skin surface",
      "Anti-inflammatory properties",
      "Controls excess oil"
    ],
    sideEffects: [
      "Dryness and peeling",
      "Initial purging",
      "Sun sensitivity"
    ],
    usage: ["AM", "PM (limited frequency)"],
    doNotMix: ["Other exfoliants", "Retinol", "Benzoyl Peroxide (same routine)"],
    bestCombinations: ["Niacinamide", "Hyaluronic Acid", "Gentle moisturizers"],
    skinTypes: ["Oily", "Combination", "Acne-prone"],
    concerns: ["Acne", "Blackheads", "Large Pores", "Oiliness"],
    icon: Wind,
    color: "#5fb3a2"
  },
  {
    id: 6,
    name: "Ceramides",
    type: "Lipid",
    shortBenefit: "Restores skin barrier, locks in moisture",
    description: "Ceramides are lipids that naturally occur in the skin and help form the skin's barrier, retaining moisture and protecting against environmental damage.",
    benefits: [
      "Strengthens skin barrier",
      "Locks in moisture",
      "Reduces sensitivity",
      "Soothes irritation",
      "Improves skin texture",
      "Protects from environmental damage"
    ],
    sideEffects: [
      "Very well tolerated",
      "Rarely causes breakouts",
      "No known side effects"
    ],
    usage: ["AM", "PM"],
    doNotMix: ["No major conflicts - works with everything"],
    bestCombinations: ["Hyaluronic Acid", "Niacinamide", "Retinol", "Fatty Acids"],
    skinTypes: ["All Skin Types", "Sensitive", "Dry"],
    concerns: ["Dryness", "Sensitivity", "Barrier Damage", "Dehydration"],
    icon: Shield,
    color: "#6c8ebf"
  },
  {
    id: 7,
    name: "Glycolic Acid",
    type: "AHA",
    shortBenefit: "Exfoliates dead skin, improves texture, boosts collagen",
    description: "Glycolic Acid is an alpha-hydroxy acid derived from sugar cane that exfoliates the skin by dissolving dead skin cells, revealing fresher, brighter skin underneath.",
    benefits: [
      "Exfoliates dead skin cells",
      "Improves skin texture and tone",
      "Reduces hyperpigmentation",
      "Stimulates collagen production",
      "Minimizes fine lines",
      "Enhances product absorption"
    ],
    sideEffects: [
      "Irritation and stinging",
      "Sun sensitivity",
      "Peeling and redness",
      "Can cause purging"
    ],
    usage: ["PM only (start 2-3x/week)"],
    doNotMix: ["Retinol", "Other AHAs/BHAs", "Benzoyl Peroxide", "Vitamin C (same routine)"],
    bestCombinations: ["Hyaluronic Acid", "Niacinamide", "Ceramides", "Peptides"],
    skinTypes: ["Normal", "Combination", "Oily", "Aging"],
    concerns: ["Texture", "Hyperpigmentation", "Aging", "Dullness", "Fine Lines"],
    icon: Flame,
    color: "#5fb3a2"
  },
  {
    id: 8,
    name: "Lactic Acid",
    type: "AHA",
    shortBenefit: "Gentle exfoliation, hydrates, brightens skin",
    description: "Lactic Acid is a gentle alpha-hydroxy acid derived from milk that exfoliates while hydrating the skin, making it suitable for sensitive skin types.",
    benefits: [
      "Gentle exfoliation",
      "Hydrates while exfoliating",
      "Brightens dull skin",
      "Improves skin texture",
      "Reduces hyperpigmentation",
      "Strengthens skin barrier"
    ],
    sideEffects: [
      "Mild irritation possible",
      "Sun sensitivity",
      "Temporary redness"
    ],
    usage: ["PM only (start 2-3x/week)"],
    doNotMix: ["Retinol", "Other exfoliants", "Benzoyl Peroxide (same routine)"],
    bestCombinations: ["Hyaluronic Acid", "Niacinamide", "Ceramides", "Gentle moisturizers"],
    skinTypes: ["All Skin Types", "Sensitive", "Dry", "Normal"],
    concerns: ["Dryness", "Texture", "Hyperpigmentation", "Dullness", "Sensitivity"],
    icon: Droplet,
    color: "#6c8ebf"
  },
  {
    id: 9,
    name: "Benzoyl Peroxide",
    type: "Antibacterial",
    shortBenefit: "Kills acne bacteria, reduces inflammation, unclogs pores",
    description: "Benzoyl Peroxide is a powerful antibacterial agent that kills acne-causing bacteria (P. acnes) and helps clear clogged pores, making it highly effective for treating acne.",
    benefits: [
      "Kills acne-causing bacteria",
      "Reduces inflammation and redness",
      "Unclogs pores",
      "Prevents new breakouts",
      "Reduces excess oil",
      "Fast-acting acne treatment"
    ],
    sideEffects: [
      "Dryness and peeling",
      "Redness and irritation",
      "Bleaching of fabrics",
      "Initial purging",
      "Sun sensitivity"
    ],
    usage: ["PM only (start with lower concentration)"],
    doNotMix: ["Retinol", "Vitamin C", "Other harsh exfoliants", "Salicylic Acid (same routine)"],
    bestCombinations: ["Gentle moisturizers", "Niacinamide", "Hyaluronic Acid", "Ceramides"],
    skinTypes: ["Oily", "Combination", "Acne-prone"],
    concerns: ["Acne", "Breakouts", "Oiliness", "Bacterial acne"],
    icon: Zap,
    color: "#5fb3a2"
  }
]

// Compatibility Check Function
const checkCompatibility = (ingredient1: string, ingredient2: string) => {
  const ing1 = ingredients.find(i => i.name === ingredient1)
  const ing2 = ingredients.find(i => i.name === ingredient2)

  if (!ing1 || !ing2) return { status: 'safe', message: 'Unknown combination' }

  // Check if they shouldn't be mixed
  if (ing1.doNotMix.some(mix => mix.toLowerCase().includes(ing2.name.toLowerCase())) ||
    ing2.doNotMix.some(mix => mix.toLowerCase().includes(ing1.name.toLowerCase()))) {
    return { status: 'avoid', message: 'Avoid mixing these ingredients together' }
  }

  // Check if they are recommended combinations
  if (ing1.bestCombinations.some(combo => combo.toLowerCase().includes(ing2.name.toLowerCase())) ||
    ing2.bestCombinations.some(combo => combo.toLowerCase().includes(ing1.name.toLowerCase()))) {
    return { status: 'good', message: 'These ingredients work well together!' }
  }

  return { status: 'caution', message: 'Use with caution, patch test first' }
}

export default function ChemicalDetails() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [filters, setFilters] = useState({
    skinType: '',
    concern: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [compatIngredient1, setCompatIngredient1] = useState('')
  const [compatIngredient2, setCompatIngredient2] = useState('')
  const [compatResult, setCompatResult] = useState<{ status: string; message: string } | null>(null)

  const skinTypes = ["All Skin Types", "Oily", "Dry", "Combination", "Normal", "Sensitive", "Acne-prone", "Aging"]
  const concerns = ["Acne", "Dryness", "Oiliness", "Aging", "Hyperpigmentation", "Redness", "Large Pores", "Sensitivity", "Texture", "Dullness", "Breakouts"]

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.shortBenefit.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSkinType = !filters.skinType || ing.skinTypes.some(type =>
      type.toLowerCase().includes(filters.skinType.toLowerCase()) ||
      (filters.skinType === "All Skin Types" && ing.skinTypes.includes("All Skin Types"))
    )

    const matchesConcern = !filters.concern || ing.concerns.some(concern =>
      concern.toLowerCase().includes(filters.concern.toLowerCase())
    )

    return matchesSearch && matchesSkinType && matchesConcern
  })

  const getSkinTypeIcon = (skinType: string) => {
    switch (skinType.toLowerCase()) {
      case 'oily': return <Droplet size={12} />
      case 'dry': return <Droplet size={12} />
      case 'sensitive': return <Heart size={12} />
      case 'acne-prone': return <AlertCircle size={12} />
      default: return <Users size={12} />
    }
  }

  const handleCompatibilityCheck = () => {
    if (compatIngredient1 && compatIngredient2) {
      const result = checkCompatibility(compatIngredient1, compatIngredient2)
      setCompatResult(result)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-3xl shadow-lg p-5 border border-indigo-200 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-600" size={18} />
            <input
              type="text"
              placeholder="Search ingredients by name, type, or benefit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
          >
            <Filter size={18} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Skin Type</label>
              <select
                value={filters.skinType}
                onChange={(e) => setFilters({ ...filters, skinType: e.target.value })}
                className="w-full p-2.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all bg-white/80 backdrop-blur-sm"
              >
                <option value="">All Skin Types</option>
                {skinTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Skin Concern</label>
              <select
                value={filters.concern}
                onChange={(e) => setFilters({ ...filters, concern: e.target.value })}
                className="w-full p-2.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all bg-white/80 backdrop-blur-sm"
              >
                <option value="">All Concerns</option>
                {concerns.map(concern => (
                  <option key={concern} value={concern}>{concern}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIngredients.map((ingredient) => (
          <div
            key={ingredient.id}
            onClick={() => setSelectedIngredient(ingredient)}
            className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-slate-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                  style={{ backgroundColor: `${ingredient.color}20`, border: `2px solid ${ingredient.color}30` }}>
                  <ingredient.icon size={20} style={{ color: ingredient.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{ingredient.name}</h3>
                  <p className="text-xs text-slate-600">{ingredient.type}</p>
                </div>
              </div>
            </div>

            <p className="text-sm mb-3 text-slate-700">{ingredient.shortBenefit}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {ingredient.skinTypes.slice(0, 3).map((type, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200">
                  {getSkinTypeIcon(type)}
                  {type}
                </span>
              ))}
              {ingredient.skinTypes.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border border-slate-300">
                  +{ingredient.skinTypes.length - 3}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {ingredient.usage.map((time, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200"
                  style={{ backgroundColor: '#fafaf7', color: '#6c8ebf' }}
                >
                  {time === 'AM' ? <Sun size={10} /> : time.includes('PM') ? <Moon size={10} /> : null}
                  {time}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ingredient Compatibility Checker */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl shadow-lg p-5 border border-emerald-200 hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Activity size={20} className="text-emerald-600" />
          Ingredient Compatibility Checker
        </h3>
        <p className="text-sm mb-4 text-slate-600">
          Check if two ingredients work well together in your routine
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Ingredient 1</label>
            <select
              value={compatIngredient1}
              onChange={(e) => setCompatIngredient1(e.target.value)}
              className="w-full p-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all bg-white/80 backdrop-blur-sm"
            >
              <option value="">Select ingredient</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.name}>{ing.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Ingredient 2</label>
            <select
              value={compatIngredient2}
              onChange={(e) => setCompatIngredient2(e.target.value)}
              className="w-full p-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all bg-white/80 backdrop-blur-sm"
            >
              <option value="">Select ingredient</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.name}>{ing.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompatibilityCheck}
            className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
          >
            Check Compatibility
          </button>
        </div>

        {compatResult && (
          <div className={`mt-4 p-4 rounded-3xl shadow-lg border transition-all duration-300 ${compatResult.status === 'good'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : compatResult.status === 'avoid'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
            }`}>
            <div className="flex items-start gap-2">
              {compatResult.status === 'good' && <ThumbsUp size={20} className="text-green-600" />}
              {compatResult.status === 'avoid' && <ThumbsDown size={20} className="text-red-600" />}
              {compatResult.status === 'caution' && <Minus size={20} className="text-yellow-600" />}
              <div>
                <p className="font-semibold text-slate-900">
                  {compatResult.status === 'good' && '✅ Safe to Combine'}
                  {compatResult.status === 'avoid' && '⚠️ Avoid Mixing'}
                  {compatResult.status === 'caution' && '⚠️ Use with Caution'}
                </p>
                <p className="text-sm mt-1 text-slate-600">{compatResult.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedIngredient(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${selectedIngredient.color}15` }}>
                  <selectedIngredient.icon size={24} style={{ color: selectedIngredient.color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#2e2e2e' }}>{selectedIngredient.name}</h2>
                  <p className="text-sm" style={{ color: '#6c8ebf' }}>{selectedIngredient.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} style={{ color: '#6c8ebf' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <Info size={18} style={{ color: '#5fb3a2' }} />
                  Description
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6c8ebf' }}>{selectedIngredient.description}</p>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <Sparkles size={18} style={{ color: '#5fb3a2' }} />
                  Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedIngredient.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: '#2e2e2e' }}>
                      <Check size={14} style={{ color: '#5fb3a2' }} />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Effects */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <AlertCircle size={18} style={{ color: '#f44336' }} />
                  Side Effects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.sideEffects.map((effect, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#ffebee', color: '#f44336' }}>
                      {effect}
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <Sun size={18} style={{ color: '#5fb3a2' }} />
                  Usage
                </h3>
                <div className="flex gap-2">
                  {selectedIngredient.usage.map((time, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: '#f5f9f8', color: '#5fb3a2' }}>
                      {time.includes('AM') ? <Sun size={12} /> : time.includes('PM') ? <Moon size={12} /> : null}
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Do Not Mix */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <ThumbsDown size={18} style={{ color: '#f44336' }} />
                  Do Not Mix With
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.doNotMix.map((mix, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#ffebee', color: '#f44336' }}>
                      {mix}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Combinations */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <ThumbsUp size={18} style={{ color: '#4caf50' }} />
                  Best Combinations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.bestCombinations.map((combo, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#e8f5e9', color: '#4caf50' }}>
                      {combo}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suitable For */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#2e2e2e' }}>
                  <Users size={18} style={{ color: '#5fb3a2' }} />
                  Suitable For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.skinTypes.map((type, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#f5f9f8', color: '#5fb3a2' }}>
                      {type} Skin
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

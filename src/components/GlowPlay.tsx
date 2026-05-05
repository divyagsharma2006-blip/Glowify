import { useEffect, useMemo, useState } from 'react'
import {
    Gamepad,
    Sparkles,
    Clock3,
    ShieldCheck,
    AlertTriangle,
    Shuffle,
    Check,
    ArrowRight,
    Zap
} from 'lucide-react'

const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || ''
const GROQ_API_TOKEN = import.meta.env.VITE_GROQ_API_TOKEN || ''
const useGroqApi = GROQ_API_URL.length > 0

type GameMode = 'ingredient-match' | 'compatibility-match' | 'reaction-time' | 'sliding-puzzle'

type PairCard = {
    id: string
    label: string
    pairId: string
    explanation: string
}

const localIngredientPairs = [
    {
        left: 'Salicylic Acid',
        right: 'Acne',
        explanation: 'Salicylic acid penetrates pores to reduce acne and unclog skin.'
    },
    {
        left: 'Hyaluronic Acid',
        right: 'Hydration',
        explanation: 'Hyaluronic acid locks in moisture for plump, hydrated skin.'
    },
    {
        left: 'Vitamin C',
        right: 'Pigmentation',
        explanation: 'Vitamin C brightens skin and helps fade hyperpigmentation.'
    },
    {
        left: 'Ceramides',
        right: 'Barrier Repair',
        explanation: 'Ceramides restore the skin barrier and prevent moisture loss.'
    }
]

const localCompatibilityPairs = [
    {
        left: 'Retinol',
        right: 'Avoid Vitamin C',
        explanation: 'Retinol and Vitamin C can irritate skin when used together in the same routine.'
    },
    {
        left: 'Niacinamide',
        right: 'Works with Hyaluronic Acid',
        explanation: 'Niacinamide is stable and pairs well with hyaluronic acid for hydration.'
    },
    {
        left: 'Salicylic Acid',
        right: 'Avoid Benzoyl Peroxide',
        explanation: 'Using these together can cause excess dryness and irritation.'
    },
    {
        left: 'Ceramides',
        right: 'Works with Retinol',
        explanation: 'Ceramides help soothe and support the skin barrier when using retinol.'
    }
]

const localReactionPrompts = [
    {
        id: 'rt-1',
        title: 'Retinol + Sunlight',
        validAction: 'avoid',
        explanation: 'Retinol increases sun sensitivity, so direct sunlight should be avoided after application.'
    },
    {
        id: 'rt-2',
        title: 'Salicylic Acid + Acne',
        validAction: 'safe',
        explanation: 'Salicylic acid is a trusted ingredient for acne-prone skin and helps clear breakouts.'
    },
    {
        id: 'rt-3',
        title: 'Vitamin C + Nighttime',
        validAction: 'safe',
        explanation: 'Vitamin C can be used safely in the evening when paired with gentle hydration.'
    },
    {
        id: 'rt-4',
        title: 'Benzoyl Peroxide + Retinol',
        validAction: 'avoid',
        explanation: 'This combination may be too irritating for most skin types if used at the same time.'
    }
]

const createDeck = (pairs: Array<{ left: string; right: string; explanation: string }>) => {
    const deck: PairCard[] = pairs.flatMap((pair, index) => [
        {
            id: `${pair.left}-${index}`,
            label: pair.left,
            pairId: `pair-${index}`,
            explanation: pair.explanation
        },
        {
            id: `${pair.right}-${index}`,
            label: pair.right,
            pairId: `pair-${index}`,
            explanation: pair.explanation
        }
    ])
    return shuffleArray(deck)
}

const shuffleArray = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)

const initialPuzzleBoard = [1, 2, 3, 4, 5, 6, 7, 8, null] as Array<number | null>

const GlowPlay = () => {
    const [mode, setMode] = useState<GameMode>('ingredient-match')
    const [deck, setDeck] = useState<PairCard[]>([])
    const [flipped, setFlipped] = useState<string[]>([])
    const [matchedPairs, setMatchedPairs] = useState<Record<string, boolean>>({})
    const [moves, setMoves] = useState(0)
    const [score, setScore] = useState(0)
    const [matchExplanation, setMatchExplanation] = useState('Pick two cards to discover the right connection.')
    const [reactionIndex, setReactionIndex] = useState(0)
    const [reactionScore, setReactionScore] = useState(0)
    const [reactionTime, setReactionTime] = useState(10)
    const [reactionResult, setReactionResult] = useState<string>('')
    const [puzzleBoard, setPuzzleBoard] = useState<Array<number | null>>(initialPuzzleBoard)
    const [puzzleSolved, setPuzzleSolved] = useState(false)

    const reactionPrompt = useMemo(() => localReactionPrompts[reactionIndex % localReactionPrompts.length], [reactionIndex])

    const isMemoryMode = mode === 'ingredient-match' || mode === 'compatibility-match'

    const totalPairs = 4

    const fetchGroqCards = async (selectedMode: GameMode) => {
        if (!useGroqApi) return null

        const query = `*[_type == "gameIdea" && mode == "${selectedMode}"][0]{ pairs[] { left, right, explanation } }`
        try {
            const url = new URL(GROQ_API_URL)
            url.searchParams.set('query', query)

            const response = await fetch(url.toString(), {
                headers: {
                    'Content-Type': 'application/json',
                    ...(GROQ_API_TOKEN ? { Authorization: `Bearer ${GROQ_API_TOKEN}` } : {})
                }
            })

            if (!response.ok) {
                return null
            }

            const result = await response.json()
            return result?.pairs ?? null
        } catch {
            return null
        }
    }

    const initializeMemoryDeck = async (selectedMode: GameMode) => {
        const fallback = selectedMode === 'ingredient-match' ? localIngredientPairs : localCompatibilityPairs
        const groqPairs = await fetchGroqCards(selectedMode)
        const content = Array.isArray(groqPairs) && groqPairs.length >= totalPairs ? groqPairs.slice(0, totalPairs) : fallback
        setDeck(createDeck(content))
        setFlipped([])
        setMatchedPairs({})
        setMoves(0)
        setScore(0)
        setMatchExplanation('Pick two cards to discover the right connection.')
    }

    const initializeReactionGame = () => {
        setReactionScore(0)
        setReactionTime(10)
        setReactionResult('Tap the correct answer before time runs out.')
        setReactionIndex(0)
    }

    const initializePuzzle = () => {
        let board = [...initialPuzzleBoard]
        for (let i = 0; i < 120; i += 1) {
            const blankIndex = board.indexOf(null)
            const possibleMoves = [blankIndex - 1, blankIndex + 1, blankIndex - 3, blankIndex + 3].filter(
                (index) => index >= 0 && index < 9 && Math.abs((index % 3) - (blankIndex % 3)) + Math.abs(Math.floor(index / 3) - Math.floor(blankIndex / 3)) === 1
            )
            const moveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
            const newBoard = [...board]
            newBoard[blankIndex] = newBoard[moveIndex]
            newBoard[moveIndex] = null
            board = newBoard
        }
        setPuzzleBoard(board)
        setPuzzleSolved(false)
    }

    useEffect(() => {
        if (isMemoryMode) {
            void initializeMemoryDeck(mode)
        }
        if (mode === 'reaction-time') {
            initializeReactionGame()
        }
        if (mode === 'sliding-puzzle') {
            initializePuzzle()
        }
    }, [mode])

    useEffect(() => {
        if (reactionTime <= 0 && mode === 'reaction-time') {
            setReactionResult('Time is up! Try the next challenge.')
            setReactionIndex((index) => index + 1)
            setReactionTime(10)
        }
    }, [reactionTime, mode])

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined
        if (mode === 'reaction-time' && reactionTime > 0) {
            timer = setInterval(() => setReactionTime((time) => Math.max(time - 1, 0)), 1000)
        }
        return () => window.clearInterval(timer)
    }, [reactionTime, mode])

    useEffect(() => {
        if (flipped.length !== 2 || deck.length === 0) return
        const [firstId, secondId] = flipped
        const firstCard = deck.find((card) => card.id === firstId)
        const secondCard = deck.find((card) => card.id === secondId)

        if (!firstCard || !secondCard) return

        const matched = firstCard.pairId === secondCard.pairId
        if (matched) {
            setMatchedPairs((current) => ({ ...current, [firstCard.pairId]: true }))
            setScore((current) => current + 10)
            setMatchExplanation(firstCard.explanation)
        } else {
            setScore((current) => Math.max(0, current - 2))
            setMatchExplanation('Not a match yet. Try again!')
        }

        setMoves((current) => current + 1)
        const timeout = window.setTimeout(() => setFlipped([]), 800)
        return () => window.clearTimeout(timeout)
    }, [flipped, deck])

    const currentPairs = useMemo(() => deck.length / 2, [deck])
    const matchedCount = useMemo(
        () => Object.keys(matchedPairs).filter((pairId) => matchedPairs[pairId]).length,
        [matchedPairs]
    )

    const isMemoryWin = isMemoryMode && matchedCount === currentPairs && currentPairs > 0

    const handleCardClick = (card: PairCard) => {
        if (matchedPairs[card.pairId] || flipped.includes(card.id) || flipped.length === 2) return
        setFlipped((current) => [...current, card.id])
    }

    const handleReactionChoice = (choice: 'safe' | 'avoid') => {
        const correct = choice === reactionPrompt.validAction
        if (correct) {
            setReactionScore((score) => score + 1)
            setReactionResult('Correct! ' + reactionPrompt.explanation)
        } else {
            setReactionResult('Not quite. ' + reactionPrompt.explanation)
        }
        setReactionIndex((index) => index + 1)
        setReactionTime(10)
    }

    const movePuzzleTile = (index: number) => {
        if (mode !== 'sliding-puzzle' || puzzleSolved) return
        const blankIndex = puzzleBoard.indexOf(null)
        const row = Math.floor(index / 3)
        const col = index % 3
        const blankRow = Math.floor(blankIndex / 3)
        const blankCol = blankIndex % 3
        const distance = Math.abs(row - blankRow) + Math.abs(col - blankCol)
        if (distance !== 1) return

        const nextBoard = [...puzzleBoard]
        nextBoard[blankIndex] = nextBoard[index]
        nextBoard[index] = null
        setPuzzleBoard(nextBoard)
        const solved = nextBoard.slice(0, 8).every((value, idx) => value === idx + 1)
        setPuzzleSolved(solved)
    }

    const modeStyles: Record<GameMode, { active: string; inactive: string; accent: string }> = {
        'ingredient-match': {
            active: 'border-blue-300 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20',
            inactive: 'border-blue-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50',
            accent: 'bg-blue-100 text-blue-700'
        },
        'compatibility-match': {
            active: 'border-emerald-300 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20',
            inactive: 'border-emerald-100 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50',
            accent: 'bg-emerald-100 text-emerald-700'
        },
        'reaction-time': {
            active: 'border-orange-300 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20',
            inactive: 'border-orange-100 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50',
            accent: 'bg-orange-100 text-orange-700'
        },
        'sliding-puzzle': {
            active: 'border-violet-300 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20',
            inactive: 'border-violet-100 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50',
            accent: 'bg-violet-100 text-violet-700'
        }
    }

    const gameModes: Array<{ id: GameMode; label: string; description: string }> = [
        {
            id: 'ingredient-match',
            label: 'Ingredient Match',
            description: 'Match ingredient cards with their functions.'
        },
        {
            id: 'compatibility-match',
            label: 'Compatibility Match',
            description: 'Match routine pairs that are safe or should be avoided together.'
        },
        {
            id: 'reaction-time',
            label: 'Reaction Time',
            description: 'Decide fast whether an ingredient combo is safe or avoid.'
        },
        {
            id: 'sliding-puzzle',
            label: 'Sliding Puzzle',
            description: 'Rearrange tiles until the skincare image reads “CLEAR SKIN.”'
        }
    ]

    return (
        <div className="space-y-6 px-4 py-6 lg:px-10">
            <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 p-8 text-white shadow-2xl shadow-slate-950/20 border border-white/10">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200 shadow-inner">
                            <Gamepad className="w-4 h-4 text-emerald-200" />
                            GlowPlay
                        </div>
                        <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Real games for real skincare learning</h1>
                        <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">
                            Play memory, compatibility, reaction, and puzzle challenges designed around ingredients, routines, and skin solutions.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-emerald-100 shadow-sm border border-white/10">Powered by Groq if available</span>
                        <span className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-200 shadow-sm border border-white/10">Score & learn as you play</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
                <div className="space-y-5">
                    <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-xl shadow-slate-900/5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Game selector</p>
                                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Choose your challenge</h2>
                            </div>
                            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
                                {useGroqApi ? 'Groq AI enabled' : 'Using local game decks'}
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {gameModes.map((item) => {
                                const styles = modeStyles[item.id]
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setMode(item.id)}
                                        className={`rounded-[28px] border px-4 py-4 text-sm font-semibold transition-all duration-200 ${mode === item.id ? styles.active : styles.inactive
                                            }`}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <span>{item.label}</span>
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles.accent}`}>
                                                {mode === item.id ? 'Selected' : 'Tap to play'}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        <p className="mt-4 text-sm text-slate-600">{gameModes.find((item) => item.id === mode)?.description}</p>
                    </div>

                    <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-950">{mode === 'ingredient-match' ? 'Memory Card: Ingredient Function' : mode === 'compatibility-match' ? 'Compatibility Memory Match' : mode === 'reaction-time' ? 'Reaction Time Challenge' : 'Sliding Puzzle'} </h3>
                                <p className="mt-2 text-sm text-slate-600">{mode === 'sliding-puzzle' ? 'Rearrange the tiles until the board is complete.' : 'Flip, match, or tap the right answer to win and learn.'}</p>
                            </div>
                            <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm border border-emerald-100">
                                {mode === 'reaction-time' ? 'Fast thinking' : 'Brain training'}
                            </div>
                        </div>

                        {mode === 'ingredient-match' || mode === 'compatibility-match' ? (
                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Moves</p>
                                        <p className="mt-2 text-3xl font-bold text-slate-900">{moves}</p>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
                                        <p className="mt-2 text-3xl font-bold text-emerald-700">{score}</p>
                                    </div>
                                    <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-4 text-slate-700 sm:col-span-1">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Matched</p>
                                        <p className="mt-2 text-3xl font-bold text-slate-900">{matchedCount}/{currentPairs}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {deck.map((card) => {
                                        const revealed = flipped.includes(card.id) || matchedPairs[card.pairId]
                                        return (
                                            <button
                                                key={card.id}
                                                type="button"
                                                onClick={() => handleCardClick(card)}
                                                className={`rounded-3xl border p-5 text-left shadow-sm transition ${revealed ? 'border-emerald-200 bg-emerald-50 text-slate-900 shadow-emerald-200/40' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{revealed ? card.label : 'Tap to flip'}</span>
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{revealed ? 'Open' : 'Hidden'}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                                    <div className="flex items-center gap-2 text-slate-900">
                                        <Sparkles className="w-4 h-4 text-emerald-600" />
                                        <p className="font-semibold">Match tip</p>
                                    </div>
                                    <p className="mt-3 text-sm leading-6">{matchExplanation}</p>
                                </div>

                                {isMemoryWin && (
                                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                                        <div className="flex items-center gap-3 font-semibold">
                                            <Check className="w-5 h-5 text-emerald-700" />
                                            <span>You completed the game! Your skin knowledge is stronger now.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : mode === 'reaction-time' ? (
                            <div className="space-y-5">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current Prompt</p>
                                            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{reactionPrompt.title}</h3>
                                        </div>
                                        <div className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm border border-slate-200">{reactionTime}s</div>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-600">Choose whether this combo is safe or should be avoided.</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => handleReactionChoice('safe')}
                                        className="rounded-3xl border border-emerald-200 bg-emerald-500 px-5 py-4 text-white shadow-lg shadow-emerald-500/15 transition hover:scale-[1.01]"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]">
                                            <ShieldCheck className="w-5 h-5" />
                                            Safe
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleReactionChoice('avoid')}
                                        className="rounded-3xl border border-rose-200 bg-rose-500 px-5 py-4 text-white shadow-lg shadow-rose-500/15 transition hover:scale-[1.01]"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]">
                                            <AlertTriangle className="w-5 h-5" />
                                            Avoid
                                        </div>
                                    </button>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-700">
                                    <p className="text-sm font-semibold text-slate-900">Result</p>
                                    <p className="mt-3 text-sm leading-6">{reactionResult}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Score</p>
                                        <p className="text-xl font-semibold text-slate-900">{reactionScore}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
                                    <p className="text-sm font-semibold text-slate-900">Goal</p>
                                    <p className="mt-3 text-sm leading-6">Move the tiles until the board reads a perfect skin result.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {puzzleBoard.map((value, index) => {
                                        const isBlank = value === null
                                        const canMove = !puzzleSolved && (() => {
                                            const blankIndex = puzzleBoard.indexOf(null)
                                            const row = Math.floor(index / 3)
                                            const col = index % 3
                                            const blankRow = Math.floor(blankIndex / 3)
                                            const blankCol = blankIndex % 3
                                            return Math.abs(row - blankRow) + Math.abs(col - blankCol) === 1
                                        })()
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => movePuzzleTile(index)}
                                                className={`aspect-square rounded-[28px] border transition-all duration-200 ${isBlank
                                                        ? 'bg-slate-100 text-slate-300 border-slate-200'
                                                        : 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 text-slate-900 border border-slate-200 shadow-sm hover:shadow-xl'
                                                    } ${canMove ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'} ${puzzleSolved ? 'opacity-80' : ''}`}
                                            >
                                                <span className="text-3xl font-bold">{value ?? ''}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <button
                                        type="button"
                                        onClick={initializePuzzle}
                                        className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
                                    >
                                        <Shuffle className="w-4 h-4" /> Shuffle Puzzle
                                    </button>
                                    {puzzleSolved && (
                                        <div className="rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-500 px-5 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/20">
                                            <div className="flex items-center justify-center gap-2">
                                                <Sparkles className="w-5 h-5 text-white" />
                                                <span>Yay — you won! Your skin puzzle is complete.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-5 rounded-[32px] border border-slate-200/80 bg-slate-50/95 p-6 shadow-xl shadow-slate-900/5">
                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-900">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-semibold">How GlowPlay helps</h3>
                        </div>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li className="rounded-3xl border border-slate-200 bg-slate-50 p-3">Learn ingredient benefits while you play.</li>
                            <li className="rounded-3xl border border-slate-200 bg-slate-50 p-3">Build memory and compatibility skills for routines.</li>
                            <li className="rounded-3xl border border-slate-200 bg-slate-50 p-3">Practice fast reactions for safe product choices.</li>
                        </ul>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/20">
                        <div className="flex items-center gap-3">
                            <Clock3 className="w-5 h-5" />
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Quick tip</p>
                                <p className="mt-2 text-sm font-semibold">Matching a pair? Read the explanation to remember why it works.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 text-slate-900">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="text-sm font-semibold">AI card generation</p>
                                <p className="mt-2 text-sm text-slate-600">If Groq is configured, GlowPlay will attempt to generate fresh card pairs for each mode.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 text-slate-700" />
                            <div>
                                <p className="text-sm font-semibold">Best practice</p>
                                <p className="mt-2 text-sm text-slate-600">Use the games regularly to memorize ingredient benefits and compatibility rules.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default GlowPlay

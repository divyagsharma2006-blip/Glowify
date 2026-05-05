// src/components/Quiz.tsx
import React, { useState, useEffect } from 'react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  health_tip: string;
  severity: string;
}

interface FocusArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || '';
const GROQ_API_TOKEN = import.meta.env.VITE_GROQ_API_TOKEN || '';
const useGroq = GROQ_API_URL.length > 0;

const fetchGroq = async (query: string, params?: Record<string, unknown>) => {
  if (!GROQ_API_URL) {
    throw new Error('GROQ API URL is not configured.');
  }

  const url = new URL(GROQ_API_URL);
  url.searchParams.set('query', query);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(`$${key}`, JSON.stringify(value));
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(GROQ_API_TOKEN ? { Authorization: `Bearer ${GROQ_API_TOKEN}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`GROQ fetch failed (${response.status})`);
  }

  const payload = await response.json();
  return payload.result ?? payload;
};

const Quiz: React.FC = () => {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<FocusArea | null>(null);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userGender, setUserGender] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userSkinType, setUserSkinType] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFocusAreas();
  }, []);

  const handleContinueToQuiz = () => {
    if (!userGender || !userAge || !userSkinType) {
      setError('Please complete all profile fields before continuing.');
      return;
    }

    setError('');
    setShowUserInfo(false);
  };

  const fetchFocusAreas = async () => {
    try {
      if (useGroq) {
        const query = `*[_type == "quizFocusArea"]{_id, title, description, icon, "slug": slug.current}`;
        const data = await fetchGroq(query);

        setFocusAreas(
          data.map((item: any) => ({
            id: item.slug || item._id,
            name: item.title,
            description: item.description,
            icon: item.icon || '✨'
          }))
        );
        return;
      }

      const response = await fetch('http://localhost:5000/api/quiz-focus-areas');
      const data = await response.json();
      setFocusAreas(data);
    } catch (error) {
      console.error('Error fetching focus areas:', error);
      setFocusAreas([
        { id: 'general', name: '🌟 General Skin Health', icon: '✨', description: 'Daily routines and overall wellness' },
        { id: 'acne', name: '🔴 Acne & Breakouts', icon: '💢', description: 'Causes, treatments, and prevention' },
        { id: 'aging', name: '⏰ Anti-Aging', icon: '🕰️', description: 'Collagen, wrinkles, and prevention' },
        { id: 'hydration', name: '💧 Hydration', icon: '💙', description: 'Moisture and hydration tips' },
        { id: 'health', name: '🏃‍♀️ Lifestyle & Health', icon: '🌿', description: 'Diet, sleep, and stress effects' }
      ]);
    }
  };

  const getFallbackQuiz = (focus: FocusArea): Question[] => {
    return [
      {
        question: `What is the best first step for ${focus.name.toLowerCase()}?`,
        options: [
          'Use a strong exfoliant every day',
          'Keep skin clean and hydrated',
          'Skip sunscreen for better absorption',
          'Use only oil-based products'
        ],
        correct: 1,
        explanation: 'Starting with a clean, hydrated base is the safest first step for most skin goals.',
        health_tip: 'Hydration supports the skin barrier and improves results from treatments.',
        severity: 'medium'
      },
      {
        question: `Which habit is most helpful for ${focus.name.toLowerCase()}?`,
        options: [
          'Sleeping 7-8 hours each night',
          'Washing face with hot water frequently',
          'Using multiple acids at once',
          'Skipping moisturizer'
        ],
        correct: 0,
        explanation: 'Good sleep supports skin renewal, especially when addressing long-term concerns.',
        health_tip: 'Your skin repairs itself while you sleep, so rest is important.',
        severity: 'low'
      },
      {
        question: `For ${focus.name.toLowerCase()}, which product should you use daily?`,
        options: [
          'Sunscreen',
          'Strong retinol every morning',
          'Body lotion only',
          'Abrasive scrub'
        ],
        correct: 0,
        explanation: 'Sunscreen is universally important for protecting skin during any routine.',
        health_tip: 'UV protection keeps skin healthy and prevents many concerns from worsening.',
        severity: 'high'
      }
    ];
  };

  const startQuiz = async (focus: FocusArea) => {
    if (!userGender || !userAge || !userSkinType) {
      alert('Please fill in all fields!');
      return;
    }

    setLoading(true);
    setSelectedFocus(focus);
    setError('');

    try {
      let quizData: Question[] = [];

      if (useGroq) {
        const query = `*[_type == "quizQuestion" && references(*[_type == "quizFocusArea" && slug.current == $focusId]._id)]{question, options, correct, explanation, health_tip, severity}[0...5]`;
        const data = await fetchGroq(query, { focusId: focus.id });

        quizData = data.map((item: any) => ({
          question: item.question,
          options: item.options,
          correct: item.correct,
          explanation: item.explanation || 'Learn more about this topic as you study.',
          health_tip: item.health_tip || 'Keep your skin routine consistent.',
          severity: item.severity || 'medium'
        }));
      } else {
        try {
          const response = await fetch('http://localhost:5000/api/generate-skin-quiz', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              focus_area: focus.id,
              age: userAge,
              gender: userGender,
              skin_type: userSkinType,
              num_questions: 3
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate quiz');
          }

          const data = await response.json();
          quizData = data.quiz || [];
        } catch (fallbackError) {
          console.warn('Local quiz generation failed, using fallback quiz:', fallbackError);
          quizData = getFallbackQuiz(focus);
          setError('Using offline quiz fallback because the quiz API is unavailable.');
        }
      }

      if (quizData.length > 0) {
        setQuiz(quizData);
        setCurrentQuestion(0);
        setAnswers([]);
        setShowResults(false);
        setShowUserInfo(false);
      } else {
        throw new Error('No questions received');
      }
    } catch (error) {
      console.error('Error:', error);
      if (quiz.length === 0) {
        setError('Failed to generate quiz. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    // Move to next question after delay
    setTimeout(() => {
      setShowExplanation(false);
      setSelectedAnswer(null);
      
      if (currentQuestion + 1 < quiz.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        evaluateQuiz(newAnswers);
      }
    }, 3000);
  };

  const evaluateQuiz = async (finalAnswers: number[]) => {
    setLoading(true);
    try {
      if (!useGroq) {
        const response = await fetch('http://localhost:5000/api/evaluate-skin-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: quiz,
            answers: finalAnswers,
            age: userAge,
            gender: userGender,
            skin_type: userSkinType
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
          return;
        }
      }

      const score = finalAnswers.filter((ans, idx) => ans === quiz[idx].correct).length;
      setResults({
        score,
        total: quiz.length,
        percentage: (score / quiz.length) * 100,
        results: quiz.map((q, idx) => ({
          question: q.question,
          user_answer: finalAnswers[idx],
          correct_answer: q.correct,
          is_correct: finalAnswers[idx] === q.correct,
          explanation: q.explanation,
          health_tip: q.health_tip
        })),
        feedback: {
          score_message: `You scored ${score}/${quiz.length}! Keep learning! 🎉`,
          skin_health_score: (score / quiz.length) * 100,
          strengths: ["You're learning about skin health!"],
          areas_to_improve: ["Keep studying", "Apply what you learned"],
          personalized_recommendations: {
            daily_routine: ["Cleanse twice daily", "Moisturize", "Use SPF"],
            products_to_consider: ["Gentle cleanser", "Moisturizer", "Sunscreen"],
            lifestyle_changes: ["Drink water", "Get sleep", "Eat healthy"]
          },
          fun_fact: "Your skin renews every 28 days!",
          motivational_message: "Small steps lead to big changes! ✨"
        }
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error evaluating quiz:', error);
      const score = finalAnswers.filter((ans, idx) => ans === quiz[idx].correct).length;
      setResults({
        score,
        total: quiz.length,
        percentage: (score / quiz.length) * 100,
        results: quiz.map((q, idx) => ({
          question: q.question,
          user_answer: finalAnswers[idx],
          correct_answer: q.correct,
          is_correct: finalAnswers[idx] === q.correct,
          explanation: q.explanation,
          health_tip: q.health_tip
        })),
        feedback: {
          score_message: `You scored ${score}/${quiz.length}! Keep learning! 🎉`,
          skin_health_score: (score / quiz.length) * 100,
          strengths: ["You're learning about skin health!"],
          areas_to_improve: ["Keep studying", "Apply what you learned"],
          personalized_recommendations: {
            daily_routine: ["Cleanse twice daily", "Moisturize", "Use SPF"],
            products_to_consider: ["Gentle cleanser", "Moisturizer", "Sunscreen"],
            lifestyle_changes: ["Drink water", "Get sleep", "Eat healthy"]
          },
          fun_fact: "Your skin renews every 28 days!",
          motivational_message: "Small steps lead to big changes! ✨"
        }
      });
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setSelectedFocus(null);
    setQuiz([]);
    setShowResults(false);
    setResults(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setShowUserInfo(true);
    setError('');
  };

  // User Info Form
  if (showUserInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-full mb-6">
                <span className="text-2xl">✨</span>
                <span className="font-semibold">AI-Powered Skin Health Quiz</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-teal-600 mb-4">
                Discover Your Skin Health Score!
              </h1>
              <p className="text-gray-600">
                Get personalized questions based on your gender, age, and skin type
              </p>
            </div>

            <div className="space-y-6">
              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUserGender('female')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userGender === 'female' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-teal-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">👩</div>
                    <div className="font-medium">Female</div>
                  </button>
                  <button
                    onClick={() => setUserGender('male')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userGender === 'male' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-teal-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">👨</div>
                    <div className="font-medium">Male</div>
                  </button>
                </div>
              </div>

              {/* Age Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Age
                </label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Skin Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Skin Type
                </label>
                <select
                  value={userSkinType}
                  onChange={(e) => setUserSkinType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select your skin type</option>
                  <option value="dry">Dry</option>
                  <option value="oily">Oily</option>
                  <option value="combination">Combination</option>
                  <option value="normal">Normal</option>
                  <option value="sensitive">Sensitive</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleContinueToQuiz}
                disabled={!userGender || !userAge || !userSkinType}
                className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Quiz →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Focus Area Selection
  if (!selectedFocus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-teal-600 mb-4">
              Choose Your Focus Area
            </h2>
            <p className="text-gray-600">
              Questions personalized for {userGender === 'female' ? '👩 Woman' : '👨 Man'} • Age {userAge} • {userSkinType} skin
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((focus) => (
              <button
                key={focus.id}
                onClick={() => startQuiz(focus)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="text-4xl mb-4">{focus.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{focus.name}</h3>
                <p className="text-gray-500 text-sm">{focus.description}</p>
                <div className="mt-4 text-teal-500 group-hover:translate-x-1 transition inline-block">
                  Start Quiz →
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={resetQuiz}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              ← Change profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-600">Generating your personalized quiz...</p>
          <p className="text-sm text-gray-500 mt-2">
            Based on your profile: {userGender === 'female' ? 'Woman' : 'Man'}, {userAge} years, {userSkinType} skin
          </p>
        </div>
      </div>
    );
  }

  // Results Page
  if (showResults && results) {
    const percentage = results.percentage;
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500 rounded-full mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 mb-4">{results.feedback.score_message}</p>
              
              <div className="text-5xl font-bold text-teal-600 mb-4">
                {results.score}/{results.total}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className="bg-teal-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Score Card */}
              <div className="bg-teal-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-teal-800 mb-2">Your Skin Health Score</h3>
                <div className="text-3xl font-bold text-teal-600">{Math.round(percentage)}/100</div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-3">✨ Personalized Recommendations</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-teal-700 mb-2">Daily Routine:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {results.feedback.personalized_recommendations.daily_routine.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-teal-700 mb-2">Products to Consider:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {results.feedback.personalized_recommendations.products_to_consider.map((product: string, i: number) => (
                      <li key={i}>{product}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800">💡 {results.feedback.fun_fact}</p>
                </div>
                
                <div className="bg-teal-50 rounded-lg p-3 mt-3 text-center">
                  <p className="text-teal-700 font-medium">{results.feedback.motivational_message}</p>
                </div>
              </div>

              {/* Question Review */}
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-semibold text-gray-800">Question Review</h3>
                {results.results.map((result: any, idx: number) => (
                  <div key={idx} className={`border rounded-lg p-4 ${
                    result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <p className="font-medium text-gray-800 mb-2">{result.question}</p>
                    <p className="text-sm text-gray-600">
                      Your answer: {quiz[idx].options[result.user_answer]}
                    </p>
                    {!result.is_correct && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct: {quiz[idx].options[result.correct_answer]}
                      </p>
                    )}
                    {result.explanation && (
                      <p className="text-sm text-gray-600 mt-2">📝 {result.explanation}</p>
                    )}
                    {result.health_tip && (
                      <p className="text-sm text-teal-600 mt-1">💚 {result.health_tip}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={resetQuiz}
                className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition"
              >
                Take Another Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz - Question Display
  const question = quiz[currentQuestion];
  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {quiz.length}</span>
              <span>{Math.round(((currentQuestion + 1) / quiz.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !showExplanation && handleAnswer(idx)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showExplanation && selectedAnswer === idx
                    ? idx === question.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : showExplanation && idx === question.correct
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                } ${!showExplanation && 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                  {showExplanation && idx === question.correct && (
                    <span className="ml-auto text-green-600">✓ Correct Answer</span>
                  )}
                  {showExplanation && selectedAnswer === idx && idx !== question.correct && (
                    <span className="ml-auto text-red-600">✗ Your Answer</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="animate-fade-in">
              <div className="bg-teal-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-teal-800 mb-1">Explanation</p>
                <p className="text-gray-700">{question.explanation}</p>
              </div>
              {question.health_tip && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="font-medium text-green-800 mb-1">Health Tip! 💚</p>
                  <p className="text-gray-700">{question.health_tip}</p>
                </div>
              )}
              <div className="text-center text-sm text-gray-500 mt-4">
                Next question in a moment...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
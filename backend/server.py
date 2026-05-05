# backend/server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv
import json
import random
import time

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Groq client
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Store recently used questions to avoid repetition
recent_questions = {}

@app.route('/api/generate-skin-quiz', methods=['POST'])
def generate_skin_quiz():
    """Generate AI-powered skin and health quiz questions based on user profile"""
    try:
        data = request.get_json()
        print("Received request:", data)
        
        focus_area = data.get('focus_area', 'general')
        age = data.get('age', '25')
        gender = data.get('gender', 'female')
        skin_type = data.get('skin_type', 'normal')
        num_questions = data.get('num_questions', random.randint(3, 5))
        
        # Create a unique session ID to track questions
        session_id = f"{gender}_{age}_{skin_type}_{focus_area}_{int(time.time())}"
        
        # Age-based context
        age_int = int(age)
        if age_int < 20:
            age_desc = "teenager going through puberty"
            age_concerns = "hormonal acne, oil production, establishing routines"
        elif age_int < 30:
            age_desc = "young adult"
            age_concerns = "prevention, stress-related breakouts, starting anti-aging"
        elif age_int < 40:
            age_desc = "adult"
            age_concerns = "early aging signs, adult acne, collagen maintenance"
        elif age_int < 50:
            age_desc = "middle-aged adult"
            age_concerns = "perimenopause (if female) or andropause (if male), firmness, pigmentation"
        else:
            age_desc = "mature adult"
            age_concerns = "menopause (if female), age-related thinning, deep hydration, gentle care"
        
        # Create a more dynamic prompt with random elements
        question_themes = [
            "daily routine", "product ingredients", "lifestyle factors", 
            "prevention strategies", "common mistakes", "science facts",
            "myth busting", "seasonal changes", "diet connection", "sleep impact"
        ]
        
        selected_themes = random.sample(question_themes, min(num_questions, len(question_themes)))
        
        prompt = f"""Create a COMPLETELY UNIQUE and FRESH skin health quiz with EXACTLY {num_questions} questions.

USER PROFILE:
- Gender: {gender}
- Age: {age} years old ({age_desc})
- Skin Type: {skin_type}
- Focus Area: {focus_area}
- Age-specific concerns: {age_concerns}

QUESTION THEMES TO USE (one per question):
{', '.join(selected_themes)}

CRITICAL REQUIREMENTS - MUST FOLLOW:
1. Each question MUST be about a DIFFERENT theme from the list above
2. Questions MUST be SPECIFIC to {gender}s aged {age} with {skin_type} skin
3. NEVER repeat the same question pattern
4. Make questions CREATIVE and UNEXPECTED, not generic

GENDER-SPECIFIC REQUIREMENTS:
{'- For FEMALE: Mention menstrual cycles, pregnancy/postpartum, perimenopause/menopause, hormonal fluctuations, collagen loss rates' if gender == 'female' else '- For MALE: Mention testosterone effects, shaving/beard care, thicker skin, later aging onset, sebum production'}

AGE-SPECIFIC REQUIREMENTS:
- Age {age}: Focus on {age_concerns}

SKIN TYPE REQUIREMENTS:
- {skin_type.upper()} skin: Focus on { 'moisture barrier and hydration' if skin_type == 'dry' else 'oil control and pore health' if skin_type == 'oily' else 'balancing different areas' if skin_type == 'combination' else 'maintaining balance' if skin_type == 'normal' else 'gentle care and avoiding irritants' }

FOCUS AREA REQUIREMENTS:
- {focus_area.upper()}: { 'Basic skincare knowledge and daily habits' if focus_area == 'general' else 'Breakout causes, treatments, and prevention' if focus_area == 'acne' else 'Wrinkle prevention, collagen, and age management' if focus_area == 'aging' else 'Moisture retention, barriers, and hydration techniques' if focus_area == 'hydration' else 'Diet, sleep, stress, and holistic wellness' }

Return ONLY valid JSON in this exact format:
{{
    "quiz": [
        {{
            "question": "unique, creative question specific to this user",
            "options": ["option1", "option2", "option3", "option4"],
            "correct": 0,
            "explanation": "detailed, educational explanation",
            "health_tip": "practical, actionable tip",
            "severity": "low/medium/high"
        }}
    ]
}}

IMPORTANT: Make each question feel like it was written specifically for this {gender} at age {age} with {skin_type} skin. Be creative and educational!"""

        print("Sending prompt to AI...")
        
        # Call Groq API with higher temperature for more variety
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,  # Higher temperature = more creative/varied responses
            max_tokens=2500
        )
        
        response_text = completion.choices[0].message.content
        print("AI Response received")
        
        # Extract JSON from response
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start != -1 and json_end != 0:
            response_text = response_text[json_start:json_end]
        
        quiz_data = json.loads(response_text)
        
        # Add metadata
        quiz_data['metadata'] = {
            'session_id': session_id,
            'gender': gender,
            'age': age,
            'skin_type': skin_type,
            'focus_area': focus_area,
            'timestamp': time.time()
        }
        
        return jsonify(quiz_data)
        
    except Exception as e:
        print(f"Error generating AI quiz: {e}")
        # Return dynamic fallback with variety
        fallback_quiz = generate_varied_fallback_quiz(age, gender, skin_type, focus_area, num_questions)
        return jsonify(fallback_quiz)

def generate_varied_fallback_quiz(age, gender, skin_type, focus_area, num_questions):
    """Generate varied fallback questions that change each time"""
    age_int = int(age)
    
    # Large pool of questions to randomly select from
    question_pool = {
        'general': [
            {
                "question_template": "What's the most important skincare step for {gender}s with {skin_type} skin at age {age}?",
                "options": ["Daily SPF application", "Heavy exfoliation", "Multiple serums", "Face masks"],
                "correct": 0,
                "explanation_template": "Sunscreen prevents UV damage, which causes 90% of premature aging regardless of {gender} or skin type.",
                "tip_template": "Apply SPF 30+ every morning - it's the single best thing for {skin_type} skin!"
            },
            {
                "question_template": "How often should someone with {skin_type} skin cleanse their face?",
                "options": ["Twice daily (morning and night)", "Once daily", "Three times daily", "Only when dirty"],
                "correct": 0,
                "explanation_template": "Morning and evening cleansing removes dirt, oil, and pollutants without over-stripping {skin_type} skin.",
                "tip_template": "Use lukewarm water and a gentle, pH-balanced cleanser for your {skin_type} skin."
            },
            {
                "question_template": "What's the correct order for applying skincare products on {skin_type} skin?",
                "options": ["Thinnest to thickest consistency", "Thickest to thinnest", "Any order works", "Moisturizer first"],
                "correct": 0,
                "explanation_template": "Apply from thinnest (serums) to thickest (moisturizers, oils) for best absorption into {skin_type} skin.",
                "tip_template": "Your {skin_type} skin will absorb products better when applied in the right order."
            },
            {
                "question_template": "Why is moisturizer important for {skin_type} skin?",
                "options": ["Locks in hydration and protects barrier", "Only for dry skin", "Makes skin oily", "Optional step"],
                "correct": 0,
                "explanation_template": "Moisturizer strengthens the skin barrier and prevents water loss, essential for all {skin_type} skin types.",
                "tip_template": "Apply moisturizer to damp {skin_type} skin for maximum hydration."
            }
        ],
        'acne': [
            {
                "question_template": "What's the most effective OTC ingredient for {gender}s with {skin_type} skin and acne?",
                "options": ["Salicylic acid", "Hyaluronic acid", "Coconut oil", "Shea butter"],
                "correct": 0,
                "explanation_template": "Salicylic acid penetrates pores to clear oil and dead skin cells that cause acne in {gender}s.",
                "tip_template": "Start with 0.5-2% salicylic acid for your {skin_type} skin, 2-3 times weekly."
            },
            {
                "question_template": "What triggers {gender}-specific acne most commonly?",
                "options": ["Hormonal fluctuations", "Eating chocolate", "Not washing enough", "Using moisturizer"],
                "correct": 0,
                "explanation_template": "Hormonal changes - { 'menstrual cycles, pregnancy, or perimenopause' if gender == 'female' else 'testosterone fluctuations' } - trigger acne in {gender}s.",
                "tip_template": f"Track your breakouts to identify { 'cycle-related' if gender == 'female' else 'hormonal' } patterns in your {skin_type} skin."
            },
            {
                "question_template": "Should you pop a pimple on {skin_type} skin?",
                "options": ["Never - causes scarring", "Only if it's ready", "Always pop them", "Use tools to pop"],
                "correct": 0,
                "explanation_template": "Popping pushes bacteria deeper, causes inflammation, and leads to permanent scars on {skin_type} skin.",
                "tip_template": "Use pimple patches instead - they're safe for {skin_type} skin and speed healing."
            }
        ],
        'aging': [
            {
                "question_template": "What causes the majority of visible skin aging in {gender}s?",
                "options": ["Sun exposure (90%)", "Genetics", "Diet", "Sleep quality"],
                "correct": 0,
                "explanation_template": "UV rays cause up to 90% of visible aging including wrinkles and dark spots, regardless of {gender}.",
                "tip_template": "Daily SPF is your #1 anti-aging strategy for {skin_type} skin at any age."
            },
            {
                "question_template": "What's the gold standard anti-aging ingredient for {skin_type} skin?",
                "options": ["Retinol/Vitamin A", "Vitamin C", "Hyaluronic acid", "Niacinamide"],
                "correct": 0,
                "explanation_template": "Retinol is most studied for boosting collagen and speeding cell turnover in aging {gender} skin.",
                "tip_template": "Start with low-strength retinol 1-2x weekly for your {skin_type} skin, then increase slowly."
            },
            {
                "question_template": "When should {gender}s start using anti-aging products?",
                "options": ["Now - prevention is key", "When wrinkles appear", "After age 40", "Never"],
                "correct": 0,
                "explanation_template": "Prevention should start early - it's easier to prevent than reverse aging signs in {gender} skin.",
                "tip_template": "Your {skin_type} skin benefits from early prevention with sunscreen and antioxidants."
            }
        ],
        'hydration': [
            {
                "question_template": "How does {skin_type} skin lose moisture differently?",
                "options": ["Weaker moisture barrier", "Produces more oil", "Thicker skin", "Doesn't lose moisture"],
                "correct": 0,
                "explanation_template": "{skin_type.capitalize()} skin often has a compromised barrier that lets moisture escape more easily.",
                "tip_template": f"Look for ceramides and niacinamide to strengthen your {skin_type} skin's moisture barrier."
            },
            {
                "question_template": "What's the best way to lock in moisture for {skin_type} skin?",
                "options": ["Apply moisturizer to damp skin", "Wait for skin to dry", "Skip moisturizer", "Use only toner"],
                "correct": 0,
                "explanation_template": "Applying moisturizer to damp skin can increase hydration by up to 200% for {skin_type} skin.",
                "tip_template": "Don't fully dry your face after cleansing - apply moisturizer while still slightly damp."
            },
            {
                "question_template": "How much water should you drink for optimal skin hydration?",
                "options": ["6-8 glasses daily", "1-2 glasses", "Only when thirsty", "10+ glasses"],
                "correct": 0,
                "explanation_template": "6-8 glasses helps maintain skin hydration from within, though external moisturizers are still needed for {skin_type} skin.",
                "tip_template": "Carry a water bottle and set reminders - your {skin_type} skin needs internal hydration too!"
            }
        ],
        'health': [
            {
                "question_template": "How does sleep affect {gender}'s {skin_type} skin health?",
                "options": ["Essential for repair", "No effect", "Only affects under-eyes", "Makes skin oily"],
                "correct": 0,
                "explanation_template": "During deep sleep, {gender} skin produces collagen and repairs damage from the day.",
                "tip_template": f"Aim for 7-9 hours of quality sleep for better {skin_type} skin health."
            },
            {
                "question_template": "What's the best diet for healthy {skin_type} skin?",
                "options": ["Antioxidant-rich foods", "Sugary foods", "Dairy products", "Processed foods"],
                "correct": 0,
                "explanation_template": "Antioxidants from fruits and vegetables protect {gender} skin from free radical damage.",
                "tip_template": f"Eat colorful fruits and veggies daily - they're great for your {skin_type} skin!"
            },
            {
                "question_template": "How does stress affect {gender}'s {skin_type} skin?",
                "options": ["Triggers inflammation", "No effect", "Makes skin glow", "Only causes aging"],
                "correct": 0,
                "explanation_template": "Stress increases cortisol, which can trigger acne, eczema, and premature aging in {gender} skin.",
                "tip_template": f"Practice stress reduction like meditation or exercise - your {skin_type} skin will thank you!"
            }
        ]
    }
    
    # Get questions for focus area or default to general
    pool = question_pool.get(focus_area, question_pool['general'])
    
    # Randomly select unique questions
    selected_questions = random.sample(pool, min(num_questions, len(pool)))
    
    # Format questions with user's specifics
    formatted_questions = []
    for q in selected_questions:
        formatted_questions.append({
            "question": q["question_template"].format(gender=gender, age=age, skin_type=skin_type),
            "options": q["options"],
            "correct": q["correct"],
            "explanation": q["explanation_template"].format(gender=gender, skin_type=skin_type),
            "health_tip": q["tip_template"].format(gender=gender, skin_type=skin_type),
            "severity": random.choice(["low", "medium", "high"])
        })
    
    # Add more variety by shuffling options order sometimes
    for q in formatted_questions:
        if random.random() > 0.5:
            # Shuffle options but keep track of correct answer
            correct_option = q["options"][q["correct"]]
            random.shuffle(q["options"])
            q["correct"] = q["options"].index(correct_option)
    
    return {"quiz": formatted_questions}

@app.route('/api/evaluate-skin-quiz', methods=['POST'])
def evaluate_skin_quiz():
    """Evaluate quiz answers and provide personalized recommendations"""
    try:
        data = request.get_json()
        questions = data.get('questions', [])
        answers = data.get('answers', [])
        age = data.get('age', '25')
        gender = data.get('gender', 'female')
        skin_type = data.get('skin_type', 'normal')
        focus_area = data.get('focus_area', 'general')
        
        results = []
        score = 0
        
        for i, (question, answer) in enumerate(zip(questions, answers)):
            is_correct = (answer == question['correct'])
            if is_correct:
                score += 1
            
            results.append({
                'question': question['question'],
                'user_answer': answer,
                'correct_answer': question['correct'],
                'is_correct': is_correct,
                'explanation': question.get('explanation', ''),
                'health_tip': question.get('health_tip', '')
            })
        
        percentage = (score / len(questions)) * 100
        
        # Personalized feedback based on performance
        if percentage >= 80:
            score_message = f"Excellent! You scored {score}/{len(questions)}! You really know your {skin_type} skin! 🌟"
        elif percentage >= 60:
            score_message = f"Good job! You scored {score}/{len(questions)}! You're on the right track! 👍"
        else:
            score_message = f"You scored {score}/{len(questions)}! Great start - every quiz teaches us something new! 💪"
        
        # Gender-specific motivational message
        if gender == 'female':
            motivational = "Your skin changes with your cycle, age, and life stages - keep learning what works for YOU!"
        else:
            motivational = "Men's skin needs love too! Consistency with basics (cleanse, moisturize, SPF) makes a huge difference!"
        
        feedback = {
            "score_message": score_message,
            "skin_health_score": percentage,
            "strengths": [f"You're learning about {focus_area} for your {skin_type} skin!"],
            "areas_to_improve": ["Keep exploring skincare topics", "Apply what you learned to your daily routine"],
            "personalized_recommendations": {
                "daily_routine": [
                    "Cleanse gently morning and night",
                    f"For {skin_type} skin: use {'rich cream' if skin_type == 'dry' else 'gel formula' if skin_type == 'oily' else 'balanced moisturizer'}",
                    "Apply SPF 30+ every single morning"
                ],
                "products_to_consider": [
                    "Gentle, pH-balanced cleanser",
                    f"{'Hydrating serum with hyaluronic acid' if skin_type == 'dry' else 'Oil-controlling serum with niacinamide' if skin_type == 'oily' else 'Balancing moisturizer'}",
                    "Broad-spectrum SPF 30+ sunscreen"
                ],
                "lifestyle_changes": [
                    "Drink 6-8 glasses of water daily",
                    "Get 7-9 hours of quality sleep",
                    "Eat antioxidant-rich fruits and vegetables"
                ]
            },
            "fun_fact": f"Did you know? Your {skin_type} skin renews itself every 28-40 days, depending on your age!",
            "motivational_message": motivational
        }
        
        return jsonify({
            'score': score,
            'total': len(questions),
            'percentage': percentage,
            'results': results,
            'feedback': feedback
        })
        
    except Exception as e:
        print(f"Error evaluating quiz: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz-focus-areas', methods=['GET'])
def get_focus_areas():
    """Get available quiz categories"""
    focus_areas = [
        {"id": "general", "name": "🌟 General Skin Health", "icon": "✨", "description": "Daily routines, basics, and overall wellness"},
        {"id": "acne", "name": "🔴 Acne & Breakouts", "icon": "💢", "description": "Causes, treatments, and prevention strategies"},
        {"id": "aging", "name": "⏰ Anti-Aging", "icon": "🕰️", "description": "Collagen, wrinkles, and age prevention"},
        {"id": "hydration", "name": "💧 Hydration", "icon": "💙", "description": "Moisture, barriers, and internal hydration"},
        {"id": "health", "name": "🏃‍♀️ Lifestyle & Health", "icon": "🌿", "description": "Diet, sleep, stress, and skin connection"}
    ]
    return jsonify(focus_areas)

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
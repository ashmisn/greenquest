import React, { useState } from 'react';

const questions = [
    {
        questionText: 'Which of these items is NOT recyclable?',
        answerOptions: [
            { answerText: 'Plastic Bottle', isCorrect: false },
            { answerText: 'Greasy Pizza Box', isCorrect: true },
            { answerText: 'Aluminum Can', isCorrect: false },
            { answerText: 'Newspaper', isCorrect: false },
        ],
    },
    {
        questionText: 'What does the "3 R\'s" of waste management stand for?',
        answerOptions: [
            { answerText: 'Reduce, Reuse, Recycle', isCorrect: true },
            { answerText: 'Read, Review, Repeat', isCorrect: false },
            { answerText: 'Rock, Rags, Riches', isCorrect: false },
            { answerText: 'Rethink, Refuse, Repair', isCorrect: false },
        ],
    },
    {
        questionText: 'How long does it take for a plastic bottle to decompose?',
        answerOptions: [
            { answerText: '10-20 years', isCorrect: false },
            { answerText: '50-100 years', isCorrect: false },
            { answerText: 'Over 450 years', isCorrect: true },
            { answerText: 'It never decomposes', isCorrect: false },
        ],
    },
];

const QuizGame: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerClick = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(score + 1);
        }

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            setShowScore(true);
        }
    };
    
    const restartQuiz = () => {
        setCurrentQuestion(0);
        setShowScore(false);
        setScore(0);
    }

    return (
        <div className='bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto text-center'>
            {showScore ? (
                <div>
                    <h2 className='text-3xl font-bold text-green-700 mb-4'>You scored {score} out of {questions.length}!</h2>
                    <p className='text-gray-600 mb-6'>For each correct answer, you've earned 5 bonus points!</p>
                    <p className='text-2xl font-bold text-yellow-500 mb-8'>Total: +{score * 5} Points</p>
                    <button onClick={restartQuiz} className='bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105'>
                        Play Again
                    </button>
                </div>
            ) : (
                <>
                    <div className='mb-6'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Question {currentQuestion + 1}/{questions.length}</h2>
                        <p className='text-xl text-gray-700'>{questions[currentQuestion].questionText}</p>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {questions[currentQuestion].answerOptions.map((option, index) => (
                            <button key={index} onClick={() => handleAnswerClick(option.isCorrect)} className='bg-gray-100 hover:bg-green-100 border-2 border-transparent hover:border-green-500 text-gray-800 font-semibold py-4 px-4 rounded-lg transition-all duration-300'>
                                {option.answerText}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default QuizGame;
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { expandedQuizQuestions } from '../../data/expandedQuizQuestions';
import QuizResults from './QuizResults';

function Quiz() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState(null);
  const pageSize = 5;
  const [page, setPage] = useState(0);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    const newScores = {
      Science: 0,
      Arts: 0,
      Commerce: 0,
    };

    expandedQuizQuestions.forEach((question) => {
      const selectedValue = answers[question.id];
      if (selectedValue && question.category !== 'general') {
        if (question.category === 'science') newScores.Science += selectedValue;
        if (question.category === 'arts') newScores.Arts += selectedValue;
        if (question.category === 'commerce') newScores.Commerce += selectedValue;
      }
    });

    // Save quiz results to Firestore
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "quizResults", auth.currentUser.uid), {
          userId: auth.currentUser.uid,
          scores: newScores,
          answers: answers,
          completedAt: new Date(),
          totalQuestions: expandedQuizQuestions.length,
          answeredQuestions: Object.keys(answers).length
        });
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }

    setScores(newScores);
    setShowResults(true);
  };

  const totalPages = Math.ceil(expandedQuizQuestions.length / pageSize);
  const startIdx = page * pageSize;
  const currentQuestions = expandedQuizQuestions.slice(startIdx, startIdx + pageSize);
  const answeredCount = Object.keys(answers).length;

  if (showResults) {
    return <QuizResults scores={scores} onRetake={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl shadow-xl space-y-8 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{t('quiz')}</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">Answered: {answeredCount}/{expandedQuizQuestions.length}</div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${((page + 1) / totalPages) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Page {page + 1} of {totalPages}</div>
        </div>

        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          {currentQuestions.map((question, idx) => (
            <div key={question.id} className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">{startIdx + idx + 1}</div>
                <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">{question.question}</p>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((option) => (
                  <label key={option.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[question.id] === option.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-800'}`}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.value}
                      onChange={() => handleAnswerChange(question.id, option.value)}
                      checked={answers[question.id] === option.value}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-800 dark:text-gray-200">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              Prev
            </button>

            {page < totalPages - 1 ? (
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Quiz;

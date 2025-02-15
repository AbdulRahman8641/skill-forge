import { useState } from "react";
import { db, auth } from "../utils/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const sampleQuestions = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "Hyper Transfer Markup Language", "High Tech Markup Language"],
    answer: "Hyper Text Markup Language"
  },
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n^2)"],
    answer: "O(log n)"
  },
  {
    question: "Which programming language is used for Android development?",
    options: ["Python", "Java", "C++"],
    answer: "Java"
  }
];

export default function Assessment() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionIndex, selectedOption) => {
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const handleSubmit = async () => {
    let correctAnswers = 0;
    sampleQuestions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctAnswers++;
      }
    });

    const finalScore = (correctAnswers / sampleQuestions.length) * 100;
    setScore(finalScore);
    setSubmitted(true);

    // ✅ Save result to Firestore
    const user = auth.currentUser;
    if (user) {
      const resultRef = doc(db, "results", user.uid);
      await setDoc(resultRef, { uid: user.uid, score: finalScore, date: new Date() });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Skill Assessment</h1>
      {sampleQuestions.map((q, index) => (
        <div key={index} className="mt-4">
          <p className="font-semibold">{q.question}</p>
          {q.options.map((option) => (
            <div key={option}>
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                onChange={() => handleSelect(index, option)}
              />
              <label className="ml-2">{option}</label>
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
      {submitted && (
        <p className="mt-4 text-lg font-semibold">
          Your Score: {score}%
        </p>
      )}
    </div>
  );
}

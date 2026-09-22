import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

const QuestionCard = ({
  question,
  index,
  selectedAnswer,
  onSelectOption,
  onDeleteQuestion,
  onEditQuestion,
  isInteractive = false,
  shuffledOptions = null
}) => {
  const { role } = useContext(AuthContext);
  const isStaff = role === 'ADMIN' || role === 'EDUCATOR';

  const options = shuffledOptions || [
    { label: 'A', text: question.optionA, value: 'A' },
    { label: 'B', text: question.optionB, value: 'B' },
    { label: 'C', text: question.optionC, value: 'C' },
    { label: 'D', text: question.optionD, value: 'D' }
  ];

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-num">Question {index + 1}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-role">{question.marks || 1} {question.marks === 1 ? 'Mark' : 'Marks'}</span>
          {isStaff && (
            <span className="badge badge-easy">{question.questionType || 'MCQ'}</span>
          )}
          {isStaff && onDeleteQuestion && (
            <Button variant="danger" size="sm" onClick={() => onDeleteQuestion(question.id)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="question-text">
        {question.questionText}
      </div>

      <div className="options-grid">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.value;
          const isCorrect = isStaff && question.correctAnswer === opt.value;

          let itemClass = 'option-item';
          if (isSelected) itemClass += ' selected';
          if (isCorrect) itemClass += ' correct';

          return (
            <label
              key={opt.label}
              className={itemClass}
              onClick={() => isInteractive && onSelectOption && onSelectOption(question.id, opt.value)}
            >
              <input
                type="radio"
                name={`question_${question.id}`}
                value={opt.value}
                checked={isSelected}
                onChange={() => isInteractive && onSelectOption && onSelectOption(question.id, opt.value)}
                className="option-radio"
                disabled={!isInteractive}
              />
              <span><strong>{opt.label}.</strong> {opt.text}</span>
            </label>
          );
        })}
      </div>

      {/* IMPORTANT: Only show correct answer badge if user is ADMIN or EDUCATOR */}
      {isStaff && question.correctAnswer && (
        <div className="correct-badge">
          ✅ Correct Answer: Option {question.correctAnswer}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;

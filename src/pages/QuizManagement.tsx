import { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import type { Quiz, QuizQuestion, QuestionType, ContinuingEducationClass, QuizAttempt, CEAttendance } from '../types';
import { BookOpen, Plus, Trash2, Edit, Save, Play, Award, Check, X, Copy, GraduationCap } from 'lucide-react';
import HelpIcon from '../components/HelpIcon';

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice', description: 'Single answer from options' },
  { value: 'multi_select', label: 'Multi-Select', description: 'Multiple answers allowed (NCLEX-style)' },
  { value: 'true_false', label: 'True/False', description: 'Binary choice question' },
  { value: 'fill_blank', label: 'Fill in the Blank', description: 'Text answer required' },
  { value: 'matching', label: 'Matching', description: 'Match items (future feature)' },
];

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const generateCertificateNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CE-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

const QuizManagement = () => {
  const { state, updateState, addAuditEvent } = useApp();
  
  // View state
  const [activeTab, setActiveTab] = useState<'quizzes' | 'ce_classes' | 'results'>('quizzes');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCEModal, setShowCEModal] = useState(false);
  const [showTakeQuiz, setShowTakeQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingCE, setEditingCE] = useState<ContinuingEducationClass | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizProgramId, setQuizProgramId] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [allowRetakes, setAllowRetakes] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Question form state
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [questionOptions, setQuestionOptions] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [questionWeight, setQuestionWeight] = useState(1);
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [questionCategory, setQuestionCategory] = useState('');
  
  // CE Class form state
  const [ceTitle, setCETitle] = useState('');
  const [ceDescription, setCEDescription] = useState('');
  const [ceProgramId, setCEProgramId] = useState('');
  const [ceHours, setCEHours] = useState(1);
  const [ceInstructor, setCEInstructor] = useState('');
  const [ceDate, setCEDate] = useState('');
  const [ceDuration, setCEDuration] = useState(60);
  const [ceQuizId, setCEQuizId] = useState('');
  
  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [quizStartTime, setQuizStartTime] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  const canManage = currentUser?.role === 'Instructor' || currentUser?.role === 'Coordinator' || currentUser?.role === 'ProgramAdmin';

  const activeQuizzes = useMemo(() => 
    state.quizzes.filter(q => q.isActive).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [state.quizzes]
  );

  const activeCEClasses = useMemo(() =>
    state.ceClasses.filter(c => c.isActive).sort((a, b) => b.date.localeCompare(a.date)),
    [state.ceClasses]
  );

  const myAttempts = useMemo(() =>
    state.quizAttempts.filter(a => a.studentId === state.activeProfileId),
    [state.quizAttempts, state.activeProfileId]
  );

  const myCEAttendances = useMemo(() =>
    state.ceAttendances.filter(a => a.studentId === state.activeProfileId),
    [state.ceAttendances, state.activeProfileId]
  );

  // Reset functions
  const resetQuizForm = () => {
    setQuizTitle(''); setQuizDescription(''); setQuizProgramId('');
    setPassingScore(70); setTimeLimit(''); setAllowRetakes(true);
    setShuffleQuestions(true); setShuffleOptions(true); setQuestions([]);
    setEditingQuiz(null);
  };

  const resetQuestionForm = () => {
    setQuestionText(''); setQuestionType('multiple_choice'); setQuestionOptions('');
    setCorrectAnswer(''); setCorrectAnswers([]); setQuestionWeight(1);
    setQuestionExplanation(''); setQuestionCategory(''); setEditingQuestion(null);
  };

  const resetCEForm = () => {
    setCETitle(''); setCEDescription(''); setCEProgramId(''); setCEHours(1);
    setCEInstructor(''); setCEDate(''); setCEDuration(60); setCEQuizId('');
    setEditingCE(null);
  };

  // Quiz CRUD
  const openQuizModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizTitle(quiz.title);
      setQuizDescription(quiz.description || '');
      setQuizProgramId(quiz.programId || '');
      setPassingScore(quiz.passingScore);
      setTimeLimit(quiz.timeLimit || '');
      setAllowRetakes(quiz.allowRetakes);
      setShuffleQuestions(quiz.shuffleQuestions);
      setShuffleOptions(quiz.shuffleOptions);
      setQuestions([...quiz.questions]);
    } else {
      resetQuizForm();
    }
    setShowQuizModal(true);
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) return;
    
    const options = questionType !== 'true_false' && questionType !== 'fill_blank'
      ? questionOptions.split('\n').filter(o => o.trim())
      : questionType === 'true_false' ? ['True', 'False'] : undefined;

    const newQuestion: QuizQuestion = {
      id: editingQuestion?.id || genId('q'),
      type: questionType,
      text: questionText.trim(),
      options,
      correctAnswer: questionType === 'multi_select' ? correctAnswers : correctAnswer,
      explanation: questionExplanation.trim() || undefined,
      weight: questionWeight,
      category: questionCategory.trim() || undefined,
    };

    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? newQuestion : q));
    } else {
      setQuestions([...questions, newQuestion]);
    }
    resetQuestionForm();
  };

  const startEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionText(question.text);
    setQuestionType(question.type);
    setQuestionOptions(question.options?.join('\n') || '');
    setCorrectAnswer(Array.isArray(question.correctAnswer) ? '' : question.correctAnswer);
    setCorrectAnswers(Array.isArray(question.correctAnswer) ? question.correctAnswer : []);
    setQuestionWeight(question.weight);
    setQuestionExplanation(question.explanation || '');
    setQuestionCategory(question.category || '');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveQuiz = () => {
    if (!quizTitle.trim() || questions.length === 0) {
      alert('Please provide a title and at least one question');
      return;
    }

    const now = new Date().toISOString();
    
    if (editingQuiz) {
      const updated: Quiz = {
        ...editingQuiz,
        title: quizTitle.trim(),
        description: quizDescription.trim() || undefined,
        programId: quizProgramId || undefined,
        passingScore,
        timeLimit: timeLimit || undefined,
        allowRetakes,
        shuffleQuestions,
        shuffleOptions,
        questions,
        updatedAt: now,
      };
      
      updateState(prev => ({
        ...prev,
        quizzes: prev.quizzes.map(q => q.id === editingQuiz.id ? updated : q),
      }));
      addAuditEvent('update_quiz', 'quiz', editingQuiz.id);
    } else {
      const newQuiz: Quiz = {
        id: genId('quiz'),
        title: quizTitle.trim(),
        description: quizDescription.trim() || undefined,
        programId: quizProgramId || undefined,
        passingScore,
        timeLimit: timeLimit || undefined,
        allowRetakes,
        shuffleQuestions,
        shuffleOptions,
        questions,
        createdBy: state.activeProfileId,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };
      
      updateState(prev => ({
        ...prev,
        quizzes: [...prev.quizzes, newQuiz],
      }));
      addAuditEvent('create_quiz', 'quiz', newQuiz.id);
    }

    setShowQuizModal(false);
    resetQuizForm();
  };

  const handleDeleteQuiz = (id: string) => {
    if (!confirm('Are you sure you want to deactivate this quiz?')) return;
    updateState(prev => ({
      ...prev,
      quizzes: prev.quizzes.map(q => q.id === id ? { ...q, isActive: false } : q),
    }));
    addAuditEvent('deactivate_quiz', 'quiz', id);
  };

  const handleDuplicateQuiz = (quiz: Quiz) => {
    const now = new Date().toISOString();
    const newQuiz: Quiz = {
      ...quiz,
      id: genId('quiz'),
      title: `${quiz.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      createdBy: state.activeProfileId,
    };
    updateState(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, newQuiz],
    }));
    addAuditEvent('duplicate_quiz', 'quiz', newQuiz.id);
  };

  // CE Class CRUD
  const openCEModal = (ce?: ContinuingEducationClass) => {
    if (ce) {
      setEditingCE(ce);
      setCETitle(ce.title);
      setCEDescription(ce.description || '');
      setCEProgramId(ce.programId || '');
      setCEHours(ce.ceHours);
      setCEInstructor(ce.instructor);
      setCEDate(ce.date);
      setCEDuration(ce.duration);
      setCEQuizId(ce.quizId || '');
    } else {
      resetCEForm();
    }
    setShowCEModal(true);
  };

  const handleSaveCE = () => {
    if (!ceTitle.trim() || !ceInstructor.trim() || !ceDate) {
      alert('Please fill all required fields');
      return;
    }

    const now = new Date().toISOString();
    
    if (editingCE) {
      const updated: ContinuingEducationClass = {
        ...editingCE,
        title: ceTitle.trim(),
        description: ceDescription.trim() || undefined,
        programId: ceProgramId || undefined,
        ceHours,
        instructor: ceInstructor.trim(),
        date: ceDate,
        duration: ceDuration,
        quizId: ceQuizId || undefined,
      };
      
      updateState(prev => ({
        ...prev,
        ceClasses: prev.ceClasses.map(c => c.id === editingCE.id ? updated : c),
      }));
      addAuditEvent('update_ce_class', 'ceClass', editingCE.id);
    } else {
      const newCE: ContinuingEducationClass = {
        id: genId('ce'),
        title: ceTitle.trim(),
        description: ceDescription.trim() || undefined,
        programId: ceProgramId || undefined,
        ceHours,
        instructor: ceInstructor.trim(),
        date: ceDate,
        duration: ceDuration,
        quizId: ceQuizId || undefined,
        createdBy: state.activeProfileId,
        createdAt: now,
        isActive: true,
      };
      
      updateState(prev => ({
        ...prev,
        ceClasses: [...prev.ceClasses, newCE],
      }));
      addAuditEvent('create_ce_class', 'ceClass', newCE.id);
    }

    setShowCEModal(false);
    resetCEForm();
  };

  // Quiz taking
  const startQuiz = (quiz: Quiz) => {
    // Check if already attempted and retakes not allowed
    const existingAttempt = myAttempts.find(a => a.quizId === quiz.id && a.completedAt);
    if (existingAttempt && !quiz.allowRetakes) {
      alert('You have already completed this quiz and retakes are not allowed.');
      return;
    }

    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setQuizStartTime(new Date().toISOString());
    setShowResults(false);
    setShowTakeQuiz(true);
  };

  const handleQuizAnswer = (questionId: string, answer: string | string[]) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = () => {
    if (!selectedQuiz) return;

    // Calculate score
    let correctCount = 0;
    let totalWeight = 0;
    
    for (const question of selectedQuiz.questions) {
      totalWeight += question.weight;
      const userAnswer = quizAnswers[question.id];
      
      if (question.type === 'multi_select') {
        const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
        const user = Array.isArray(userAnswer) ? userAnswer : [];
        if (correct.length === user.length && correct.every(a => user.includes(a))) {
          correctCount += question.weight;
        }
      } else {
        if (userAnswer === question.correctAnswer) {
          correctCount += question.weight;
        }
      }
    }

    const score = Math.round((correctCount / totalWeight) * 100);
    const passed = score >= selectedQuiz.passingScore;

    // Save attempt
    const attempt: QuizAttempt = {
      id: genId('attempt'),
      quizId: selectedQuiz.id,
      studentId: state.activeProfileId,
      answers: quizAnswers,
      score,
      passed,
      startedAt: quizStartTime,
      completedAt: new Date().toISOString(),
    };

    updateState(prev => ({
      ...prev,
      quizAttempts: [...prev.quizAttempts, attempt],
    }));
    addAuditEvent('complete_quiz', 'quizAttempt', attempt.id);

    setQuizScore(score);
    setShowResults(true);
  };

  // CE Attendance
  const recordAttendance = (ceClass: ContinuingEducationClass) => {
    const existingAttendance = myCEAttendances.find(a => a.classId === ceClass.id);
    if (existingAttendance) {
      alert('You have already recorded attendance for this class.');
      return;
    }

    // If quiz required, check if passed
    if (ceClass.quizId) {
      const quizPassed = myAttempts.some(a => a.quizId === ceClass.quizId && a.passed);
      if (!quizPassed) {
        alert('You must pass the associated quiz before receiving CE credit.');
        return;
      }
    }

    const attendance: CEAttendance = {
      id: genId('cea'),
      classId: ceClass.id,
      studentId: state.activeProfileId,
      attendedAt: new Date().toISOString(),
      quizPassed: ceClass.quizId ? true : undefined,
      certificateNumber: generateCertificateNumber(),
      verificationCode: generateVerificationCode(),
    };

    updateState(prev => ({
      ...prev,
      ceAttendances: [...prev.ceAttendances, attendance],
    }));
    addAuditEvent('record_ce_attendance', 'ceAttendance', attendance.id);
    
    alert(`CE Credit recorded! Certificate #: ${attendance.certificateNumber}\nVerification Code: ${attendance.verificationCode}`);
  };

  const programName = (pid: string) => state.programs.find(p => p.id === pid)?.name ?? 'General';

  if (!canManage && !isStudent) {
    return (
      <div className="max-w-6xl mx-auto pb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mt-8">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">This page is for instructors, coordinators, and students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary-500" /> 
            {canManage ? 'Quiz & CE Management' : 'Quizzes & Continuing Education'}
            <HelpIcon
              title="Quizzes & CE"
              content={
                <div className="space-y-2">
                  <p><strong>Quizzes:</strong> NCLEX/NREMT-style questions with multiple choice, multi-select, true/false options.</p>
                  <p><strong>Weighted Questions:</strong> Assign different point values to questions.</p>
                  <p><strong>CE Classes:</strong> Track continuing education hours with certificates and verification codes.</p>
                  <p><strong>Results:</strong> View your quiz attempts and CE certificates.</p>
                </div>
              }
            />
          </h1>
          <p className="text-gray-600 mt-1">
            {canManage ? 'Create quizzes and manage continuing education' : 'Take quizzes and earn CE hours'}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => openQuizModal()}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> New Quiz
            </button>
            <button
              onClick={() => openCEModal()}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-colors text-sm"
            >
              <GraduationCap className="w-4 h-4" /> New CE Class
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['quizzes', 'ce_classes', 'results'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
              activeTab === tab
                ? 'bg-primary-600 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {tab === 'quizzes' && <BookOpen className="w-4 h-4" />}
            {tab === 'ce_classes' && <GraduationCap className="w-4 h-4" />}
            {tab === 'results' && <Award className="w-4 h-4" />}
            {tab === 'quizzes' ? 'Quizzes' : tab === 'ce_classes' ? 'CE Classes' : 'My Results'}
          </button>
        ))}
      </div>

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {activeQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Quizzes Available</h3>
              <p className="text-gray-500">
                {canManage ? 'Create your first quiz to get started.' : 'No quizzes have been created yet.'}
              </p>
            </div>
          ) : (
            activeQuizzes.map(quiz => {
              const myBestAttempt = myAttempts
                .filter(a => a.quizId === quiz.id && a.completedAt)
                .sort((a, b) => b.score - a.score)[0];

              return (
                <div key={quiz.id} className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                        <span>{quiz.questions.length} questions</span>
                        <span>•</span>
                        <span>Pass: {quiz.passingScore}%</span>
                        {quiz.timeLimit && (
                          <>
                            <span>•</span>
                            <span>{quiz.timeLimit} min</span>
                          </>
                        )}
                        {quiz.programId && (
                          <>
                            <span>•</span>
                            <span>{programName(quiz.programId)}</span>
                          </>
                        )}
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
                      )}
                      {myBestAttempt && (
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          myBestAttempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {myBestAttempt.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Best Score: {myBestAttempt.score}%
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {(isStudent || canManage) && (
                        <button
                          onClick={() => startQuiz(quiz)}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                          <Play className="w-4 h-4" /> Take Quiz
                        </button>
                      )}
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleDuplicateQuiz(quiz)}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openQuizModal(quiz)}
                            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CE Classes Tab */}
      {activeTab === 'ce_classes' && (
        <div className="space-y-4">
          {activeCEClasses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No CE Classes Available</h3>
              <p className="text-gray-500">
                {canManage ? 'Create a continuing education class to award CE hours.' : 'No CE classes have been scheduled.'}
              </p>
            </div>
          ) : (
            activeCEClasses.map(ce => {
              const myAttendance = myCEAttendances.find(a => a.classId === ce.id);
              const linkedQuiz = ce.quizId ? activeQuizzes.find(q => q.id === ce.quizId) : null;
              const quizPassed = linkedQuiz ? myAttempts.some(a => a.quizId === linkedQuiz.id && a.passed) : true;

              return (
                <div key={ce.id} className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{ce.title}</h3>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {ce.ceHours} CE {ce.ceHours === 1 ? 'Hour' : 'Hours'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                        <span>Instructor: {ce.instructor}</span>
                        <span>•</span>
                        <span>{new Date(ce.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{ce.duration} min</span>
                      </div>
                      {ce.description && (
                        <p className="text-sm text-gray-600 mt-2">{ce.description}</p>
                      )}
                      {linkedQuiz && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Required Quiz: </span>
                          <span className={quizPassed ? 'text-green-600' : 'text-orange-600'}>
                            {linkedQuiz.title} {quizPassed ? '✓ Passed' : '(Not completed)'}
                          </span>
                        </div>
                      )}
                      {myAttendance && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800">
                            <Award className="w-4 h-4 inline mr-1" />
                            Certificate #{myAttendance.certificateNumber}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Verification: {myAttendance.verificationCode}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {isStudent && !myAttendance && (
                        <button
                          onClick={() => recordAttendance(ce)}
                          disabled={!!(linkedQuiz && !quizPassed)}
                          className={`flex items-center gap-1 font-medium py-2 px-3 rounded-lg transition-colors text-sm ${
                            linkedQuiz && !quizPassed
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                          title={linkedQuiz && !quizPassed ? 'Complete the quiz first' : 'Record Attendance'}
                        >
                          <Award className="w-4 h-4" /> Get Certificate
                        </button>
                      )}
                      {canManage && (
                        <>
                          <button
                            onClick={() => openCEModal(ce)}
                            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (!confirm('Are you sure?')) return;
                              updateState(prev => ({
                                ...prev,
                                ceClasses: prev.ceClasses.map(c => c.id === ce.id ? { ...c, isActive: false } : c),
                              }));
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Quiz Attempts */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" /> Quiz Attempts
            </h3>
            {myAttempts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p className="text-gray-500">No quiz attempts yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAttempts.filter(a => a.completedAt).sort((a, b) => b.completedAt!.localeCompare(a.completedAt!)).map(attempt => {
                  const quiz = activeQuizzes.find(q => q.id === attempt.quizId);
                  return (
                    <div key={attempt.id} className="bg-white rounded-xl shadow p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{quiz?.title || 'Unknown Quiz'}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(attempt.completedAt!).toLocaleString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {attempt.score}% {attempt.passed ? '✓ Passed' : '✗ Failed'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CE Certificates */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-500" /> CE Certificates
            </h3>
            {myCEAttendances.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p className="text-gray-500">No CE certificates yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myCEAttendances.map(attendance => {
                  const ce = activeCEClasses.find(c => c.id === attendance.classId);
                  return (
                    <div key={attendance.id} className="bg-white rounded-xl shadow p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{ce?.title || 'Unknown Class'}</h4>
                          <p className="text-sm text-gray-500">
                            Certificate #: {attendance.certificateNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            Verification: {attendance.verificationCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-semibold">
                            {ce?.ceHours || 0} CE Hours
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(attendance.attendedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingQuiz ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={e => setQuizTitle(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Cardiac Assessment Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={quizDescription}
                    onChange={e => setQuizDescription(e.target.value)}
                    className={inputClass}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      value={quizProgramId}
                      onChange={e => setQuizProgramId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">All Programs</option>
                      {state.programs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={passingScore}
                      onChange={e => setPassingScore(parseInt(e.target.value) || 70)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (min)</label>
                    <input
                      type="number"
                      min={0}
                      value={timeLimit}
                      onChange={e => setTimeLimit(e.target.value ? parseInt(e.target.value) : '')}
                      className={inputClass}
                      placeholder="No limit"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={allowRetakes}
                      onChange={e => setAllowRetakes(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Allow Retakes</span>
                  </label>
                  <label className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={e => setShuffleQuestions(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Shuffle Questions</span>
                  </label>
                </div>
              </div>

              {/* Questions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions ({questions.length})</h3>
                
                {/* Existing Questions */}
                <div className="space-y-2 mb-4">
                  {questions.map((q, index) => (
                    <div key={q.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm font-medium text-gray-500 mt-0.5">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{q.text}</p>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          <span>{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                          <span>•</span>
                          <span>{q.weight} pt{q.weight !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add/Edit Question Form */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">
                    {editingQuestion ? 'Edit Question' : 'Add Question'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Question Text *</label>
                      <textarea
                        value={questionText}
                        onChange={e => setQuestionText(e.target.value)}
                        className={inputClass}
                        rows={2}
                        placeholder="Enter the question..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                        <select
                          value={questionType}
                          onChange={e => setQuestionType(e.target.value as QuestionType)}
                          className={inputClass}
                        >
                          {QUESTION_TYPES.filter(t => t.value !== 'matching').map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                        <input
                          type="number"
                          min={1}
                          value={questionWeight}
                          onChange={e => setQuestionWeight(parseInt(e.target.value) || 1)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {(questionType === 'multiple_choice' || questionType === 'multi_select') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Options (one per line) *
                        </label>
                        <textarea
                          value={questionOptions}
                          onChange={e => setQuestionOptions(e.target.value)}
                          className={inputClass}
                          rows={4}
                          placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                        />
                      </div>
                    )}

                    {questionType === 'multi_select' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Correct Answers (select all that apply) *
                        </label>
                        <div className="space-y-1">
                          {questionOptions.split('\n').filter(o => o.trim()).map((opt, i) => (
                            <label key={i} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={correctAnswers.includes(opt.trim())}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setCorrectAnswers([...correctAnswers, opt.trim()]);
                                  } else {
                                    setCorrectAnswers(correctAnswers.filter(a => a !== opt.trim()));
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{opt.trim()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Correct Answer *
                        </label>
                        {questionType === 'true_false' ? (
                          <select
                            value={correctAnswer}
                            onChange={e => setCorrectAnswer(e.target.value)}
                            className={inputClass}
                          >
                            <option value="">Select...</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        ) : questionType === 'multiple_choice' ? (
                          <select
                            value={correctAnswer}
                            onChange={e => setCorrectAnswer(e.target.value)}
                            className={inputClass}
                          >
                            <option value="">Select correct answer...</option>
                            {questionOptions.split('\n').filter(o => o.trim()).map((opt, i) => (
                              <option key={i} value={opt.trim()}>{opt.trim()}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={correctAnswer}
                            onChange={e => setCorrectAnswer(e.target.value)}
                            className={inputClass}
                            placeholder="Enter the correct answer"
                          />
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                      <textarea
                        value={questionExplanation}
                        onChange={e => setQuestionExplanation(e.target.value)}
                        className={inputClass}
                        rows={2}
                        placeholder="Explanation shown after answering..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      {editingQuestion && (
                        <button
                          onClick={resetQuestionForm}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleAddQuestion}
                        disabled={!questionText.trim() || (questionType !== 'fill_blank' && !correctAnswer && correctAnswers.length === 0)}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
                      >
                        {editingQuestion ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingQuestion ? 'Update' : 'Add Question'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowQuizModal(false); resetQuizForm(); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuiz}
                  disabled={!quizTitle.trim() || questions.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  <Save className="w-5 h-5" /> Save Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CE Class Modal */}
      {showCEModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {editingCE ? 'Edit CE Class' : 'Create CE Class'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={ceTitle}
                  onChange={e => setCETitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Advanced Cardiac Life Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={ceDescription}
                  onChange={e => setCEDescription(e.target.value)}
                  className={inputClass}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CE Hours *</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={ceHours}
                    onChange={e => setCEHours(parseFloat(e.target.value) || 1)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
                  <input
                    type="number"
                    min={15}
                    value={ceDuration}
                    onChange={e => setCEDuration(parseInt(e.target.value) || 60)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor *</label>
                <input
                  type="text"
                  value={ceInstructor}
                  onChange={e => setCEInstructor(e.target.value)}
                  className={inputClass}
                  placeholder="Instructor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={ceDate}
                  onChange={e => setCEDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Quiz (optional)</label>
                <select
                  value={ceQuizId}
                  onChange={e => setCEQuizId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No quiz required</option>
                  {activeQuizzes.map(q => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowCEModal(false); resetCEForm(); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCE}
                  disabled={!ceTitle.trim() || !ceInstructor.trim() || !ceDate}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  <Save className="w-5 h-5" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Take Quiz Modal */}
      {showTakeQuiz && selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!showResults ? (
              <>
                <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedQuiz.title}</h2>
                      <p className="text-sm opacity-90">
                        Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTakeQuiz(false)}
                      className="p-2 hover:bg-white/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {(() => {
                    const question = selectedQuiz.questions[currentQuestionIndex];
                    const userAnswer = quizAnswers[question.id];

                    return (
                      <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-900">{question.text}</p>

                        {question.type === 'true_false' && (
                          <div className="space-y-2">
                            {['True', 'False'].map(opt => (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  userAnswer === opt ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  checked={userAnswer === opt}
                                  onChange={() => handleQuizAnswer(question.id, opt)}
                                  className="w-5 h-5"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options?.map((opt, i) => (
                              <label
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  userAnswer === opt ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  checked={userAnswer === opt}
                                  onChange={() => handleQuizAnswer(question.id, opt)}
                                  className="w-5 h-5"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'multi_select' && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500 mb-2">Select all that apply:</p>
                            {question.options?.map((opt, i) => {
                              const selected = Array.isArray(userAnswer) && userAnswer.includes(opt);
                              return (
                                <label
                                  key={i}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={e => {
                                      const current = Array.isArray(userAnswer) ? userAnswer : [];
                                      if (e.target.checked) {
                                        handleQuizAnswer(question.id, [...current, opt]);
                                      } else {
                                        handleQuizAnswer(question.id, current.filter(a => a !== opt));
                                      }
                                    }}
                                    className="w-5 h-5"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {question.type === 'fill_blank' && (
                          <input
                            type="text"
                            value={(userAnswer as string) || ''}
                            onChange={e => handleQuizAnswer(question.id, e.target.value)}
                            className={inputClass}
                            placeholder="Type your answer..."
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* Navigation */}
                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <button
                      onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      ← Previous
                    </button>
                    
                    {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                      <button
                        onClick={submitQuiz}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg"
                      >
                        <Check className="w-5 h-5" /> Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIndex(i => Math.min(selectedQuiz.questions.length - 1, i + 1))}
                        className="px-4 py-2 text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`p-6 rounded-t-xl ${quizScore >= selectedQuiz.passingScore ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  <h2 className="text-2xl font-bold text-center">
                    {quizScore >= selectedQuiz.passingScore ? '🎉 Congratulations!' : '📚 Keep Studying'}
                  </h2>
                </div>
                <div className="p-6 text-center">
                  <p className="text-5xl font-bold text-gray-900 mb-2">{quizScore}%</p>
                  <p className={`text-lg font-medium ${quizScore >= selectedQuiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                    {quizScore >= selectedQuiz.passingScore ? 'You Passed!' : `Passing score: ${selectedQuiz.passingScore}%`}
                  </p>
                  <button
                    onClick={() => setShowTakeQuiz(false)}
                    className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;

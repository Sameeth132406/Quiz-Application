import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import questionService from '../services/questionService';
import attemptService from '../services/attemptService';
import authService from '../services/authService';
import userService from '../services/userService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'linear-gradient(135deg, #7c3aed, #6d28d9)',
  'linear-gradient(135deg, #059669, #047857)',
  'linear-gradient(135deg, #d97706, #b45309)',
  'linear-gradient(135deg, #dc2626, #b91c1c)',
  'linear-gradient(135deg, #0284c7, #0369a1)',
  'linear-gradient(135deg, #4f46e5, #4338ca)',
  'linear-gradient(135deg, #db2777, #be185d)',
];

const getAvatarGradient = (str) => {
  if (!str) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getInitials = (name) => {
  if (!name) return 'S';
  const parts = name.trim().split(/[\s_-]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Dashboard = () => {
  const { user, role } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesMap, setQuizzesMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assessment & Student Grouping View & Filter States
  const [viewMode, setViewMode] = useState('QUIZ_GROUPED'); // 'QUIZ_GROUPED' | 'STUDENT_GROUPED' | 'FEED'
  const [searchQuery, setSearchQuery] = useState('');
  const [integrityFilter, setIntegrityFilter] = useState('ALL'); // 'ALL' | 'CLEAN' | 'FLAGGED'
  const [sortBy, setSortBy] = useState('RECENT'); // 'RECENT' | 'SCORE_DESC' | 'SCORE_ASC' | 'ATTEMPTS_DESC' | 'NAME_ASC'
  const [expandedStudents, setExpandedStudents] = useState({});
  const [expandedQuizzes, setExpandedQuizzes] = useState({});
  const [publishingQuizId, setPublishingQuizId] = useState(null);

  const isStudent = role === 'STUDENT' || (!role && role !== 'ADMIN' && role !== 'EDUCATOR');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Resolve student's user ID reliably
      let currentUserId = user?.id;
      if (!currentUserId) {
        try {
          const me = await authService.getCurrentUser();
          if (me?.id) currentUserId = me.id;
        } catch (e) {}
      }

      // Fetch Quizzes and their actual question count
      const qList = await quizService.getQuizzes().catch(() => []);
      const qMap = {};
      if (Array.isArray(qList)) {
        await Promise.all(
          qList.map(async (q) => {
            let count = 0;
            try {
              const questions = await questionService.getStudentQuestions(q.id, false).catch(() => []);
              count = Array.isArray(questions) && questions.length > 0 ? questions.length : 0;
              if (count === 0) {
                const adminQ = await questionService.getQuestionsByQuiz(q.id).catch(() => []);
                count = Array.isArray(adminQ) ? adminQ.length : 0;
              }
            } catch (e) {}
            qMap[q.id] = {
              ...q,
              totalQuestions: count > 0 ? count : 1
            };
          })
        );
      }
      setQuizzes(Array.isArray(qList) ? qList : []);
      setQuizzesMap(qMap);

      // Fetch Users list (for ADMIN/EDUCATOR to link names and emails to attempts)
      const uMap = {};
      try {
        let uList = await userService.getAllUsers().catch(() => []);
        if (!Array.isArray(uList) || uList.length === 0) {
          uList = await authService.getAllUsers().catch(() => []);
        }
        if (Array.isArray(uList)) {
          uList.forEach((u) => {
            if (u?.id) uMap[u.id] = u;
          });
        }
      } catch (e) {
        console.warn('Could not fetch user directory', e);
      }
      setUsersMap(uMap);
      
      // For students: ONLY fetch and show this particular student's attempts
      // For staff (ADMIN/EDUCATOR): show all attempts
      const attemptsPromise = isStudent
        ? (currentUserId
            ? attemptService.getAttemptsByUser(currentUserId).catch(() => [])
            : Promise.resolve([]))
        : attemptService.getAllAttempts().catch(() => []);

      const a = await attemptsPromise;

      // If student, guarantee strict filter so no other student's data is ever shown
      const studentAttempts = isStudent && currentUserId
        ? (Array.isArray(a) ? a.filter(att => att.userId === currentUserId) : [])
        : (Array.isArray(a) ? a : []);

      setAttempts(studentAttempts);
    } catch {
      setError('Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isStudent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Strictly filter valid STUDENT attempts:
  // - Exclude any user not found in database (deleted users / orphan records)
  // - Exclude ADMIN and EDUCATOR accounts so only enrolled students are shown
  const validStudentAttempts = useMemo(() => {
    if (isStudent) return attempts;
    return attempts.filter((att) => {
      if (!att.userId) return false;
      const userObj = usersMap[att.userId];
      // User must exist in the database (excludes deleted users)
      if (!userObj) return false;
      // Must be a student (excludes ADMIN and EDUCATOR)
      return userObj.role === 'STUDENT';
    });
  }, [attempts, usersMap, isStudent]);


  // Student-specific metrics: only calculate average from published quizzes
  const studentPublishedAttempts = useMemo(() => {
    if (!isStudent) return [];
    return attempts.filter((a) => {
      const q = quizzesMap[a.quizId];
      return Boolean(a.resultsPublished || q?.resultsPublished);
    });
  }, [isStudent, attempts, quizzesMap]);

  const studentAvgScore = useMemo(() => {
    if (studentPublishedAttempts.length === 0) return '—';
    const sum = studentPublishedAttempts.reduce((acc, c) => acc + (c.score || 0), 0);
    return (sum / studentPublishedAttempts.length).toFixed(1);
  }, [studentPublishedAttempts]);

  const completedQuizzesCount = attempts.length;

  // Overall platform / student KPI metrics
  const displayAttempts = isStudent ? attempts : validStudentAttempts;

  const avgScore = displayAttempts.length > 0
    ? (displayAttempts.reduce((acc, c) => acc + (c.score || 0), 0) / displayAttempts.length).toFixed(1)
    : '—';

  const cleanAttemptsCount = displayAttempts.filter(a => !a.tabSwitches || a.tabSwitches === 0).length;
  const integrityPct = displayAttempts.length > 0 ? Math.round((cleanAttemptsCount / displayAttempts.length) * 100) : 100;

  // Group attempts by student (Strictly for ADMIN and EDUCATOR roles)
  const studentGroups = useMemo(() => {
    if (isStudent) return [];
    const groups = {};

    validStudentAttempts.forEach((att) => {
      const userObj = usersMap[att.userId];
      if (!userObj || userObj.role !== 'STUDENT') return;

      const sId = att.userId != null ? att.userId : `anonymous-${att.id}`;
      const sName = userObj?.username || userObj?.name || att.studentName || att.username || `Student #${att.userId}`;
      const sEmail = userObj?.email || att.studentEmail || att.userEmail || '';
      const sRole = userObj?.role || 'STUDENT';

      if (!groups[sId]) {
        groups[sId] = {
          userId: sId,
          rawUserId: att.userId,
          name: sName,
          email: sEmail,
          role: sRole,
          attempts: [],
          totalScore: 0,
          totalQuestionsCount: 0,
          cleanCount: 0,
          flaggedCount: 0,
          totalSwitches: 0,
          lastAttemptTime: 0,
        };
      }

      if (!groups[sId].email && sEmail) {
        groups[sId].email = sEmail;
      }
      if (groups[sId].name.startsWith('Student #') && sName && !sName.startsWith('Student #')) {
        groups[sId].name = sName;
      }

      const quiz = quizzesMap[att.quizId];
      const totalQ = quiz?.totalQuestions || 1;
      const score = att.score || 0;
      const switches = att.tabSwitches || 0;
      const compDate = att.completedAt ? new Date(att.completedAt) : (att.startedAt ? new Date(att.startedAt) : null);
      const timeMs = compDate ? compDate.getTime() : 0;

      if (timeMs > groups[sId].lastAttemptTime) {
        groups[sId].lastAttemptTime = timeMs;
      }

      groups[sId].totalScore += score;
      groups[sId].totalQuestionsCount += totalQ;
      groups[sId].totalSwitches += switches;
      if (switches === 0) {
        groups[sId].cleanCount += 1;
      } else {
        groups[sId].flaggedCount += 1;
      }

      groups[sId].attempts.push({
        ...att,
        quizTitle: quiz?.title || `Quiz #${att.quizId}`,
        quizCategory: quiz?.category || 'Assessment',
        totalQuestions: totalQ,
        score,
        tabSwitches: switches,
        percentage: totalQ > 0 ? Math.round((score / totalQ) * 100) : 0,
        completedDate: compDate,
      });
    });

    return Object.values(groups).map((s) => {
      const count = s.attempts.length;
      const avgStudentScore = count > 0 ? (s.totalScore / count).toFixed(1) : '0';
      const avgPct = s.totalQuestionsCount > 0 ? Math.round((s.totalScore / s.totalQuestionsCount) * 100) : 0;
      const integrityRate = count > 0 ? Math.round((s.cleanCount / count) * 100) : 100;
      const maxScore = Math.max(...s.attempts.map((a) => a.score), 0);
      const maxTotal = Math.max(...s.attempts.map((a) => a.totalQuestions), 1);

      // Sort attempts within student by most recent first
      const sortedAttempts = [...s.attempts].sort((a, b) => {
        const timeA = a.completedDate ? a.completedDate.getTime() : 0;
        const timeB = b.completedDate ? b.completedDate.getTime() : 0;
        return timeB - timeA;
      });

      return {
        ...s,
        attempts: sortedAttempts,
        attemptsCount: count,
        avgScore: avgStudentScore,
        avgPercentage: avgPct,
        integrityRate,
        maxScore,
        maxTotal,
      };
    });
  }, [validStudentAttempts, usersMap, quizzesMap, isStudent]);

  // Filtering & Sorting of Student Groups
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...studentGroups];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesQuiz = s.attempts.some((a) => a.quizTitle.toLowerCase().includes(q));
        return matchesName || matchesEmail || matchesQuiz;
      });
    }

    if (integrityFilter === 'CLEAN') {
      result = result.filter((s) => s.totalSwitches === 0);
    } else if (integrityFilter === 'FLAGGED') {
      result = result.filter((s) => s.totalSwitches > 0);
    }

    result.sort((a, b) => {
      if (sortBy === 'RECENT') return b.lastAttemptTime - a.lastAttemptTime;
      if (sortBy === 'SCORE_DESC') return b.avgPercentage - a.avgPercentage;
      if (sortBy === 'SCORE_ASC') return a.avgPercentage - b.avgPercentage;
      if (sortBy === 'ATTEMPTS_DESC') return b.attemptsCount - a.attemptsCount;
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [studentGroups, searchQuery, integrityFilter, sortBy]);

  // Expand / Collapse controls
  const toggleStudent = (sId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [sId]: !prev[sId],
    }));
  };

  const isExpanded = (sId) => {
    // Default collapsed so user sees clean list; expands when arrow clicked
    return Boolean(expandedStudents[sId]);
  };

  const expandAll = () => {
    const map = {};
    studentGroups.forEach((s) => {
      map[s.userId] = true;
    });
    setExpandedStudents(map);
  };

  const collapseAll = () => {
    setExpandedStudents({});
  };

  // Central Result Publication Function for a Quiz Title
  const handleTogglePublishResults = async (quizId, currentStatus) => {
    setPublishingQuizId(quizId);
    try {
      const nextStatus = !currentStatus;
      await quizService.publishResults(quizId, nextStatus);

      // Update local quizzes state immediately
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizId ? { ...q, resultsPublished: nextStatus } : q))
      );
      setQuizzesMap((prev) => ({
        ...prev,
        [quizId]: {
          ...prev[quizId],
          resultsPublished: nextStatus,
        },
      }));
      setAttempts((prev) =>
        prev.map((a) => (a.quizId === quizId ? { ...a, resultsPublished: nextStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update result publication status', err);
      alert('Failed to update result publication status.');
    } finally {
      setPublishingQuizId(null);
    }
  };

  // Group all tests by Quiz Assessment (Whole Quiz Title Grouping)
  const quizGroups = useMemo(() => {
    if (isStudent) return [];

    return quizzes.map((q) => {
      const qAttempts = validStudentAttempts
        .filter((a) => a.quizId === q.id)
        .map((att) => {
          const userObj = usersMap[att.userId];
          const sName =
            att.studentName ||
            att.username ||
            userObj?.username ||
            userObj?.name ||
            (att.userId ? `Student #${att.userId}` : 'Learner');
          const sEmail = att.studentEmail || att.userEmail || userObj?.email || '';
          const totalQ = quizzesMap[q.id]?.totalQuestions || 1;
          const score = att.score;
          const pct = totalQ > 0 && score != null ? Math.round((score / totalQ) * 100) : 0;
          const switches = att.tabSwitches || 0;
          const compDate = att.completedAt ? new Date(att.completedAt) : att.startedAt ? new Date(att.startedAt) : null;

          return {
            ...att,
            studentName: sName,
            studentEmail: sEmail,
            totalQuestions: totalQ,
            score,
            percentage: pct,
            isPass: pct >= 50,
            tabSwitches: switches,
            completedDate: compDate,
          };
        })
        .sort((a, b) => {
          const tA = a.completedDate ? a.completedDate.getTime() : 0;
          const tB = b.completedDate ? b.completedDate.getTime() : 0;
          return tB - tA;
        });

      const count = qAttempts.length;
      const totalScore = qAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalPossible = count * (quizzesMap[q.id]?.totalQuestions || 1);
      const avgScore = count > 0 ? (totalScore / count).toFixed(1) : '0';
      const avgPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      const passedCount = qAttempts.filter((a) => a.isPass).length;
      const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;
      const cleanAttempts = qAttempts.filter((a) => a.tabSwitches === 0).length;
      const integrityRate = count > 0 ? Math.round((cleanAttempts / count) * 100) : 100;
      const isPublished = Boolean(q.resultsPublished || quizzesMap[q.id]?.resultsPublished);

      return {
        quiz: q,
        quizId: q.id,
        quizTitle: q.title,
        category: q.category || 'General',
        difficulty: q.difficulty || 'MEDIUM',
        duration: q.duration || 15,
        totalQuestions: quizzesMap[q.id]?.totalQuestions || 1,
        attempts: qAttempts,
        attemptsCount: count,
        avgScore,
        avgPercentage,
        passRate,
        integrityRate,
        cleanAttempts,
        isPublished,
      };
    });
  }, [quizzes, validStudentAttempts, quizzesMap, usersMap, isStudent]);

  // Quiz Grouping Filtering
  const filteredQuizGroups = useMemo(() => {
    let result = [...quizGroups];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((g) => {
        const matchesTitle = g.quizTitle.toLowerCase().includes(q);
        const matchesCategory = g.category.toLowerCase().includes(q);
        const matchesStudent = g.attempts.some(
          (a) => a.studentName.toLowerCase().includes(q) || a.studentEmail.toLowerCase().includes(q)
        );
        return matchesTitle || matchesCategory || matchesStudent;
      });
    }

    if (integrityFilter === 'CLEAN') {
      result = result.filter((g) => g.integrityRate === 100);
    } else if (integrityFilter === 'FLAGGED') {
      result = result.filter((g) => g.integrityRate < 100);
    }

    return result;
  }, [quizGroups, searchQuery, integrityFilter]);

  const toggleQuiz = (qId) => {
    setExpandedQuizzes((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const isQuizExpanded = (qId) => {
    // Default collapsed so dashboard is compact; extends only when arrow clicked
    return Boolean(expandedQuizzes[qId]);
  };

  const expandAllQuizzes = () => {
    const map = {};
    quizGroups.forEach((g) => {
      map[g.quizId] = true;
    });
    setExpandedQuizzes(map);
  };

  const collapseAllQuizzes = () => {
    setExpandedQuizzes({});
  };

  const actions = [
    { icon: '📚', title: 'Browse Quizzes', desc: 'Explore available assessments', to: '/quizzes', color: '#dc2626' },
    {
      icon: '📊',
      title: (role === 'ADMIN' || role === 'EDUCATOR') ? 'View Analytics' : 'My Analytics',
      desc: (role === 'ADMIN' || role === 'EDUCATOR') ? 'View platform performance & history' : 'View your performance & history',
      to: '/analytics',
      color: '#d97706'
    },
    ...(role === 'ADMIN' || role === 'EDUCATOR'
      ? [{ icon: '➕', title: 'Create Quiz', desc: 'Build a new assessment', to: '/add-quiz', color: '#16a34a' }]
      : []),
    ...(role === 'ADMIN'
      ? [{ icon: '👥', title: 'User Management', desc: 'Manage user accounts', to: '/admin/users', color: '#7c3aed' }]
      : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        borderRadius: '12px',
        padding: '1.4rem 1.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.15)',
      }}>
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>
            Welcome back, {user?.username || 'Learner'} 👋
          </div>
          <div style={{ color: '#bfdbfe', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Logged in as <strong style={{ color: '#ffffff' }}>{role || 'STUDENT'}</strong>
            {isStudent && <span style={{ marginLeft: '0.5rem', opacity: 0.9 }}>• Viewing Individual Student Workspace</span>}
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '46px', height: '46px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {role === 'ADMIN' ? '🛡️' : role === 'EDUCATOR' ? '🎓' : '👤'}
        </div>
      </div>

      {loading ? <Loading message="Loading your dashboard..." /> : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
            {(isStudent ? [
              { icon: '📚', value: quizzes.length, label: 'Available Quizzes', color: '#2563eb' },
              { icon: '🎯', value: attempts.length, label: 'My Attempts', color: '#d97706' },
              { icon: '⭐', value: studentAvgScore, label: 'My Avg Score', color: '#0284c7' },
              { icon: '✅', value: completedQuizzesCount, label: 'Completed Quizzes', color: '#10b981' }
            ] : [
              { icon: '📚', value: quizzes.length, label: 'Available Quizzes', color: '#2563eb' },
              { icon: '🎯', value: validStudentAttempts.length, label: 'Total Attempts', color: '#d97706' },
              { icon: '⭐', value: avgScore, label: 'Avg Score', color: '#0284c7' },
              { icon: '🛡️', value: `${integrityPct}%`, label: 'Integrity Rating', color: '#4f46e5' }
            ]).map(s => (
              <div key={s.label} style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                borderLeft: `4px solid ${s.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: '42px', height: '42px',
                  background: `${s.color}15`,
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${actions.length}, 1fr)`, gap: '0.75rem' }}>
              {actions.map(a => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '1rem 1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{
                      width: '38px', height: '38px',
                      background: `${a.color}15`,
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.15rem', flexShrink: 0,
                    }}>
                      {a.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#111827' }}>{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.1rem' }}>{a.desc}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '0.95rem' }}>&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Student Performance & Attempt History Section (Grouped by Student) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.4rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            {/* Header & View Switcher */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '1rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {isStudent ? '🎓 My Quiz Attempts' : '👥 Student Performance & Quiz Attempts'}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: '700',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    border: '1px solid #bfdbfe'
                  }}>
                    {isStudent ? `${attempts.length} Attempts` : `${studentGroups.length} Students • ${displayAttempts.length} Attempts`}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  {isStudent
                    ? 'Track your completed assessments and test submissions.'
                    : 'Individual student academic performance, scores, and integrity records grouped under their name.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!isStudent && (
                  <div style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '3px',
                    gap: '2px',
                  }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('QUIZ_GROUPED')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: viewMode === 'QUIZ_GROUPED' ? '#ffffff' : 'transparent',
                        color: viewMode === 'QUIZ_GROUPED' ? '#0f172a' : '#64748b',
                        boxShadow: viewMode === 'QUIZ_GROUPED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📚 Grouped by Quiz Assessment
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('STUDENT_GROUPED')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: viewMode === 'STUDENT_GROUPED' ? '#ffffff' : 'transparent',
                        color: viewMode === 'STUDENT_GROUPED' ? '#0f172a' : '#64748b',
                        boxShadow: viewMode === 'STUDENT_GROUPED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      👤 Grouped by Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('FEED')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: viewMode === 'FEED' ? '#ffffff' : 'transparent',
                        color: viewMode === 'FEED' ? '#0f172a' : '#64748b',
                        boxShadow: viewMode === 'FEED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📋 All Attempts Feed
                    </button>
                  </div>
                )}

                <Link
                  to="/analytics"
                  style={{
                    fontSize: '0.8rem',
                    color: '#2563eb',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  View Full Analytics &rarr;
                </Link>
              </div>
            </div>

            {/* Filter and Search Bar for ADMIN / EDUCATOR */}
            {!isStudent && studentGroups.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px' }}>
                  <span style={{ fontSize: '0.9rem' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by student name, email, or quiz..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <select
                    value={integrityFilter}
                    onChange={(e) => setIntegrityFilter(e.target.value)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="ALL">All Integrity Status</option>
                    <option value="CLEAN">🛡️ Clean Only (0 Switches)</option>
                    <option value="FLAGGED">⚠️ Flagged Violations</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="RECENT">Sort: Recent Activity</option>
                    <option value="SCORE_DESC">Sort: Highest Avg Score</option>
                    <option value="SCORE_ASC">Sort: Lowest Avg Score</option>
                    <option value="ATTEMPTS_DESC">Sort: Most Attempts</option>
                    <option value="NAME_ASC">Sort: Student Name (A-Z)</option>
                  </select>

                  {viewMode === 'STUDENT_GROUPED' && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={expandAll}
                        style={{
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#475569',
                        }}
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={collapseAll}
                        style={{
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#475569',
                        }}
                      >
                        Collapse All
                      </button>
                    </div>
                  )}

                  {viewMode === 'QUIZ_GROUPED' && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={expandAllQuizzes}
                        style={{
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#475569',
                        }}
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={collapseAllQuizzes}
                        style={{
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#475569',
                        }}
                      >
                        Collapse All
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {attempts.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>
                  {isStudent ? 'No Quiz Attempts Found' : 'No Student Attempts Yet'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  {isStudent
                    ? 'You have not completed any quizzes yet. Take a quiz to view your individual performance metrics here!'
                    : 'Attempts completed by enrolled students will automatically be grouped under their name with full performance analytics.'}
                </div>
              </div>
            ) : isStudent ? (
              /* STUDENT VIEW: Clean individual attempts table with results publication check and NO integrity events */
              <div className="table-container" style={{ margin: 0 }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Quiz Assessment</th>
                      <th style={{ width: '20%' }}>Completed At</th>
                      <th style={{ width: '18%' }}>Result Status</th>
                      <th style={{ width: '15%' }}>Score</th>
                      <th style={{ width: '15%' }}>Percentage</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((att, idx) => {
                      const quiz = quizzesMap[att.quizId];
                      const totalQ = quiz?.totalQuestions || 1;
                      const isPublished = Boolean(att.resultsPublished || quiz?.resultsPublished);
                      const score = att.score;
                      const pct = totalQ > 0 && score != null ? Math.round((score / totalQ) * 100) : 0;
                      const isPass = pct >= 50;
                      const compDate = att.completedAt ? new Date(att.completedAt) : (att.startedAt ? new Date(att.startedAt) : null);

                      return (
                        <tr key={att.id || idx}>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>
                              {quiz?.title || att.quizTitle || 'Assessment'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                              Attempt {idx + 1} • {quiz?.category || 'Assessment'}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {compDate ? compDate.toLocaleString() : 'Recent'}
                          </td>
                          <td>
                            {isPublished ? (
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#15803d',
                                background: '#dcfce7',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                border: '1px solid #bbf7d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                ✅ Published
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#b45309',
                                background: '#fffbeb',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                border: '1px solid #fde68a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                ⏳ Pending Release
                              </span>
                            )}
                          </td>
                          <td>
                            {isPublished && score != null ? (
                              <>
                                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{score}</strong>{' '}
                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>/ {totalQ} marks</span>
                              </>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                🔒 Unpublished
                              </span>
                            )}
                          </td>
                          <td>
                            {isPublished && score != null ? (
                              <span style={{
                                fontWeight: '800',
                                fontSize: '0.82rem',
                                color: isPass ? '#15803d' : '#dc2626',
                                background: isPass ? '#dcfce7' : '#fee2e2',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                              }}>
                                {pct}%
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isPublished ? (
                              <Link
                                to={`/result/${att.id || att.quizId}`}
                                style={{
                                  color: '#2563eb',
                                  fontWeight: '700',
                                  fontSize: '0.78rem',
                                  textDecoration: 'none',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  display: 'inline-block',
                                }}
                              >
                                Review &rarr;
                              </Link>
                            ) : (
                              <span style={{
                                color: '#64748b',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                padding: '0.3rem 0.6rem',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                display: 'inline-block',
                              }}>
                                Submitted
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : filteredAndSortedStudents.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
              }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
                  No students matching your filter criteria
                </div>
                <button
                  onClick={() => { setSearchQuery(''); setIntegrityFilter('ALL'); }}
                  style={{
                    marginTop: '0.5rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'QUIZ_GROUPED' ? (
              /* PRIMARY VIEW: Grouped by Quiz Assessment (All tests under each quiz title) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredQuizGroups.length === 0 ? (
                  <div style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    color: '#64748b',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#334155' }}>
                      No quiz assessments matching your search criteria
                    </div>
                  </div>
                ) : (
                  filteredQuizGroups.map((group) => {
                    const expanded = isQuizExpanded(group.quizId);

                    return (
                      <div
                        key={group.quizId}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Quiz Assessment Header Banner with Central Result Publication Control */}
                        <div
                          onClick={() => toggleQuiz(group.quizId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.15rem 1.35rem',
                            background: expanded ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderBottom: expanded ? '1px solid #e2e8f0' : 'none',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Quiz Title & Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: '800',
                              fontSize: '1.25rem',
                              flexShrink: 0,
                              boxShadow: '0 2px 6px rgba(37,99,235,0.22)',
                            }}>
                              📚
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                                  {group.quizTitle}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontWeight: '700',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  border: '1px solid #bfdbfe'
                                }}>
                                  {group.category}
                                </span>
                                <span className={`badge badge-${(group.difficulty || 'easy').toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                  {group.difficulty}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span>⏱️ {group.duration} Mins</span>
                                <span>• ❓ {group.totalQuestions} Questions</span>
                                <span>• Assessment ID: {group.quizId}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quiz Metrics & Whole Quiz Result Publication Button - Extended only when arrow is clicked */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                            {expanded && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', animation: 'fadeIn 0.2s ease-in-out' }}>
                                {/* Tests Count */}
                                <div style={{
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}>
                                  <span>🎯</span> {group.attemptsCount} {group.attemptsCount === 1 ? 'Test' : 'Tests'}
                                </div>

                                {/* Avg Score */}
                                <div style={{
                                  background: group.avgPercentage >= 50 ? '#f0fdf4' : '#fef2f2',
                                  border: `1px solid ${group.avgPercentage >= 50 ? '#bbf7d0' : '#fecaca'}`,
                                  color: group.avgPercentage >= 50 ? '#15803d' : '#b91c1c',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}>
                                  <span>📊</span> Avg: {group.avgPercentage}% ({group.avgScore} pts)
                                </div>

                                {/* Pass Rate */}
                                <div style={{
                                  background: '#fffbeb',
                                  border: '1px solid #fde68a',
                                  color: '#b45309',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}>
                                  <span>🏆</span> Pass: {group.passRate}%
                                </div>

                                {/* Integrity Rate */}
                                <div style={{
                                  background: group.integrityRate === 100 ? '#f0fdf4' : '#fff1f2',
                                  border: `1px solid ${group.integrityRate === 100 ? '#bbf7d0' : '#fecdd3'}`,
                                  color: group.integrityRate === 100 ? '#166534' : '#be123c',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}>
                                  {group.integrityRate === 100 ? '🛡️ 100% Clean' : `⚠️ ${group.integrityRate}% Clean`}
                                </div>

                                {/* Central Result Publication Button for the whole Quiz Title */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePublishResults(group.quizId, group.isPublished);
                                  }}
                                  disabled={publishingQuizId === group.quizId}
                                  style={{
                                    padding: '0.45rem 1rem',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '0.82rem',
                                    cursor: publishingQuizId === group.quizId ? 'not-allowed' : 'pointer',
                                    border: '1px solid',
                                    borderColor: group.isPublished ? '#bbf7d0' : '#2563eb',
                                    background: group.isPublished ? '#f0fdf4' : '#2563eb',
                                    color: group.isPublished ? '#15803d' : '#ffffff',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                                    transition: 'all 0.15s ease',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={group.isPublished ? "Click to unpublish results for all students" : "Click to publish results to all students who completed this test"}
                                >
                                  {publishingQuizId === group.quizId
                                    ? 'Updating...'
                                    : group.isPublished
                                    ? '📢 Results Published'
                                    : '🚀 Publish Results'}
                                </button>
                              </div>
                            )}

                            {/* Arrow Button to extend buttons and details */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleQuiz(group.quizId);
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: expanded ? '#eff6ff' : '#f1f5f9',
                                border: `1px solid ${expanded ? '#bfdbfe' : '#cbd5e1'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                color: expanded ? '#1d4ed8' : '#475569',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title={expanded ? "Click arrow to collapse" : "Click arrow to extend buttons and view student details"}
                              aria-expanded={expanded}
                            >
                              {expanded ? '▲' : '▼'}
                            </button>
                          </div>
                        </div>

                        {/* All Tests Under this Quiz Title */}
                        {expanded && (
                          <div style={{ padding: '0.75rem 1.4rem 1.4rem 1.4rem' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.8rem',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                            }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                                All Student Tests for {group.quizTitle} ({group.attempts.length})
                              </div>
                              <div style={{ fontSize: '0.75rem', color: group.isPublished ? '#15803d' : '#b45309', fontWeight: '700' }}>
                                {group.isPublished
                                  ? '✅ All students who completed this quiz can view their results & evaluations'
                                  : '⏳ Results are currently hidden from students until you click "Publish Results"'}
                              </div>
                            </div>

                            {group.attempts.length === 0 ? (
                              <div style={{
                                padding: '1.75rem 1rem',
                                textAlign: 'center',
                                color: '#94a3b8',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px dashed #e2e8f0',
                                fontSize: '0.85rem',
                              }}>
                                No students have attempted this quiz assessment yet.
                              </div>
                            ) : (
                              <div className="table-container" style={{ margin: 0 }}>
                                <table className="custom-table" style={{ width: '100%' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '28%' }}>Student Learner</th>
                                      <th style={{ width: '18%' }}>Completed At</th>
                                      <th style={{ width: '14%' }}>Score</th>
                                      <th style={{ width: '12%' }}>Percentage</th>
                                      <th style={{ width: '14%' }}>Academic Integrity</th>
                                      <th style={{ width: '14%' }}>Student Access</th>
                                      <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.attempts.map((att, idx) => {
                                      const switches = att.tabSwitches || 0;
                                      const isPass = att.percentage >= 50;

                                      return (
                                        <tr key={att.id || idx}>
                                          <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                              <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: getAvatarGradient(att.studentName),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                fontWeight: '700',
                                                fontSize: '0.8rem',
                                                flexShrink: 0,
                                              }}>
                                                {getInitials(att.studentName)}
                                              </div>
                                              <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                                                  {att.studentName}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                  {att.studentEmail ? att.studentEmail : (att.userId ? `#${att.userId}` : '')}
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {att.completedDate ? att.completedDate.toLocaleString() : 'Recent'}
                                          </td>
                                          <td>
                                            <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                                              {att.score}
                                            </strong>{' '}
                                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                              / {att.totalQuestions} marks
                                            </span>
                                          </td>
                                          <td>
                                            <span style={{
                                              fontWeight: '800',
                                              fontSize: '0.82rem',
                                              color: isPass ? '#15803d' : '#dc2626',
                                              background: isPass ? '#dcfce7' : '#fee2e2',
                                              padding: '0.15rem 0.5rem',
                                              borderRadius: '6px',
                                            }}>
                                              {att.percentage}%
                                            </span>
                                          </td>
                                          <td>
                                            <span className={`integrity-badge-indicator ${switches === 0 ? 'clean' : 'warning'}`}>
                                              {switches === 0 ? '🛡️ Clean (0)' : `⚠️ ${switches} Switches`}
                                            </span>
                                          </td>
                                          <td>
                                            <span style={{
                                              fontSize: '0.72rem',
                                              fontWeight: '700',
                                              color: group.isPublished ? '#15803d' : '#b45309',
                                              background: group.isPublished ? '#f0fdf4' : '#fffbeb',
                                              border: `1px solid ${group.isPublished ? '#bbf7d0' : '#fde68a'}`,
                                              padding: '0.2rem 0.5rem',
                                              borderRadius: '6px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.25rem'
                                            }}>
                                              {group.isPublished ? '✅ Visible to Student' : '🔒 Pending Release'}
                                            </span>
                                          </td>
                                          <td style={{ textAlign: 'right' }}>
                                            <Link
                                              to={`/result/${att.id || att.quizId}`}
                                              style={{
                                                color: '#2563eb',
                                                fontWeight: '700',
                                                fontSize: '0.78rem',
                                                textDecoration: 'none',
                                                padding: '0.3rem 0.6rem',
                                                borderRadius: '6px',
                                                background: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                display: 'inline-block',
                                              }}
                                            >
                                              Review Attempt &rarr;
                                            </Link>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : viewMode === 'STUDENT_GROUPED' ? (
              /* PRIMARY VIEW: Grouped by Student */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredAndSortedStudents.map((student) => {
                  const expanded = isExpanded(student.userId);
                  const isCurrentUser = student.rawUserId === user?.id;

                  return (
                    <div
                      key={student.userId}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Student Profile Header Banner */}
                      <div
                        onClick={() => toggleStudent(student.userId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem 1.25rem',
                          background: expanded ? '#f8fafc' : '#ffffff',
                          cursor: 'pointer',
                          userSelect: 'none',
                          borderBottom: expanded ? '1px solid #e2e8f0' : 'none',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Student Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: getAvatarGradient(student.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: '800',
                            fontSize: '1.05rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          }}>
                            {getInitials(student.name)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                                {student.name}
                              </span>
                              {isCurrentUser && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  background: '#dbeafe',
                                  color: '#1d4ed8',
                                  fontWeight: '800',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '999px',
                                }}>
                                  YOU
                                </span>
                              )}
                              <span style={{
                                fontSize: '0.68rem',
                                background: student.role === 'ADMIN' ? '#fef3c7' : '#f1f5f9',
                                color: student.role === 'ADMIN' ? '#b45309' : '#475569',
                                fontWeight: '700',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(0,0,0,0.06)',
                              }}>
                                {student.role || 'STUDENT'}
                              </span>
                              {student.rawUserId && (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                  ID: {student.rawUserId}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {student.email && (
                                <span>📧 {student.email}</span>
                              )}
                              {student.lastAttemptTime > 0 && (
                                <span>• 🕒 Last Active: {new Date(student.lastAttemptTime).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Student Performance Metric Badges - Extended only when arrow is clicked */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          {expanded && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', animation: 'fadeIn 0.2s ease-in-out' }}>
                              {/* Attempts count */}
                              <div style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}>
                                <span>🎯</span> {student.attemptsCount} {student.attemptsCount === 1 ? 'Attempt' : 'Attempts'}
                              </div>

                              {/* Avg Score */}
                              <div style={{
                                background: student.avgPercentage >= 50 ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${student.avgPercentage >= 50 ? '#bbf7d0' : '#fecaca'}`,
                                color: student.avgPercentage >= 50 ? '#15803d' : '#b91c1c',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}>
                                <span>📊</span> Avg: {student.avgPercentage}% ({student.avgScore} pts)
                              </div>

                              {/* Top Score */}
                              <div style={{
                                background: '#fffbeb',
                                border: '1px solid #fde68a',
                                color: '#b45309',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}>
                                <span>🏆</span> Best: {student.maxScore} marks
                              </div>

                              {/* Academic Integrity */}
                              <div style={{
                                background: student.totalSwitches === 0 ? '#f0fdf4' : '#fff1f2',
                                border: `1px solid ${student.totalSwitches === 0 ? '#bbf7d0' : '#fecdd3'}`,
                                color: student.totalSwitches === 0 ? '#166534' : '#be123c',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}>
                                {student.totalSwitches === 0
                                  ? '🛡️ 100% Clean'
                                  : `⚠️ ${student.totalSwitches} Switches (${student.integrityRate}%)`}
                              </div>
                            </div>
                          )}

                          {/* Arrow Button to extend metrics and details */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStudent(student.userId);
                            }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: expanded ? '#eff6ff' : '#f1f5f9',
                              border: `1px solid ${expanded ? '#bfdbfe' : '#cbd5e1'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              color: expanded ? '#1d4ed8' : '#475569',
                              fontWeight: '800',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              marginLeft: '0.25rem',
                            }}
                            title={expanded ? "Click arrow to collapse" : "Click arrow to extend metrics and view attempt history"}
                            aria-expanded={expanded}
                          >
                            {expanded ? '▲' : '▼'}
                          </button>
                        </div>
                      </div>

                      {/* Attempts Table for this Student */}
                      {expanded && (
                        <div style={{ padding: '0.5rem 1.25rem 1.25rem 1.25rem' }}>
                          <div className="table-container" style={{ margin: 0 }}>
                            <table className="custom-table" style={{ width: '100%' }}>
                              <thead>
                                <tr>
                                  <th style={{ width: '32%' }}>Quiz Assessment</th>
                                  <th style={{ width: '22%' }}>Completed At</th>
                                  <th style={{ width: '16%' }}>Score</th>
                                  <th style={{ width: '12%' }}>Percentage</th>
                                  <th style={{ width: '18%' }}>Integrity Status</th>
                                  <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {student.attempts.map((att, idx) => {
                                  const switches = att.tabSwitches || 0;
                                  const isPass = att.percentage >= 50;

                                  return (
                                    <tr key={att.id || idx}>
                                      <td>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>
                                          {att.quizTitle}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                                          Attempt {idx + 1} • {att.quizCategory}
                                        </div>
                                      </td>
                                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {att.completedDate ? att.completedDate.toLocaleString() : 'Recent'}
                                      </td>
                                      <td>
                                        <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                                          {att.score}
                                        </strong>{' '}
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                          / {att.totalQuestions} marks
                                        </span>
                                      </td>
                                      <td>
                                        <span style={{
                                          fontWeight: '800',
                                          fontSize: '0.82rem',
                                          color: isPass ? '#15803d' : '#dc2626',
                                          background: isPass ? '#dcfce7' : '#fee2e2',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '6px',
                                        }}>
                                          {att.percentage}%
                                        </span>
                                      </td>
                                      <td>
                                        <span className={`integrity-badge-indicator ${switches === 0 ? 'clean' : 'warning'}`}>
                                          {switches === 0 ? '🛡️ Clean (0)' : `⚠️ ${switches} Switches`}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                                          <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: '700',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            border: '1px solid',
                                            borderColor: Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '#bbf7d0' : '#fde68a',
                                            background: Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '#f0fdf4' : '#fffbeb',
                                            color: Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '#15803d' : '#b45309',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '✅ Published' : '⏳ Pending'}
                                          </span>
                                          <Link
                                            to={`/result/${att.id || att.quizId}`}
                                            style={{
                                              color: '#2563eb',
                                              fontWeight: '700',
                                              fontSize: '0.78rem',
                                              textDecoration: 'none',
                                              padding: '0.3rem 0.6rem',
                                              borderRadius: '6px',
                                              background: '#eff6ff',
                                              border: '1px solid #bfdbfe',
                                              display: 'inline-block',
                                            }}
                                          >
                                            Review &rarr;
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ALTERNATIVE VIEW: Flat Chronological Feed with prominent Student Columns */
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Quiz Assessment</th>
                      <th>Completed At</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Integrity Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validStudentAttempts.slice(0, 50).map((att, idx) => {
                      const userObj = usersMap[att.userId];
                      const sName = att.studentName || att.username || userObj?.username || userObj?.name || (att.userId ? `Student #${att.userId}` : 'Learner');
                      const sEmail = att.studentEmail || att.userEmail || userObj?.email || '';
                      const quiz = quizzesMap[att.quizId];
                      const totalQ = quiz?.totalQuestions || 1;
                      const score = att.score || 0;
                      const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
                      const switches = att.tabSwitches || 0;
                      const isPass = pct >= 50;

                      return (
                        <tr key={att.id || idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: getAvatarGradient(sName),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                flexShrink: 0,
                              }}>
                                {getInitials(sName)}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                                  {sName}
                                </strong>
                                {sEmail && (
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {sEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{quiz?.title || `Quiz #${att.quizId}`}</strong>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {att.completedAt ? new Date(att.completedAt).toLocaleString() : 'Recent'}
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{score}</strong> / {totalQ} marks
                          </td>
                          <td>
                            <span style={{
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              color: isPass ? '#15803d' : '#dc2626',
                            }}>
                              {pct}%
                            </span>
                          </td>
                          <td>
                            <span className={`integrity-badge-indicator ${switches === 0 ? 'clean' : 'warning'}`}>
                              {switches === 0 ? '🛡️ Clean (0)' : `⚠️ ${switches} Switches`}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '#bbf7d0' : '#fde68a',
                                background: Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '#f0fdf4' : '#fffbeb',
                                color: Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '#15803d' : '#b45309',
                                whiteSpace: 'nowrap'
                              }}>
                                {Boolean(att.resultsPublished || quizzesMap[att.quizId]?.resultsPublished) ? '✅ Published' : '⏳ Pending'}
                              </span>
                              <Link
                                to={`/result/${att.id || att.quizId}`}
                                style={{
                                  color: '#2563eb',
                                  fontWeight: '700',
                                  fontSize: '0.78rem',
                                  textDecoration: 'none',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  display: 'inline-block',
                                }}
                              >
                                Review Attempt &rarr;
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;


// =========================================================
// STUDENT HEALTH TRACKER - JAVASCRIPT CONTROLLER
// Clean, interactive, and user-friendly logic
// =========================================================

(function () {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEYS = {
    THEME: 'student_health_theme',
    PLANNER: 'student_health_planner',
    TASKS: 'student_health_tasks',
    LOGS: 'student_health_logs'
  };

  // --- State ---
  let state = {
    theme: 'light',
    planner: {
      waterGoal: 0,
      sleepGoal: 0,
      exerciseGoal: '',
      customHabitGoal: '',
      isPlanned: false
    },
    logs: {
      waterActual: 0,
      sleepActual: 0,
      exerciseActual: ''
    },
    tasks: [], // { id, title, category, completed, isCore }
    activeTab: 'all' // 'all' | 'pending' | 'completed'
  };

  // --- DOM Elements ---
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentDateDisplay = document.getElementById('current-date-display');
  const resetDayBtn = document.getElementById('reset-day-btn');
  const statusPill = document.getElementById('daily-status-pill');
  const statusPillText = document.getElementById('status-pill-text');

  // Overview
  const overallProgressCircle = document.getElementById('overall-progress-circle');
  const overallProgressText = document.getElementById('overall-progress-text');
  const motivationTitle = document.getElementById('motivation-title');
  const motivationSubtitle = document.getElementById('motivation-subtitle');
  const metricWaterVal = document.getElementById('metric-water-val');
  const metricSleepVal = document.getElementById('metric-sleep-val');
  const metricExerciseVal = document.getElementById('metric-exercise-val');

  // Planner
  const plannerForm = document.getElementById('planner-form');
  const waterGoalInput = document.getElementById('water-goal');
  const sleepGoalInput = document.getElementById('sleep-goal');
  const exerciseGoalInput = document.getElementById('exercise-goal');
  const customHabitGoalInput = document.getElementById('custom-habit-goal');
  const clearPlanBtn = document.getElementById('clear-plan-btn');
  const plannerStatusBadge = document.getElementById('planner-status-badge');

  // Quick Loggers
  const waterProgressSub = document.getElementById('water-progress-sub');
  const waterCounterBadge = document.getElementById('water-counter-badge');
  const waterCupsGrid = document.getElementById('water-cups-grid');
  const currentWaterCount = document.getElementById('current-water-count');
  const targetWaterCount = document.getElementById('target-water-count');
  const btnWaterMinus = document.getElementById('btn-water-minus');
  const btnWaterPlus = document.getElementById('btn-water-plus');

  const sleepCounterBadge = document.getElementById('sleep-counter-badge');
  const currentSleepCount = document.getElementById('current-sleep-count');
  const targetSleepCount = document.getElementById('target-sleep-count');
  const btnSleepMinus = document.getElementById('btn-sleep-minus');
  const btnSleepPlus = document.getElementById('btn-sleep-plus');

  const exerciseCounterBadge = document.getElementById('exercise-counter-badge');
  const exerciseActualInput = document.getElementById('exercise-actual-input');
  const btnLogExercise = document.getElementById('btn-log-exercise');
  const exerciseLoggedDisplay = document.getElementById('exercise-logged-display');
  const exerciseLoggedText = document.getElementById('exercise-logged-text');
  const btnRemoveExercise = document.getElementById('btn-remove-exercise');

  // Checklist
  const checklistEmptyState = document.getElementById('checklist-empty-state');
  const checklistGroupsWrapper = document.getElementById('checklist-groups-wrapper');
  const pendingTaskList = document.getElementById('pending-task-list');
  const completedTaskList = document.getElementById('completed-task-list');
  const pendingGroupBadge = document.getElementById('pending-group-badge');
  const completedGroupBadge = document.getElementById('completed-group-badge');
  const noPendingHint = document.getElementById('no-pending-hint');
  const noCompletedHint = document.getElementById('no-completed-hint');
  const countAll = document.getElementById('count-all');
  const countPending = document.getElementById('count-pending');
  const countCompleted = document.getElementById('count-completed');
  const tabButtons = document.querySelectorAll('.checklist-tabs .tab-btn');

  // Custom Task Modal
  const openAddTaskModalBtn = document.getElementById('open-add-task-modal');
  const taskModalOverlay = document.getElementById('task-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const customTaskForm = document.getElementById('custom-task-form');
  const customTaskInput = document.getElementById('custom-task-input');

  // Toasts
  const toastContainer = document.getElementById('toast-container');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiAnimationId = null;
  let particles = [];

  // =========================================================
  // INITIALIZATION
  // =========================================================
  function init() {
    renderCurrentDate();
    initTheme();
    loadStateFromStorage();
    bindEvents();
    renderAll();
  }

  function renderCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString(undefined, options);
    if (currentDateDisplay) {
      currentDateDisplay.textContent = `Today • ${dateStr}`;
    }
  }

  // =========================================================
  // THEME SWITCHING (LIGHT / DARK)
  // =========================================================
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  function setTheme(theme) {
    state.theme = theme;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // =========================================================
  // LOCAL STORAGE PERSISTENCE
  // =========================================================
  function loadStateFromStorage() {
    try {
      const savedPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
      if (savedPlanner) {
        state.planner = JSON.parse(savedPlanner);
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        state.logs = JSON.parse(savedLogs);
      }

      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
  }

  function saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(state.planner));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // =========================================================
  // EVENT BINDINGS
  // =========================================================
  function bindEvents() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      showToast(`Switched to ${nextTheme} theme`);
    });

    // Reset Day
    resetDayBtn.addEventListener('click', handleResetDay);

    // Planner Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
          targetInput.value = btn.dataset.val;
          targetInput.focus();
        }
      });
    });

    document.querySelectorAll('.preset-text-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
          targetInput.value = btn.dataset.val;
          targetInput.focus();
        }
      });
    });

    // Planner Form Submit
    plannerForm.addEventListener('submit', handlePlannerSubmit);
    clearPlanBtn.addEventListener('click', handleClearPlannerForm);

    // Water Logger Controls
    btnWaterPlus.addEventListener('click', () => adjustWater(1));
    btnWaterMinus.addEventListener('click', () => adjustWater(-1));

    // Sleep Logger Controls
    btnSleepPlus.addEventListener('click', () => adjustSleep(0.5));
    btnSleepMinus.addEventListener('click', () => adjustSleep(-0.5));

    // Exercise Activity Logger
    btnLogExercise.addEventListener('click', handleLogExercise);
    exerciseActualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogExercise();
      }
    });
    btnRemoveExercise.addEventListener('click', handleRemoveExercise);

    // Checklist Tabs
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeTab = btn.dataset.tab;
        renderChecklist();
      });
    });

    // Custom Task Modal
    openAddTaskModalBtn.addEventListener('click', openTaskModal);
    modalCloseBtn.addEventListener('click', closeTaskModal);
    modalCancelBtn.addEventListener('click', closeTaskModal);
    taskModalOverlay.addEventListener('click', (e) => {
      if (e.target === taskModalOverlay) closeTaskModal();
    });
    customTaskForm.addEventListener('submit', handleAddCustomTask);

    // Window resize for confetti canvas
    window.addEventListener('resize', handleCanvasResize);
  }

  // =========================================================
  // DAILY PLANNER LOGIC
  // =========================================================
  function handlePlannerSubmit(e) {
    e.preventDefault();

    const waterVal = parseInt(waterGoalInput.value, 10) || 0;
    const sleepVal = parseFloat(sleepGoalInput.value) || 0;
    const exerciseVal = exerciseGoalInput.value.trim();
    const customHabitVal = customHabitGoalInput.value.trim();

    if (!waterVal && !sleepVal && !exerciseVal && !customHabitVal) {
      showToast('Please enter at least one goal to plan your day.');
      waterGoalInput.focus();
      return;
    }

    state.planner = {
      waterGoal: waterVal,
      sleepGoal: sleepVal,
      exerciseGoal: exerciseVal,
      customHabitGoal: customHabitVal,
      isPlanned: true
    };

    // Synchronize or generate checklist core items
    syncPlannerToChecklist();

    saveStateToStorage();
    renderAll();
    showToast('✨ Daily plan saved and checklist updated!');
  }

  function handleClearPlannerForm() {
    waterGoalInput.value = '';
    sleepGoalInput.value = '';
    exerciseGoalInput.value = '';
    customHabitGoalInput.value = '';
    waterGoalInput.focus();
  }

  function syncPlannerToChecklist() {
    // Keep custom tasks, re-generate or update core planner tasks
    const existingCustomTasks = state.tasks.filter(t => !t.isCore);
    const newCoreTasks = [];

    if (state.planner.waterGoal > 0) {
      const isCompleted = state.logs.waterActual >= state.planner.waterGoal;
      newCoreTasks.push({
        id: 'core-water',
        title: `Drink ${state.planner.waterGoal} glasses of water`,
        category: '💧 Water',
        completed: isCompleted,
        isCore: true,
        type: 'water'
      });
    }

    if (state.planner.sleepGoal > 0) {
      const isCompleted = state.logs.sleepActual >= state.planner.sleepGoal;
      newCoreTasks.push({
        id: 'core-sleep',
        title: `Get ${state.planner.sleepGoal} hours of restful sleep`,
        category: '😴 Sleep',
        completed: isCompleted,
        isCore: true,
        type: 'sleep'
      });
    }

    if (state.planner.exerciseGoal) {
      const isCompleted = Boolean(state.logs.exerciseActual);
      newCoreTasks.push({
        id: 'core-exercise',
        title: `Exercise: ${state.planner.exerciseGoal}`,
        category: '🏃 Exercise',
        completed: isCompleted,
        isCore: true,
        type: 'exercise'
      });
    }

    if (state.planner.customHabitGoal) {
      // Retain completed state if previously existing
      const prevHabit = state.tasks.find(t => t.id === 'core-habit');
      newCoreTasks.push({
        id: 'core-habit',
        title: `Habit: ${state.planner.customHabitGoal}`,
        category: '⭐ Wellness',
        completed: prevHabit ? prevHabit.completed : false,
        isCore: true,
        type: 'habit'
      });
    }

    state.tasks = [...newCoreTasks, ...existingCustomTasks];
  }

  // =========================================================
  // INTERACTIVE HABIT LOGGING (WATER, SLEEP, EXERCISE)
  // =========================================================
  function adjustWater(delta) {
    const nextVal = Math.max(0, state.logs.waterActual + delta);
    if (nextVal === state.logs.waterActual) return;

    state.logs.waterActual = nextVal;

    // Check if water goal task needs auto-checking
    const waterTask = state.tasks.find(t => t.id === 'core-water');
    if (waterTask && state.planner.waterGoal > 0) {
      const shouldComplete = state.logs.waterActual >= state.planner.waterGoal;
      if (waterTask.completed !== shouldComplete) {
        waterTask.completed = shouldComplete;
        if (shouldComplete) {
          showToast('🎉 Water goal reached for today!');
          checkOverallCompletion();
        }
      }
    }

    saveStateToStorage();
    renderLoggers();
    renderOverview();
    renderChecklist();
  }

  function setWaterExact(count) {
    state.logs.waterActual = count;
    const waterTask = state.tasks.find(t => t.id === 'core-water');
    if (waterTask && state.planner.waterGoal > 0) {
      waterTask.completed = state.logs.waterActual >= state.planner.waterGoal;
    }
    saveStateToStorage();
    renderLoggers();
    renderOverview();
    renderChecklist();
  }

  function adjustSleep(delta) {
    const nextVal = Math.max(0, Math.round((state.logs.sleepActual + delta) * 10) / 10);
    if (nextVal === state.logs.sleepActual) return;

    state.logs.sleepActual = nextVal;

    const sleepTask = state.tasks.find(t => t.id === 'core-sleep');
    if (sleepTask && state.planner.sleepGoal > 0) {
      const shouldComplete = state.logs.sleepActual >= state.planner.sleepGoal;
      if (sleepTask.completed !== shouldComplete) {
        sleepTask.completed = shouldComplete;
        if (shouldComplete) {
          showToast('🌙 Sleep target achieved!');
          checkOverallCompletion();
        }
      }
    }

    saveStateToStorage();
    renderLoggers();
    renderOverview();
    renderChecklist();
  }

  function handleLogExercise() {
    const text = exerciseActualInput.value.trim();
    if (!text) {
      showToast('Please type your workout before logging.');
      exerciseActualInput.focus();
      return;
    }

    state.logs.exerciseActual = text;
    exerciseActualInput.value = '';

    const exerciseTask = state.tasks.find(t => t.id === 'core-exercise');
    if (exerciseTask) {
      exerciseTask.completed = true;
    }

    showToast(`🏃 Logged workout: ${text}`);
    checkOverallCompletion();

    saveStateToStorage();
    renderLoggers();
    renderOverview();
    renderChecklist();
  }

  function handleRemoveExercise() {
    state.logs.exerciseActual = '';
    const exerciseTask = state.tasks.find(t => t.id === 'core-exercise');
    if (exerciseTask) {
      exerciseTask.completed = false;
    }

    saveStateToStorage();
    renderLoggers();
    renderOverview();
    renderChecklist();
    showToast('Exercise record cleared');
  }

  // =========================================================
  // CHECKLIST INTERACTIONS
  // =========================================================
  function toggleTaskCompletion(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    // If it's a core task, reflect in loggers when applicable
    if (task.id === 'core-water' && state.planner.waterGoal > 0) {
      if (task.completed && state.logs.waterActual < state.planner.waterGoal) {
        state.logs.waterActual = state.planner.waterGoal;
      }
    } else if (task.id === 'core-sleep' && state.planner.sleepGoal > 0) {
      if (task.completed && state.logs.sleepActual < state.planner.sleepGoal) {
        state.logs.sleepActual = state.planner.sleepGoal;
      }
    } else if (task.id === 'core-exercise') {
      if (task.completed && !state.logs.exerciseActual) {
        state.logs.exerciseActual = state.planner.exerciseGoal || 'Workout completed';
      } else if (!task.completed) {
        state.logs.exerciseActual = '';
      }
    }

    if (task.completed) {
      showToast(`Completed: ${task.title}`);
      checkOverallCompletion();
    }

    saveStateToStorage();
    renderAll();
  }

  function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveStateToStorage();
    renderAll();
    showToast('Task removed');
  }

  // Custom Task Modal
  function openTaskModal() {
    taskModalOverlay.classList.add('open');
    taskModalOverlay.setAttribute('aria-hidden', 'false');
    customTaskInput.value = '';
    customTaskInput.focus();
  }

  function closeTaskModal() {
    taskModalOverlay.classList.remove('open');
    taskModalOverlay.setAttribute('aria-hidden', 'true');
  }

  function handleAddCustomTask(e) {
    e.preventDefault();
    const title = customTaskInput.value.trim();
    if (!title) return;

    const selectedCategory = document.querySelector('input[name="task-category"]:checked');
    const category = selectedCategory ? selectedCategory.value : '⭐ Wellness';

    const newTask = {
      id: 'custom-' + Date.now(),
      title: title,
      category: category,
      completed: false,
      isCore: false
    };

    state.tasks.push(newTask);
    saveStateToStorage();
    closeTaskModal();
    renderAll();
    showToast(`Added: ${title}`);
  }

  // =========================================================
  // RESET DAY
  // =========================================================
  function handleResetDay() {
    const confirmed = window.confirm('Reset all goals, logs, and checklist for a fresh new day?');
    if (!confirmed) return;

    state.planner = {
      waterGoal: 0,
      sleepGoal: 0,
      exerciseGoal: '',
      customHabitGoal: '',
      isPlanned: false
    };

    state.logs = {
      waterActual: 0,
      sleepActual: 0,
      exerciseActual: ''
    };

    state.tasks = [];

    // Clear form inputs
    handleClearPlannerForm();

    saveStateToStorage();
    renderAll();
    showToast('All data cleared. Welcome to your fresh start!');
  }

  // =========================================================
  // RENDERING CONTROLLERS
  // =========================================================
  function renderAll() {
    renderPlanner();
    renderLoggers();
    renderOverview();
    renderChecklist();
  }

  function renderPlanner() {
    if (state.planner.isPlanned) {
      waterGoalInput.value = state.planner.waterGoal || '';
      sleepGoalInput.value = state.planner.sleepGoal || '';
      exerciseGoalInput.value = state.planner.exerciseGoal || '';
      customHabitGoalInput.value = state.planner.customHabitGoal || '';
      plannerStatusBadge.textContent = 'Active Plan';
      plannerStatusBadge.style.color = '#22C55E';
      plannerStatusBadge.style.borderColor = 'rgba(34, 197, 94, 0.4)';

      statusPill.classList.add('active');
      statusPillText.textContent = 'Day in Progress';
    } else {
      plannerStatusBadge.textContent = 'Blank';
      plannerStatusBadge.style.color = '';
      plannerStatusBadge.style.borderColor = '';

      statusPill.classList.remove('active');
      statusPillText.textContent = 'Day Not Started';
    }
  }

  function renderLoggers() {
    const targetWater = state.planner.waterGoal || 0;
    const actualWater = state.logs.waterActual;

    currentWaterCount.textContent = actualWater;
    targetWaterCount.textContent = targetWater > 0 ? targetWater : '--';
    waterCounterBadge.textContent = `${actualWater} / ${targetWater > 0 ? targetWater : '--'} gl`;
    waterProgressSub.textContent = targetWater > 0
      ? (actualWater >= targetWater ? 'Goal reached! Stay hydrated 💧' : `${targetWater - actualWater} glasses left to reach goal`)
      : 'Set a water goal in planner';

    // Render interactive cups grid (default to max of 8 or targetWater)
    renderCupsGrid(targetWater, actualWater);

    // Sleep
    const targetSleep = state.planner.sleepGoal || 0;
    const actualSleep = state.logs.sleepActual;
    currentSleepCount.textContent = actualSleep.toFixed(1);
    targetSleepCount.textContent = targetSleep > 0 ? targetSleep.toFixed(1) : '--';
    sleepCounterBadge.textContent = `${actualSleep.toFixed(1)} / ${targetSleep > 0 ? targetSleep.toFixed(1) : '--'} hrs`;

    // Exercise
    if (state.logs.exerciseActual) {
      exerciseCounterBadge.textContent = 'Completed';
      exerciseCounterBadge.style.color = '#22C55E';
      exerciseLoggedDisplay.style.display = 'flex';
      exerciseLoggedText.textContent = state.logs.exerciseActual;
    } else {
      exerciseCounterBadge.textContent = state.planner.exerciseGoal ? 'Pending' : 'No Goal';
      exerciseCounterBadge.style.color = '';
      exerciseLoggedDisplay.style.display = 'none';
    }
  }

  function renderCupsGrid(targetWater, actualWater) {
    waterCupsGrid.innerHTML = '';
    const displayCount = Math.max(8, targetWater || 8, actualWater);
    const cappedCount = Math.min(displayCount, 20); // visual cap

    for (let i = 1; i <= cappedCount; i++) {
      const cup = document.createElement('button');
      cup.type = 'button';
      cup.className = `cup-btn ${i <= actualWater ? 'filled' : ''}`;
      cup.setAttribute('aria-label', `Cup ${i}: ${i <= actualWater ? 'filled' : 'empty'}`);
      cup.title = `Click to log ${i} glasses`;
      cup.textContent = i;
      cup.addEventListener('click', () => {
        // If clicking currently active cup, toggle it down; else set to this cup
        if (i === actualWater) {
          setWaterExact(i - 1);
        } else {
          setWaterExact(i);
        }
      });
      waterCupsGrid.appendChild(cup);
    }
  }

  function renderOverview() {
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.completed).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update Progress Ring
    const radius = 32;
    const circumference = 2 * Math.PI * radius; // ~201
    const offset = circumference - (percentage / 100) * circumference;
    if (overallProgressCircle) {
      overallProgressCircle.style.strokeDashoffset = offset;
    }
    if (overallProgressText) {
      overallProgressText.textContent = `${percentage}%`;
    }

    // Dynamic Motivational Copy
    if (!state.planner.isPlanned && totalTasks === 0) {
      motivationTitle.textContent = 'Welcome to Your Health Hub';
      motivationSubtitle.textContent = 'Set your daily goals in the planner to create your personalized health checklist.';
    } else if (percentage === 100 && totalTasks > 0) {
      motivationTitle.textContent = 'Outstanding Job! 🎉';
      motivationSubtitle.textContent = 'You have accomplished all of your wellness goals for today. Keep up the brilliant work!';
    } else if (percentage >= 50) {
      motivationTitle.textContent = 'Great Momentum! ⚡';
      motivationSubtitle.textContent = `You have completed ${completedTasks} of ${totalTasks} tasks today. Stay consistent!`;
    } else {
      motivationTitle.textContent = 'Day in Progress ✨';
      motivationSubtitle.textContent = `Track your health activities as you complete them throughout the day.`;
    }

    // Metric Badges
    const targetWater = state.planner.waterGoal || 0;
    metricWaterVal.textContent = `${state.logs.waterActual} / ${targetWater} gl`;

    const targetSleep = state.planner.sleepGoal || 0;
    metricSleepVal.textContent = `${state.logs.sleepActual.toFixed(1)} / ${targetSleep.toFixed(1)} hrs`;

    if (state.logs.exerciseActual) {
      metricExerciseVal.textContent = 'Completed ✓';
      metricExerciseVal.style.color = '#22C55E';
    } else if (state.planner.exerciseGoal) {
      metricExerciseVal.textContent = 'Pending';
      metricExerciseVal.style.color = '';
    } else {
      metricExerciseVal.textContent = 'Not Planned';
      metricExerciseVal.style.color = '';
    }
  }

  function renderChecklist() {
    const all = state.tasks;
    const pending = all.filter(t => !t.completed);
    const completed = all.filter(t => t.completed);

    // Update tab counters
    countAll.textContent = all.length;
    countPending.textContent = pending.length;
    countCompleted.textContent = completed.length;

    pendingGroupBadge.textContent = `${pending.length} ${pending.length === 1 ? 'task' : 'tasks'}`;
    completedGroupBadge.textContent = `${completed.length} ${completed.length === 1 ? 'task' : 'tasks'}`;

    if (all.length === 0) {
      checklistEmptyState.style.display = 'block';
      checklistGroupsWrapper.style.display = 'none';
      return;
    }

    checklistEmptyState.style.display = 'none';
    checklistGroupsWrapper.style.display = 'flex';

    // Clear lists
    pendingTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    const pendingGroup = document.getElementById('pending-group');
    const completedGroup = document.getElementById('completed-group');

    // Handle Tab View Filters
    if (state.activeTab === 'pending') {
      pendingGroup.style.display = 'flex';
      completedGroup.style.display = 'none';
    } else if (state.activeTab === 'completed') {
      pendingGroup.style.display = 'none';
      completedGroup.style.display = 'flex';
    } else {
      pendingGroup.style.display = 'flex';
      completedGroup.style.display = 'flex';
    }

    // Populate Pending Tasks
    if (pending.length === 0) {
      noPendingHint.style.display = 'block';
    } else {
      noPendingHint.style.display = 'none';
      pending.forEach(task => {
        pendingTaskList.appendChild(createTaskElement(task));
      });
    }

    // Populate Completed Tasks
    if (completed.length === 0) {
      noCompletedHint.style.display = 'block';
    } else {
      noCompletedHint.style.display = 'none';
      completed.forEach(task => {
        completedTaskList.appendChild(createTaskElement(task));
      });
    }
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'is-completed' : ''}`;
    li.dataset.id = task.id;

    // Left main interactable area
    const taskMain = document.createElement('div');
    taskMain.className = 'task-main';
    taskMain.addEventListener('click', () => toggleTaskCompletion(task.id));

    // Custom Checkbox
    const customCheckbox = document.createElement('div');
    customCheckbox.className = 'custom-checkbox';
    customCheckbox.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    // Text labels
    const taskTextGroup = document.createElement('div');
    taskTextGroup.className = 'task-text-group';

    const categoryTag = document.createElement('span');
    categoryTag.className = 'task-category-tag';
    categoryTag.textContent = task.category || 'General';

    const label = document.createElement('span');
    label.className = 'task-label';
    label.textContent = task.title;

    taskTextGroup.appendChild(categoryTag);
    taskTextGroup.appendChild(label);

    taskMain.appendChild(customCheckbox);
    taskMain.appendChild(taskTextGroup);

    // Action button (Delete)
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.setAttribute('aria-label', `Delete ${task.title}`);
    deleteBtn.title = 'Remove task';
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    taskActions.appendChild(deleteBtn);

    li.appendChild(taskMain);
    li.appendChild(taskActions);

    return li;
  }

  // =========================================================
  // CELEBRATION & CONFETTI ON ALL COMPLETED
  // =========================================================
  function checkOverallCompletion() {
    const total = state.tasks.length;
    if (total === 0) return;
    const completed = state.tasks.filter(t => t.completed).length;

    if (completed === total) {
      launchConfetti();
    }
  }

  function handleCanvasResize() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function launchConfetti() {
    if (!confettiCanvas || !confettiCtx) return;

    handleCanvasResize();
    particles = [];
    const colors = ['#8367C7', '#E9D2F4', '#3C153B', '#FFD166', '#06D6A0'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * -50,
        r: Math.random() * 6 + 4,
        d: Math.random() * 90,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
      });
    }

    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
    }
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiCtx || particles.length === 0) return;

    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
      p.x += Math.sin(p.d);
      p.tilt = Math.sin(p.tiltAngle) * 15;

      confettiCtx.beginPath();
      confettiCtx.lineWidth = p.r / 2;
      confettiCtx.strokeStyle = p.color;
      confettiCtx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      confettiCtx.stroke();
    }

    // Filter out fallen particles
    particles = particles.filter(p => p.y < confettiCanvas.height + 20);

    if (particles.length > 0) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimationId = null;
    }
  }

  // =========================================================
  // TOAST FEEDBACK
  // =========================================================
  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 240ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // Kickstart Application
  init();
})();

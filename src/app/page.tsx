'use client'

import { useState } from 'react'
import styles from './page.module.css'

type Screen = 'home' | 'step1' | 'step2' | 'step3' | 'step4' | 'loading' | 'workout' | 'week-setup' | 'week-loading' | 'week'

type WorkoutStep = {
  name: string
  description: string
  duration: string
  isKey: boolean
}

type Workout = {
  name: string
  insight: string
  pace: string
  steps: WorkoutStep[]
  tips: string[]
}

type WeekDay = {
  dayShort: string
  dayFull: string
  type: 'run' | 'rest' | 'peak'
  title: string
  detail: string
  badge: string
}

type WeekPlan = {
  weekInsight: string
  weeklyGoalKm: number
  days: WeekDay[]
}

const FEELING_OPTIONS = [
  { value: 'energized', icon: '⚡', label: 'Energized', desc: 'Legs fresh, ready to push' },
  { value: 'steady', icon: '〰', label: 'Steady', desc: 'Good, but not electric' },
  { value: 'recovery', icon: '🌿', label: 'Recovery', desc: 'Need a gentle session' },
  { value: 'off', icon: '🌙', label: 'Off Day', desc: 'Something is off today' },
]

const TYPE_OPTIONS = [
  { value: 'speed', icon: '⚡', label: 'Speed', desc: 'Fast intervals, race prep' },
  { value: 'interval', icon: '🔁', label: 'Interval', desc: 'Hard efforts, recover, repeat' },
  { value: 'endurance', icon: '🏃', label: 'Endurance', desc: 'Steady miles, aerobic base' },
  { value: 'recovery', icon: '🌱', label: 'Recovery', desc: 'Easy, low HR, mental reset' },
]

const FITNESS_OPTIONS = [
  { value: 'beginner', label: 'Just starting out', desc: 'Under 10 miles/week' },
  { value: 'intermediate', label: 'Building a base', desc: '10–30 miles/week' },
  { value: 'advanced', label: 'Consistent runner', desc: '30+ miles/week' },
]

export default function StridesApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [feeling, setFeeling] = useState('steady')
  const [runType, setRunType] = useState('endurance')
  const [distance, setDistance] = useState(5)
  const [duration, setDuration] = useState(45)
  const [notes, setNotes] = useState('')
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [error, setError] = useState('')

  // Week plan state
  const [weekGoal, setWeekGoal] = useState(20)
  const [weekDays, setWeekDays] = useState(4)
  const [weekFitness, setWeekFitness] = useState('intermediate')
  const [weekNotes, setWeekNotes] = useState('')
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)

  const go = (s: Screen) => { setScreen(s); setError('') }

  const paceDisplay = () => {
    const raw = duration / distance
    const min = Math.floor(raw)
    const sec = Math.round((raw - min) * 60)
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  async function generateWorkout() {
    go('loading')
    try {
      const res = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling, type: runType, distance, duration, notes }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setWorkout(data)
      go('workout')
    } catch {
      setError('Something went wrong generating your workout. Please try again.')
      go('step4')
    }
  }

  async function generateWeek() {
    go('week-loading')
    try {
      const res = await fetch('/api/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: weekGoal, daysAvailable: weekDays, currentFitness: weekFitness, notes: weekNotes }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setWeekPlan(data)
      go('week')
    } catch {
      setError('Something went wrong generating your plan. Please try again.')
      go('week-setup')
    }
  }

  function addNote(text: string) {
    setNotes(prev => prev ? prev + '. ' + text : text)
  }

  const stepDots = (active: number) => (
    <div className={styles.stepDots}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`${styles.stepDot} ${i === active ? styles.dotActive : i < active ? styles.dotDone : ''}`} />
      ))}
    </div>
  )

  const NavBar = ({ active }: { active: 'home' | 'workout' | 'plan' }) => (
    <nav className={styles.navBar}>
      <button className={`${styles.navBtn} ${active === 'home' ? styles.navActive : ''}`} onClick={() => go('home')}>
        <HomeIcon /> Home
      </button>
      <button className={`${styles.navBtn} ${active === 'workout' ? styles.navActive : ''}`} onClick={() => go('step1')}>
        <RunIcon /> Workout
      </button>
      <button className={`${styles.navBtn} ${active === 'plan' ? styles.navActive : ''}`} onClick={() => go('week-setup')}>
        <CalIcon /> Plan
      </button>
    </nav>
  )

  return (
    <div className={styles.shell}>
      <div className={styles.app}>

        {/* HOME */}
        {screen === 'home' && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <span className={styles.logo}>Strides</span>
              <button className={styles.iconBtn}><SettingsIcon /></button>
            </div>
            <div className={styles.body}>
              <div className={styles.greeting}>Good morning</div>
              <h1 className={styles.headline}>Ready to run?</h1>
              <p className={styles.sub}>Tell me what you&apos;re after and I&apos;ll build your perfect session.</p>

              <div className={styles.aiInsight}>
                <div className={styles.aiLabel}>✦ AI insight</div>
                <p className={styles.aiText}>
                  Start a workout to get personalized insights based on your training history and today&apos;s goals.
                </p>
              </div>

              <button className={styles.btnPrimary} onClick={() => go('step1')}>
                + Build Today&apos;s Workout
              </button>
              <button className={styles.btnSecondary} onClick={() => go('week-setup')}>
                Plan My Week
              </button>

              <div className={styles.recentLabel}>Recent runs</div>
              <div className={styles.recentCard}>
                <div className={styles.recentCardTop}>
                  <span className={styles.recentName}>Your first run awaits</span>
                  <span className={styles.recentDate}>—</span>
                </div>
                <p className={styles.recentEmpty}>Generate your first Strides workout to see it here.</p>
              </div>
            </div>
            <NavBar active="home" />
          </div>
        )}

        {/* STEP 1 — FEELING */}
        {screen === 'step1' && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <button className={styles.backBtn} onClick={() => go('home')}>← back</button>
              {stepDots(1)}
            </div>
            <div className={styles.body}>
              <div className={styles.stepLabel}>Step 1 of 4</div>
              <h1 className={styles.stepHeadline}>How are you feeling today?</h1>
              <p className={styles.stepSub}>Your energy shapes everything — be honest with yourself.</p>
              <div className={styles.choiceGrid}>
                {FEELING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.choiceBtn} ${feeling === opt.value ? styles.choiceSelected : ''}`}
                    onClick={() => { setFeeling(opt.value); go('step2') }}
                  >
                    <span className={styles.choiceIcon}>{opt.icon}</span>
                    <span className={styles.choiceName}>{opt.label}</span>
                    <span className={styles.choiceDesc}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — TYPE */}
        {screen === 'step2' && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <button className={styles.backBtn} onClick={() => go('step1')}>← back</button>
              {stepDots(2)}
            </div>
            <div className={styles.body}>
              <div className={styles.stepLabel}>Step 2 of 4</div>
              <h1 className={styles.stepHeadline}>What kind of run?</h1>
              <p className={styles.stepSub}>Pick the intention for your session.</p>
              <div className={styles.choiceGrid}>
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.choiceBtn} ${runType === opt.value ? styles.choiceSelected : ''}`}
                    onClick={() => { setRunType(opt.value); go('step3') }}
                  >
                    <span className={styles.choiceIcon}>{opt.icon}</span>
                    <span className={styles.choiceName}>{opt.label}</span>
                    <span className={styles.choiceDesc}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — DISTANCE & DURATION */}
        {screen === 'step3' && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <button className={styles.backBtn} onClick={() => go('step2')}>← back</button>
              {stepDots(3)}
            </div>
            <div className={styles.body}>
              <div className={styles.stepLabel}>Step 3 of 4</div>
              <h1 className={styles.stepHeadline}>Distance & duration</h1>
              <p className={styles.stepSub}>Set your target mileage and time window.</p>

              <div className={styles.sliderWrap}>
                <div className={styles.sliderDisplay}>{distance.toFixed(1)}</div>
                <div className={styles.sliderUnit}>miles</div>
                <input type="range" min="1" max="26" step="0.5" value={distance}
                  onChange={e => setDistance(parseFloat(e.target.value))} className={styles.slider} />
                <div className={styles.rangeLabels}><span>1 mi</span><span>26 mi</span></div>
              </div>

              <div className={styles.sliderWrap}>
                <div className={styles.sliderDisplay}>{duration}</div>
                <div className={styles.sliderUnit}>minutes</div>
                <input type="range" min="15" max="180" step="5" value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))} className={styles.slider} />
                <div className={styles.rangeLabels}><span>15 min</span><span>3 hrs</span></div>
              </div>

              <div className={styles.pacePreview}>
                Estimated pace: <strong>{paceDisplay()} /mi</strong>
              </div>

              <button className={styles.btnPrimary} onClick={() => go('step4')}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4 — NOTES */}
        {screen === 'step4' && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <button className={styles.backBtn} onClick={() => go('step3')}>← back</button>
              {stepDots(4)}
            </div>
            <div className={styles.body}>
              <div className={styles.stepLabel}>Step 4 of 4</div>
              <h1 className={styles.stepHeadline}>Anything else?</h1>
              <p className={styles.stepSub}>Terrain, injuries, goals — whatever matters to you today.</p>

              <textarea
                className={styles.textarea}
                rows={5}
                placeholder="e.g. My knee has been a bit sore. I'd like trail if possible. Training for a half marathon in December..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <div className={styles.quickTags}>
                {['Trail preferred', 'Road run', 'Knee is sore', 'Half marathon training', 'Marathon training', 'Keep it easy'].map(t => (
                  <button key={t} className={styles.tag} onClick={() => addNote(t)}>{t}</button>
                ))}
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button className={styles.btnPrimary} style={{ marginTop: 'auto' }} onClick={generateWorkout}>
                ✦ Generate My Workout
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {screen === 'loading' && (
          <div className={styles.screen}>
            <div className={styles.loadingScreen}>
              <div className={styles.pulseRing} />
              <div>
                <div className={styles.loadingHeadline}>Building your run</div>
                <p className={styles.loadingText}>Personalizing based on how you feel today...</p>
              </div>
            </div>
          </div>
        )}

        {/* WORKOUT RESULT */}
        {screen === 'workout' && workout && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <span className={styles.logo}>Strides</span>
              <button className={styles.iconBtn}><EditIcon /></button>
            </div>
            <div className={styles.scrollable}>
              <div className={styles.body} style={{ paddingBottom: '100px' }}>
                <div className={styles.stepLabel}>Daily alignment</div>
                <h1 className={styles.stepHeadline}>{workout.name}</h1>

                <div className={styles.aiInsight}>
                  <div className={styles.aiLabel}>✦ Strides AI</div>
                  <p className={styles.aiText}>{workout.insight}</p>
                </div>

                <div className={styles.workoutStats}>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{distance.toFixed(1)}</span>
                    <span className={styles.statLabel}>miles</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{workout.pace}</span>
                    <span className={styles.statLabel}>target pace</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{duration}</span>
                    <span className={styles.statLabel}>minutes</span>
                  </div>
                </div>

                <div className={styles.sectionLabel}>Session structure</div>
                <div className={styles.sessionSteps}>
                  {workout.steps.map((step, i) => (
                    <div key={i} className={styles.sessionStep}>
                      <div className={`${styles.sessionDot} ${step.isKey ? styles.sessionDotKey : ''}`} />
                      <div className={styles.sessionContent}>
                        <div className={styles.sessionName}>{step.name}</div>
                        <div className={styles.sessionDesc}>{step.description}</div>
                      </div>
                      <div className={styles.sessionTime}>{step.duration}</div>
                    </div>
                  ))}
                </div>

                {workout.tips && workout.tips.length > 0 && (
                  <>
                    <div className={styles.sectionLabel} style={{ marginTop: '24px' }}>Coach tips</div>
                    <div className={styles.tipsWrap}>
                      {workout.tips.map((tip, i) => (
                        <div key={i} className={styles.tip}>
                          <span className={styles.tipDot} />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <button className={styles.btnPrimary} style={{ marginTop: '28px' }}>
                  Start Run →
                </button>
                <button className={styles.btnSecondary} onClick={() => go('step1')}>
                  Rebuild workout
                </button>
              </div>
            </div>
            <NavBar active="workout" />
          </div>
        )}

        {/* WEEK SETUP */}
        {screen === 'week-setup' && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <span className={styles.logo}>Strides</span>
              <button className={styles.iconBtn}><CalIcon /></button>
            </div>
            <div className={styles.scrollable}>
              <div className={styles.body} style={{ paddingBottom: '100px' }}>
                <h1 className={styles.stepHeadline}>Plan my week</h1>
                <p className={styles.stepSub}>Tell me your goals and I&apos;ll build a week of training around your schedule.</p>

                <div className={styles.fieldLabel}>Weekly distance goal</div>
                <div className={styles.sliderWrap}>
                  <div className={styles.sliderDisplay}>{weekGoal}</div>
                  <div className={styles.sliderUnit}>miles</div>
                  <input type="range" min="5" max="70" step="1" value={weekGoal}
                    onChange={e => setWeekGoal(parseInt(e.target.value))} className={styles.slider} />
                  <div className={styles.rangeLabels}><span>5 mi</span><span>70 mi</span></div>
                </div>

                <div className={styles.fieldLabel}>Days available to run</div>
                <div className={styles.sliderWrap}>
                  <div className={styles.sliderDisplay}>{weekDays}</div>
                  <div className={styles.sliderUnit}>days per week</div>
                  <input type="range" min="2" max="7" step="1" value={weekDays}
                    onChange={e => setWeekDays(parseInt(e.target.value))} className={styles.slider} />
                  <div className={styles.rangeLabels}><span>2 days</span><span>7 days</span></div>
                </div>

                <div className={styles.fieldLabel}>Current fitness level</div>
                <div className={styles.fitnessOptions}>
                  {FITNESS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`${styles.fitnessBtn} ${weekFitness === opt.value ? styles.fitnessBtnSelected : ''}`}
                      onClick={() => setWeekFitness(opt.value)}
                    >
                      <span className={styles.fitnessLabel}>{opt.label}</span>
                      <span className={styles.fitnessDesc}>{opt.desc}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.fieldLabel}>Goals or context</div>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="e.g. Training for a 10K in 8 weeks, want to add a tempo run..."
                  value={weekNotes}
                  onChange={e => setWeekNotes(e.target.value)}
                />

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button className={styles.btnPrimary} style={{ marginTop: '24px' }} onClick={generateWeek}>
                  ✦ Generate Week Plan
                </button>
              </div>
            </div>
            <NavBar active="plan" />
          </div>
        )}

        {/* WEEK LOADING */}
        {screen === 'week-loading' && (
          <div className={styles.screen}>
            <div className={styles.loadingScreen}>
              <div className={styles.pulseRing} />
              <div>
                <div className={styles.loadingHeadline}>Building your week</div>
                <p className={styles.loadingText}>Structuring your training plan...</p>
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY PLAN RESULT */}
        {screen === 'week' && weekPlan && (
          <div className={styles.screen}>
            <div className={styles.topBar}>
              <span className={styles.logo}>Strides</span>
              <button className={styles.iconBtn} onClick={() => go('week-setup')}><EditIcon /></button>
            </div>
            <div className={styles.scrollable}>
              <div className={styles.body} style={{ paddingBottom: '100px' }}>
                <h1 className={styles.stepHeadline}>Weekly Plan</h1>

                <div className={styles.aiInsight}>
                  <div className={styles.aiLabel}>✦ Strides AI</div>
                  <p className={styles.aiText}>{weekPlan.weekInsight}</p>
                </div>

                <div className={styles.weekDays}>
                  {weekPlan.days.map((day, i) => (
                    <div key={i} className={`${styles.weekDayRow} ${day.type === 'peak' ? styles.weekDayPeak : ''}`}>
                      {day.type === 'peak' && <div className={styles.peakLabel}>Peak workout</div>}
                      <div className={styles.weekDayShort}>{day.dayShort}</div>
                      <div className={styles.weekDayContent}>
                        <div className={`${styles.weekDayTitle} ${day.type === 'rest' ? styles.weekDayRest : ''}`}>
                          {day.title}
                        </div>
                        <div className={styles.weekDayDetail}>{day.detail}</div>
                      </div>
                      <span className={`${styles.badge} ${day.type === 'rest' ? styles.badgeRest : day.type === 'peak' ? styles.badgePeak : styles.badgeRun}`}>
                        {day.badge}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.goalBar}>
                  <div className={styles.goalBarTop}>
                    <span className={styles.goalBarLabel}>Weekly goal: {weekGoal} miles</span>
                    <span className={styles.goalBarSub}>0 / {weekGoal} mi done</span>
                  </div>
                  <div className={styles.goalBarTrack}>
                    <div className={styles.goalBarFill} style={{ width: '0%' }} />
                  </div>
                  <div className={styles.goalBarNote}>Start your runs to track progress</div>
                </div>

                <button className={styles.btnPrimary} style={{ marginTop: '20px' }} onClick={() => go('week-setup')}>
                  ✦ Regenerate Plan
                </button>
                <button className={styles.btnSecondary} onClick={() => go('step1')}>
                  + Build Today&apos;s Workout
                </button>
              </div>
            </div>
            <NavBar active="plan" />
          </div>
        )}

      </div>
    </div>
  )
}

// SVG icons
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
  </svg>
)
const RunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="5" r="1.5" />
    <path d="M9 20l1.5-5 2.5 2 3-7" />
    <path d="M6.5 11.5l2.5-3 3 2 2-3" />
  </svg>
)
const CalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

import { useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Activity, Book, Award, ArrowUpRight, Bell, Trash2, CheckCircle } from 'lucide-react';

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    // Get initial state from location (after assessment)
    const initialState = location.state || { recommendations: [], type: 'unknown' };

    // In real app, create state to hold data if we navigate directly to dashboard
    const [recommendations, setRecommendations] = useState(initialState.recommendations);
    const [type, setType] = useState(initialState.type);

    // New State for features
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);

    useEffect(() => {
        if (!user || !token) return;

        // 1. Load Enrolled Courses from API + sync localStorage
        const loadCourses = async () => {
            try {
                // First, check if there are local courses to sync
                const localKey = `user_courses_${user.id}`;
                const localCourses = JSON.parse(localStorage.getItem(localKey)) || [];

                if (localCourses.length > 0) {
                    // Sync each local course to DB
                    for (const course of localCourses) {
                        try {
                            await axios.post('http://localhost:5000/api/user/enroll', {
                                course_id: course.id,
                                total_lessons: course.total_lessons || 20
                            }, { headers: { Authorization: `Bearer ${token}` } });
                        } catch (e) {
                            // Ignore duplicates
                        }
                    }
                    // Clear local storage after sync attempt
                    localStorage.removeItem(localKey);
                }

                // Now fetch from DB
                const res = await axios.get('http://localhost:5000/api/user/enrollments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Map DB names to UI names if different (image placeholder etc)
                const mapped = res.data.map(c => ({
                    ...c,
                    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'
                }));
                setEnrolledCourses(mapped);
            } catch (err) {
                console.error("Failed to load courses", err);
            }
        };

        // 2. Load Notifications
        const loadNotifications = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setLoadingAlerts(false);
            }
        };

        loadCourses();
        loadNotifications();

    }, [user, token]);

    const completeLesson = async (enrollmentId) => {
        const course = enrolledCourses.find(c => c.id === enrollmentId);
        if (!course || course.completed_lessons >= course.total_lessons) return;

        const newCompleted = course.completed_lessons + 1;
        const newProgress = Math.round((newCompleted / course.total_lessons) * 100);

        try {
            await axios.put(`http://localhost:5000/api/user/enrollments/${enrollmentId}`, {
                progress: newProgress,
                completed_lessons: newCompleted
            }, { headers: { Authorization: `Bearer ${token}` } });

            // Update local state
            setEnrolledCourses(enrolledCourses.map(c =>
                c.id === enrollmentId ? { ...c, progress: newProgress, completed_lessons: newCompleted } : c
            ));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const removeCourse = async (enrollmentId) => {
        if (!confirm('Unenroll from this course?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/user/enrollments/${enrollmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolledCourses(enrolledCourses.filter(c => c.id !== enrollmentId));
        } catch (err) {
            console.error("Failed to unenroll", err);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 mt-10">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-gradient">{user?.name}</span></h1>
                        <p className="text-gray-400">Track your progress and achieve your career goals.</p>
                    </div>
                    {/* Quick Stats or Date could go here */}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. MY LEARNING PATH (Added Courses) */}
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Book className="text-cyan-400" /> My Learning Path
                            </h2>

                            {enrolledCourses.length > 0 ? (
                                <div className="space-y-4">
                                    {enrolledCourses.map((course) => (
                                        <div key={course.id} className="glass-card p-4 flex gap-4 items-center">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-white truncate pr-4">{course.title}</h3>
                                                    <button
                                                        onClick={() => removeCourse(course.id)}
                                                        className="text-gray-500 hover:text-red-400 transition"
                                                        title="Remove course"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                                                    <span className="bg-white/5 px-2 py-0.5 rounded">{course.platform}</span>
                                                    <span>Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                                                </div>

                                                <div className="pt-2">
                                                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                                                        <span className="text-gray-300">
                                                            {course.completedLessons} / {course.totalLessons} Lessons
                                                        </span>
                                                        <span className="text-cyan-400">{course.progress}%</span>
                                                    </div>

                                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${course.progress}%` }}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => completeLesson(course.id)}
                                                        disabled={course.completedLessons >= course.totalLessons}
                                                        className={`w-full py-1.5 rounded text-xs font-bold transition ${course.completedLessons >= course.totalLessons
                                                            ? 'bg-green-500/20 text-green-400 cursor-default'
                                                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                            }`}
                                                    >
                                                        {course.completedLessons >= course.totalLessons ? 'Course Completed' : '+ Mark Next Lesson Complete'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-8 text-center border-dashed border-white/10">
                                    <p className="text-gray-400 mb-4">You haven't added any courses yet.</p>
                                    <Link to="/courses">
                                        <button className="btn-primary text-sm px-6 py-2">Browse Courses</button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* 2. CAREER MATCHES (Existing logic) */}
                        {recommendations.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <Award className="text-purple-400" /> Career AI Recommendations
                                </h2>
                                <div className="space-y-6">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="glass-card p-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full -z-10 group-hover:bg-cyan-500/20 transition-colors" />

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-1">{rec.title}</h3>
                                                    <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                                        {rec.category}
                                                    </span>
                                                </div>
                                                {rec.score && (
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-400">{Math.round(rec.score * 100)}%</div>
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Match</div>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-400 mb-6 max-w-xl">{rec.description}</p>

                                            <div className="mt-6 flex flex-col gap-3">
                                                {rec.sample_courses && rec.sample_courses.length > 0 ? (
                                                    <>
                                                        <h4 className="text-sm font-bold text-gray-300">Recommended Courses:</h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {rec.sample_courses.map((course, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => window.open(course.link, '_blank')}
                                                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition text-xs text-left"
                                                                >
                                                                    <Book className="w-3 h-3 text-cyan-400" />
                                                                    <span className="text-cyan-300 font-medium truncate max-w-[150px]">{course.title}</span>
                                                                    <span className="text-gray-500 text-[10px]">({course.platform})</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : null}

                                                <button
                                                    onClick={() => {
                                                        const catMap = {
                                                            'Technical': 'Development',
                                                            'Creative': 'Design',
                                                            'Business': 'Business',
                                                            'Trade': 'All'
                                                        };
                                                        const targetFilter = catMap[rec.category] || 'All';
                                                        navigate('/courses', { state: { filter: targetFilter } });
                                                    }}
                                                    className="w-full mt-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    View All Related Courses <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">

                        {/* 3. NOTIFICATIONS */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                                <Bell className="text-yellow-400 w-5 h-5" /> Recent Notifications
                            </h3>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingAlerts ? (
                                    <div className="text-center text-gray-500 text-sm py-4">Loading alerts...</div>
                                ) : notifications.length > 0 ? (
                                    notifications.map(alert => (
                                        <div key={alert.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition">
                                            <div className="flex items-start gap-3">
                                                {alert.type === 'success' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                                ) : (
                                                    <Activity className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                                )}
                                                <div>
                                                    <h4 className={`text-sm font-bold ${alert.type === 'success' ? 'text-green-400' : 'text-blue-400'}`}>
                                                        {alert.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                                        {alert.message}
                                                    </p>
                                                    <span className="text-[10px] text-gray-600 mt-2 block">Just now</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                        No new notifications.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Learning Stats (Static for now, can be dynamic based on enrolled courses) */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="text-purple-400" /> Learning Stats</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Courses Enrolled", val: enrolledCourses.length, max: 10, color: "bg-blue-500" },
                                    {
                                        label: "Profile Strength",
                                        val: (() => {
                                            let score = 50; // Base score (Signed up)
                                            if (user.phone) score += 10; // Verified Phone
                                            if (recommendations.length > 0) score += 20; // Taken Assessment
                                            if (enrolledCourses.length > 0) score += 20; // Started Learning
                                            return Math.min(score, 100);
                                        })(),
                                        max: 100,
                                        color: "bg-green-500"
                                    },
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1 text-gray-400">
                                            <span>{stat.label}</span>
                                            <span>{stat.val}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${stat.color} rounded-full`}
                                                style={{ width: `${Math.min((stat.val / stat.max) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

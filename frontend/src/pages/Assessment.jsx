import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { motion } from 'framer-motion';

export default function Assessment() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState(null); // 'skilled' or 'cold_start'
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [step, setStep] = useState('skills'); // 'skills' -> 'details'


    // Cold Start Answers
    const [coldAnswers, setColdAnswers] = useState({
        workType: 'Practical',
        environment: 'Indoor',
        time: 'Short',
        social: 'Team',
        creativity: 'Logical',
        structure: 'Fixed',
        education: 'High School',
        currentStatus: 'Student',
        hobby: 'Gaming',
        value: 'High Pay'
    });

    useEffect(() => {
        axios.get('http://localhost:5000/api/skills').then(res => setSkills(res.data));
    }, []);

    const handleSubmit = async () => {
        try {
            const payload = {
                userId: user?.id,
                assessmentType: mode,
                answers: coldAnswers, // Send answers for BOTH modes now
                skills: mode === 'skilled' ? selectedSkills : []
            };

            const res = await axios.post('http://localhost:5000/api/ai/recommend', payload, {
                headers: { Authorization: `Bearer ${token || ''}` } // Handle no token for demo
            });

            // Navigate to Dashboard with results state
            navigate('/dashboard', { state: { recommendations: res.data.recommendations, type: res.data.type } });

        } catch (err) {
            console.error("Assessment Error:", err);
            const errMsg = err.response?.data?.error || err.message || 'Unknown Error';
            alert(`Error submitting assessment: ${errMsg}`);
        }
    };

    const handleNext = () => {
        if (mode === 'skilled' && step === 'skills') {
            if (selectedSkills.length === 0) return alert("Please select at least one skill.");
            setStep('details');
        } else {
            handleSubmit();
        }
    };

    if (!mode) {
        return (
            <div className="min-h-screen pt-20">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh] px-4">
                    <div className="glass-card p-8 md:p-12 max-w-2xl w-full text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-600"></div>

                        <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'Explorer'}</h2>
                        <p className="mb-10 text-gray-400 text-lg">To provide the best guidance, tell us where you stand today.</p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setMode('skilled')}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-glass-border p-6 rounded-xl hover:border-cyan-500/50 transition-all text-left"
                            >
                                <div className="text-4xl mb-4">🎓</div>
                                <h3 className="text-xl font-bold text-white mb-2">I have skills</h3>
                                <p className="text-sm text-gray-400">Match my existing skills and education to jobs.</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setMode('cold_start')}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-glass-border p-6 rounded-xl hover:border-green-500/50 transition-all text-left"
                            >
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-xl font-bold text-white mb-2">I have no skills / education / interests</h3>
                                <p className="text-sm text-gray-400">I have no specific skills yet. Help me find a direction.</p>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 mt-10">
                <Button variant="secondary" onClick={() => setMode(null)} className="mb-6 text-sm">
                    &larr; Back
                </Button>

                <div className="glass-card p-8">
                    {mode === 'cold_start' ? (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-green-400">Exploration Mode</h2>
                                <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">Beginner Friendly</span>
                            </div>

                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Current Status</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.currentStatus}
                                            onChange={e => setColdAnswers({ ...coldAnswers, currentStatus: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Student">Student</option>
                                            <option className="bg-gray-900" value="Job Seeker">Job Seeker</option>
                                            <option className="bg-gray-900" value="Working Professional">Working Professional</option>
                                            <option className="bg-gray-900" value="Gap Year">Taking a Gap Year</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Highest Education</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.education}
                                            onChange={e => setColdAnswers({ ...coldAnswers, education: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="High School">High School (10th/12th)</option>
                                            <option className="bg-gray-900" value="Diploma">Diploma / ITI</option>
                                            <option className="bg-gray-900" value="Bachelor">Bachelor's Degree</option>
                                            <option className="bg-gray-900" value="Master">Master's / PhD</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">What kind of work?</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.workType}
                                            onChange={e => setColdAnswers({ ...coldAnswers, workType: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Practical">Practical (Hands-on, fixing)</option>
                                            <option className="bg-gray-900" value="Theoretical">Theoretical (Thinking, analyzing)</option>
                                            <option className="bg-gray-900" value="Digital">Digital (Computer based)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Environment?</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.environment}
                                            onChange={e => setColdAnswers({ ...coldAnswers, environment: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Indoor">Indoor (Office, Home)</option>
                                            <option className="bg-gray-900" value="Outdoor">Outdoor (Field, Sites)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Social Preference</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.social}
                                            onChange={e => setColdAnswers({ ...coldAnswers, social: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Team">Team (Work with people)</option>
                                            <option className="bg-gray-900" value="Solo">Independent (Work alone)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Thinking Style</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.creativity}
                                            onChange={e => setColdAnswers({ ...coldAnswers, creativity: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Logical">Logical (Facts, Process)</option>
                                            <option className="bg-gray-900" value="Creative">Creative (Ideas, Design)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Primary Interest / Hobby</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.hobby}
                                            onChange={e => setColdAnswers({ ...coldAnswers, hobby: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Gaming">Gaming / Technology</option>
                                            <option className="bg-gray-900" value="Art">Art / Drawing / Design</option>
                                            <option className="bg-gray-900" value="Social">Social Media / Content</option>
                                            <option className="bg-gray-900" value="Fixing">Fixing things / Mechanics</option>
                                            <option className="bg-gray-900" value="Reading">Reading / Writing</option>
                                            <option className="bg-gray-900" value="Sports">Sports / Fitness</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">What matters most?</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.value}
                                            onChange={e => setColdAnswers({ ...coldAnswers, value: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="High Pay">High Pay / Growth</option>
                                            <option className="bg-gray-900" value="WLB">Work-Life Balance</option>
                                            <option className="bg-gray-900" value="Impact">Helping People / Impact</option>
                                            <option className="bg-gray-900" value="Passion">Following Passion</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Work Structure</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.structure}
                                            onChange={e => setColdAnswers({ ...coldAnswers, structure: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Fixed">Structured (9-5)</option>
                                            <option className="bg-gray-900" value="Flexible">Flexible / Shifts</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-3 text-gray-300">Learning Commitment</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                            value={coldAnswers.time}
                                            onChange={e => setColdAnswers({ ...coldAnswers, time: e.target.value })}
                                        >
                                            <option className="bg-gray-900" value="Short">Short Term (Courses, &lt; 6 months)</option>
                                            <option className="bg-gray-900" value="Long">Long Term (Degrees)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {step === 'skills' ? (
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold text-cyan-400">Skill Assessment</h2>
                                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">Step 1: Select Skills</span>
                                    </div>

                                    <p className="mb-6 text-gray-400">Select the skills you already have to build your profile:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                        {skills.map(skill => (
                                            <motion.div
                                                key={skill.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    if (selectedSkills.includes(skill.id)) {
                                                        setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                                                    } else {
                                                        setSelectedSkills([...selectedSkills, skill.id]);
                                                    }
                                                }}
                                                className={`p-3 border rounded-lg cursor-pointer text-sm font-medium transition-all ${selectedSkills.includes(skill.id)
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                                                    }`}
                                            >
                                                {skill.name}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold text-purple-400">Refine Your Profile</h2>
                                        <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">Step 2: Your Preferences</span>
                                    </div>

                                    {/* Reuse the form logic by copying structure but maybe hiding some fields if needed. For now, showing full form. */}
                                    <div className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block font-medium mb-3 text-gray-300">Current Status</label>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                                    value={coldAnswers.currentStatus}
                                                    onChange={e => setColdAnswers({ ...coldAnswers, currentStatus: e.target.value })}
                                                >
                                                    <option className="bg-gray-900" value="Student">Student</option>
                                                    <option className="bg-gray-900" value="Job Seeker">Job Seeker</option>
                                                    <option className="bg-gray-900" value="Working Professional">Working Professional</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block font-medium mb-3 text-gray-300">Highest Education</label>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                                    value={coldAnswers.education}
                                                    onChange={e => setColdAnswers({ ...coldAnswers, education: e.target.value })}
                                                >
                                                    <option className="bg-gray-900" value="High School">High School (10th/12th)</option>
                                                    <option className="bg-gray-900" value="Diploma">Diploma / ITI</option>
                                                    <option className="bg-gray-900" value="Bachelor">Bachelor's Degree</option>
                                                    <option className="bg-gray-900" value="Master">Master's / PhD</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block font-medium mb-3 text-gray-300">Primary Interest / Hobby</label>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                                    value={coldAnswers.hobby}
                                                    onChange={e => setColdAnswers({ ...coldAnswers, hobby: e.target.value })}
                                                >
                                                    <option className="bg-gray-900" value="Gaming">Gaming / Technology</option>
                                                    <option className="bg-gray-900" value="Art">Art / Drawing / Design</option>
                                                    <option className="bg-gray-900" value="Social">Social Media / Content</option>
                                                    <option className="bg-gray-900" value="Fixing">Fixing things / Mechanics</option>
                                                    <option className="bg-gray-900" value="Reading">Reading / Writing</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block font-medium mb-3 text-gray-300">What matters most?</label>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                                    value={coldAnswers.value}
                                                    onChange={e => setColdAnswers({ ...coldAnswers, value: e.target.value })}
                                                >
                                                    <option className="bg-gray-900" value="High Pay">High Pay / Growth</option>
                                                    <option className="bg-gray-900" value="WLB">Work-Life Balance</option>
                                                    <option className="bg-gray-900" value="Impact">Helping People / Impact</option>
                                                    <option className="bg-gray-900" value="Passion">Following Passion</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleNext}
                        className="w-full justify-center h-12 text-lg mt-4"
                    >
                        {mode === 'skilled' && step === 'skills' ? 'Next: Tell us more' : 'Get AI Recommendations'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

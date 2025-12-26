import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash, Plus, Users, BookOpen, Wrench, Briefcase, BarChart2 } from 'lucide-react';
import Button from '../components/Button';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('careers'); // careers, skills, courses, users

    // Data States
    const [careers, setCareers] = useState([]);
    const [skills, setSkills] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ careerStats: [], courseStats: [] });

    // Form States
    const [newCareer, setNewCareer] = useState({ title: '', description: '', category: 'Technical', min_education: 'Bachelor' });
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical' });
    const [newCourse, setNewCourse] = useState({ title: '', link: '', platform: '', skill_id: '', difficulty: 'Beginner' });

    useEffect(() => {
        if (!token) return;
        fetchData(activeTab);
    }, [token, activeTab]);

    const fetchData = async (tab) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (tab === 'careers') {
                const res = await axios.get('http://localhost:5000/api/admin/careers', { headers });
                setCareers(res.data);
            } else if (tab === 'skills') {
                const res = await axios.get('http://localhost:5000/api/skills', { headers });
                setSkills(res.data);
            } else if (tab === 'courses') {
                const res = await axios.get('http://localhost:5000/api/admin/courses', { headers });
                setCourses(res.data);
            } else if (tab === 'users') {
                const res = await axios.get('http://localhost:5000/api/admin/users', { headers });
                setUsers(res.data);
            } else if (tab === 'stats') {
                const res = await axios.get('http://localhost:5000/api/admin/stats', { headers });
                setStats(res.data);
            }
        } catch (err) {
            console.error(`Failed to fetch ${tab}`, err);
        }
    };

    // --- VALIDATION ---
    const validate = (type, value) => {
        if (type === 'text') return value.length > 0;
        if (type === 'number') return /^\d+$/.test(value);
        if (type === 'phone') return /^\d{10}$/.test(value); // Simple 10 digit check
        return true;
    };

    // --- HANDLERS ---

    // CAREERS
    const addCareer = async () => {
        if (!newCareer.title || !newCareer.description) return alert('Please fill all fields');
        await axios.post('http://localhost:5000/api/admin/careers', newCareer, { headers: { Authorization: `Bearer ${token}` } });
        setNewCareer({ title: '', description: '', category: 'Technical', min_education: 'Bachelor' });
        fetchData('careers');
    };
    const deleteCareer = async (id) => {
        if (!confirm('Delete career?')) return;
        await axios.delete(`http://localhost:5000/api/admin/careers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData('careers');
    };

    // SKILLS
    const addSkill = async () => {
        if (!newSkill.name) return alert('Skill name required');
        await axios.post('http://localhost:5000/api/admin/skills', newSkill, { headers: { Authorization: `Bearer ${token}` } });
        setNewSkill({ name: '', category: 'Technical' });
        fetchData('skills');
    };
    const deleteSkill = async (id) => {
        if (!confirm('Delete skill?')) return;
        await axios.delete(`http://localhost:5000/api/admin/skills/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData('skills');
    };

    // USERS
    const deleteUser = async (id) => {
        if (!confirm('Delete user? This is irreversible.')) return;
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData('users');
    };

    // COURSES (Placeholder for Handler)
    const addCourse = async () => {
        if (!newCourse.title || !newCourse.link) return alert('Title and Link required');
        await axios.post('http://localhost:5000/api/admin/courses', newCourse, { headers: { Authorization: `Bearer ${token}` } });
        setNewCourse({ title: '', link: '', platform: '', skill_id: '', difficulty: 'Beginner' });
        alert('Course added!');
        fetchData('courses');
    };


    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen pt-20 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 mt-10">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <TabButton id="careers" label="Careers" icon={Briefcase} />
                    <TabButton id="skills" label="Skills" icon={Wrench} />
                    <TabButton id="courses" label="Courses" icon={BookOpen} />
                    <TabButton id="users" label="Users" icon={Users} />
                    <TabButton id="stats" label="Stats" icon={BarChart2} />
                </div>

                {/* Content Area */}
                <div className="glass-card p-6">

                    {/* --- CAREERS TAB --- */}
                    {activeTab === 'careers' && (
                        <div>
                            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold mb-4 text-cyan-400">Add New Career</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="input-field"
                                        placeholder="Title (Letters only)"
                                        value={newCareer.title}
                                        onChange={e => setNewCareer({ ...newCareer, title: e.target.value.replace(/[^A-Za-z\s]/g, '') })}
                                    />
                                    <input
                                        className="input-field"
                                        placeholder="Category"
                                        value={newCareer.category}
                                        onChange={e => setNewCareer({ ...newCareer, category: e.target.value.replace(/[^A-Za-z\s]/g, '') })}
                                    />
                                    <textarea
                                        className="input-field md:col-span-2"
                                        placeholder="Description"
                                        value={newCareer.description}
                                        onChange={e => setNewCareer({ ...newCareer, description: e.target.value })}
                                    />
                                    <select className="input-field" value={newCareer.min_education} onChange={e => setNewCareer({ ...newCareer, min_education: e.target.value })}>
                                        <option value="None">None</option><option value="Bachelor">Bachelor</option><option value="Master">Master</option>
                                    </select>
                                    <Button onClick={addCareer} className="md:col-span-2 justify-center">Add Career</Button>
                                </div>
                            </div>

                            <table className="w-full text-left">
                                <thead className="text-gray-400 border-b border-white/10"><tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Action</th></tr></thead>
                                <tbody>
                                    {careers.map(c => (
                                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3">{c.title}</td>
                                            <td className="p-3 text-gray-400">{c.category}</td>
                                            <td className="p-3"><button onClick={() => deleteCareer(c.id)} className="text-red-400"><Trash className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- SKILLS TAB --- */}
                    {activeTab === 'skills' && (
                        <div>
                            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold mb-4 text-cyan-400">Add New Skill</h3>
                                <div className="flex gap-4">
                                    <input
                                        className="input-field flex-1"
                                        placeholder="Skill Name (Letters only)"
                                        value={newSkill.name}
                                        onChange={e => setNewSkill({ ...newSkill, name: e.target.value.replace(/[^A-Za-z\s]/g, '') })}
                                    />
                                    <input
                                        className="input-field flex-1"
                                        placeholder="Category"
                                        value={newSkill.category}
                                        onChange={e => setNewSkill({ ...newSkill, category: e.target.value.replace(/[^A-Za-z\s]/g, '') })}
                                    />
                                    <Button onClick={addSkill}>Add</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {skills.map(s => (
                                    <div key={s.id} className="p-3 bg-white/5 rounded flex justify-between items-center border border-white/10">
                                        <span>{s.name}</span>
                                        <button onClick={() => deleteSkill(s.id)} className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- USERS TAB --- */}
                    {activeTab === 'users' && (
                        <div>
                            <h3 className="text-lg font-bold mb-6 text-cyan-400">Registered Users</h3>
                            <table className="w-full text-left">
                                <thead className="text-gray-400 border-b border-white/10"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Action</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 font-medium">{u.name}</td>
                                            <td className="p-3 text-gray-400">{u.email}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>{u.role}</span></td>
                                            <td className="p-3 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    )}

                    {/* --- STATS TAB --- */}
                    {activeTab === 'stats' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold mb-6 text-purple-400">Popular Careers</h3>
                                <div className="space-y-4">
                                    {stats.careerStats.length > 0 ? stats.careerStats.map((stat, i) => {
                                        const percentage = stats.totalUsers ? ((stat.user_count / stats.totalUsers) * 100).toFixed(1) : 0;
                                        return (
                                            <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <div className="flex justify-between text-sm mb-2 text-gray-300">
                                                    <span className="font-bold text-white">{stat.title}</span>
                                                    <span className="font-bold text-cyan-400">{percentage}% ({stat.user_count} Users)</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-gray-500">No data yet.</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-6 text-green-400">Course Enrollments</h3>
                                <div className="space-y-4">
                                    {stats.courseStats.length > 0 ? stats.courseStats.map((stat, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1 text-gray-300">
                                                <span>{stat.title}</span>
                                                <span className="font-bold">{stat.enrollment_count} Enrolled</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(stat.enrollment_count * 10, 100)}%` }} />
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-500">No enrollments yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- COURSES TAB --- */}
                    {activeTab === 'courses' && (
                        <div>
                            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold mb-4 text-cyan-400">Add New Course</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="input-field"
                                        placeholder="Course Title (e.g. React 19)"
                                        value={newCourse.title}
                                        onChange={e => setNewCourse({ ...newCourse, title: e.target.value.replace(/[^A-Za-z0-9\s-]/g, '') })}
                                    />
                                    <input
                                        type="url"
                                        className="input-field"
                                        placeholder="Course Link (https://...)"
                                        value={newCourse.link}
                                        onChange={e => setNewCourse({ ...newCourse, link: e.target.value })}
                                    />
                                    <input
                                        className="input-field"
                                        placeholder="Platform (Letters only)"
                                        value={newCourse.platform}
                                        onChange={e => setNewCourse({ ...newCourse, platform: e.target.value.replace(/[^A-Za-z\s]/g, '') })}
                                    />
                                    <select className="input-field" value={newCourse.skill_id} onChange={e => setNewCourse({ ...newCourse, skill_id: e.target.value })}>
                                        <option value="">Select Skill</option>
                                        {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <Button onClick={addCourse} className="md:col-span-2 justify-center">Add Course</Button>
                                    <p className="text-xs text-gray-500 md:col-span-2">* Note: Course listing implementation pending for full view.</p>
                                </div>
                            </div>


                            <table className="w-full text-left">
                                <thead className="text-gray-400 border-b border-white/10"><tr><th className="p-3">Title</th><th className="p-3">Platform</th><th className="p-3">Related Skill</th><th className="p-3">Action</th></tr></thead>
                                <tbody>
                                    {courses.map(c => (
                                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 font-medium">{c.title}</td>
                                            <td className="p-3 text-gray-400">{c.platform}</td>
                                            <td className="p-3 text-cyan-400 text-sm">{c.skill_name || 'N/A'}</td>
                                            <td className="p-3"><button onClick={() => deleteCourse(c.id)} className="text-red-400"><Trash className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
            <style>{`
                .input-field {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    color: white;
                    outline: none;
                    width: 100%;
                }
                .input-field:focus {
                    border-color: #06b6d4;
                }
            `}</style>
        </div >
    );
}

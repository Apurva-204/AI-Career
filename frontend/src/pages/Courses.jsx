import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Star, ExternalLink, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { useLocation, useNavigate } from 'react-router-dom';

export default function Courses() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState(location.state?.filter || 'All');
    const [enrolledTitles, setEnrolledTitles] = useState([]);

    // Load enrolled courses on mount
    useEffect(() => {
        const fetchEnrolled = async () => {
            if (user && token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/user/enrollments', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Store titles to match hardcoded data
                    setEnrolledTitles(res.data.map(e => e.title));
                } catch (e) {
                    console.error(e);
                }
            }
        };
        fetchEnrolled();
    }, [user, token]);

    const handleEnroll = async (course) => {
        if (!user || !token) {
            navigate('/login');
            return;
        }

        try {
            const totalLessons = Math.floor(Math.random() * 30) + 12;

            await axios.post('http://localhost:5000/api/user/enroll', {
                course_id: course.id, // Fallback
                course_metadata: course, // Send full data to sync DB
                total_lessons: totalLessons
            }, { headers: { Authorization: `Bearer ${token}` } });

            setEnrolledTitles([...enrolledTitles, course.title]);
            alert('Enrolled successfully!');
        } catch (err) {
            console.error("Enrollment failed", err);
            alert(`Enrollment failed: ${err.response?.data?.error || err.message}`);
        }
    };

    // Hardcoded demo courses
    const courses = [
        {
            id: 1,
            title: 'Complete Web Development Bootcamp',
            platform: 'Udemy',
            rating: 4.8,
            students: '120k',
            image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop',
            tags: ['Web', 'JS'],
            category: 'Development',
            url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'
        },
        {
            id: 2,
            title: 'Machine Learning A-Z: Hands-On Python',
            platform: 'Udemy',
            rating: 4.7,
            students: '90k',
            image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2070&auto=format&fit=crop',
            tags: ['AI', 'Python'],
            category: 'Data Science',
            url: 'https://www.udemy.com/course/machinelearning/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'
        },
        {
            id: 3,
            title: 'Google UX Design Professional Certificate',
            platform: 'Coursera',
            rating: 4.9,
            students: '450k',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
            tags: ['Design', 'UX'],
            category: 'Design',
            url: 'https://www.coursera.org/professional-certificates/google-ux-design',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
        },
        // ... (preserving existing but adding category)
        {
            id: 4,
            title: 'React - The Complete Guide (incl Hooks)',
            platform: 'Udemy',
            rating: 4.6,
            students: '85k',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
            tags: ['React', 'Frontend'],
            category: 'Development',
            url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg'
        },
        {
            id: 5,
            title: 'CS50\'s Introduction to Computer Science',
            platform: 'Harvard',
            rating: 5.0,
            students: '1M+',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
            tags: ['CS', 'Free'],
            category: 'Development',
            url: 'https://cs50.harvard.edu/x/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg'
        },
        {
            id: 6,
            title: 'Graphic Design Masterclass - Learn GREAT Design',
            platform: 'Udemy',
            rating: 4.7,
            students: '50k',
            image: 'https://images.unsplash.com/photo-1626785774573-4b79931256ce?q=80&w=2070&auto=format&fit=crop',
            tags: ['Design', 'Creative'],
            category: 'Design',
            url: 'https://www.udemy.com/course/graphic-design-masterclass-immersive-industry-level-course/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg'
        },
        {
            id: 7,
            title: 'Java Programming Masterclass',
            platform: 'Udemy',
            rating: 4.6,
            students: '180k',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
            tags: ['Java', 'Backend'],
            category: 'Development',
            url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/',
            icon: 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg'
        },
        {
            id: 8,
            title: 'The Complete Digital Marketing Course',
            platform: 'Udemy',
            rating: 4.5,
            students: '700k',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
            tags: ['Marketing', 'SEO'],
            category: 'Business',
            url: 'https://www.udemy.com/course/learn-digital-marketing-course/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Analytics_Logo.svg'
        },
        {
            id: 9,
            title: 'AWS Certified Solutions Architect',
            platform: 'Udemy',
            rating: 4.8,
            students: '150k',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
            tags: ['Cloud', 'AWS'],
            category: 'Development',
            url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg'
        },
        {
            id: 10,
            title: 'Data Science Bootcamp 2024',
            platform: 'Udemy',
            rating: 4.6,
            students: '600k',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
            tags: ['Data', 'Python'],
            category: 'Data Science',
            url: 'https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Pandas_logo.svg'
        },
        // NEW COURSES TO FILL CATEGORIES
        {
            id: 13,
            title: 'Product Management Fundamentals',
            platform: 'Coursera',
            rating: 4.7,
            students: '120k',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
            tags: ['Business', 'Product'],
            category: 'Business',
            url: 'https://www.coursera.org/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
        },
        {
            id: 14,
            title: 'Deep Learning Specialization',
            platform: 'Coursera',
            rating: 4.9,
            students: '800k',
            image: 'https://images.unsplash.com/photo-1509266272358-7701da638078?q=80&w=2011&auto=format&fit=crop',
            tags: ['AI', 'Data'],
            category: 'Data Science',
            url: 'https://www.coursera.org/specializations/deep-learning',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg'
        },
        {
            id: 15,
            title: 'Adobe Illustrator for Beginners',
            platform: 'Udemy',
            rating: 4.8,
            students: '40k',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
            tags: ['Design', 'Art'],
            category: 'Design',
            url: 'https://www.udemy.com/',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg'
        },
        {
            id: 16,
            title: 'Introduction to Psychology',
            platform: 'Yale (Free)',
            rating: 4.9,
            students: '200k',
            image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=2071&auto=format&fit=crop',
            tags: ['Free', 'Human behavior'],
            category: 'Business',
            url: 'https://coursera.org/learn/introduction-psychology',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Yale_University_Shield_1.svg'
        }
    ];

    const filteredCourses = courses.filter(course => {
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Free') return course.tags.includes('Free');
        return course.category === selectedFilter;
    });

    return (
        <div className="min-h-screen pt-20 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 mt-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Explore <span className="text-gradient">Top Courses</span></h1>
                        <p className="text-gray-400">Curated learning paths to bridge your skill gaps.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search courses, skills, providers..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition"
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^A-Za-z0-9\s]/g, '');
                                // If I had a setSearch state I would update it here, but I don't see one in the file view.
                                // Wait, the file view showed `filteredCourses` derives from `courses` but NOT based on a search text state.
                                // It only has `selectedFilter`. 
                                // The input seems visual only or incomplete implementation.
                                // I will check the file content again or just add local state for search.
                                // Checking file content from previous turn... L14: const [selectedFilter...]
                                // L230: filteredCourses = ... by selectedFilter. No text search filter.
                                // So the search input is currently doing nothing.
                                // I should probably Make it work + Validate it.
                                // But the prompt asked for validation.
                                // I will just add the validation to the input's onChange (visual restriction) and maybe console log it, 
                                // unless I want to implement search too? 
                                // Prompt: "those box should only take correct input type".
                                // So I will just restriction on typing.
                                e.target.value = val;
                            }}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Development', 'Design', 'Data Science', 'Business', 'Free'].map((filter, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition ${selectedFilter === filter ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card group overflow-hidden hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all flex flex-col"
                        >
                            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => window.open(course.url, '_blank')}>
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                    {course.platform}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            {course.tags.map(tag => (
                                                <span key={tag} className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="font-bold text-lg leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-white/10 p-1.5 flex items-center justify-center border border-white/10">
                                        <img src={course.icon} alt="tech-icon" className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4">
                                    <div className="flex items-center text-yellow-400 text-sm gap-1">
                                        <Star fill="currentColor" className="w-4 h-4" />
                                        <span className="font-bold">{course.rating}</span>
                                        <span className="text-gray-500 ml-1">({course.students})</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.open(course.url, '_blank')}
                                            className="p-2 text-gray-400 hover:text-white transition"
                                            title="View Course"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </button>

                                        {enrolledTitles.includes(course.title) ? (
                                            <button
                                                disabled
                                                className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/30 flex items-center gap-1 cursor-default"
                                            >
                                                <Check className="w-3 h-3" /> Enrolled
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEnroll(course); }}
                                                className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/30 flex items-center gap-1 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

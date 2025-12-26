import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { ArrowRight, Brain, Target, Zap, BarChart2, ClipboardCheck, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen pt-20">
            <Navbar />

            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8"
                >
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-xs font-medium text-cyan-300 tracking-wide uppercase">Trusted by 50,000+ Indian Students</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl"
                >
                    AI-Powered <br />
                    <span className="text-gradient">Career Pathways</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl"
                >
                    Discover your perfect career match using advanced AI analysis of your skills, interests, and Indian market trends.
                    <span className="text-gray-300"> Tailored for your future.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link to="/assessment">
                        <Button variant="primary" className="h-12 text-lg px-8">
                            Start Your Career Test <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Button
                        variant="secondary"
                        className="h-12 text-lg px-8"
                        onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                    >
                        Explore Features
                    </Button>
                </motion.div>

                {/* Features Grid */}
                <div id="features" className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full">
                    {[
                        { icon: Brain, title: "AI Analysis", desc: "Deep learning algorithms analyze your unique profile." },
                        { icon: Target, title: "Precision Mapping", desc: "Match with careers that fit your exact strengths." },
                        { icon: Zap, title: "Smart Roadmap", desc: "Get a step-by-step plan to reach your goal." },
                        { icon: BarChart2, title: "Skill Gap Analysis", desc: "Identify and bridge gaps between current and target skills." },
                        { icon: ClipboardCheck, title: "Interactive Assessment", desc: "Engaging modules to accurately evaluate your aptitudes." },
                        { icon: Bell, title: "Smart Alerts", desc: "Get notified about high-match job openings instantly." }
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="glass-card p-6 text-left hover:bg-white/5 group"
                        >
                            <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                                <f.icon className="text-cyan-400 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}


import React, { useState, useEffect } from 'react';
import { 
  ResumeData, 
  Experience, 
  Education, 
  Project, 
  Certification,
  Reference,
  FormSection,
  ResumeTemplateType,
  AppMode
} from './types';
import ResumeTemplate from './components/ResumeTemplate';
import AdminDashboard from './components/AdminDashboard';
import { enhanceSummary, enhanceExperienceDescription, analyzeATSCompatibility } from './services/geminiService';

const STORAGE_KEY = 'applicant_tracking_system_resume_active_form';
const SUBMISSIONS_KEY = 'applicant_tracking_system_resume_submissions';

const generateUniqueIdentifier = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('user');
  const [activeSection, setActiveSection] = useState<FormSection>('personal');
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submissions, setSubmissions] = useState<ResumeData[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  const initialData: ResumeData = {
    id: generateUniqueIdentifier(),
    template: 'Standard',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    experiences: [],
    education: [],
    projects: [],
    certifications: [],
    references: [],
    skills: '',
    languages: '',
    jobDescription: ''
  };

  const [data, setData] = useState<ResumeData>(initialData);

  useEffect(() => {
    try {
      const savedSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
      if (savedSubmissions) {
        setSubmissions(JSON.parse(savedSubmissions));
      }

      const activeForm = localStorage.getItem(STORAGE_KEY);
      if (activeForm) {
        setData(JSON.parse(activeForm));
      }
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
  }, []);

  useEffect(() => {
    if (data.fullName || data.email || data.experiences.length > 0) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          console.error("Error saving data to storage:", error);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleInputChange = (field: keyof ResumeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const submitResume = () => {
    try {
      const newSubmissions = [...submissions];
      const existingIdx = newSubmissions.findIndex(s => s.id === data.id);
      
      const submissionData = { 
        ...data, 
        submittedAt: new Date().toISOString() 
      };

      if (existingIdx >= 0) {
        newSubmissions[existingIdx] = submissionData;
      } else {
        newSubmissions.push(submissionData);
      }

      setSubmissions(newSubmissions);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(newSubmissions));
      alert('Resume submitted successfully to the local database!');
    } catch (error) {
      alert('Failed to submit resume. Storage might be full.');
    }
  };

  const createNewResume = () => {
    if (confirm('Create a new resume? This will clear the current editor. Your previously submitted resumes are saved in the Administrator Dashboard.')) {
      setData({ ...initialData, id: generateUniqueIdentifier() });
      localStorage.removeItem(STORAGE_KEY);
      setActiveSection('personal');
    }
  };

  const loadSubmission = (sub: ResumeData) => {
    setData(sub);
    setAppMode('user');
    setActiveSection('personal');
  };

  const deleteSubmission = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this resume submission?')) {
      const updated = submissions.filter(s => s.id !== id);
      setSubmissions(updated);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    }
  };

  const exportSubmissions = () => {
    const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_database_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const addExperience = () => {
    const newExp: Experience = { id: generateUniqueIdentifier(), company: '', position: '', location: '', startDate: '', endDate: '', description: '' };
    setData(prev => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setData(prev => ({ ...prev, experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };

  const aiEnhanceExp = async (id: string) => {
    const exp = data.experiences.find(e => e.id === id);
    if (!exp || !exp.description) return;
    setIsEnhancing(id);
    try {
      const enhanced = await enhanceExperienceDescription(exp);
      updateExperience(id, 'description', enhanced);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(null);
    }
  };

  const runATSAnalysis = async () => {
    if (!data.jobDescription) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeATSCompatibility(data, data.jobDescription);
      handleInputChange('atsScore', result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addEducation = () => {
    const newEdu: Education = { id: generateUniqueIdentifier(), school: '', degree: '', location: '', gradDate: '', grades: '' };
    setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };

  const addProject = () => {
    const newProj: Project = { id: generateUniqueIdentifier(), title: '', description: '', date: '' };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  };

  const addCertification = () => {
    const newCert: Certification = { id: generateUniqueIdentifier(), name: '', issuer: '', date: '' };
    setData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c) }));
  };

  const addReference = () => {
    const newRef: Reference = { id: generateUniqueIdentifier(), name: '', position: '', organization: '', email: '', phone: '' };
    setData(prev => ({ ...prev, references: [...prev.references, newRef] }));
  };

  const updateReference = (id: string, field: keyof Reference, value: string) => {
    setData(prev => ({ ...prev, references: prev.references.map(r => r.id === id ? { ...r, [field]: value } : r) }));
  };

  const NavButton: React.FC<{ section: FormSection; label: string }> = ({ section, label }) => (
    <button 
      onClick={() => setActiveSection(section)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        activeSection === section ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20 no-print">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppMode('user')}>
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight italic">Applicant Tracking System Intelligence</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg no-print">
            <button onClick={() => setAppMode('user')} className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${appMode === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Resume Editor
            </button>
            <button onClick={() => setAppMode('admin')} className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${appMode === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Administrator Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          <div className="flex flex-col items-end mr-4">
            {saveStatus === 'saving' && <span className="text-[10px] text-gray-400 italic animate-pulse">Synchronizing Data...</span>}
            {saveStatus === 'saved' && <span className="text-[10px] text-green-500 font-bold">Successfully Saved Progress</span>}
          </div>
          
          <button onClick={createNewResume} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-xs font-bold transition-colors">Start New Project</button>
          <button onClick={submitResume} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-all">Submit Final Resume</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Generate Portable Document Format
          </button>
        </div>
      </header>

      {appMode === 'admin' ? (
        <div className="flex-1 p-8 overflow-hidden bg-gray-50">
          <AdminDashboard submissions={submissions} onView={loadSubmission} onDelete={deleteSubmission} onExport={exportSubmissions} />
        </div>
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row p-6 gap-8 overflow-hidden">
          <section className="w-full lg:w-[500px] flex flex-col h-full bg-white rounded-3xl border shadow-xl no-print overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              <NavButton section="personal" label="Information" />
              <NavButton section="summary" label="Biography" />
              <NavButton section="education" label="Education" />
              <NavButton section="experience" label="Experience" />
              <NavButton section="projects" label="Projects" />
              <NavButton section="skills" label="Skills" />
              <NavButton section="certifications" label="Certifications" />
              <NavButton section="references" label="References" />
              <NavButton section="ats" label="Intelligence" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <label className="block text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3">Choose Visual Layout Style</label>
                <div className="flex flex-wrap gap-2">
                  {(['Standard', 'Technology', 'Business', 'Creative'] as ResumeTemplateType[]).map(t => (
                    <button key={t} onClick={() => handleInputChange('template', t)} className={`px-4 py-2 text-[11px] font-black rounded-xl border-2 transition-all ${data.template === t ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {t} Layout
                    </button>
                  ))}
                </div>
              </div>

              {activeSection === 'personal' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 inline-block">Personal Details</h3>
                  <div className="grid grid-cols-1 gap-5">
                    <div><label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">Full Legal Name</label><input type="text" className="w-full border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 outline-none transition-all" placeholder="Enter your full legal name" value={data.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">Electronic Mail Address</label><input type="email" className="w-full border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 outline-none transition-all" placeholder="email@example.com" value={data.email} onChange={(e) => handleInputChange('email', e.target.value)} /></div>
                      <div><label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">Telephone Number</label><input type="text" className="w-full border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 outline-none transition-all" placeholder="+60 12-345 6789" value={data.phone} onChange={(e) => handleInputChange('phone', e.target.value)} /></div>
                    </div>
                    <div><label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">Current Living Address</label><input type="text" className="w-full border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 outline-none transition-all" placeholder="City, State, Country" value={data.location} onChange={(e) => handleInputChange('location', e.target.value)} /></div>
                    <div><label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">LinkedIn Profile Address</label><input type="text" className="w-full border-2 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 outline-none transition-all" placeholder="linkedin.com/in/username" value={data.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} /></div>
                  </div>
                </div>
              )}

              {activeSection === 'summary' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Biography Summary</h3>
                    <button onClick={async () => { setIsEnhancing('summary'); const s = await enhanceSummary(data); handleInputChange('summary', s); setIsEnhancing(null); }} disabled={isEnhancing === 'summary'} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800">
                      {isEnhancing === 'summary' ? 'Generating Content...' : '✨ Generate Using Intelligence'}
                    </button>
                  </div>
                  <textarea className="w-full border-2 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 outline-none transition-all min-h-[220px] text-sm leading-relaxed" placeholder="Write a compelling biography summary about your professional background and career aspirations..." value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} />
                </div>
              )}

              {activeSection === 'education' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Educational History</h3>
                    <button onClick={addEducation} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">+ Add Educational Institution</button>
                  </div>
                  {data.education.map(edu => (
                    <div key={edu.id} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative group hover:border-blue-200 transition-all">
                      <button onClick={() => setData(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))} className="absolute -right-3 -top-3 bg-white text-red-500 shadow-xl border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Educational Institution Name</label><input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none focus:border-blue-500 border-gray-100" placeholder="University or College Name" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Degree Title and Field of Study</label><input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none focus:border-blue-500 border-gray-100" placeholder="Bachelor of Science in Information Technology" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} /></div>
                      <div className="grid grid-cols-3 gap-3">
                         <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Grade Point Average</label><input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none focus:border-blue-500 border-gray-100" placeholder="3.80" value={edu.gpa} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} /></div>
                         <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Graduation Month and Year</label><input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none focus:border-blue-500 border-gray-100" placeholder="December 2024" value={edu.gradDate} onChange={e => updateEducation(edu.id, 'gradDate', e.target.value)} /></div>
                         <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Academic Result Honors</label><input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none focus:border-blue-500 border-gray-100" placeholder="First Class Honors" value={edu.grades} onChange={e => updateEducation(edu.id, 'grades', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Professional Experience</h3>
                    <button onClick={addExperience} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">+ Add Working Experience</button>
                  </div>
                  {data.experiences.map(exp => (
                    <div key={exp.id} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative group hover:border-blue-200 transition-all">
                      <button onClick={() => setData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== exp.id) }))} className="absolute -right-3 -top-3 bg-white text-red-500 shadow-xl border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm font-bold outline-none border-gray-100 focus:border-blue-500" placeholder="Organization or Company Name" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Professional Job Position" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} />
                      <div className="flex gap-4">
                        <input className="flex-1 border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Start Month and Year" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                        <input className="flex-1 border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="End Month and Year" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                      </div>
                      <textarea className="w-full border-2 p-3 rounded-xl bg-white text-sm min-h-[120px] outline-none border-gray-100 focus:border-blue-500" placeholder="Describe your key responsibilities and significant achievements..." value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} />
                      <button onClick={() => aiEnhanceExp(exp.id)} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                        {isEnhancing === exp.id ? 'Optimizing Content...' : '✨ Intelligence Formatting to Bullet Points'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'projects' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Significant Projects</h3>
                    <button onClick={addProject} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">+ Add Project Details</button>
                  </div>
                  {data.projects.map(proj => (
                    <div key={proj.id} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative group hover:border-blue-200 transition-all">
                      <button onClick={() => setData(p => ({ ...p, projects: p.projects.filter(pr => pr.id !== proj.id) }))} className="absolute -right-3 -top-3 bg-white text-red-500 shadow-xl border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm font-bold outline-none border-gray-100 focus:border-blue-500" placeholder="Project Title Name" value={proj.title} onChange={e => updateProject(proj.id, 'title', e.target.value)} />
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Month and Year of Completion" value={proj.date} onChange={e => updateProject(proj.id, 'date', e.target.value)} />
                      <textarea className="w-full border-2 p-3 rounded-xl bg-white text-sm min-h-[100px] outline-none border-gray-100 focus:border-blue-500" placeholder="Detailed description of project impact and your specific role..." value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'skills' && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 inline-block">Skills and Competencies</h3>
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase mb-2 block">Technical and Interpersonal Skills</label>
                    <textarea className="w-full border-2 p-4 rounded-2xl text-sm min-h-[120px] outline-none focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 leading-relaxed transition-all" placeholder="e.g. JavaScript Programming, Python Data Science, Leadership, Communication..." value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Professional Tip: Use comma separation for efficient Applicant Tracking System processing.</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase mb-2 block">Languages Proficient In Speaking and Writing</label>
                    <input type="text" className="w-full border-2 p-4 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 transition-all" placeholder="e.g. English (Native), Malay (Professional), Mandarin (Beginner)" value={data.languages} onChange={(e) => handleInputChange('languages', e.target.value)} />
                  </div>
                </div>
              )}

              {activeSection === 'certifications' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Professional Certifications</h3>
                    <button onClick={addCertification} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">+ Add New Certification</button>
                  </div>
                  {data.certifications.map(cert => (
                    <div key={cert.id} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative group hover:border-blue-200 transition-all">
                      <button onClick={() => setData(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== cert.id) }))} className="absolute -right-3 -top-3 bg-white text-red-500 shadow-xl border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm font-bold outline-none border-gray-100 focus:border-blue-500" placeholder="Official Certification Name" value={cert.name} onChange={e => updateCertification(cert.id, 'name', e.target.value)} />
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Issuing Authority Organization" value={cert.issuer} onChange={e => updateCertification(cert.id, 'issuer', e.target.value)} />
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Date Issued" value={cert.date} onChange={e => updateCertification(cert.id, 'date', e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'references' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Professional References</h3>
                    <button onClick={addReference} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">+ Add New Reference</button>
                  </div>
                  {data.references.map(ref => (
                    <div key={ref.id} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl space-y-4 relative group hover:border-blue-200 transition-all">
                      <button onClick={() => setData(p => ({ ...p, references: p.references.filter(r => r.id !== ref.id) }))} className="absolute -right-3 -top-3 bg-white text-red-500 shadow-xl border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      <input className="w-full border-2 p-3 rounded-xl bg-white text-sm font-bold outline-none border-gray-100 focus:border-blue-500" placeholder="Full Professional Reference Name" value={ref.name} onChange={e => updateReference(ref.id, 'name', e.target.value)} />
                      <div className="grid grid-cols-2 gap-4">
                         <input className="border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Job Title Position" value={ref.position} onChange={e => updateReference(ref.id, 'position', e.target.value)} />
                         <input className="border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Organization or Company" value={ref.organization} onChange={e => updateReference(ref.id, 'organization', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <input className="border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Electronic Mail Address" value={ref.email} onChange={e => updateReference(ref.id, 'email', e.target.value)} />
                         <input className="border-2 p-3 rounded-xl bg-white text-sm outline-none border-gray-100 focus:border-blue-500" placeholder="Telephone Number" value={ref.phone} onChange={e => updateReference(ref.id, 'phone', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'ats' && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 inline-block">Applicant Tracking System Match Intelligence</h3>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-xs text-blue-900 leading-relaxed italic">
                    Paste the target job description below. Our Gemini Artificial Intelligence will analyze your resume and provide a compatibility score along with critical missing keywords to help you pass automated screening systems.
                  </div>
                  <textarea className="w-full border-2 p-5 rounded-3xl min-h-[250px] text-sm outline-none focus:ring-4 focus:ring-blue-100 border-gray-100 focus:border-blue-500 leading-relaxed transition-all shadow-inner" placeholder="Paste the full job description text here..." value={data.jobDescription} onChange={(e) => handleInputChange('jobDescription', e.target.value)} />
                  <button onClick={runATSAnalysis} disabled={isAnalyzing || !data.jobDescription} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all uppercase tracking-widest text-xs">
                    {isAnalyzing ? 'Analyzing Resume Compatibility...' : 'Execute Intelligent Matching Analysis'}
                  </button>
                  {data.atsScore && (
                    <div className="p-8 bg-white border-2 border-blue-100 rounded-[2rem] space-y-6 shadow-2xl animate-fadeIn">
                      <div className="flex justify-between items-center"><span className="font-black text-gray-800 uppercase tracking-tighter">Compatibility Match Score Percentage</span><span className="text-4xl font-black text-blue-600">{data.atsScore.score}%</span></div>
                      <div className="w-full bg-gray-100 h-5 rounded-full overflow-hidden shadow-inner border border-gray-200"><div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-1000 ease-out" style={{ width: `${data.atsScore.score}%` }}></div></div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-3">Critical Keywords Missing From Content</h4>
                        <div className="flex flex-wrap gap-3">{data.atsScore.missingKeywords.map((k, i) => <span key={i} className="bg-blue-50 border-2 border-blue-100 px-3 py-1.5 rounded-xl text-[11px] font-black text-blue-700 shadow-sm">+{k}</span>)}</div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl italic text-sm text-gray-800 leading-relaxed border-l-4 border-blue-600">
                        "{data.atsScore.feedback}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="no-print mb-6 px-6 py-2 bg-white border-2 rounded-full text-[11px] font-black text-gray-800 inline-flex items-center gap-3 self-center shadow-xl uppercase tracking-widest">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse ring-4 ring-green-100"></span>
              Real-Time Visual Representation: {data.template} Style Layout
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center pb-20 custom-scrollbar">
              <ResumeTemplate data={data} />
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default App;

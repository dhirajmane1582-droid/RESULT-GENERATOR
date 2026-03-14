import { useState, useRef, useEffect } from 'react';
import { Save, Download, GraduationCap, User, BookOpen, MessageSquare, Trash2, Plus, Settings, Calendar, Eye, X, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Remarks {
  specialImprovements: string;
  hobbies: string;
  necessaryImprovement: string;
}

interface StudentData {
  name: string;
  std: string;
  division: string;
  rollNo: string;
  dob: string;
  medium: 'English' | 'Semi';
  overallPercentage: string;
  result: string;
  promotedTo: string;
  schoolReopens: string;
  subjects: { id: string; name: string; sem1: string; sem2: string }[];
  remarks: {
    sem1: Remarks;
    sem2: Remarks;
  };
}

const STANDARDS = [
  'NUR', 'JR. KG', 'SR. KG',
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th'
];

const SUBJECT_MAPPING: Record<string, string[]> = {
  'NUR': ['English', 'Maths', 'Drawing', 'Oral'],
  'JR. KG': ['English', 'Maths', 'Drawing', 'Oral'],
  'SR. KG': ['English', 'Maths', 'Drawing', 'Oral'],
  '1st': ['English', 'Marathi', 'Hindi', 'Maths', 'E.V.S'],
  '2nd': ['English', 'Marathi', 'Hindi', 'Maths', 'E.V.S'],
  '3rd': ['English', 'Marathi', 'Hindi', 'Maths', 'E.V.S'],
  '4th': ['English', 'Marathi', 'Hindi', 'Maths', 'E.V.S'],
  '5th': ['Marathi', 'Hindi', 'English', 'Maths', 'History', 'Geography', 'Science'],
  '6th': ['Marathi', 'Hindi', 'English', 'Maths', 'History', 'Geography', 'Science'],
  '7th': ['Marathi', 'Hindi', 'English', 'Maths', 'History', 'Geography', 'Science'],
  '8th': ['Marathi', 'Hindi', 'English', 'Maths', 'History', 'Geography', 'Science'],
  '9th': ['Marathi', 'Hindi', 'English', 'Maths', 'Science', 'Social Science'],
  '10th': ['Marathi', 'Hindi', 'English', 'Maths', 'Science', 'Social Science'],
};

const DEFAULT_SUBJECTS = SUBJECT_MAPPING['1st'].map((name, index) => ({
  id: (index + 1).toString(),
  name,
  sem1: '',
  sem2: ''
}));

const INITIAL_DATA: StudentData = {
  name: '',
  std: '1st',
  division: 'A',
  rollNo: '',
  dob: '',
  medium: 'English',
  overallPercentage: '',
  result: 'PASS',
  promotedTo: '',
  schoolReopens: '11TH JUNE 2026',
  subjects: [...DEFAULT_SUBJECTS],
  remarks: {
    sem1: { specialImprovements: '', hobbies: '', necessaryImprovement: '' },
    sem2: { specialImprovements: '', hobbies: '', necessaryImprovement: '' }
  }
};

export default function App() {
  const [data, setData] = useState<StudentData>(INITIAL_DATA);
  const [isManagingSubjects, setIsManagingSubjects] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewBW, setIsPreviewBW] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const reportBWRef = useRef<HTMLDivElement>(null);

  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const schoolName = data.medium === 'English' 
    ? 'INDRAYANI ENGLISH MEDIUM SCHOOL' 
    : 'INDRAYANI INTERNATIONAL SCHOOL';

  const udise = data.medium === 'English'
    ? '27211003415/27211003417'
    : '27211003501/27211003519';

  const handleStandardChange = (std: string) => {
    const subjectNames = SUBJECT_MAPPING[std] || SUBJECT_MAPPING['1st'];
    setData(prev => ({
      ...prev,
      std,
      subjects: subjectNames.map((name, index) => ({
        id: (index + 1).toString(),
        name,
        sem1: '',
        sem2: ''
      }))
    }));
  };

  const handleSubjectChange = (id: string, sem: 'sem1' | 'sem2', value: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, [sem]: value } : s)
    }));
  };

  const handleSubjectNameChange = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, name } : s)
    }));
  };

  const addSubject = () => {
    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { id: Math.random().toString(36).substr(2, 9), name: 'New Subject', sem1: '', sem2: '' }]
    }));
  };

  const deleteSubject = (id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id)
    }));
  };

  const handleRemarkChange = (sem: 'sem1' | 'sem2', field: keyof Remarks, value: string) => {
    setData(prev => ({
      ...prev,
      remarks: {
        ...prev.remarks,
        [sem]: {
          ...prev.remarks[sem],
          [field]: value
        }
      }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async (mode: 'color' | 'bw' = 'color') => {
    const targetRef = mode === 'bw' ? reportBWRef : reportRef;
    if (!targetRef.current || isGenerating) return;
    
    setIsGenerating(mode);
    try {
      const canvas = await html2canvas(targetRef.current, {
        scale: 3, // Increased scale for high quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1119, // Adjusted for 296mm
        imageTimeout: 0,
        removeContainer: true
      });
      
      const imgData = canvas.toDataURL('image/png'); // PNG for lossless quality
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 296, undefined, 'FAST');
      pdf.save(`Result_${data.name || 'Student'}_${mode}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-6 px-4 sm:px-6 lg:px-8 font-sans text-[#1C1E21]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-xl shadow-sm border border-[#DADDE1]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-[#1877F2] p-2 sm:p-2.5 rounded-lg shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#1C1E21] leading-tight">Result Generator</h1>
              <p className="text-[#65676B] text-[9px] sm:text-xs font-medium uppercase tracking-wider">Indrayani Institutions</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex gap-1.5">
              <button 
                onClick={() => { setIsPreviewBW(false); setIsPreviewOpen(true); }}
                className="px-3 py-2 text-[10px] sm:text-xs font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#DBE7F2] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> <span>Preview</span>
              </button>
              <button 
                onClick={() => setIsManagingSubjects(!isManagingSubjects)}
                className={`px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${isManagingSubjects ? 'bg-[#1877F2] text-white' : 'bg-[#E4E6EB] text-[#4B4F56]'}`}
              >
                <Settings className="w-3.5 h-3.5" /> <span>{isManagingSubjects ? 'Done' : 'Setup'}</span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-[#DADDE1] mx-1 hidden sm:block" />
            <div className="flex gap-1">
              <button 
                onClick={() => generatePDF('color')}
                disabled={!!isGenerating}
                className={`px-2.5 py-2 text-[10px] sm:text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${isGenerating === 'color' ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isGenerating === 'color' ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden xs:inline">Color</span>
              </button>
              <button 
                onClick={() => generatePDF('bw')}
                disabled={!!isGenerating}
                className={`px-2.5 py-2 text-[10px] sm:text-xs font-bold text-white bg-[#4B4F56] hover:bg-[#333] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${isGenerating === 'bw' ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isGenerating === 'bw' ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden xs:inline">B/W</span>
              </button>
            </div>
          </div>
        </header>

        {isManagingSubjects && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-[#DADDE1] space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-[#1C1E21] uppercase tracking-wider">Subject Manager</h2>
                <button 
                  onClick={() => setData(INITIAL_DATA)}
                  className="px-2 py-1 text-[10px] font-bold text-[#FA3E3E] bg-[#FEEBEB] hover:bg-[#FCD9D9] rounded-md transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Reset All
                </button>
              </div>
              <button 
                onClick={addSubject}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#42B72A] hover:bg-[#36A420] rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.subjects.map((s) => (
                <div key={s.id} className="flex items-center gap-2 p-2 bg-[#F0F2F5] rounded-lg border border-[#DADDE1]">
                  <input 
                    type="text"
                    value={s.name}
                    onChange={(e) => handleSubjectNameChange(s.id, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm bg-white border border-[#CCD0D5] rounded focus:ring-1 focus:ring-[#1877F2] outline-none"
                  />
                  <button 
                    onClick={() => deleteSubject(s.id)}
                    className="p-1.5 text-[#FA3E3E] hover:bg-[#FEEBEB] rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Form Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Student Info & Grades */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Info Card */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-[#DADDE1] space-y-5">
              <div className="flex items-center gap-2 text-[#1877F2] font-bold text-xs uppercase tracking-widest">
                <User className="w-4 h-4" /> Student Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Medium</label>
                  <select 
                    value={data.medium}
                    onChange={(e) => setData(prev => ({ ...prev, medium: e.target.value as 'English' | 'Semi' }))}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  >
                    <option value="English">English</option>
                    <option value="Semi">Semi</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Student Name</label>
                  <input 
                    type="text"
                    value={data.name}
                    onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Standard</label>
                  <select 
                    value={data.std}
                    onChange={(e) => handleStandardChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  >
                    {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Division</label>
                  <input 
                    type="text"
                    value={data.division}
                    onChange={(e) => setData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Roll Number</label>
                  <input 
                    type="text"
                    value={data.rollNo}
                    onChange={(e) => setData(prev => ({ ...prev, rollNo: e.target.value }))}
                    placeholder="Roll No"
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Date of Birth</label>
                  <input 
                    type="date"
                    value={data.dob}
                    onChange={(e) => setData(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Academic Grades Card */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-[#DADDE1] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1877F2] font-bold text-xs uppercase tracking-widest">
                  <BookOpen className="w-4 h-4" /> Academic Grades
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#65676B] uppercase">Overall %</span>
                  <input 
                    type="text"
                    value={data.overallPercentage}
                    onChange={(e) => setData(prev => ({ ...prev, overallPercentage: e.target.value }))}
                    placeholder="0.00"
                    className="w-20 px-2 py-1 bg-[#F0F2F5] border border-[#CCD0D5] rounded text-center font-mono font-bold text-sm focus:border-[#1877F2] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.subjects.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border border-[#EBEDF0] bg-[#F0F2F5]/50 space-y-2">
                    <h3 className="text-[11px] font-bold text-[#4B4F56] tracking-wide">{s.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#90949C] uppercase block">Sem 1</label>
                        <input 
                          type="text"
                          value={s.sem1}
                          onChange={(e) => handleSubjectChange(s.id, 'sem1', e.target.value)}
                          placeholder="Grade/No"
                          className="w-full px-2 py-1.5 bg-white border border-[#CCD0D5] rounded text-center font-bold text-sm focus:border-[#1877F2] outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#90949C] uppercase block">Sem 2</label>
                        <input 
                          type="text"
                          value={s.sem2}
                          onChange={(e) => handleSubjectChange(s.id, 'sem2', e.target.value)}
                          placeholder="Grade/No"
                          className="w-full px-2 py-1.5 bg-white border border-[#CCD0D5] rounded text-center font-bold text-sm focus:border-[#1877F2] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Remarks & Result */}
          <div className="space-y-6">
            {/* Result Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-[#DADDE1] space-y-5">
              <div className="flex items-center gap-2 text-[#1877F2] font-bold text-xs uppercase tracking-widest">
                <Calendar className="w-4 h-4" /> Result Details
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Result Status</label>
                  <select 
                    value={data.result}
                    onChange={(e) => setData(prev => ({ ...prev, result: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="PROMOTED">PROMOTED</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">Promoted To</label>
                  <input 
                    type="text"
                    value={data.promotedTo}
                    onChange={(e) => setData(prev => ({ ...prev, promotedTo: e.target.value }))}
                    placeholder="e.g. CLASS 2"
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">School Reopens</label>
                  <input 
                    type="text"
                    value={data.schoolReopens}
                    onChange={(e) => setData(prev => ({ ...prev, schoolReopens: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Remarks Sections */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-[#DADDE1] space-y-5">
              <div className="flex items-center gap-2 text-[#1877F2] font-bold text-xs uppercase tracking-widest">
                <MessageSquare className="w-4 h-4" /> Evaluation Criteria
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-[#90949C] uppercase border-b pb-1">Semester 1</h4>
                  <RemarkField label="Special Improvements" value={data.remarks.sem1.specialImprovements} onChange={(val) => handleRemarkChange('sem1', 'specialImprovements', val)} />
                  <RemarkField label="Hobbies & Interests" value={data.remarks.sem1.hobbies} onChange={(val) => handleRemarkChange('sem1', 'hobbies', val)} />
                  <RemarkField label="Necessary Improvements" value={data.remarks.sem1.necessaryImprovement} onChange={(val) => handleRemarkChange('sem1', 'necessaryImprovement', val)} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-[#90949C] uppercase border-b pb-1">Semester 2</h4>
                  <RemarkField label="Special Improvements" value={data.remarks.sem2.specialImprovements} onChange={(val) => handleRemarkChange('sem2', 'specialImprovements', val)} />
                  <RemarkField label="Hobbies & Interests" value={data.remarks.sem2.hobbies} onChange={(val) => handleRemarkChange('sem2', 'hobbies', val)} />
                  <RemarkField label="Necessary Improvements" value={data.remarks.sem2.necessaryImprovement} onChange={(val) => handleRemarkChange('sem2', 'necessaryImprovement', val)} />
                </div>
              </div>
            </section>

            <button 
              onClick={() => generatePDF('color')}
              disabled={!!isGenerating}
              className={`w-full py-3.5 bg-[#1877F2] text-white rounded-xl font-bold shadow-md hover:bg-[#166FE5] transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isGenerating ? 'Generating...' : 'Save & Generate PDF'}
            </button>
          </div>
        </div>

        {/* Hidden Report Template for PDF Generation */}
        <div className="fixed top-0 left-0 pointer-events-none -z-50 overflow-hidden" style={{ width: '210mm', height: '297mm', transform: 'translateX(-1000%)' }}>
          <div ref={reportRef} style={{ width: '210mm', height: '297mm', backgroundColor: 'white' }}>
            <ReportContent data={data} schoolName={schoolName} udise={udise} isBW={false} />
          </div>
          <div ref={reportBWRef} style={{ width: '210mm', height: '297mm', backgroundColor: 'white' }}>
            <ReportContent data={data} schoolName={schoolName} udise={udise} isBW={true} />
          </div>
        </div>

        {/* Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1877F2] p-1.5 rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1C1E21]">Report Card Preview</h3>
                    <p className="text-[10px] text-[#65676B] font-medium uppercase tracking-wider">A4 Standard Layout</p>
                  </div>
                </div>
            <div className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={() => setIsPreviewBW(!isPreviewBW)}
                    className={`p-2 sm:px-4 sm:py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${isPreviewBW ? 'bg-[#151619] text-white' : 'bg-[#E4E6EB] text-[#4B4F56]'}`}
                  >
                    {isPreviewBW ? 'Show Color' : 'Show B/W'}
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-2 sm:px-4 sm:py-2 text-xs font-bold text-[#4B4F56] bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
                  </button>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => generatePDF('color')}
                      disabled={!!isGenerating}
                      className="p-2 sm:px-4 sm:py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isGenerating === 'color' ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                      <span className="hidden sm:inline">Color</span>
                    </button>
                    <button 
                      onClick={() => generatePDF('bw')}
                      disabled={!!isGenerating}
                      className="p-2 sm:px-4 sm:py-2 text-xs font-bold text-white bg-[#4B4F56] hover:bg-[#333] rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isGenerating === 'bw' ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                      <span className="hidden sm:inline">B/W</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsPreviewOpen(false)} 
                    className="p-1.5 sm:p-2 hover:bg-[#F0F2F5] rounded-full transition-colors text-[#65676B]"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#8E9299]/20 flex justify-center items-start overflow-x-hidden">
                <div className="relative py-8">
                  <div className={`shadow-2xl bg-white transform origin-top transition-transform duration-300 ${isPreviewBW ? 'grayscale-report' : ''}`} 
                       style={{ 
                         transform: `scale(${windowWidth < 480 ? 0.35 : windowWidth < 640 ? 0.45 : windowWidth < 768 ? 0.6 : windowWidth < 1024 ? 0.8 : 1})`,
                         width: '210mm',
                         height: '297mm'
                       }}>
                    <ReportContent data={data} schoolName={schoolName} udise={udise} isBW={isPreviewBW} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportContent({ data, schoolName, udise, isBW = false }: { data: StudentData, schoolName: string, udise: string, isBW?: boolean }) {
  const subjectCount = data.subjects.length;
  
  // Aggressive Dynamic Scaling Logic to ensure A4 fit
  const getScaleStyles = () => {
    if (subjectCount <= 5) return { 
      fontSize: 'text-[13px]', 
      padding: 'py-5 px-4', 
      evalPadding: 'p-4',
      evalFontSize: 'text-[12px]',
      sectionMargin: 'mb-0',
      headerMargin: 'mb-0',
      resultPadding: 'p-5',
      sigPadding: 'pt-8',
      remarkMaxHeight: 'max-h-[120px]'
    };
    if (subjectCount <= 7) return { 
      fontSize: 'text-[12px]', 
      padding: 'py-4 px-4', 
      evalPadding: 'p-3.5',
      evalFontSize: 'text-[11px]',
      sectionMargin: 'mb-0',
      headerMargin: 'mb-0',
      resultPadding: 'p-4',
      sigPadding: 'pt-7'
    };
    if (subjectCount <= 9) return { 
      fontSize: 'text-[11px]', 
      padding: 'py-3 px-3', 
      evalPadding: 'p-3',
      evalFontSize: 'text-[10px]',
      sectionMargin: 'mb-0',
      headerMargin: 'mb-0',
      resultPadding: 'p-3.5',
      sigPadding: 'pt-6'
    };
    if (subjectCount <= 11) return { 
      fontSize: 'text-[10px]', 
      padding: 'py-2 px-2', 
      evalPadding: 'p-2',
      evalFontSize: 'text-[9px]',
      sectionMargin: 'mb-0',
      headerMargin: 'mb-0',
      resultPadding: 'p-3',
      sigPadding: 'pt-5'
    };
    if (subjectCount <= 13) return { 
      fontSize: 'text-[9.5px]', 
      padding: 'py-1.5 px-2', 
      evalPadding: 'p-1.5',
      evalFontSize: 'text-[8.5px]',
      sectionMargin: 'mb-0',
      headerMargin: 'mb-0',
      resultPadding: 'p-2',
      sigPadding: 'pt-4'
    };
    // Ultra-compact for 14+ subjects
    return { 
      fontSize: 'text-[9px]', 
      padding: 'py-1 px-1.5', 
      evalPadding: 'p-1',
      evalFontSize: 'text-[8px]',
      sectionMargin: 'mb-0',
      headerMargin: 'mb-0',
      resultPadding: 'p-1.5',
      sigPadding: 'pt-3'
    };
  };

  const s = getScaleStyles();

  return (
    <div id="report-card-to-print" className={`w-[210mm] h-[296mm] bg-white p-[5mm] text-[#000000] font-sans ${isBW ? 'grayscale-report' : ''}`} data-report-content style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div className={`border-[2px] border-black h-full flex flex-col justify-between ${subjectCount > 10 ? 'p-2' : 'p-3'} overflow-hidden`}>
        
        {/* 1. School Header Section */}
        <header className={`shrink-0 text-center space-y-0.5 ${s.headerMargin}`}>
          <div className="flex justify-center mb-1">
            <img src="https://i.ibb.co/zTgknf89/logo1jp.jpg" alt="Logo" className="h-10 w-auto" referrerPolicy="no-referrer" />
          </div>
          <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isBW ? 'text-black' : 'text-[#4B4F56]'}`}>SHREE GANESH EDUCATION ACADEMY'S</p>
          
          <div className="py-0.5 flex justify-center">
            <h1 className={`text-[24px] font-serif font-black uppercase leading-tight tracking-tight text-center px-4 ${isBW ? 'text-black' : 'text-[#E65100]'}`}>
              {schoolName}
            </h1>
          </div>
          
          <p className={`text-[9px] font-bold uppercase tracking-widest ${isBW ? 'text-black' : 'text-[#65676B]'}`}>SECTOR 18, KOPARKHAIRANE, NAVI MUMBAI | UDISE: {udise}</p>
          
          <div className="w-full h-[1px] bg-black my-1" />
          
          <div className="flex justify-center mt-3 mb-1">
            <div className={`border-[1.5px] border-black px-10 py-2 ${isBW ? 'bg-white' : 'bg-[#E3F2FD]'}`}>
              <p className={`text-[14px] font-bold uppercase tracking-tight ${isBW ? 'text-black' : 'text-[#0D47A1]'}`}>ANNUAL PROGRESS CARD 2025-26</p>
            </div>
          </div>
        </header>

        {/* 2. Student Information Section */}
        <section className="shrink-0 mb-3">
          <div className={`grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] border-[1.5px] border-black p-3 ${isBW ? 'bg-white' : 'bg-[#F5F9FF]'}`}>
            <div className="flex items-baseline gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`}>STUDENT NAME:</span>
              <span className="flex-1 font-bold uppercase truncate">{data.name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`}>ROLL NO:</span>
              <span className="flex-1 font-bold uppercase">{data.rollNo}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`}>STANDARD:</span>
              <span className="flex-1 font-bold uppercase">{data.std} - {data.division}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`}>D.O.B:</span>
              <span className="flex-1 font-bold uppercase">{data.dob}</span>
            </div>
          </div>
        </section>

        {/* 3. Subjects Table Section */}
        <section className={`shrink-0 ${s.sectionMargin}`}>
          <table className="w-full border-collapse border-[1.5px] border-black">
            <thead>
              <tr className={`text-white text-[11px] font-bold uppercase ${isBW ? 'bg-[#151619]' : 'bg-[#1976D2]'}`}>
                <th className={`border-[1px] border-black ${s.padding} w-10`}>SR.</th>
                <th className={`border-[1px] border-black ${s.padding} text-left`}>SUBJECTS</th>
                <th className={`border-[1px] border-black ${s.padding} w-60`}>FIRST SEMESTER</th>
                <th className={`border-[1px] border-black ${s.padding} w-60`}>SECOND SEMESTER</th>
              </tr>
            </thead>
            <tbody className={`${s.fontSize} font-bold`}>
              {data.subjects.map((s_item, index) => (
                <tr key={s_item.id} className={index % 2 === 0 ? 'bg-white' : (isBW ? 'bg-[#F5F5F5]' : 'bg-[#F5F9FF]')}>
                  <td className={`border-[1px] border-black ${s.padding} text-center`}>{index + 1}</td>
                  <td className={`border-[1px] border-black ${s.padding} pl-3`}>{s_item.name}</td>
                  <td className={`border-[1px] border-black ${s.padding} text-center`}>{s_item.sem1}</td>
                  <td className={`border-[1px] border-black ${s.padding} text-center`}>{s_item.sem2}</td>
                </tr>
              ))}
              <tr className={isBW ? 'bg-[#F5F5F5]' : 'bg-[#E3F2FD]'}>
                <td colSpan={2} className={`border-[1px] border-black p-2 text-center uppercase tracking-wider font-bold ${isBW ? 'text-black' : 'text-[#1565C0]'}`}>OVERALL PERCENTAGE (%)</td>
                <td colSpan={2} className={`border-[1px] border-black p-2 text-center text-base font-bold ${isBW ? 'text-black' : 'text-[#E65100]'}`}>{data.overallPercentage} %</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 4. Evaluation Criteria Table Section */}
        <section className={`shrink-0 ${s.sectionMargin}`}>
          <table className="w-full border-collapse border-[1.5px] border-black">
            <thead>
              <tr className={`text-white text-[10px] font-bold uppercase ${isBW ? 'bg-[#151619]' : 'bg-[#2E7D32]'}`}>
                <th className={`border-[1px] border-black ${s.evalPadding} text-left`}>EVALUATION CRITERIA</th>
                <th className={`border-[1px] border-black ${s.evalPadding} w-60`}>FIRST SEMESTER</th>
                <th className={`border-[1px] border-black ${s.evalPadding} w-60`}>SECOND SEMESTER</th>
              </tr>
            </thead>
            <tbody className={`${s.evalFontSize} font-bold italic leading-normal`}>
              <tr>
                <td className={`border-[1px] border-black ${s.evalPadding} uppercase bg-[#F9FAFB] font-bold`}>SPECIAL IMPROVEMENTS</td>
                <td className={`border-[1px] border-black ${s.evalPadding}`}>
                  {data.remarks.sem1.specialImprovements}
                </td>
                <td className={`border-[1px] border-black ${s.evalPadding}`}>
                  {data.remarks.sem2.specialImprovements}
                </td>
              </tr>
              <tr>
                <td className={`border-[1px] border-black ${s.evalPadding} uppercase bg-[#F9FAFB] font-bold`}>HOBBIES & INTERESTS</td>
                <td className={`border-[1px] border-black ${s.evalPadding}`}>
                  {data.remarks.sem1.hobbies}
                </td>
                <td className={`border-[1px] border-black ${s.evalPadding}`}>
                  {data.remarks.sem2.hobbies}
                </td>
              </tr>
              <tr>
                <td className={`border-[1px] border-black ${s.evalPadding} uppercase bg-[#F9FAFB] font-bold`}>NECESSARY IMPROVEMENTS</td>
                <td className={`border-[1px] border-black ${s.evalPadding}`}>
                  {data.remarks.sem1.necessaryImprovement}
                </td>
                <td className={`border-[1px] border-black ${s.evalPadding}`}>
                  {data.remarks.sem2.necessaryImprovement}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5. Grade Scale Section */}
        <section className={`shrink-0 ${s.sectionMargin}`}>
          <div className={`grid grid-cols-8 border-[1px] border-black text-[7px] font-black text-center ${isBW ? 'bg-white' : 'bg-[#F7F8FA]'}`}>
            <div className="border-r border-black p-0.5">91%+(A1)</div>
            <div className="border-r border-black p-0.5">81-90%(A2)</div>
            <div className="border-r border-black p-0.5">71-80%(B1)</div>
            <div className="border-r border-black p-0.5">61-70%(B2)</div>
            <div className="border-r border-black p-0.5">51-60%(C1)</div>
            <div className="border-r border-black p-0.5">41-50%(C2)</div>
            <div className="border-r border-black p-0.5">33-40%(D)</div>
            <div className="p-0.5">&lt;33%(E)</div>
          </div>
        </section>

        {/* 6. Result & Signatures Section */}
        <div className="flex flex-col shrink-0">
          <section className="mb-4">
            <div className={`border-[1.5px] border-black ${s.resultPadding} text-center space-y-1 ${isBW ? 'bg-white' : 'bg-[#F5F9FF]'}`}>
              <p className="text-[13px] font-bold uppercase">
                RESULT: <span className={isBW ? 'text-black' : 'text-[#C62828]'}>{data.result}</span> | PROMOTED TO: <span className={isBW ? 'text-black' : 'text-[#1565C0]'}>{data.promotedTo}</span>
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isBW ? 'text-black' : 'text-[#455A64]'}`}>SCHOOL REOPENS: {data.schoolReopens}</p>
            </div>
          </section>

          <footer className={`px-4 ${s.sigPadding}`}>
            <div className="grid grid-cols-2 gap-12">
              <div className="border-t-[1px] border-black pt-1 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest">CLASS TEACHER'S SIGN</p>
              </div>
              <div className="border-t-[1px] border-black pt-1 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest">PRINCIPAL'S SIGN</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function RemarkField({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-[#65676B] uppercase tracking-wider ml-0.5">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="..."
        rows={2}
        className="w-full px-2 py-1.5 bg-[#F0F2F5] border border-[#CCD0D5] rounded-lg focus:ring-1 focus:ring-[#1877F2] outline-none transition-all font-medium resize-none text-xs"
      />
    </div>
  );
}


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
  rollNo: string;
  dob: string;
  medium: 'English' | 'Semi';
  overallPercentage: string;
  sem1Percentage: string;
  sem2Percentage: string;
  totalMarks: string;
  minMarks: string;
  result: string;
  promotedTo: string;
  schoolReopens: string;
  subjects: { 
    id: string; 
    name: string; 
    sem1: string; 
    sem2: string;
    total1: string;
    min1: string;
    total2: string;
    min2: string;
  }[];
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

const getSubjects = (std: string, medium: 'English' | 'Semi'): string[] => {
  if (['NUR', 'JR. KG', 'SR. KG'].includes(std)) {
    return ['English', 'Maths', 'Drawing', 'Oral'];
  }
  if (['1st', '2nd', '3rd', '4th'].includes(std)) {
    return ['English', 'Marathi', 'Hindi', 'Maths', 'E.V.S', 'Arts', 'W.E.', 'P.T.'];
  }
  if (['5th', '6th', '7th', '8th', '9th'].includes(std)) {
    if (medium === 'English') {
      return ['English', 'Hindi', 'Marathi', 'Maths', 'Science', 'Social Science', 'Arts', 'Work Experience', 'Physical Education'];
    } else {
      return ['Marathi', 'Hindi', 'English', 'Maths', 'Science', 'Social Science', 'Arts', 'Work Experience', 'Physical Education'];
    }
  }
  return ['Marathi', 'Hindi', 'English', 'Maths', 'Science', 'Social Science'];
};

const INITIAL_DATA: StudentData = {
  name: '',
  std: '1st',
  rollNo: '',
  dob: '',
  medium: 'English',
  overallPercentage: '',
  sem1Percentage: '',
  sem2Percentage: '',
  totalMarks: '1000',
  minMarks: '350',
  result: 'PASS',
  promotedTo: '',
  schoolReopens: '11TH JUNE 2026',
  subjects: getSubjects('1st', 'English').map((name, index) => ({
    id: (index + 1).toString(),
    name,
    sem1: '',
    sem2: '',
    total1: '100',
    min1: '35',
    total2: '100',
    min2: '35'
  })),
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

  useEffect(() => {
    if (data.std === '5th' || data.std === '8th') {
      let total1 = 0;
      let possible1 = 0;
      let total2 = 0;
      let possible2 = 0;

      data.subjects.forEach(s => {
        if (s.sem1 !== '' && !isNaN(Number(s.sem1))) { 
          total1 += Number(s.sem1); 
          possible1 += Number(data.totalMarks) || 100; 
        }
        if (s.sem2 !== '' && !isNaN(Number(s.sem2))) { 
          total2 += Number(s.sem2); 
          possible2 += Number(data.totalMarks) || 100; 
        }
      });

      const overallTotal = total1 + total2;
      const overallPossible = possible1 + possible2;
      
      const newSem1Percentage = possible1 > 0 ? ((total1 / possible1) * 100).toFixed(2) : '';
      const newSem2Percentage = possible2 > 0 ? ((total2 / possible2) * 100).toFixed(2) : '';
      const newOverallPercentage = overallPossible > 0 ? ((overallTotal / overallPossible) * 100).toFixed(2) : '';

      if (data.sem1Percentage !== newSem1Percentage || data.sem2Percentage !== newSem2Percentage || data.overallPercentage !== newOverallPercentage) {
        setData(prev => ({ 
          ...prev, 
          sem1Percentage: newSem1Percentage, 
          sem2Percentage: newSem2Percentage, 
          overallPercentage: newOverallPercentage 
        }));
      }
    }
  }, [data.subjects, data.std, data.overallPercentage, data.sem1Percentage, data.sem2Percentage, data.totalMarks]);

  const schoolName = data.medium === 'English' 
    ? 'INDRAYANI ENGLISH MEDIUM SCHOOL' 
    : 'INDRAYANI INTERNATIONAL SCHOOL';

  const udise = data.medium === 'English'
    ? '27211003415/27211003417'
    : '27211003501/27211003519';

  const handleStandardChange = (std: string) => {
    const subjectNames = getSubjects(std, data.medium);
    setData(prev => ({
      ...prev,
      std,
      subjects: subjectNames.map((name, index) => ({
        id: (index + 1).toString(),
        name,
        sem1: '',
        sem2: '',
        total1: '100',
        min1: '35',
        total2: '100',
        min2: '35'
      }))
    }));
  };

  const handleMediumChange = (medium: 'English' | 'Semi') => {
    const subjectNames = getSubjects(data.std, medium);
    setData(prev => ({
      ...prev,
      medium,
      subjects: subjectNames.map((name, index) => ({
        id: (index + 1).toString(),
        name,
        sem1: '',
        sem2: '',
        total1: '100',
        min1: '35',
        total2: '100',
        min2: '35'
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
      subjects: [...prev.subjects, { 
        id: Math.random().toString(36).substr(2, 9), 
        name: 'New Subject', 
        sem1: '', 
        sem2: '',
        total1: '100',
        min1: '35',
        total2: '100',
        min2: '35'
      }]
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

  const loadSampleData = () => {
    const std = '5th';
    const medium = 'English';
    const subjectNames = getSubjects(std, medium);
    
    const sampleSubjects = subjectNames.map((name, index) => {
      const marks1 = [88, 92, 85, 76, 90, 94, 82, 89, 91];
      const marks2 = [90, 94, 88, 80, 92, 96, 85, 92, 93];
      return {
        id: (index + 1).toString(),
        name,
        sem1: marks1[index % marks1.length].toString(),
        sem2: marks2[index % marks2.length].toString(),
        total1: '100',
        min1: '35',
        total2: '100',
        min2: '35'
      };
    });

    const total1 = sampleSubjects.reduce((sum, s) => sum + Number(s.sem1), 0);
    const total2 = sampleSubjects.reduce((sum, s) => sum + Number(s.sem2), 0);
    const possible = sampleSubjects.length * 100;
    
    setData({
      name: 'ADITYA VIJAY MANE',
      std,
      rollNo: '15',
      dob: '2015-05-15',
      medium,
      overallPercentage: (((total1 + total2) / (possible * 2)) * 100).toFixed(2),
      sem1Percentage: ((total1 / possible) * 100).toFixed(2),
      sem2Percentage: ((total2 / possible) * 100).toFixed(2),
      totalMarks: '100',
      minMarks: '35',
      result: 'PASS',
      promotedTo: 'CLASS 6',
      schoolReopens: '11TH JUNE 2026',
      subjects: sampleSubjects,
      remarks: {
        sem1: { 
          specialImprovements: 'Good in Mathematics and Science.', 
          hobbies: 'Reading books and Drawing.', 
          necessaryImprovement: 'Needs to focus on handwriting.' 
        },
        sem2: { 
          specialImprovements: 'Excellent performance in all subjects.', 
          hobbies: 'Playing Cricket and Chess.', 
          necessaryImprovement: 'Keep up the good work.' 
        }
      }
    });
  };

  const generatePDF = async (mode: 'color' | 'bw' = 'color') => {
    const targetRef = mode === 'bw' ? reportBWRef : reportRef;
    if (!targetRef.current || isGenerating) return;
    
    setIsGenerating(mode);
    try {
      // Ensure all fonts are loaded before capture
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(targetRef.current, {
        scale: 4, // High resolution for professional print
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 793.7, // 210mm at 96 DPI
        height: 1122.5, // 297mm at 96 DPI
        windowWidth: 794, // Force standard A4 width for media queries
        windowHeight: 1123,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const reportEl = clonedDoc.querySelector('[data-report-content]') as HTMLElement;
          if (reportEl) {
            reportEl.style.visibility = 'visible';
            reportEl.style.position = 'relative';
            reportEl.style.top = '0';
            reportEl.style.left = '0';
            reportEl.style.transform = 'none';
            reportEl.style.margin = '0';
            reportEl.style.padding = '5mm';
            reportEl.style.width = '210mm';
            reportEl.style.height = '297mm';
            reportEl.style.boxSizing = 'border-box';
            
            // Force high-quality font rendering in the clone
            const allText = reportEl.querySelectorAll('*');
            allText.forEach((el) => {
              const style = (el as HTMLElement).style;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (style as any).webkitFontSmoothing = 'antialiased';
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (style as any).mozOsxFontSmoothing = 'grayscale';
              style.textRendering = 'optimizeLegibility';
              // Prevent text compression by ensuring letter-spacing is preserved
              if (!style.letterSpacing) {
                style.letterSpacing = 'normal';
              }
              // Use a normal line-height for headers to prevent clipping
              if (el.tagName === 'TH') {
                style.lineHeight = 'normal';
              } else if (!style.lineHeight || style.lineHeight === '1.2') {
                style.lineHeight = '1.3';
              }
            });

            // Specifically fix table headers for html2canvas rowSpan issues
            const allTh = reportEl.querySelectorAll('th');
            allTh.forEach((th) => {
              const element = th as HTMLElement;
              element.style.verticalAlign = 'middle';
              element.style.display = 'table-cell';
              element.style.opacity = '1';
              element.style.overflow = 'visible';
              element.style.boxSizing = 'border-box';
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 16
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`Result_${data.name || 'Student'}_${mode}.pdf`);

      // Automatically clear form fields for new entry, keeping common fields
      setData(prev => ({
        ...prev,
        name: '',
        rollNo: '',
        dob: '',
        overallPercentage: '',
        result: 'PASS',
        subjects: prev.subjects.map(s => ({ 
          ...s, 
          sem1: '', 
          sem2: '',
          total1: '100',
          min1: '35',
          total2: '100',
          min2: '35'
        })),
        remarks: {
          sem1: { specialImprovements: '', hobbies: '', necessaryImprovement: '' },
          sem2: { specialImprovements: '', hobbies: '', necessaryImprovement: '' }
        }
      }));
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
                onClick={loadSampleData}
                className="px-3 py-2 text-[10px] sm:text-xs font-bold text-[#42B72A] bg-[#EBF7EE] hover:bg-[#D1F0D8] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Sample</span>
              </button>
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
                    onChange={(e) => handleMediumChange(e.target.value as 'English' | 'Semi')}
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
                  { (data.std === '5th' || data.std === '8th') ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#65676B] uppercase">Total Marks</span>
                        <input 
                          type="text"
                          value={data.totalMarks}
                          onChange={(e) => setData(prev => ({ ...prev, totalMarks: e.target.value }))}
                          placeholder="100"
                          className="w-16 px-2 py-1 bg-[#F0F2F5] border border-[#CCD0D5] rounded text-center font-mono font-bold text-sm focus:border-[#1877F2] outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#65676B] uppercase">Min Marks</span>
                        <input 
                          type="text"
                          value={data.minMarks}
                          onChange={(e) => setData(prev => ({ ...prev, minMarks: e.target.value }))}
                          placeholder="35"
                          className="w-16 px-2 py-1 bg-[#F0F2F5] border border-[#CCD0D5] rounded text-center font-mono font-bold text-sm focus:border-[#1877F2] outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#65676B] uppercase">Overall %</span>
                      <input 
                        type="text"
                        value={data.overallPercentage}
                        onChange={(e) => setData(prev => ({ ...prev, overallPercentage: e.target.value }))}
                        placeholder="0.00"
                        className="w-20 px-2 py-1 bg-[#F0F2F5] border border-[#CCD0D5] rounded text-center font-mono font-bold text-sm focus:border-[#1877F2] outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.subjects.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border border-[#EBEDF0] bg-[#F0F2F5]/50 space-y-2">
                    <h3 className="text-[11px] font-bold text-[#4B4F56] tracking-wide">{s.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#90949C] uppercase block border-b pb-1">Sem 1</label>
                        <div className="grid grid-cols-1 gap-1">
                          <div className="space-y-0.5">
                            <span className="text-[7px] text-[#90949C] uppercase font-bold">Obt</span>
                            <input 
                              type="text"
                              value={s.sem1}
                              onChange={(e) => handleSubjectChange(s.id, 'sem1', e.target.value)}
                              placeholder="Gr/No"
                              className="w-full px-1 py-1 bg-white border border-[#CCD0D5] rounded text-center font-bold text-sm focus:border-[#1877F2] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#90949C] uppercase block border-b pb-1">Sem 2</label>
                        <div className="grid grid-cols-1 gap-1">
                          <div className="space-y-0.5">
                            <span className="text-[7px] text-[#90949C] uppercase font-bold">Obt</span>
                            <input 
                              type="text"
                              value={s.sem2}
                              onChange={(e) => handleSubjectChange(s.id, 'sem2', e.target.value)}
                              placeholder="Gr/No"
                              className="w-full px-1 py-1 bg-white border border-[#CCD0D5] rounded text-center font-bold text-sm focus:border-[#1877F2] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              { (data.std === '5th' || data.std === '8th') && (
                <div className="pt-4 border-t border-[#EBEDF0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#E3F2FD]/50 border border-[#BBDEFB] flex flex-col items-center justify-center gap-1">
                    <span className="text-[10px] font-bold text-[#1565C0] uppercase">Sem 1 Percentage</span>
                    <span className="text-lg font-black text-[#0D47A1]">{data.sem1Percentage || '0.00'}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#E3F2FD]/50 border border-[#BBDEFB] flex flex-col items-center justify-center gap-1">
                    <span className="text-[10px] font-bold text-[#1565C0] uppercase">Sem 2 Percentage</span>
                    <span className="text-lg font-black text-[#0D47A1]">{data.sem2Percentage || '0.00'}%</span>
                  </div>
                </div>
              )}
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
                  <label className="text-[11px] font-bold text-[#65676B] uppercase ml-0.5">NEXT YEAR'S STANDARD</label>
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
        <div className="fixed top-0 left-0 pointer-events-none -z-50 overflow-hidden" style={{ width: '210mm', height: '297mm', transform: 'translateX(-10000px)' }}>
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
      padding: 'py-4 px-4', 
      evalPadding: 'p-4',
      evalHeaderPadding: 'py-1.5 px-4',
      evalFontSize: 'text-[12px]',
      sectionMargin: 'mb-1',
      evalMargin: 'mb-4',
      headerMargin: 'mb-1',
      resultPadding: 'p-5',
      sigPadding: 'pt-8',
      remarkMaxHeight: 'max-h-[120px]'
    };
    if (subjectCount <= 7) return { 
      fontSize: 'text-[12px]', 
      padding: 'py-3 px-4', 
      evalPadding: 'p-3.5',
      evalHeaderPadding: 'py-1.5 px-4',
      evalFontSize: 'text-[11px]',
      sectionMargin: 'mb-1',
      evalMargin: 'mb-3',
      headerMargin: 'mb-1',
      resultPadding: 'p-4',
      sigPadding: 'pt-7'
    };
    if (subjectCount <= 9) return { 
      fontSize: 'text-[11px]', 
      padding: 'py-2.5 px-3', 
      evalPadding: 'p-3',
      evalHeaderPadding: 'py-2 px-3',
      evalFontSize: 'text-[10px]',
      sectionMargin: 'mb-0.5',
      evalMargin: 'mb-2',
      headerMargin: 'mb-0.5',
      resultPadding: 'p-3.5',
      sigPadding: 'pt-6'
    };
    if (subjectCount <= 11) return { 
      fontSize: 'text-[10px]', 
      padding: 'py-2 px-2', 
      evalPadding: 'p-2',
      evalHeaderPadding: 'py-1.5 px-2',
      evalFontSize: 'text-[9px]',
      sectionMargin: 'mb-0.5',
      evalMargin: 'mb-1.5',
      headerMargin: 'mb-0.5',
      resultPadding: 'p-3',
      sigPadding: 'pt-5'
    };
    if (subjectCount <= 13) return { 
      fontSize: 'text-[9.5px]', 
      padding: 'py-1.5 px-2', 
      evalPadding: 'p-1.5',
      evalHeaderPadding: 'py-1 px-2',
      evalFontSize: 'text-[8.5px]',
      sectionMargin: 'mb-1',
      evalMargin: 'mb-1',
      headerMargin: 'mb-0',
      resultPadding: 'p-2',
      sigPadding: 'pt-4'
    };
    // Ultra-compact for 14+ subjects
    return { 
      fontSize: 'text-[8.5px]', 
      padding: 'py-1 px-1.5', 
      evalPadding: 'p-1',
      evalHeaderPadding: 'py-1 px-1.5',
      evalFontSize: 'text-[8px]',
      sectionMargin: 'mb-0.5',
      evalMargin: 'mb-0.5',
      headerMargin: 'mb-0',
      resultPadding: 'p-1.5',
      sigPadding: 'pt-3'
    };
  };

  const s = getScaleStyles();
  const totalSem1 = data.subjects.reduce((sum, sub) => sum + (isNaN(Number(sub.sem1)) || sub.sem1 === '' ? 0 : Number(sub.sem1)), 0);
  const totalSem2 = data.subjects.reduce((sum, sub) => sum + (isNaN(Number(sub.sem2)) || sub.sem2 === '' ? 0 : Number(sub.sem2)), 0);
  const totalPossible1 = data.subjects.reduce((sum, sub) => sum + (sub.sem1 !== '' && !isNaN(Number(sub.sem1)) ? (Number(sub.total1) || 100) : 0), 0);
  const totalPossible2 = data.subjects.reduce((sum, sub) => sum + (sub.sem2 !== '' && !isNaN(Number(sub.sem2)) ? (Number(sub.total2) || 100) : 0), 0);
  const isNumericData = data.subjects.some(sub => (sub.sem1 !== '' && !isNaN(Number(sub.sem1))) || (sub.sem2 !== '' && !isNaN(Number(sub.sem2))));

  return (
    <div 
      id="report-card-to-print" 
      className={`w-[210mm] h-[297mm] bg-white p-[5mm] text-[#000000] ${isBW ? 'grayscale-report' : ''}`} 
      data-report-content 
      style={{ 
        pageBreakInside: 'avoid', 
        breakInside: 'avoid',
        fontFamily: '"Inter", sans-serif',
        lineHeight: '1.2',
        letterSpacing: 'normal'
      }}
    >
      <div className={`border-[2px] border-black h-full flex flex-col justify-between ${subjectCount > 10 ? 'p-2' : 'p-3'} overflow-hidden`}>
        
        {/* 1. School Header Section */}
        <header className={`shrink-0 text-center space-y-0.5 ${s.headerMargin}`}>
          <div className="flex justify-center mb-1">
            <img src="https://i.ibb.co/zTgknf89/logo1jp.jpg" alt="Logo" className="h-10 w-auto" referrerPolicy="no-referrer" />
          </div>
          <p className={`text-[14px] font-black uppercase ${isBW ? 'text-black' : 'text-[#4B4F56]'}`} style={{ letterSpacing: '0.15em' }}>SHREE GANESH EDUCATION ACADEMY'S</p>
          
          <div className="py-0.5 flex justify-center">
            <h1 
              className={`text-[32px] font-black uppercase text-center px-4 ${isBW ? 'text-black' : 'text-[#8B0000]'}`}
              style={{ 
                fontFamily: '"Playfair Display", serif',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}
            >
              {schoolName}
            </h1>
          </div>
          
          <p className={`text-[9px] font-black uppercase ${isBW ? 'text-black' : 'text-[#65676B]'}`} style={{ letterSpacing: '0.2em' }}>SECTOR 18, KOPARKHAIRANE, NAVI MUMBAI | UDISE: {udise}</p>
          
          <div className="w-full flex flex-col items-center justify-center my-1">
            <div className={`w-full h-[1.5px] ${isBW ? 'bg-black' : 'bg-[#8B0000]'}`} />
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1 h-1 rotate-45 ${isBW ? 'bg-black' : 'bg-[#8B0000]'}`} />
              <div className={`w-1.5 h-1.5 rotate-45 ${isBW ? 'bg-black' : 'bg-[#8B0000]'}`} />
              <div className={`w-1 h-1 rotate-45 ${isBW ? 'bg-black' : 'bg-[#8B0000]'}`} />
            </div>
          </div>
          
          <div className="flex justify-center mt-3 mb-1">
            <div className={`border-[1.5px] border-black px-10 py-2 ${isBW ? 'bg-white' : 'bg-gradient-to-b from-[#E3F2FD] to-[#BBDEFB]'} shadow-md`}>
              <p className={`text-[14px] font-bold uppercase ${isBW ? 'text-black' : 'text-[#0D47A1]'}`} style={{ letterSpacing: '-0.02em' }}>ANNUAL PROGRESS CARD 2025-26</p>
            </div>
          </div>
        </header>

        {/* 2. Student Information Section */}
        <section className="shrink-0 mb-3">
          <div className={`grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] border-[1.5px] border-black p-3 ${isBW ? 'bg-white' : 'bg-[#F5F9FF]'} shadow-sm`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em' }}>STUDENT NAME:</span>
              <span className="flex-1 font-bold uppercase whitespace-normal" style={{ lineHeight: '1.25' }}>{data.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em' }}>ROLL NO:</span>
              <span className="flex-1 font-bold uppercase">{data.rollNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em' }}>STANDARD:</span>
              <span className="flex-1 font-bold uppercase">{data.std}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold uppercase whitespace-nowrap ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em' }}>D.O.B:</span>
              <span className="flex-1 font-bold uppercase">{data.dob ? data.dob.split('-').reverse().join('') : ''}</span>
            </div>
          </div>
        </section>

        {/* 3. Subjects Table Section */}
        <section className={`flex-grow flex flex-col min-h-0 ${s.sectionMargin}`}>
          <div className="flex-grow overflow-hidden">
            <table className="w-full border-collapse border-[1.5px] border-black h-full">
              <thead>
                { (data.std === '5th' || data.std === '8th') ? (
                  <>
                    <tr className={`text-white text-[13px] font-bold uppercase ${isBW ? 'bg-[#151619]' : 'bg-[#1976D2]'}`}>
                      <th rowSpan={2} className="border-t border-x border-black px-3 text-center" style={{ verticalAlign: 'top' }}>
                        <div className="flex items-start justify-center h-[65px] pt-2">
                          SUBJECTS
                        </div>
                      </th>
                      <th colSpan={3} className="border-[1px] border-black py-2 text-center" style={{ verticalAlign: 'middle' }}>
                        FIRST SEMESTER
                      </th>
                      <th colSpan={3} className="border-[1px] border-black py-2 text-center" style={{ verticalAlign: 'middle' }}>
                        SECOND SEMESTER
                      </th>
                    </tr>
                    <tr className={`text-white text-[10px] font-bold uppercase ${isBW ? 'bg-[#151619]' : 'bg-[#1976D2]'}`}>
                      <th className={`border-[1px] border-black p-1 w-20`}>TOTAL</th>
                      <th className={`border-[1px] border-black p-1 w-20`}>MIN</th>
                      <th className={`border-[1px] border-black p-1 w-20`}>OBTAIN</th>
                      <th className={`border-[1px] border-black p-1 w-20`}>TOTAL</th>
                      <th className={`border-[1px] border-black p-1 w-20`}>MIN</th>
                      <th className={`border-[1px] border-black p-1 w-20`}>OBTAIN</th>
                    </tr>
                  </>
                ) : (
                  <tr className={`text-white text-[15px] font-bold uppercase ${isBW ? 'bg-[#151619]' : 'bg-[#1976D2]'}`}>
                    <th className={`border-[1px] border-black ${s.padding} w-10`}>SR.</th>
                    <th className={`border-[1px] border-black ${s.padding} text-center`}>SUBJECTS</th>
                    <th className={`border-[1px] border-black ${s.padding} w-60`}>FIRST SEMESTER</th>
                    <th className={`border-[1px] border-black ${s.padding} w-60`}>SECOND SEMESTER</th>
                  </tr>
                )}
              </thead>
              <tbody className={`${s.fontSize} font-bold`}>
                {data.subjects.map((s_item, index) => (
                  <tr key={s_item.id} className={index % 2 === 0 ? 'bg-white' : (isBW ? 'bg-[#F5F5F5]' : 'bg-[#F5F9FF]')}>
                    { (data.std === '5th' || data.std === '8th') ? (
                      <>
                        <td className={`border-[1px] border-black ${s.padding} pl-3`}>{s_item.name}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{data.totalMarks}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{data.minMarks}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{s_item.sem1}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{data.totalMarks}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{data.minMarks}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{s_item.sem2}</td>
                      </>
                    ) : (
                      <>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{index + 1}</td>
                        <td className={`border-[1px] border-black ${s.padding} pl-3`}>{s_item.name}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{s_item.sem1}</td>
                        <td className={`border-[1px] border-black ${s.padding} text-center`}>{s_item.sem2}</td>
                      </>
                    )}
                  </tr>
                ))}
                {(data.std === '5th' || data.std === '8th') && isNumericData ? (
                  <>
                    <tr className={isBW ? 'bg-[#F5F5F5]' : 'bg-[#E3F2FD]'}>
                      <td className={`border-[1px] border-black ${s.padding} text-center uppercase font-bold ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em' }}>TOTAL MARKS</td>
                      <td className={`border-[1px] border-black ${s.padding} text-center font-bold`}>{totalPossible1}</td>
                      <td className={`border-[1px] border-black ${s.padding} text-center font-bold`}>-</td>
                      <td className={`border-[1px] border-black ${s.padding} text-center font-bold`}>{totalSem1}</td>
                      <td className={`border-[1px] border-black ${s.padding} text-center font-bold`}>{totalPossible2}</td>
                      <td className={`border-[1px] border-black ${s.padding} text-center font-bold`}>-</td>
                      <td className={`border-[1px] border-black ${s.padding} text-center font-bold`}>{totalSem2}</td>
                    </tr>
                    <tr className={isBW ? 'bg-[#F5F5F5]' : 'bg-[#E3F2FD]'}>
                      <td className={`border-[1px] border-black ${s.padding} text-center uppercase font-bold ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em', verticalAlign: 'top' }}>
                        <div className="pt-1">PERCENTAGE (%)</div>
                      </td>
                      <td colSpan={3} className={`border-[1px] border-black ${s.padding} text-center text-base font-bold ${isBW ? 'text-black' : 'text-[#E65100]'}`} style={{ verticalAlign: 'top' }}>
                        <div className="pt-1">{data.sem1Percentage || '0.00'} %</div>
                      </td>
                      <td colSpan={3} className={`border-[1px] border-black ${s.padding} text-center text-base font-bold ${isBW ? 'text-black' : 'text-[#E65100]'}`} style={{ verticalAlign: 'top' }}>
                        <div className="pt-1">{data.sem2Percentage || '0.00'} %</div>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr className={isBW ? 'bg-[#F5F5F5]' : 'bg-[#E3F2FD]'}>
                    <td colSpan={2} className={`border-[1px] border-black ${s.padding} text-center uppercase font-bold ${isBW ? 'text-black' : 'text-[#1565C0]'}`} style={{ letterSpacing: '0.05em', verticalAlign: 'top' }}>
                      <div className="pt-1">OVERALL PERCENTAGE (%)</div>
                    </td>
                    <td colSpan={2} className={`border-[1px] border-black ${s.padding} text-center text-base font-bold ${isBW ? 'text-black' : 'text-[#E65100]'}`} style={{ verticalAlign: 'top' }}>
                      <div className="pt-1">{data.overallPercentage} %</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Evaluation Criteria Table Section */}
        <section className={`shrink-0 ${s.evalMargin}`}>
          <table className="w-full border-collapse border-[1.5px] border-black">
            <thead>
              <tr className={`text-white text-[13px] font-bold uppercase ${isBW ? 'bg-[#151619]' : 'bg-[#2E7D32]'}`}>
                <th className={`border-[1px] border-black ${s.evalHeaderPadding} text-left`}>EVALUATION CRITERIA</th>
                <th className={`border-[1px] border-black ${s.evalHeaderPadding} w-60`}>FIRST SEMESTER</th>
                <th className={`border-[1px] border-black ${s.evalHeaderPadding} w-60`}>SECOND SEMESTER</th>
              </tr>
            </thead>
            <tbody className={`${s.evalFontSize} font-bold italic`} style={{ lineHeight: '1.4' }}>
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
            <div className={`border-[1.5px] border-black ${s.resultPadding} text-center space-y-1 ${isBW ? 'bg-white' : 'bg-[#F5F9FF]'} shadow-sm`}>
              <p className="text-[13px] font-bold uppercase">
                RESULT: <span className={isBW ? 'text-black' : 'text-[#C62828]'}>{data.result}</span> | NEXT YEAR'S STANDARD: <span className={isBW ? 'text-black' : 'text-[#1565C0]'}>{data.promotedTo}</span>
              </p>
              <p className={`text-[10px] font-bold uppercase ${isBW ? 'text-black' : 'text-[#455A64]'}`} style={{ letterSpacing: '0.1em' }}>SCHOOL REOPENS: {data.schoolReopens}</p>
            </div>
          </section>

          <footer className={`px-4 ${s.sigPadding}`}>
            <div className="grid grid-cols-2 gap-12">
              <div className="border-t-[1px] border-black pt-1 text-center">
                <p className="text-[8px] font-black uppercase" style={{ letterSpacing: '0.1em' }}>CLASS TEACHER'S SIGN</p>
              </div>
              <div className="border-t-[1px] border-black pt-1 text-center">
                <p className="text-[8px] font-black uppercase" style={{ letterSpacing: '0.1em' }}>PRINCIPAL'S SIGN</p>
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


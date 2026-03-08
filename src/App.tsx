import { useState, useRef } from 'react';
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
  schoolReopens: '11TH JUNE 2025',
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
  const reportRef = useRef<HTMLDivElement>(null);

  const schoolName = data.medium === 'English' 
    ? 'INDRAYANI ENGLISH MEDIUM SCHOOL' 
    : 'INDRAYANI INTERNATIONAL SCHOOL';

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

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    pdf.save(`Result_${data.name || 'Student'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-6 px-4 sm:px-6 lg:px-8 font-sans text-[#1C1E21]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-[#DADDE1]">
          <div className="flex items-center gap-4">
            <div className="bg-[#1877F2] p-2.5 rounded-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C1E21]">Annual Result Generator</h1>
              <p className="text-[#65676B] text-xs font-medium">Indrayani Educational Institutions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 text-xs font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#DBE7F2] rounded-lg transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button 
              onClick={() => setIsManagingSubjects(!isManagingSubjects)}
              className="px-4 py-2 text-xs font-bold text-[#4B4F56] bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> {isManagingSubjects ? 'Close Manager' : 'Manage Subjects'}
            </button>
            <button 
              onClick={() => setData(INITIAL_DATA)}
              className="px-4 py-2 text-xs font-bold text-[#FA3E3E] bg-[#FEEBEB] hover:bg-[#FCD9D9] rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Reset
            </button>
            <button 
              onClick={generatePDF}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Generate PDF
            </button>
          </div>
        </header>

        {isManagingSubjects && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-[#DADDE1] space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-[#1C1E21] uppercase tracking-wider">Subject Manager</h2>
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
              onClick={generatePDF}
              className="w-full py-3.5 bg-[#1877F2] text-white rounded-xl font-bold shadow-md hover:bg-[#166FE5] transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <Save className="w-5 h-5" /> Save & Generate PDF
            </button>
          </div>
        </div>

        {/* Hidden Report Template for PDF Generation */}
        <div className="fixed -left-[9999px] top-0">
          <div ref={reportRef}>
            <ReportContent data={data} schoolName={schoolName} />
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs font-bold text-[#4B4F56] bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button 
                    onClick={generatePDF}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-lg flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button 
                    onClick={() => setIsPreviewOpen(false)} 
                    className="p-2 hover:bg-[#F0F2F5] rounded-full transition-colors text-[#65676B]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F0F2F5] flex justify-center" id="report-container">
                <div className="shadow-2xl bg-white transform scale-[0.5] sm:scale-[0.7] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-300" id="report-to-print">
                  <ReportContent data={data} schoolName={schoolName} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportContent({ data, schoolName }: { data: StudentData, schoolName: string }) {
  return (
    <div className="w-[210mm] h-[297mm] bg-white p-[15mm] text-[#000000] font-sans relative overflow-hidden">
      <div className="border-[1.5px] border-black p-8 h-full flex flex-col relative">
        {/* Decorative Corner Marks (Optional for print precision) */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black/10 -m-1" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black/10 -m-1" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black/10 -m-1" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black/10 -m-1" />
        
        {/* PDF Header */}
        <div className="text-center space-y-1 mb-4">
          <div className="flex justify-center mb-2">
            <img src="https://i.ibb.co/zTgknf89/logo1jp.jpg" alt="Logo" className="h-20 w-auto" referrerPolicy="no-referrer" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">SHREE GANESH EDUCATION ACADEMY'S</p>
          <h1 className="text-2xl font-black text-[#F27D26] uppercase leading-tight">{schoolName}</h1>
          <p className="text-[9px] font-bold uppercase">SECTOR 18, KOPARKHAIRANE, NAVI MUMBAI | UDISE: 27211003415</p>
          <div className="inline-block border border-black px-8 py-1 mt-2">
            <p className="text-sm font-black uppercase">ANNUAL PROGRESS CARD 2024-25</p>
          </div>
        </div>

        {/* PDF Student Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] border border-black p-3 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-bold uppercase whitespace-nowrap">STUDENT NAME:</span>
            <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{data.name}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold uppercase whitespace-nowrap">ROLL NO:</span>
            <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{data.rollNo}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold uppercase whitespace-nowrap">STANDARD:</span>
            <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{data.std} - {data.division}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold uppercase whitespace-nowrap">D.O.B:</span>
            <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{data.dob}</span>
          </div>
        </div>

        {/* PDF Grades Table */}
        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-[#151619] text-white text-[10px] font-bold uppercase">
              <th className="border border-black p-2 w-12">SR.</th>
              <th className="border border-black p-2 text-left">SUBJECTS</th>
              <th className="border border-black p-2 w-48">FIRST SEMESTER</th>
              <th className="border border-black p-2 w-48">SECOND SEMESTER</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-bold">
            {data.subjects.map((s, index) => (
              <tr key={s.id}>
                <td className="border border-black p-3 text-center">{index + 1}</td>
                <td className="border border-black p-3 pl-8">{s.name}</td>
                <td className="border border-black p-3 text-center">{s.sem1}</td>
                <td className="border border-black p-3 text-center">{s.sem2}</td>
              </tr>
            ))}
            <tr className="bg-[#F0F2F5]">
              <td colSpan={2} className="border border-black p-3 text-center uppercase tracking-widest">OVERALL PERCENTAGE (%)</td>
              <td colSpan={2} className="border border-black p-3 text-center text-lg font-black">{data.overallPercentage} %</td>
            </tr>
          </tbody>
        </table>

        {/* PDF Evaluation Criteria */}
        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-[#151619] text-white text-[10px] font-bold uppercase">
              <th className="border border-black p-2 text-left">EVALUATION CRITERIA</th>
              <th className="border border-black p-2 w-48">FIRST SEMESTER</th>
              <th className="border border-black p-2 w-48">SECOND SEMESTER</th>
            </tr>
          </thead>
          <tbody className="text-[10px] font-bold italic">
            <tr>
              <td className="border border-black p-3 uppercase">SPECIAL IMPROVEMENTS</td>
              <td className="border border-black p-3">{data.remarks.sem1.specialImprovements}</td>
              <td className="border border-black p-3">{data.remarks.sem2.specialImprovements}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 uppercase">HOBBIES & INTERESTS</td>
              <td className="border border-black p-3">{data.remarks.sem1.hobbies}</td>
              <td className="border border-black p-3">{data.remarks.sem2.hobbies}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 uppercase">NECESSARY IMPROVEMENTS</td>
              <td className="border border-black p-3">{data.remarks.sem1.necessaryImprovement}</td>
              <td className="border border-black p-3">{data.remarks.sem2.necessaryImprovement}</td>
            </tr>
          </tbody>
        </table>

        {/* PDF Grade Scale */}
        <div className="grid grid-cols-8 border border-black text-[8px] font-bold text-center mb-6">
          <div className="border-r border-black p-1">91%+(A1)</div>
          <div className="border-r border-black p-1">81-90%(A2)</div>
          <div className="border-r border-black p-1">71-80%(B1)</div>
          <div className="border-r border-black p-1">61-70%(B2)</div>
          <div className="border-r border-black p-1">51-60%(C1)</div>
          <div className="border-r border-black p-1">41-50%(C2)</div>
          <div className="border-r border-black p-1">33-40%(D)</div>
          <div className="p-1">&lt;33%(E)</div>
        </div>

        {/* PDF Result Section */}
        <div className="border border-black p-4 text-center space-y-1 mb-8">
          <p className="text-sm font-black uppercase">
            RESULT: <span className="text-[#FA3E3E]">{data.result}</span> | PROMOTED TO: <span className="text-[#F27D26]">{data.promotedTo}</span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest">SCHOOL REOPENS: {data.schoolReopens}</p>
        </div>

        {/* PDF Signatures */}
        <div className="mt-auto grid grid-cols-2 gap-20 px-10">
          <div className="border-t border-black pt-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest">CLASS TEACHER'S SIGN</p>
          </div>
          <div className="border-t border-black pt-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest">PRINCIPAL'S SIGN</p>
          </div>
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


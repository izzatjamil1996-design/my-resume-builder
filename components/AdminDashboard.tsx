
import React, { useState } from 'react';
import { ResumeData } from '../types';

interface AdminDashboardProps {
  submissions: ResumeData[];
  onView: (resume: ResumeData) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ submissions, onView, onDelete, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = submissions.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border shadow-lg overflow-hidden flex flex-col h-full animate-fadeIn">
      <div className="p-6 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Professional Administrator Dashboard</h2>
          <p className="text-sm text-gray-500">Total Applicant Resume Submissions: {submissions.length}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by full name or electronic mail..." 
              className="border pl-10 pr-4 py-2.5 rounded-xl text-sm w-72 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <button 
            onClick={onExport}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export Comprehensive Database
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-5">Full Applicant Identification Name</th>
              <th className="px-6 py-5">Electronic Mail Address</th>
              <th className="px-6 py-5">Selected Visual Template</th>
              <th className="px-6 py-5">Date and Time of Submission</th>
              <th className="px-6 py-5 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-blue-50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-800">{sub.fullName || 'Unspecified Individual Name'}</div>
                  <div className="text-xs text-gray-400 font-medium">{sub.phone || 'No Telephone Number Provided'}</div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">{sub.email || 'No Electronic Mail Provided'}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    sub.template === 'Technology' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                    sub.template === 'Business' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    sub.template === 'Creative' ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {sub.template} Style Layout
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                  {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never Successfully Submitted'}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onView(sub)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-bold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      Review and Modify Content
                    </button>
                    <button 
                      onClick={() => onDelete(sub.id!)}
                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
                      title="Permanently Delete This Entry"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <p className="text-gray-400 font-medium italic">No resumes found in the system database records.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

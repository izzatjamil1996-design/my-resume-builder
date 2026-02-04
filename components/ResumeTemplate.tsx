
import React from 'react';
import { ResumeData } from '../types';

interface ResumeTemplateProps {
  data: ResumeData;
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const renderHeader = () => {
    const info = [
      data.email,
      data.phone,
      data.location,
      data.linkedin
    ].filter(Boolean);

    return (
      <div className="flex flex-wrap justify-center gap-x-2 text-[11pt] text-gray-700">
        {info.map((item, idx) => (
          <React.Fragment key={idx}>
            <span>{item}</span>
            {idx < info.length - 1 && <span className="text-gray-400">|</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderBullets = (text: string) => {
    if (!text) return null;
    return (
      <ul className="list-none space-y-1">
        {text.split('\n').filter(line => line.trim()).map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-gray-600">•</span>
            <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    );
  };

  const templates = {
    Standard: (
      <div className="resume-paper bg-white p-8 sm:p-12 shadow-lg min-h-[1056px] h-auto text-[#333] leading-snug w-full max-w-[816px] mx-auto border" id="resume-content" style={{ overflow: 'visible' }}>
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            {data.fullName || "Your Full Identification Name"}
          </h1>
          {renderHeader()}
        </header>

        {data.summary && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Professional Biography Summary</h2>
            <p className="text-sm text-justify leading-relaxed">{data.summary}</p>
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Educational Background</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{edu.school}</span>
                  <span className="italic font-normal">{edu.location}</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="italic">{edu.degree}</span>
                  <span>{edu.gradDate}</span>
                </div>
                {(edu.gpa || edu.grades) && (
                  <p className="text-xs text-gray-700 mt-0.5">
                    {edu.gpa && <span>Academic Performance: Grade Point Average {edu.gpa}</span>}
                    {edu.gpa && edu.grades && <span className="mx-1">|</span>}
                    {edu.grades && <span>Examination Honors Result: {edu.grades}</span>}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {data.experiences.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Professional Working Experience</h2>
            {data.experiences.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{exp.company}</span>
                  <span className="italic font-normal">{exp.location}</span>
                </div>
                <div className="flex justify-between items-baseline text-sm italic mb-1">
                  <span>{exp.position}</span>
                  <span className="font-normal not-italic">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="text-sm ml-1">{renderBullets(exp.description)}</div>
              </div>
            ))}
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Academic and Professional Projects</h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{proj.title}</span>
                  <span className="font-normal italic text-xs">{proj.date}</span>
                </div>
                {proj.link && <p className="text-xs italic underline text-blue-800">{proj.link}</p>}
                <div className="text-sm mt-1">{renderBullets(proj.description)}</div>
              </div>
            ))}
          </section>
        )}

        {data.certifications.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Professional Certifications</h2>
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline text-sm mb-1">
                <span><span className="font-bold">{cert.name}</span> — {cert.issuer}</span>
                <span>{cert.date}</span>
              </div>
            ))}
          </section>
        )}

        {(data.skills || data.languages) && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Skills and Proficient Languages</h2>
            {data.skills && <p className="text-sm mb-1"><span className="font-bold">Core Competencies:</span> {data.skills}</p>}
            {data.languages && <p className="text-sm"><span className="font-bold">Languages Spoken:</span> {data.languages}</p>}
          </section>
        )}

        {data.references.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold border-b border-black uppercase mb-2">Professional Character References</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {data.references.map((ref) => (
                <div key={ref.id} className="text-sm">
                  <p className="font-bold">{ref.name}</p>
                  <p className="italic">{ref.position}, {ref.organization}</p>
                  <div className="text-xs text-gray-600 mt-1">
                    {ref.email && <p>Electronic Mail: {ref.email}</p>}
                    {ref.phone && <p>Telephone Number: {ref.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    ),
    Technology: (
      <div className="resume-paper bg-white p-10 shadow-lg min-h-[1056px] h-auto text-gray-900 leading-snug w-full max-w-[816px] mx-auto border" id="resume-content" style={{ overflow: 'visible' }}>
        <header className="mb-8 border-l-4 border-blue-600 pl-6">
          <h1 className="text-4xl font-black uppercase tracking-tight text-blue-900">{data.fullName || "Your Full Legal Name"}</h1>
          {renderHeader()}
        </header>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12">
             <section className="mb-6">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 border-b-2 border-gray-100 pb-1">Technical Competencies and Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.split(',').map((s, i) => (
                    <span key={i} className="bg-gray-100 px-3 py-1 rounded text-xs font-bold text-gray-700">{s.trim()}</span>
                  ))}
                </div>
                {data.languages && <p className="text-[10px] text-gray-400 mt-2">Languages: {data.languages}</p>}
             </section>
             
             <section className="mb-6">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 border-b-2 border-gray-100 pb-1">Professional Working History</h2>
                {data.experiences.map(exp => (
                  <div key={exp.id} className="mb-5">
                    <div className="flex justify-between font-bold text-base">
                      <span>{exp.position}</span>
                      <span className="text-gray-500 font-normal text-sm">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="text-blue-800 font-semibold mb-2">{exp.company}</div>
                    <div className="text-sm">{renderBullets(exp.description)}</div>
                  </div>
                ))}
             </section>

             <section className="mb-6">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 border-b-2 border-gray-100 pb-1">Educational Background Details</h2>
                {data.education.map(edu => (
                  <div key={edu.id} className="mb-4">
                    <div className="flex justify-between font-bold">
                      <span>{edu.school}</span>
                      <span className="font-normal text-sm text-gray-500">{edu.gradDate}</span>
                    </div>
                    <p className="italic text-sm">{edu.degree}</p>
                    <p className="text-xs font-bold text-gray-600 mt-1">Grade Point Average: {edu.gpa || 'Not Specified'} | Honors: {edu.grades || 'None'}</p>
                  </div>
                ))}
             </section>

             <section className="mb-6">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 border-b-2 border-gray-100 pb-1">Certifications and References</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-gray-400">Professional Certificates</h3>
                    {data.certifications.map(cert => (
                      <div key={cert.id} className="text-xs">
                        <p className="font-bold">{cert.name}</p>
                        <p className="text-gray-500">{cert.issuer} | {cert.date}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-gray-400">Professional References</h3>
                    {data.references.map(ref => (
                      <div key={ref.id} className="text-xs">
                        <p className="font-bold">{ref.name}</p>
                        <p className="text-gray-500 uppercase text-[9px] font-black tracking-tight">{ref.position} at {ref.organization}</p>
                        <p className="text-gray-400 mt-0.5">{ref.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </section>
          </div>
        </div>
      </div>
    ),
    Business: (
      <div className="resume-paper bg-white p-12 shadow-lg min-h-[1056px] h-auto text-black leading-tight w-full max-w-[816px] mx-auto border font-serif" id="resume-content" style={{ overflow: 'visible' }}>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 tracking-tighter uppercase">{data.fullName || "Your Full Name"}</h1>
          <div className="text-sm font-sans flex justify-center gap-4 text-gray-600">
             {data.email} | {data.phone} | {data.location}
          </div>
          <div className="text-sm font-sans flex justify-center gap-4 text-gray-600 mt-1">
             {data.linkedin}
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold border-b-2 border-black mb-3 uppercase tracking-tighter">Professional Working Experience</h2>
          {data.experiences.map(exp => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between items-baseline font-sans">
                <span className="font-bold text-lg">{exp.company}</span>
                <span className="font-bold">{exp.location}</span>
              </div>
              <div className="flex justify-between items-baseline italic mb-2">
                <span>{exp.position}</span>
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="text-[10.5pt] font-sans leading-relaxed">{renderBullets(exp.description)}</div>
            </div>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold border-b-2 border-black mb-3 uppercase tracking-tighter">Educational Background Details</h2>
          {data.education.map(edu => (
            <div key={edu.id} className="mb-4 font-sans">
              <div className="flex justify-between items-baseline font-bold">
                <span>{edu.school}</span>
                <span>{edu.gradDate}</span>
              </div>
              <div className="flex justify-between items-baseline italic">
                <span>{edu.degree}</span>
                <span>Grade Point Average: {edu.gpa || 'Not Specified'}</span>
              </div>
              {edu.grades && <p className="text-xs mt-1">Examination Result Honors: {edu.grades}</p>}
            </div>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold border-b-2 border-black mb-3 uppercase tracking-tighter">Expertise and Skills</h2>
          <div className="grid grid-cols-2 gap-4 font-sans text-[10.5pt]">
            <p><strong>Professional Skills:</strong> {data.skills}</p>
            <p><strong>Languages Spoken:</strong> {data.languages}</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-10">
          <section>
            <h2 className="text-lg font-bold border-b-2 border-black mb-3 uppercase tracking-tighter">Certifications</h2>
            {data.certifications.map(cert => (
              <div key={cert.id} className="text-sm font-sans mb-3">
                <p className="font-bold">{cert.name}</p>
                <p className="text-xs text-gray-600">{cert.issuer} ({cert.date})</p>
              </div>
            ))}
          </section>
          <section>
            <h2 className="text-lg font-bold border-b-2 border-black mb-3 uppercase tracking-tighter">Professional References</h2>
            {data.references.map(ref => (
              <div key={ref.id} className="text-sm font-sans mb-3">
                <p className="font-bold">{ref.name}</p>
                <p className="text-xs text-gray-600 uppercase font-bold tracking-tighter">{ref.position} at {ref.organization}</p>
                <p className="text-xs text-gray-500 italic mt-0.5">Contact Method: {ref.phone || ref.email}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    ),
    Creative: (
      <div className="resume-paper bg-white p-0 shadow-lg min-h-[1056px] h-auto text-gray-800 leading-snug w-full max-w-[816px] mx-auto border flex overflow-hidden" id="resume-content" style={{ overflow: 'visible' }}>
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gray-900 text-white p-8 flex flex-col gap-8" style={{ minHeight: '100%' }}>
          <div>
            <h1 className="text-2xl font-black uppercase mb-2 leading-none">{data.fullName.split(' ')[0]}<br/>{data.fullName.split(' ').slice(1).join(' ')}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest border-t border-gray-700 pt-2 mt-2">Biography Summary</p>
            <p className="text-xs mt-2 text-gray-300 leading-relaxed italic">{data.summary}</p>
          </div>
          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Contact Information</h3>
            <div className="space-y-4 text-[10px]">
              <p className="flex flex-col"><strong className="text-gray-500 uppercase tracking-widest text-[8px]">Electronic Mail Address</strong> {data.email}</p>
              <p className="flex flex-col"><strong className="text-gray-500 uppercase tracking-widest text-[8px]">Telephone Number</strong> {data.phone}</p>
              <p className="flex flex-col"><strong className="text-gray-500 uppercase tracking-widest text-[8px]">Current Geographic Location</strong> {data.location}</p>
              <p className="flex flex-col"><strong className="text-gray-500 uppercase tracking-widest text-[8px]">LinkedIn Profile Address</strong> {data.linkedin}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Professional Competencies</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.split(',').map((s, i) => (
                <span key={i} className="border border-gray-700 px-2 py-1 text-[9px] uppercase tracking-tighter font-bold">{s.trim()}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Professional References</h3>
            <div className="space-y-5">
              {data.references.map(ref => (
                <div key={ref.id} className="text-[10px]">
                  <p className="font-bold text-blue-300">{ref.name}</p>
                  <p className="text-gray-400 uppercase font-black text-[8px] tracking-widest">{ref.organization}</p>
                  <p className="text-gray-500 mt-1">{ref.phone}</p>
                  <p className="text-gray-500 truncate italic">{ref.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main */}
        <div className="flex-1 p-10 bg-white">
          <section className="mb-10">
            <h2 className="text-xl font-black uppercase border-b-4 border-gray-900 mb-6 inline-block tracking-tighter">Professional Experience</h2>
            {data.experiences.map(exp => (
              <div key={exp.id} className="mb-8">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-black uppercase text-gray-900 tracking-tight">{exp.position}</h4>
                  <span className="text-xs font-bold text-gray-400">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-widest">{exp.company}</p>
                <div className="text-xs leading-relaxed text-gray-600 border-l border-gray-100 pl-4">{renderBullets(exp.description)}</div>
              </div>
            ))}
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase border-b-4 border-gray-900 mb-6 inline-block tracking-tighter">Educational History</h2>
            {data.education.map(edu => (
              <div key={edu.id} className="mb-6">
                <h4 className="font-black text-gray-900 uppercase tracking-tighter">{edu.school}</h4>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mt-1 tracking-widest">
                  <span>{edu.degree}</span>
                  <span>{edu.gradDate}</span>
                </div>
                <p className="text-xs mt-2 italic text-gray-400">Performance: Grade Point Average {edu.gpa} | Honors: {edu.grades}</p>
              </div>
            ))}
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase border-b-4 border-gray-900 mb-6 inline-block tracking-tighter">Professional Certifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.certifications.map(cert => (
                <div key={cert.id} className="mb-4">
                  <h4 className="font-bold text-gray-900 text-sm tracking-tight">{cert.name}</h4>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{cert.issuer}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{cert.date}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase border-b-4 border-gray-900 mb-6 inline-block tracking-tighter">Academic Projects</h2>
            {data.projects.map(proj => (
              <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-gray-900 tracking-tight">{proj.title}</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{proj.date}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed italic">{proj.description}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    )
  };

  return templates[data.template] || templates.Standard;
};

export default ResumeTemplate;

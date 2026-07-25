import React from 'react';

export const TemplateModern = ({ data }: { data: any }) => {
  return (
    <div className="text-gray-800 font-sans leading-relaxed" style={{ fontSize: '9pt' }}>
      {/* Header - Modern Left Aligned */}
      <div className="border-l-[5px] border-[#0ea5e9] pl-5 mb-8">
        <h1 className="text-[28pt] font-black tracking-tighter text-gray-900 uppercase leading-none">{data.name}</h1>
        <div className="text-[14pt] font-semibold text-[#0ea5e9] mt-1 tracking-wide">{data.role}</div>
        <div className="flex flex-wrap items-center gap-2 text-[9.5pt] font-medium text-gray-500 mt-2">
          {data.location && <span>{data.location}</span>}
          {data.location && <span className="text-gray-300">•</span>}
          <span>+91 98765 43210</span>
          <span className="text-gray-300">•</span>
          <span>{data.name.split(' ')[0]?.toLowerCase() || 'user'}@email.com</span>
        </div>
      </div>

      {/* Grid Layout for the rest */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Main Content (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          {data.summary && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-2 uppercase tracking-widest">Profile</h2>
              <p className="text-[9.5pt] leading-relaxed text-gray-700 text-justify">{data.summary}</p>
            </section>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Experience</h2>
              <div className="space-y-4">
                {data.experience.map((exp: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-[11pt] font-bold text-gray-900">{exp.role}</h3>
                      <span className="text-[9pt] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm">{exp.dates}</span>
                    </div>
                    <div className="text-[10pt] text-[#0ea5e9] font-bold mb-1.5">{exp.company}</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {exp.points.map((point: string, idx: number) => (
                        <li key={idx} className="text-[9.5pt] text-gray-600 leading-snug pl-1 text-justify">{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Projects</h2>
              <div className="space-y-4">
                {data.projects.map((proj: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-[10.5pt] font-bold text-gray-900 flex items-center gap-2 mb-0.5">
                      {proj.name}
                    </h3>
                    <p className="text-[9.5pt] text-gray-600 leading-snug my-1 text-justify">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="text-[8.5pt] text-gray-500 font-medium mt-1">
                        <span className="font-bold text-gray-700">Tech Stack:</span> {proj.technologies.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Sidebar (1/3) */}
        <div className="col-span-1 space-y-6">
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-[8.5pt] font-bold rounded border border-gray-200 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-[10pt] font-bold text-gray-900 leading-tight">{edu.degree}</h3>
                    <div className="text-[9pt] text-gray-600 mt-0.5">{edu.institution}</div>
                    <div className="text-[8.5pt] font-bold text-[#0ea5e9] mt-0.5">{edu.dates}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Certifications</h2>
              <div className="space-y-2">
                {data.certifications.map((cert: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-[9.5pt] font-bold text-gray-900">{cert.name}</h3>
                    <div className="text-[8.5pt] text-gray-500">{cert.issuer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Achievements</h2>
              <ul className="space-y-1.5">
                {data.achievements.map((ach: any, i: number) => (
                  <li key={i} className="text-[9pt] text-gray-600 leading-snug">
                    <span className="font-bold text-gray-800">{ach.title}</span> {ach.issuer ? `(${ach.issuer})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section>
              <h2 className="text-[12pt] font-extrabold text-gray-900 border-b-[2px] border-gray-100 pb-1 mb-3 uppercase tracking-widest">Hobbies</h2>
              <div className="text-[9pt] text-gray-600 leading-relaxed">
                {data.hobbies.join(" • ")}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

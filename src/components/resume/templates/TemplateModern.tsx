import React from 'react';

export const TemplateModern = ({ data }: { data: any }) => {
  return (
    <div className="space-y-6 text-[#2A2A2A] font-sans">
      {/* Header - Modern Left Aligned */}
      <div className="border-l-4 border-blue-600 pl-4 mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 uppercase">{data.name}</h1>
        <div className="text-xl font-medium text-blue-600 mt-1">{data.role}</div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 mt-2">
          {data.location && <span>{data.location}</span>}
          {/* We can add email/phone if we had them in the schema */}
        </div>
      </div>

      {/* Grid Layout for the rest */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Main Content (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          {data.summary && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-3">Profile</h2>
              <p className="text-[13px] leading-relaxed text-gray-700 text-justify">{data.summary}</p>
            </section>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-4">Experience</h2>
              <div className="space-y-5">
                {data.experience.map((exp: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[15px] font-bold text-gray-900">{exp.role}</h3>
                      <span className="text-xs font-semibold text-gray-500">{exp.dates}</span>
                    </div>
                    <div className="text-[13px] text-blue-600 font-bold mb-2">{exp.company}</div>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {exp.points.map((point: string, idx: number) => (
                        <li key={idx} className="text-[13px] text-gray-700 leading-relaxed pl-1">{point}</li>
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
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-4">Projects</h2>
              <div className="space-y-4">
                {data.projects.map((proj: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                      {proj.name}
                    </h3>
                    <p className="text-[13px] text-gray-700 leading-relaxed my-1">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="text-[12px] text-gray-500 font-medium">
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
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-800 text-white text-[11px] font-bold rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-3">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-[13px] font-bold text-gray-900 leading-tight">{edu.degree}</h3>
                    <div className="text-[12px] text-gray-600 mt-1">{edu.institution}</div>
                    <div className="text-[11px] font-semibold text-gray-400 mt-0.5">{edu.dates}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-3">Certifications</h2>
              <div className="space-y-2">
                {data.certifications.map((cert: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-[12px] font-bold text-gray-900">{cert.name}</h3>
                    <div className="text-[11px] text-gray-600">{cert.issuer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-3">Achievements</h2>
              <ul className="space-y-2">
                {data.achievements.map((ach: any, i: number) => (
                  <li key={i} className="text-[12px] text-gray-700 leading-snug">
                    <span className="font-bold">{ach.title}</span> {ach.issuer ? `(${ach.issuer})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-200 pb-1 mb-3">Hobbies</h2>
              <div className="text-[12px] text-gray-700">
                {data.hobbies.join(" • ")}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

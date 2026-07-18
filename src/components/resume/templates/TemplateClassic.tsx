import React from 'react';

export const TemplateClassic = ({ data }: { data: any }) => {
  return (
    <div className="space-y-6 text-[#1a1a1a]">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">{data.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-600 mt-2">
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded text-[13px] font-semibold">{data.role}</span>
          {data.location && (
            <>
              <span className="text-gray-300">•</span>
              <span>{data.location}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Technical Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Professional Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{exp.role}</h3>
                    <div className="text-sm text-primary font-medium">{exp.company}</div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{exp.dates}</span>
                </div>
                <ul className="list-disc pl-4 mt-1.5 space-y-1">
                  {exp.points.map((point: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 leading-relaxed pl-1">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Key Projects</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.projects.map((proj: any, i: number) => (
              <div key={i} className="bg-gray-50/80 border border-gray-200/60 p-3 rounded-lg">
                <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <span className="text-primary text-xs">❖</span> {proj.name}
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
                    {proj.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className="text-[10px] text-gray-500 font-medium px-1.5 py-0.5 bg-white border border-gray-200 rounded">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications (New) */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Licenses & Certifications</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.certifications.map((cert: any, i: number) => (
              <div key={i} className="mb-2">
                <h3 className="text-sm font-bold text-gray-900">{cert.name}</h3>
                <div className="text-[13px] text-gray-600">{cert.issuer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{edu.degree}</h3>
                  <div className="text-[13px] text-gray-600">{edu.institution}</div>
                </div>
                <span className="text-xs font-medium text-gray-500">{edu.dates}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements (New) */}
      {data.achievements && data.achievements.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Honors & Achievements</h2>
          <ul className="list-disc pl-4 space-y-1">
            {data.achievements.map((ach: any, i: number) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">
                <strong>{ach.title}</strong> {ach.issuer ? `- ${ach.issuer}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

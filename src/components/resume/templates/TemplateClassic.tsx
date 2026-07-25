import React from 'react';

export const TemplateClassic = ({ data }: { data: any }) => {
  return (
    <div className="text-gray-900 leading-normal" style={{ fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Header */}
      <div className="text-center pb-2 mb-4">
        <h1 className="text-[24pt] font-bold text-[#1f4e79] tracking-wider uppercase mb-1">{data.name}</h1>
        <div className="text-[12pt] text-gray-700 italic mb-1.5">{data.role}</div>
        <div className="text-[10pt] text-gray-600 flex justify-center items-center gap-2 font-sans">
          {data.location && <span>{data.location}</span>}
          {data.location && <span className="text-gray-400">|</span>}
          <span>+91 98765 43210</span>
          <span className="text-gray-400">|</span>
          <span>{data.name.split(' ')[0]?.toLowerCase() || 'user'}@email.com</span>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold text-[#1f4e79] uppercase tracking-widest border-b-[1.5px] border-[#1f4e79] mb-2 pb-0.5">Professional Summary</h2>
          <p className="text-[10.5pt] leading-snug text-justify">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold text-[#1f4e79] uppercase tracking-widest border-b-[1.5px] border-[#1f4e79] mb-2 pb-0.5">Technical Skills</h2>
          <p className="text-[10.5pt] leading-snug">
             <span className="font-bold">Core Competencies: </span>
             {data.skills.join(", ")}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold text-[#1f4e79] uppercase tracking-widest border-b-[1.5px] border-[#1f4e79] mb-2 pb-0.5">Professional Experience</h2>
          <div className="space-y-3">
            {data.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[11pt] font-bold text-[#1f4e79]">
                    {exp.role} <span className="font-normal text-gray-600">| {exp.company}</span>
                  </h3>
                  <span className="text-[10pt] font-medium text-gray-700 italic">{exp.dates}</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {exp.points.map((point: string, idx: number) => (
                    <li key={idx} className="text-[10.5pt] text-gray-800 leading-snug pl-1 text-justify">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold text-[#1f4e79] uppercase tracking-widest border-b-[1.5px] border-[#1f4e79] mb-2 pb-0.5">Key Projects</h2>
          <div className="space-y-3">
            {data.projects.map((proj: any, i: number) => (
              <div key={i}>
                <h3 className="text-[10.5pt] font-bold text-gray-900 mb-0.5">
                  {proj.name}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="font-normal text-gray-600 italic"> — {proj.technologies.join(", ")}</span>
                  )}
                </h3>
                <p className="text-[10.5pt] text-gray-800 leading-snug text-justify">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold text-[#1f4e79] uppercase tracking-widest border-b-[1.5px] border-[#1f4e79] mb-2 pb-0.5">Education</h2>
          <div className="space-y-2">
            {data.education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10.5pt] font-bold text-gray-900">{edu.degree}</span>
                  <span className="text-[10.5pt] text-gray-700">, {edu.institution}</span>
                </div>
                <span className="text-[10pt] font-medium text-gray-700 italic">{edu.dates}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold text-[#1f4e79] uppercase tracking-widest border-b-[1.5px] border-[#1f4e79] mb-2 pb-0.5">Licenses & Certifications</h2>
          <ul className="list-disc pl-5 space-y-0.5">
            {data.certifications.map((cert: any, i: number) => (
              <li key={i} className="text-[10.5pt] text-gray-800">
                <span className="font-bold">{cert.name}</span> — {cert.issuer}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

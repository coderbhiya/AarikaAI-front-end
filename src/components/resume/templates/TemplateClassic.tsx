import React from 'react';

export const TemplateClassic = ({ data }: { data: any }) => {
  const contactParts = [
    data.email || 'email@example.com',
    data.phone,
    data.location,
  ].filter(Boolean);

  return (
    <div className="text-gray-800" style={{ fontSize: '11pt', fontFamily: '"Segoe UI", "Calibri", sans-serif', lineHeight: '1.5' }}>
      {/* Header Section - Elegant Design */}
      <div className="pb-3 mb-5 border-b-2 border-gray-800">
        <h1 style={{ fontSize: '26pt', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1a1a1a', letterSpacing: '0.5px' }}>
          {data.name}
        </h1>
        <h2 style={{ fontSize: '12pt', fontWeight: '600', margin: '0 0 6px 0', color: '#2c3e50' }}>
          {data.role}
        </h2>
        <div style={{ fontSize: '10pt', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {contactParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ color: '#999' }}>•</span>}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-5">
          <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '1px solid #ddd' }}>
            Professional Summary
          </h3>
          <p style={{ fontSize: '10.5pt', color: '#444', lineHeight: '1.6', margin: '0', textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Core Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-5">
          <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '1px solid #ddd' }}>
            Core Skills
          </h3>
          <p style={{ fontSize: '10.5pt', color: '#444', margin: '0', lineHeight: '1.6' }}>
            {data.skills.join(" • ")}
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-5">
          <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #ddd' }}>
            Professional Experience
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '11pt', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                    {exp.role}
                  </h4>
                  <span style={{ fontSize: '10pt', color: '#666', fontStyle: 'italic' }}>
                    {exp.dates}
                  </span>
                </div>
                <p style={{ fontSize: '10.5pt', color: '#2c3e50', fontWeight: '600', margin: '2px 0 6px 0' }}>
                  {exp.company}
                </p>
                {exp.points && exp.points.length > 0 && (
                  <ul style={{ margin: '0', paddingLeft: '20px', listStyle: 'none' }}>
                    {exp.points.map((point: string, idx: number) => (
                      <li key={idx} style={{ fontSize: '10.5pt', color: '#555', marginBottom: '4px', paddingLeft: '8px', position: 'relative', textAlign: 'justify', lineHeight: '1.5' }}>
                        <span style={{ position: 'absolute', left: '-12px' }}>•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-5">
          <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #ddd' }}>
            Key Projects
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.projects.map((proj: any, i: number) => (
              <div key={i}>
                <h4 style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 3px 0' }}>
                  {proj.name}
                </h4>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p style={{ fontSize: '9.5pt', color: '#666', fontStyle: 'italic', margin: '2px 0', fontWeight: '500' }}>
                    {proj.technologies.join(" • ")}
                  </p>
                )}
                <p style={{ fontSize: '10.5pt', color: '#555', margin: '3px 0 0 0', lineHeight: '1.5', textAlign: 'justify' }}>
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-5">
          <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #ddd' }}>
            Education
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.education.map((edu: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {edu.degree}
                  </span>
                  {edu.institution && (
                    <span style={{ fontSize: '10.5pt', color: '#666', marginLeft: '8px' }}>
                      • {edu.institution}
                    </span>
                  )}
                </div>
                {edu.dates && (
                  <span style={{ fontSize: '10pt', color: '#999', fontStyle: 'italic' }}>
                    {edu.dates}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-3">
          <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #ddd' }}>
            Certifications
          </h3>
          <ul style={{ margin: '0', paddingLeft: '0', listStyle: 'none' }}>
            {data.certifications.map((cert: any, i: number) => (
              <li key={i} style={{ fontSize: '10.5pt', color: '#555', marginBottom: '3px', paddingLeft: '12px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0' }}>•</span>
                <span style={{ fontWeight: 'bold' }}>{cert.name || cert.title}</span>
                {cert.issuer && <span style={{ color: '#999', marginLeft: '6px' }}>— {cert.issuer}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
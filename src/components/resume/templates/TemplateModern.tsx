import React from 'react';

export const TemplateModern = ({ data }: { data: any }) => {
  const contactParts = [
    data.email || 'email@example.com',
    data.phone,
    data.location,
  ].filter(Boolean);

  return (
    <div style={{ fontSize: '10pt', fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif', color: '#2c3e50', lineHeight: '1.5' }}>
      {/* Modern Header with Left Border */}
      <div style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '16px', marginBottom: '20px', paddingBottom: '8px' }}>
        <h1 style={{ fontSize: '28pt', fontWeight: '800', margin: '0 0 6px 0', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          {data.name}
        </h1>
        <h2 style={{ fontSize: '13pt', fontWeight: '700', margin: '0 0 8px 0', color: '#0ea5e9', letterSpacing: '0.5px' }}>
          {data.role}
        </h2>
        <div style={{ fontSize: '9.5pt', color: '#666', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {contactParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ color: '#ccc' }}>•</span>}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* Main Content - Left Column */}
        <div>
          {/* Profile Summary */}
          {data.summary && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Profile
              </h3>
              <p style={{ fontSize: '10pt', color: '#555', margin: '0', lineHeight: '1.6', textAlign: 'justify' }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Professional Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Experience
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.experience.map((exp: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                      <h4 style={{ fontSize: '11pt', fontWeight: '700', margin: '0', color: '#1a1a1a' }}>
                        {exp.role}
                      </h4>
                      <span style={{ fontSize: '9pt', color: '#999', fontWeight: '600', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '3px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {exp.dates}
                      </span>
                    </div>
                    <p style={{ fontSize: '10.5pt', color: '#0ea5e9', fontWeight: '600', margin: '2px 0 6px 0' }}>
                      {exp.company}
                    </p>
                    {exp.points && exp.points.length > 0 && (
                      <ul style={{ margin: '0', paddingLeft: '18px', listStyle: 'none' }}>
                        {exp.points.map((point: string, idx: number) => (
                          <li key={idx} style={{ fontSize: '10pt', color: '#555', marginBottom: '4px', paddingLeft: '6px', position: 'relative', lineHeight: '1.5', textAlign: 'justify' }}>
                            <span style={{ position: 'absolute', left: '-12px' }}>▪</span>
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

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Projects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.projects.map((proj: any, i: number) => (
                  <div key={i}>
                    <h4 style={{ fontSize: '10.5pt', fontWeight: '700', color: '#1a1a1a', margin: '0 0 3px 0' }}>
                      {proj.name}
                    </h4>
                    <p style={{ fontSize: '10pt', color: '#666', margin: '3px 0', lineHeight: '1.5', textAlign: 'justify' }}>
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p style={{ fontSize: '9pt', color: '#999', margin: '4px 0 0 0', fontWeight: '500' }}>
                        <span style={{ fontWeight: '600', color: '#555' }}>Tech:</span> {proj.technologies.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div>
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.skills.map((skill: string, i: number) => (
                  <span key={i} style={{ fontSize: '9pt', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e0e0e0', fontWeight: '500' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Education
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.education.map((edu: any, i: number) => (
                  <div key={i}>
                    <h4 style={{ fontSize: '10pt', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px 0', lineHeight: '1.4' }}>
                      {edu.degree}
                    </h4>
                    <p style={{ fontSize: '9.5pt', color: '#666', margin: '2px 0', lineHeight: '1.4' }}>
                      {edu.institution}
                    </p>
                    {edu.dates && (
                      <p style={{ fontSize: '9pt', color: '#0ea5e9', fontWeight: '600', margin: '2px 0 0 0' }}>
                        {edu.dates}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Certifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.certifications.map((cert: any, i: number) => (
                  <div key={i}>
                    <h4 style={{ fontSize: '10pt', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px 0', lineHeight: '1.3' }}>
                      {cert.name || cert.title}
                    </h4>
                    {cert.issuer && (
                      <p style={{ fontSize: '9pt', color: '#666', margin: '0', lineHeight: '1.4' }}>
                        {cert.issuer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies/Interests */}
          {data.hobbies && data.hobbies.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f0f0f0' }}>
                Interests
              </h3>
              <p style={{ fontSize: '10pt', color: '#666', margin: '0', lineHeight: '1.5' }}>
                {data.hobbies.join(" • ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
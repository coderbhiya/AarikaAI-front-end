import React, { useState, useEffect } from 'react';
import { getCertifications, addCertification, updateCertification, deleteCertification } from '@/services/profileService';
import { Award, Plus, Trash2, Edit3, Check, ExternalLink } from "lucide-react";

const Certifications = () => {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCertifications = async () => {
      setIsLoading(true);
      try {
        const certsData = await getCertifications();
        setCertifications(certsData || []);
      } catch (error) {
        console.error('Error fetching certifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  const handleAddCertification = async (certData) => {
    setIsLoading(true);
    try {
      const response = await addCertification(certData);

      if (response.success && response.certification) {
        setCertifications(prev => [response.certification, ...prev]);
        setIsAddingCertification(false);
      }
    } catch (error) {
      console.error('Error adding certification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCertification = async (certId, updatedCert) => {
    setIsLoading(true);
    try {
      const response = await updateCertification(certId, updatedCert);

      if (response.success && response.certification) {
        setCertifications(prev => prev.map(cert =>
          cert.id === certId ? response.certification : cert
        ));
        setEditingCertification(null);
      }
    } catch (error) {
      console.error('Error updating certification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCertification = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;

    setIsLoading(true);
    try {
      const response = await deleteCertification(certId);

      if (response.success) {
        setCertifications(prev => prev.filter(cert => cert.id !== certId));
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const CertificationForm = ({ certification = null, onSave, onCancel }: { certification?: any; onSave: any; onCancel: any }) => {
    const [formData, setFormData] = useState({
      name: certification?.name || '',
      issuer: certification?.issuer || '',
      issueDate: certification?.issueDate ? new Date(certification.issueDate).toISOString().split('T')[0] : '',
      expirationDate: certification?.expirationDate ? new Date(certification.expirationDate).toISOString().split('T')[0] : '',
      credentialId: certification?.credentialId || '',
      url: certification?.url || '',
      doesNotExpire: certification ? !certification.expirationDate : true
    });

    const isFormValid = formData.name.trim() && formData.issuer.trim() && formData.issueDate;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isFormValid) {
        const dataToSave = {
          ...formData,
          expirationDate: formData.doesNotExpire ? null : formData.expirationDate
        };
        const { doesNotExpire, ...finalData } = dataToSave as any;
        onSave(finalData);
      }
    };

    const inputClasses = `w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400 h-11`;

    return (
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: AWS Certified Solutions Architect"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Issuing Organization *</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Amazon Web Services (AWS)"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Issue Date *</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className={inputClasses}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Expiration Date</label>
              <div className="space-y-3">
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                  disabled={formData.doesNotExpire}
                  className={inputClasses}
                />
                <label className="flex items-center gap-2.5 cursor-pointer group/label">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.doesNotExpire ? 'bg-slate-900 border-slate-900' : 'border-slate-200 group-hover/label:border-primary/50'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.doesNotExpire}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        doesNotExpire: e.target.checked,
                        expirationDate: e.target.checked ? '' : prev.expirationDate
                      }))}
                    />
                    {formData.doesNotExpire && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className="text-[12px] font-medium text-gray-600">This credential does not expire</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Credential ID</label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                className={inputClasses}
                placeholder="Credential ID"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Credential URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className={inputClasses}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              <span>{certification ? 'Save Changes' : 'Add Certification'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 h-11 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Licenses & Certifications</h2>
          <p className="text-gray-500 text-[13px]">Showcase your verified skills and credentials</p>
        </div>
        <button
          onClick={() => setIsAddingCertification(true)}
          disabled={isAddingCertification}
          className="px-5 py-2 bg-primary text-white font-semibold text-[14px] rounded-full hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add Certification
        </button>
      </div>

      {/* Add Section */}
      {isAddingCertification && (
        <div className="mb-8">
          <CertificationForm onSave={handleAddCertification} onCancel={() => setIsAddingCertification(false)} />
        </div>
      )}

      {/* Certifications List */}
      <div className="space-y-4 relative">
        {certifications.length === 0 && !isAddingCertification ? (
          <div className="p-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Award size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No certifications listed</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-[13px]">Add your professional credentials and certifications.</p>
          </div>
        ) : (
          certifications.map((cert: any) => (
            <div key={cert.id} className="relative">
              {editingCertification === cert.id ? (
                <CertificationForm
                  certification={cert}
                  onSave={(updated) => handleEditCertification(cert.id, updated)}
                  onCancel={() => setEditingCertification(null)}
                />
              ) : (
                <div className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Award size={20} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{cert.name}</h3>
                        <p className="text-[14px] font-medium text-gray-700 mt-0.5">{cert.issuer}</p>
                        <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1">
                          <span>Issued {formatDate(cert.issueDate)}</span>
                          {cert.expirationDate && (
                            <>
                              <span>•</span>
                              <span>Expires {formatDate(cert.expirationDate)}</span>
                            </>
                          )}
                        </div>
                        {cert.credentialId && (
                          <p className="text-[12px] text-gray-500 mt-0.5">Credential ID {cert.credentialId}</p>
                        )}
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                            Show credential <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCertification(cert.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Certifications;

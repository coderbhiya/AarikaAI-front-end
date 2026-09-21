import React from "react";
import { GraduationCap, MapPin, Star, Globe, Phone, Navigation } from "lucide-react";

interface College {
  name: string;
  rating?: string | null;
  reviewCount?: string | null;
  collegeType?: string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  mapsLink?: string | null;
}

interface CollegeCardProps {
  colleges: College[];
}

// Pulls a plain numeric rating out of strings like "3.8 ★" or "4.2".
const parseRatingValue = (rating?: string | null): number | null => {
  if (!rating) return null;
  const match = rating.match(/[\d.]+/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  return Number.isFinite(value) ? value : null;
};

const CollegeCard: React.FC<CollegeCardProps> = ({ colleges }) => {
  if (!colleges || colleges.length === 0) return null;

  return (
    <div className="w-full mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {colleges.map((college, index) => {
        const ratingValue = parseRatingValue(college.rating);

        return (
          <div
            key={index}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>

              <div className="min-w-0 flex-1">
                {/* Name first — this is what the user is actually choosing between,
                    so it gets full width and wraps rather than truncating. */}
                <h4 className="text-[15px] font-bold text-[#202124] leading-snug">
                  {college.name}
                </h4>

                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {ratingValue !== null && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      {ratingValue.toFixed(1)}
                      {college.reviewCount && (
                        <span className="font-medium text-amber-600">({college.reviewCount})</span>
                      )}
                    </span>
                  )}
                  {college.collegeType && (
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {college.collegeType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {college.address && (
              <div className="flex items-start gap-1.5 mt-3 text-[13px] text-[#5f6368] leading-snug">
                <MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{college.address}</span>
              </div>
            )}

            {(college.website || college.phone) && (
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Globe size={12} />
                    Website
                  </a>
                )}
                {college.phone && (
                  <a
                    href={`tel:${college.phone}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5f6368] hover:text-[#202124]"
                  >
                    <Phone size={12} />
                    {college.phone}
                  </a>
                )}
              </div>
            )}

            {college.mapsLink && (
              <a
                href={college.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full py-2 transition-colors mt-auto pt-2"
              >
                <Navigation size={13} />
                View on Google Maps
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CollegeCard;

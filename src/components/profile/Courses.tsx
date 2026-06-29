import React, { useState, useEffect } from "react";
import { BookOpen, ExternalLink, PlayCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiUrl}/profile/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (id: number, progressPercentage: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiUrl}/profile/courses/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progressPercentage })
      });
      if (res.ok) {
        toast.success("Progress updated!");
        fetchCourses();
      }
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading courses...</div>;
  }

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[19px] font-bold text-gray-900">Learning & Courses</h2>
          <p className="text-[14px] text-gray-500 mt-1">Track your progress and test your proficiency.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 className="text-[15px] font-semibold text-gray-700">No courses yet</h3>
          <p className="text-[13px] text-gray-500 mt-1">Ask Aarika for course recommendations to start learning!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-primary/30 transition-all flex flex-col">
              <div className="flex gap-3 mb-4">
                <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${(course.platform || "").toLowerCase().includes('youtube') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  {(course.platform || "").toLowerCase().includes('youtube') ? <PlayCircle size={20} /> : <BookOpen size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-gray-900 line-clamp-2">{course.title}</h3>
                  <div className="flex gap-2 mt-1 items-center">
                    <span className="text-[12px] text-gray-500">{course.platform}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${course.isFree ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>{course.isFree ? 'Free' : 'Paid'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-semibold text-gray-600">Progress</span>
                  <span className="text-[12px] font-bold text-primary">{course.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${course.progressPercentage}%` }}></div>
                </div>
                
                <div className="flex gap-2">
                  {course.progressPercentage < 100 ? (
                    <button 
                      onClick={() => updateProgress(course.id, 100)}
                      className="flex-1 py-2 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 border border-gray-200 hover:border-green-200 rounded-lg text-[12px] font-bold transition-all"
                    >
                      Mark Completed
                    </button>
                  ) : (
                    <button 
                      onClick={() => router.push(`/?msg=I have completed the course "${course.title}". Please prepare a 5 question proficiency test for me.`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-[12px] font-bold shadow-sm"
                    >
                      <Trophy size={14} /> Take Proficiency Test
                    </button>
                  )}
                  {course.url && (
                     <a href={course.url.startsWith('http') ? course.url : `https://${course.url}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 transition-all">
                       <ExternalLink size={14} />
                     </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

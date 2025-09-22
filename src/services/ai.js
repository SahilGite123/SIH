// src/services/ai.js
// Placeholder AI integration for generating career roadmaps.
// Replace the body of generateRoadmapAI with a real OpenAI/Gemini call later.
// The function returns an object with { title, steps, scholarships, colleges }

export async function generateRoadmapAI(profile) {
  const { domain, location = 'J&K' } = profile || {};
  const loc = String(location || '').toLowerCase();

  // Simple domain-specific templates with India/J&K flavor
  const BASE = {
    Engineering: {
      title: 'Engineering',
      steps: ['Class 11-12 with PCM', 'JEE Main/Advanced prep', 'B.Tech/B.E. (NIT/IIT/Private)', 'Internships & Projects', 'Placements or Higher Studies (M.Tech/MS)'],
      scholarships: ['INSPIRE Scholarship', 'IIT/NIT Merit Scholarships', 'AICTE Pragati/Saksham'],
      colleges: ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'NIT Trichy', 'BITS Pilani'],
    },
    Medicine: {
      title: 'Medicine',
      steps: ['Class 11-12 with PCB', 'NEET preparation', 'MBBS/BDS/AYUSH', 'Internship', 'PG Specialization (MD/MS)'],
      scholarships: ['NEET Rank-based Scholarships', 'National Scholarships Portal (NSP)'],
      colleges: ['AIIMS Delhi', 'CMC Vellore', 'JIPMER', 'KMC Manipal'],
    },
    Law: {
      title: 'Law',
      steps: ['Class 12 (any stream)', 'CLAT/AILET prep', 'BA LL.B./BBA LL.B.', 'Internships & Moots', 'Bar Exam & Practice/LL.M.'],
      scholarships: ['CLAT Scholarships', 'University Merit Scholarships'],
      colleges: ['NLSIU Bangalore', 'NALSAR Hyderabad', 'NLU Delhi'],
    },
    Commerce: {
      title: 'Commerce',
      steps: ['Class 11-12 (Commerce)', 'B.Com/BBA', 'CA/CS/CMA (optional)', 'Internships', 'MBA or Jobs'],
      scholarships: ['National Means-cum-Merit Scholarship', 'Private University Scholarships'],
      colleges: ['SRCC, DU', 'NMIMS', 'Christ University', 'St. Xaviers Mumbai'],
    },
    UPSC: {
      title: 'UPSC',
      steps: ['Any Bachelor’s Degree', 'UPSC Prelims/Mains/Interview Prep', 'Test Series & Mentorship', 'Attempt UPSC', 'Service Allocation & Training'],
      scholarships: ['Government Coaching Assistance', 'State UPSC Scholarships'],
      colleges: ['—'],
    },
    Arts: {
      title: 'Arts',
      steps: ['Class 11-12 (Arts)', 'BA/Design/Media', 'Portfolio/Projects', 'Internships/Freelance', 'Jobs/Higher Studies (MA/MFA)'],
      scholarships: ['Art & Design Scholarships', 'MA/MFA Scholarships'],
      colleges: ['NID', 'NIFT', 'FTII', 'Srishti Institute'],
    },
  };

  const d = BASE[domain] || {
    title: domain || 'General',
    steps: ['Class 11-12 foundation', 'Choose Bachelor’s program', 'Projects/Internships', 'Jobs/Higher Studies'],
    scholarships: ['National Scholarships Portal (NSP)'],
    colleges: ['Local Govt Colleges', 'Top Private Universities'],
  };

  // Add J&K specific tailoring
  const jkAdds = {
    scholarships: ['PMSS for J&K Students (AICTE)', 'JKBOPEE/State Scholarships'],
    colleges: ['NIT Srinagar', 'AIIMS Jammu', 'Central University of Kashmir'],
  };

  const isJK = loc.includes('j&k') || loc.includes('jammu') || loc.includes('kashmir') || loc.includes('srinagar');
  const scholarships = isJK ? Array.from(new Set([...(d.scholarships || []), ...jkAdds.scholarships])) : d.scholarships;
  const colleges = isJK ? Array.from(new Set([...(d.colleges || []), ...jkAdds.colleges])) : d.colleges;

  return {
    title: d.title,
    steps: d.steps,
    scholarships,
    colleges,
  };
}

export default { generateRoadmapAI };

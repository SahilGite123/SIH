// src/services/roadmapBuilder.js
// Dynamic roadmap generator based on user inputs.
// Inputs:
// - education: 'Class 10' | 'Class 11-12' | 'Undergraduate' | 'Graduate'
// - interest: 'Fine Arts' | 'Design' | 'Journalism/Media' | 'Psychology/Social Sciences' | 'Literature' | 'Political Science/Law' | 'Other'
// - goal: 'Designer' | 'Journalist' | 'Teacher' | 'Researcher' | 'Writer' | 'Social Worker' | 'Undecided'
// - skill: 'Writing' | 'Drawing' | 'Communication' | 'Research' | 'Editing/Media' | 'Public Speaking'
// - studyPref: 'India' | 'Abroad' | 'Both'
// - availability: '<5 hrs/week' | '5–10 hrs/week' | '10+ hrs/week'
// Output: array of steps with { type: 'study'|'portfolio'|'internship'|'higher', title, details, icon }

const ICONS = {
  study: 'book',
  portfolio: 'laptop',
  internship: 'briefcase',
  higher: 'cap',
};

const STREAM_MAP = {
  'Fine Arts': ['BFA', 'BA Fine Arts', 'Diploma in Fine Arts'],
  'Design': ['B.Des', 'BA Design', 'Diploma in UI/UX'],
  'Journalism/Media': ['BA Journalism', 'BJMC', 'BA Mass Communication'],
  'Psychology/Social Sciences': ['BA Psychology', 'BA Social Sciences', 'BSW'],
  'Literature': ['BA English', 'BA Literature'],
  'Political Science/Law': ['BA Political Science', 'BA LL.B'],
  'Other': ['BA (General)', 'BBA', 'BSc (relevant)'],
};

const SKILL_PORTFOLIO = {
  Writing: ['Blog series on Medium', 'Op-eds and essays', 'Newsletter'],
  Drawing: ['Sketchbook/ArtStation portfolio', 'Illustration series', 'Poster design set'],
  Communication: ['Podcast snippets', 'Presentation videos', 'Campus event moderation clips'],
  Research: ['Literature review summaries', 'Mini research report', 'Survey + analysis'],
  'Editing/Media': ['Short video edits (Reels/YT shorts)', 'Audio cleanup demo', 'Campus event coverage'],
  'Public Speaking': ['Toastmasters videos', 'Seminar talk recording', 'Interview clips'],
};

function levelStartingPoint(education) {
  switch (education) {
    case 'Class 10':
      return ['Class 10'];
    case 'Class 11-12':
      return ['Class 11-12'];
    case 'Undergraduate':
      return ['Undergrad'];
    case 'Graduate':
      return ['Graduate'];
    default:
      return ['Class 11-12'];
  }
}

function examsForInterest(interest, studyPref) {
  const india = {
    Design: ['NID', 'NIFT', 'UCEED'],
    'Journalism/Media': ['CUET', 'University-specific'],
    'Fine Arts': ['State Fine Arts Entrance', 'University Portfolio Review'],
    'Psychology/Social Sciences': ['CUET'],
    Literature: ['CUET'],
    'Political Science/Law': ['CLAT', 'AILET', 'CUET'],
    Other: ['CUET'],
  };
  const abroad = ['IELTS/TOEFL', 'SAT/ACT (UG)', 'GRE (PG)'];
  const key = interest in india ? interest : 'Other';
  const base = india[key];
  if (studyPref === 'Abroad') return abroad;
  if (studyPref === 'Both') return Array.from(new Set([...(base || []), ...abroad]));
  return base || [];
}

function portfolioBySkill(skill, goal) {
  const base = SKILL_PORTFOLIO[skill] || [];
  if (goal === 'Designer') return Array.from(new Set([...base, 'UI case study (Figma)', 'Branding mini-kit']));
  if (goal === 'Journalist') return Array.from(new Set([...base, 'Beat reporting samples', 'Interview series']));
  if (goal === 'Writer') return Array.from(new Set([...base, 'Short story/poetry portfolio', 'Editing before-after samples']));
  if (goal === 'Researcher') return Array.from(new Set([...base, 'Data analysis notebook', 'Research poster']));
  if (goal === 'Teacher') return Array.from(new Set([...base, 'Lesson plan samples', 'Tutoring demo video']))
  if (goal === 'Social Worker') return Array.from(new Set([...base, 'Community project report', 'NGO volunteering log']))
  return base;
}

function workByAvailability(availability, interest) {
  switch (availability) {
    case '<5 hrs/week':
      return ['Micro-internships (4-6 weeks)', 'Freelance microtasks (Fiverr/Upwork)', 'Campus club contributions'];
    case '5–10 hrs/week':
      return ['Part-time internship (remote)', `Freelance gigs in ${interest}`, 'College media/design team'];
    case '10+ hrs/week':
      return ['Full internship (remote/on-site)', 'Client projects (portfolio-grade)', 'NGO/Research assistant roles'];
    default:
      return ['Part-time internship (remote)'];
  }
}

function higherStudies(goal, interest, studyPref) {
  const india = {
    Designer: ['M.Des', 'MFA (Design)'],
    Journalist: ['MA Journalism', 'Mass Comm PG Diplomas'],
    Teacher: ['B.Ed', 'M.Ed'],
    Researcher: ['MA/MSc (Psych/PolSci/English/Design)', 'M.Phil/PhD'],
    Writer: ['MA English/Lit/Creative Writing'],
    'Social Worker': ['MSW'],
    Undecided: ['General PG (MA/MBA)'],
  };
  const abroadCommon = ['IELTS/TOEFL', 'GRE (for MS/MA where needed)', 'SOP/LOR prep'];
  const top = india[goal] || india['Undecided'];
  if (studyPref === 'Abroad') return [...abroadCommon, ...top];
  if (studyPref === 'Both') return Array.from(new Set([...top, ...abroadCommon]));
  return top;
}

export function buildRoadmap({ education, interest, goal, skill, studyPref, availability }) {
  const steps = [];

  // Determine starting block based on current education
  const start = levelStartingPoint(education)[0];

  // 1) Studies path
  const streams = STREAM_MAP[interest] || STREAM_MAP['Other'];
  const exams = examsForInterest(interest, studyPref);
  if (start === 'Class 10') {
    steps.push({ type: 'study', icon: ICONS.study, title: 'Class 11–12', details: `Choose relevant subjects for ${interest}. Entrance: ${exams.join(', ') || '—'}` });
  }
  if (start === 'Class 10' || start === 'Class 11-12') {
    steps.push({ type: 'study', icon: ICONS.study, title: 'Entrance Prep', details: exams.length ? exams.join(', ') : 'Focus on strong portfolio + CUET' });
    steps.push({ type: 'study', icon: ICONS.study, title: 'Undergraduate Options', details: streams.join(' • ') });
  }
  if (start === 'Undergrad' || start === 'Graduate') {
    steps.push({ type: 'portfolio', icon: ICONS.portfolio, title: 'Portfolio Focus', details: portfolioBySkill(skill, goal).join(' • ') });
  } else {
    steps.push({ type: 'portfolio', icon: ICONS.portfolio, title: 'Build Portfolio', details: portfolioBySkill(skill, goal).join(' • ') });
  }

  // 2) Work experience based on availability
  steps.push({ type: 'internship', icon: ICONS.internship, title: 'Internships / Freelance', details: workByAvailability(availability, interest).join(' • ') });

  // 3) Higher studies aligned to goal and study preference
  steps.push({ type: 'higher', icon: ICONS.higher, title: 'Higher Studies', details: higherStudies(goal, interest, studyPref).join(' • ') });

  // 4) Goal-aligned job outcomes
  const outcomes = {
    Designer: ['UI/UX Designer', 'Graphic Designer', 'Product Designer'],
    Journalist: ['Reporter', 'Content Producer', 'Editor'],
    Teacher: ['School Teacher', 'EdTech Instructor', 'Teaching Assistant'],
    Researcher: ['Research Assistant', 'Data Analyst', 'Policy Researcher'],
    Writer: ['Copywriter', 'Author', 'Content Strategist'],
    'Social Worker': ['NGO Program Officer', 'Community Manager', 'CSR Associate'],
    Undecided: ['Explore roles via internships and electives'],
  };
  steps.push({ type: 'internship', icon: ICONS.internship, title: 'Career Outcomes', details: (outcomes[goal] || outcomes.Undecided).join(' • ') });

  return steps;
}

export default { buildRoadmap };

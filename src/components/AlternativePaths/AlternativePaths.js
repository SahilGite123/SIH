import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import degreesData from '../../data/degrees.json';
import collegesData from '../../data/colleges.json';

function AlternativePaths() {
  const { t } = useTranslation();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [alternativePaths, setAlternativePaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAspiration, setSelectedAspiration] = useState('');
  const [isCollegesOpen, setIsCollegesOpen] = useState(false);
  const [collegesForModal, setCollegesForModal] = useState([]);

  const commonAspirations = [
    'Doctor', 'Engineer', 'Teacher', 'Lawyer', 'Business Owner', 
    'Artist', 'Scientist', 'Government Officer', 'Journalist', 'Architect'
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  // Preselect aspiration from query param, e.g., /alternative-paths?aspiration=Doctor
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const a = params.get('aspiration');
    if (a && commonAspirations.includes(a)) {
      setSelectedAspiration(a);
      const paths = generateAlternativePaths(a);
      setAlternativePaths(paths);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      try {
        // Fetch user profile
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data());
        }

        // Fetch quiz results
        const quizDocRef = doc(db, "quizResults", auth.currentUser.uid);
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          setQuizResults(quizDocSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const isJKCollege = (c) => {
    const addr = String(c?.location?.address || '').toLowerCase();
    const markers = ['jammu', 'srinagar', 'kashmir', 'baramulla', 'anantnag', 'kathua', 'rajouri', 'poonch', 'leh', 'ladakh', 'udhampur', 'j&k', 'jammu and kashmir'];
    return markers.some((m) => addr.includes(m));
  };

  const openCollegesModal = (colleges = []) => {
    // Reverted: prefer the provided nearbyColleges for the path; if missing, show all.
    const list = Array.isArray(colleges) && colleges.length ? colleges : collegesData;
    const sorted = [...list].sort((a, b) => Number(isJKCollege(b)) - Number(isJKCollege(a)));
    setCollegesForModal(sorted);
    setIsCollegesOpen(true);
  };

  const closeCollegesModal = () => {
    setIsCollegesOpen(false);
    setCollegesForModal([]);
  };

  const generateAlternativePaths = (aspiration) => {
    // helper to find colleges by keyword
    const findColleges = (kw) => collegesData.filter(c =>
      (c.courses || []).some(course => course.toLowerCase().includes(String(kw).toLowerCase()))
    );

    // Define alternative paths based on common aspirations
    const pathMappings = {
      'Doctor': [
        {
          title: 'BDS (Bachelor of Dental Surgery)',
          description: 'Dental medicine and surgery.',
          requirements: 'NEET (UG) counselling; 5-year program with internship',
          pros: ['Clinical practice', 'Private clinic potential', 'Specializations possible'],
          cons: ['High competition', 'Clinic setup cost'],
          nearbyColleges: findColleges('BDS')
        },
        {
          title: 'BAMS (Ayurveda)',
          description: 'Ayurvedic medicine and surgery.',
          requirements: 'AYUSH counselling (NEET score)',
          pros: ['Traditional medicine scope', 'Clinic/practice options'],
          cons: ['Regional acceptance varies', 'Long learning curve'],
          nearbyColleges: findColleges('BAMS')
        },
        {
          title: 'BHMS (Homeopathy)',
          description: 'Homeopathic medical science.',
          requirements: 'AYUSH counselling (NEET score often needed)',
          pros: ['Lower cutoff than MBBS in many states', 'Clinic/practice options'],
          cons: ['Debate on efficacy', 'Limited govt roles'],
          nearbyColleges: findColleges('BHMS')
        },
        {
          title: 'BVSc & AH (Veterinary Science)',
          description: 'Animal healthcare and surgery.',
          requirements: 'NEET/State veterinary exams; 5-year program',
          pros: ['Govt jobs', 'Growing pet care market'],
          cons: ['Rural postings common', 'Physical work'],
          nearbyColleges: findColleges('Veterinary')
        },
        {
          title: 'BPT (Physiotherapy)',
          description: 'Physical rehabilitation and therapy.',
          requirements: 'Institute exams or merit (some states use NEET score)',
          pros: ['High demand', 'Clinic/private practice possible'],
          cons: ['Physically demanding', 'Varies by location'],
          nearbyColleges: findColleges('Physiotherapy')
        },
        {
          title: 'B.Sc Nursing',
          description: 'Professional nursing practice.',
          requirements: 'Institute/state nursing exams; NEET not always required',
          pros: ['High placement in hospitals', 'Abroad opportunities'],
          cons: ['Shift work', 'Demanding schedules'],
          nearbyColleges: findColleges('Nursing')
        },
        {
          title: 'B.Pharm (Pharmacy)',
          description: 'Pharmaceutical sciences and drug dispensing.',
          requirements: '12th PCB/PCM; institute/state exams; NEET typically not required',
          pros: ['Stable career', 'Can open pharmacy'],
          cons: ['Regulatory compliance', 'Retail competition'],
          nearbyColleges: findColleges('Pharm')
        },
        {
          title: 'Allied Health Sciences (B.Sc Paramedical)',
          description: 'Allied specializations like OT, Lab Tech, Radiology, Anesthesia.',
          requirements: 'Varies by institute; NEET/State/Institute exams',
          pros: ['Team-based roles', 'Consistent demand'],
          cons: ['Hospital shifts', 'Role-specific growth'],
          nearbyColleges: findColleges('Paramedical')
        },
        {
          title: 'B.Optom (Optometry)',
          description: 'Eye care, optometric diagnosis, and optical dispensing.',
          requirements: 'Institute/university exams; NEET not typically needed',
          pros: ['Clinical practice', 'Retail/clinic roles'],
          cons: ['Niche specialization'],
          nearbyColleges: findColleges('Optometry')
        },
        {
          title: 'Public Health (BPH/B.Sc)',
          description: 'Population health, policy, and hospital program management.',
          requirements: 'Institute/university exams; NEET not required typically',
          pros: ['NGO/government opportunities', 'Research scope'],
          cons: ['Fewer clinical roles', 'Policy-focused'],
          nearbyColleges: findColleges('Public Health')
        },
      ],
      'Teacher': [
        { title: 'B.Ed (after BA/BSc)', description: 'Gateway to school teaching.', requirements: 'UG + B.Ed entrance/merit', pros: ['Stable job', 'Govt opportunities'], cons: ['Structured progression'], nearbyColleges: findColleges('B.Ed') },
        { title: 'Integrated BA+B.Ed / BSc+B.Ed (4-year)', description: 'Faster route to become teacher.', requirements: 'After Class 12; CUCET/state tests', pros: ['Saves time', 'Early internships'], cons: ['Specialization fixed early'], nearbyColleges: findColleges('B.Ed') },
        { title: 'M.Ed / Education MA', description: 'Advanced pedagogy, leadership in education.', requirements: 'B.Ed + entrance', pros: ['Academic admin roles'], cons: ['Additional study time'], nearbyColleges: findColleges('M.Ed') },
        { title: 'CTET/State TET', description: 'Eligibility exams for govt schools.', requirements: 'B.Ed + CTET/State TET', pros: ['Public sector roles'], cons: ['Exam preparation needed'], nearbyColleges: findColleges('Education') },
        { title: 'EdTech Instructor', description: 'Teach online via platforms.', requirements: 'Subject mastery + digital tools', pros: ['Remote flexibility'], cons: ['Platform algorithms'], nearbyColleges: findColleges('Education') },
        { title: 'Special Education', description: 'Support learners with special needs.', requirements: 'B.Ed Special Education', pros: ['High impact'], cons: ['Specialized training'], nearbyColleges: findColleges('Special Education') },
      ],
      'Business Owner': [
        { title: 'BBA / BBM', description: 'Foundations in business & management.', requirements: 'CUET/University tests', pros: ['Entrepreneurial base'], cons: ['Experience matters most'], nearbyColleges: findColleges('BBA') },
        { title: 'B.Com / B.Com (H)', description: 'Accounting, finance, taxation.', requirements: 'CUET/University tests', pros: ['Finance literacy'], cons: ['Needs practical exposure'], nearbyColleges: findColleges('B.Com') },
        { title: 'MBA (after UG)', description: 'Strategy, marketing, operations.', requirements: 'CAT/XAT/GMAT', pros: ['Network and skills'], cons: ['Costly'], nearbyColleges: findColleges('MBA') },
        { title: 'Family Business Programs', description: 'Succession & venture scaling.', requirements: 'Institute programs', pros: ['Tailored to owners'], cons: ['Limited seats'], nearbyColleges: findColleges('Family Business') },
        { title: 'Startup Incubation', description: 'Incubators, accelerators, seed funds.', requirements: 'Pitch + selection', pros: ['Mentorship, grants'], cons: ['Competitive'], nearbyColleges: findColleges('Entrepreneurship') },
        { title: 'Digital Commerce', description: 'E-commerce, D2C, social selling.', requirements: 'BBA/B.Com or any + skills', pros: ['Low entry barrier'], cons: ['Crowded market'], nearbyColleges: findColleges('Commerce') },
      ],
      'Artist': [
        { title: 'BFA (Fine Arts)', description: 'Visual arts, painting, sculpture.', requirements: 'Institute portfolio/aptitude', pros: ['Creative career'], cons: ['Portfolio-driven income'], nearbyColleges: findColleges('BFA') },
        { title: 'B.Des (Communication / Industrial)', description: 'Design thinking for products & visuals.', requirements: 'NID/NIFT/UCEED', pros: ['Strong industry demand'], cons: ['Competitive portfolios'], nearbyColleges: findColleges('Design') },
        { title: 'Animation & VFX', description: '2D/3D animation, motion graphics.', requirements: 'Institute tests/portfolio', pros: ['Media/gaming demand'], cons: ['Software intensive'], nearbyColleges: findColleges('Animation') },
        { title: 'Photography / Filmmaking', description: 'Commercial shoots, direction, editing.', requirements: 'Diploma/Degree + portfolio', pros: ['Freelance potential'], cons: ['Client acquisition needed'], nearbyColleges: findColleges('Film') },
        { title: 'Music Production', description: 'Composition, sound engineering.', requirements: 'Diploma/Degree + portfolio', pros: ['Growing creator economy'], cons: ['Gig income variability'], nearbyColleges: findColleges('Music') },
        { title: 'UI/UX Design', description: 'Product design for apps and web.', requirements: 'B.Des/Diploma + case studies', pros: ['Tech demand'], cons: ['Rapid iteration'], nearbyColleges: findColleges('Design') },
      ],
      'Scientist': [
        { title: 'B.Sc → M.Sc → PhD (Physics/Chem/Maths)', description: 'Academic and research careers.', requirements: 'CUET + JAM/NET/GATE for higher study', pros: ['Research depth'], cons: ['Long academic path'], nearbyColleges: findColleges('B.Sc') },
        { title: 'Integrated M.Sc', description: '5-year integrated research track.', requirements: 'IISER/NISER/University tests', pros: ['Early research exposure'], cons: ['Selective programs'], nearbyColleges: findColleges('M.Sc') },
        { title: 'Biotech/Biomedical Research', description: 'Wet lab and clinical research.', requirements: 'B.Tech/B.Sc + GATE/NET', pros: ['Healthcare impact'], cons: ['Grants dependency'], nearbyColleges: findColleges('Biotech') },
        { title: 'Data Science', description: 'ML/AI research & applied analytics.', requirements: 'B.Tech/B.Sc + PG/Bootcamps', pros: ['Cross-industry demand'], cons: ['Fast-evolving tools'], nearbyColleges: findColleges('Data Science') },
        { title: 'Material Science/Nano', description: 'Advanced materials research.', requirements: 'B.Tech/B.Sc + PG', pros: ['Cutting-edge labs'], cons: ['Niche roles'], nearbyColleges: findColleges('Material') },
        { title: 'Space/Atmospheric Science', description: 'Earth systems and space missions.', requirements: 'B.Tech/B.Sc + PG, ISRO exams', pros: ['Prestige missions'], cons: ['Competitive'], nearbyColleges: findColleges('Space') },
      ],
      'Government Officer': [
        { title: 'UPSC Civil Services', description: 'IAS/IPS/IFS/IRS roles.', requirements: 'Any UG + UPSC CSE', pros: ['Highest prestige'], cons: ['Extremely competitive'], nearbyColleges: findColleges('Arts') },
        { title: 'State Civil Services', description: 'State administration cadres.', requirements: 'Any UG + State PSC', pros: ['Stability'], cons: ['State cadre limits'], nearbyColleges: findColleges('Arts') },
        { title: 'SSC / Banking (IBPS/SBI/RBI)', description: 'Clerical and officer cadres.', requirements: 'Any UG + competitive exams', pros: ['Abundant vacancies'], cons: ['Routine roles'], nearbyColleges: findColleges('Commerce') },
        { title: 'Defense Services (NDA/CDS/AFCAT)', description: 'Indian Army/Navy/Air Force.', requirements: 'NDA/CDS entries', pros: ['Respect & adventure'], cons: ['Physical rigor'], nearbyColleges: findColleges('Defense') },
        { title: 'Railways/PSUs/Govt Engineers', description: 'Technical govt jobs.', requirements: 'GATE/PSU tests', pros: ['Stable technical roles'], cons: ['Transfers possible'], nearbyColleges: findColleges('Engineering') },
        { title: 'Judiciary/Prosecution', description: 'Legal govt roles.', requirements: 'LL.B + state exams', pros: ['Prestige'], cons: ['High competition'], nearbyColleges: findColleges('Law') },
      ],
      'Journalist': [
        { title: 'BA Journalism/Mass Communication', description: 'Reporting, anchoring, production.', requirements: 'CUET/Institute tests', pros: ['Media visibility'], cons: ['Deadline pressure'], nearbyColleges: findColleges('Journalism') },
        { title: 'Digital Media (Content/Video)', description: 'Content strategy, video production.', requirements: 'BA/Certifications + portfolio', pros: ['Creator economy'], cons: ['Algorithm dependence'], nearbyColleges: findColleges('Media') },
        { title: 'Photojournalism', description: 'Visual reporting & documentaries.', requirements: 'Diploma + portfolio', pros: ['Strong storytelling'], cons: ['Field risk'], nearbyColleges: findColleges('Photography') },
        { title: 'Broadcast Journalism', description: 'TV/radio news & production.', requirements: 'BA Journalism + internships', pros: ['On-air roles'], cons: ['Shift timings'], nearbyColleges: findColleges('Journalism') },
        { title: 'Investigative/Policy Journalism', description: 'Deep dive stories; policy impact.', requirements: 'BA/MA + portfolio', pros: ['High impact'], cons: ['Legal risks'], nearbyColleges: findColleges('Journalism') },
        { title: 'Editing/Copy Desk', description: 'Sub-editing, fact-checking, standards.', requirements: 'BA English/Journalism', pros: ['Core newsroom role'], cons: ['Back-office visibility'], nearbyColleges: findColleges('English') },
      ],
      'Architect': [
        { title: 'B.Arch', description: 'Architecture & urban design.', requirements: 'NATA/JEE Paper 2', pros: ['Design + engineering'], cons: ['Studio-intensive'], nearbyColleges: findColleges('B.Arch') },
        { title: 'B.Plan (Urban/Regional)', description: 'Urban planning & policy.', requirements: 'NATA/JEE Paper 2/University tests', pros: ['Govt/consulting demand'], cons: ['Policy-heavy'], nearbyColleges: findColleges('Planning') },
        { title: 'Interior Design', description: 'Residential & commercial interiors.', requirements: 'Diploma/Degree + portfolio', pros: ['High freelance demand'], cons: ['Client management'], nearbyColleges: findColleges('Interior') },
        { title: 'Landscape Architecture', description: 'Parks, campuses, ecology.', requirements: 'B.Arch + PG specialization', pros: ['Sustainability focus'], cons: ['PG needed'], nearbyColleges: findColleges('Landscape') },
        { title: 'Heritage Conservation', description: 'Conserve historic sites.', requirements: 'B.Arch/History + PG', pros: ['Cultural impact'], cons: ['Niche roles'], nearbyColleges: findColleges('Conservation') },
        { title: 'Construction Management', description: 'Project planning & execution.', requirements: 'B.Arch/B.Tech + PG', pros: ['Cross-disciplinary'], cons: ['Site travel'], nearbyColleges: findColleges('Construction') },
      ],
      'Lawyer': [
        {
          title: 'BA LL.B (5-year Integrated)',
          description: 'Integrated undergraduate + law degree for early legal specialization.',
          requirements: 'CLAT/AILET/State law entrances; 5-year program',
          pros: ['Saves a year vs BA then LLB', 'Campus recruitment from NLUs'],
          cons: ['Highly competitive', 'Intense coursework'],
          nearbyColleges: findColleges('LLB')
        },
        {
          title: 'BBA LL.B (5-year Integrated)',
          description: 'Business + law foundation suitable for corporate law.',
          requirements: 'CLAT/Institute law tests; 5-year program',
          pros: ['Corporate readiness', 'Internships with firms'],
          cons: ['Heavier commercial focus may not suit litigation'],
          nearbyColleges: findColleges('BBA LL.B')
        },
        {
          title: 'B.Com LL.B (5-year Integrated)',
          description: 'Commerce + law for tax law, compliance, and audit support.',
          requirements: 'CLAT/State law tests; 5-year program',
          pros: ['Tax/compliance advantage', 'Industry demand'],
          cons: ['Niche early on'],
          nearbyColleges: findColleges('B.Com LL.B')
        },
        {
          title: 'LL.B (3-year after Graduation)',
          description: 'Law degree after any bachelor’s; for late switchers to law.',
          requirements: 'Any UG + Law entrance/university test; 3 years',
          pros: ['Pathway for graduates', 'Mature cohort'],
          cons: ['Longer overall duration'],
          nearbyColleges: findColleges('LL.B')
        },
        {
          title: 'Corporate Lawyer',
          description: 'Advises companies on contracts, M&A, compliance.',
          requirements: 'Integrated LL.B or LL.B + internships; company/firm placements',
          pros: ['High remuneration', 'Prestige roles'],
          cons: ['Long hours, high pressure'],
          nearbyColleges: findColleges('Law')
        },
        {
          title: 'Litigation (Civil/Criminal)',
          description: 'Court practice; client representation and advocacy.',
          requirements: 'LL.B + Bar Council enrollment; mentorship under senior advocates',
          pros: ['Courtroom experience', 'Independence'],
          cons: ['Income can be variable early on'],
          nearbyColleges: findColleges('Law')
        },
        {
          title: 'Intellectual Property (IP) Law',
          description: 'Patents, trademarks, copyrights, technology licensing.',
          requirements: 'LL.B; IP electives/PG diplomas; science/tech background helpful',
          pros: ['Tech industry demand', 'Specialist niche'],
          cons: ['Additional certifications helpful'],
          nearbyColleges: findColleges('IP Law')
        },
        {
          title: 'Cyber Law / Data Protection',
          description: 'Compliance for IT Act, privacy, GDPR-like frameworks.',
          requirements: 'LL.B; cyber law certifications',
          pros: ['Rapidly growing field', 'Cross-border work'],
          cons: ['Constantly evolving regulations'],
          nearbyColleges: findColleges('Cyber Law')
        },
        {
          title: 'Taxation Law',
          description: 'Direct/indirect tax advisory, GST compliance, litigation.',
          requirements: 'LL.B; tax electives; synergy with CA/CMA is a plus',
          pros: ['Consistent corporate/firm demand'],
          cons: ['Frequent policy changes'],
          nearbyColleges: findColleges('Tax Law')
        },
        {
          title: 'Judiciary Services (Judge/ Magistrate)',
          description: 'State judicial services via PCS(J)/Civil Judge examinations.',
          requirements: 'LL.B + state judiciary exam; strong legal GK',
          pros: ['High prestige', 'Stable government role'],
          cons: ['Highly competitive exams'],
          nearbyColleges: findColleges('Law')
        },
        {
          title: 'Legal Journalism / Policy',
          description: 'Write and analyze legal developments; policy think tanks.',
          requirements: 'LL.B + writing portfolio; LLM/Policy degrees help',
          pros: ['Impact via discourse', 'Public interest roles'],
          cons: ['Fewer positions compared to practice'],
          nearbyColleges: findColleges('Law')
        },
      ],
      'Engineer': [
        {
          title: 'B.Tech (Computer Science / AI & ML)',
          description: 'Software engineering, data platforms, AI/ML systems.',
          requirements: 'Class 11–12 PCM; JEE Main/Advanced or CUET/Institute exams',
          pros: ['Very high demand', 'Remote/global roles', 'Startup opportunities'],
          cons: ['Competitive hiring', 'Constant upskilling required'],
          nearbyColleges: findColleges('Computer Science')
        },
        {
          title: 'B.Tech (Mechanical Engineering)',
          description: 'Design, manufacturing, automotive, energy systems.',
          requirements: 'PCM; JEE/CUET/State CET',
          pros: ['Core industry roles', 'Public sector options'],
          cons: ['Cyclical hiring in some sectors'],
          nearbyColleges: findColleges('Mechanical')
        },
        {
          title: 'B.Tech (Civil Engineering)',
          description: 'Infrastructure, construction, structural design.',
          requirements: 'PCM; JEE/CUET/State CET',
          pros: ['Government contracts', 'Urban development demand'],
          cons: ['On-site field work common'],
          nearbyColleges: findColleges('Civil')
        },
        {
          title: 'B.Tech (Electrical / Electronics & Communication)',
          description: 'Power systems, embedded, telecom, VLSI.',
          requirements: 'PCM; JEE/CUET/State CET',
          pros: ['Broad opportunities (hardware + software)', 'Core + IT crossover'],
          cons: ['Specialized roles may need PG'],
          nearbyColleges: findColleges('Electronics')
        },
        {
          title: 'B.Tech (Chemical Engineering)',
          description: 'Process engineering, energy, materials, pharma.',
          requirements: 'PCM; JEE/CUET/State CET',
          pros: ['Process industry demand', 'Research scope'],
          cons: ['Plant shift work possible'],
          nearbyColleges: findColleges('Chemical')
        },
        {
          title: 'B.Tech (Aerospace / Aeronautical)',
          description: 'Aircraft, propulsion, avionics, space systems.',
          requirements: 'PCM; JEE/Institute exams',
          pros: ['Cutting-edge tech', 'Govt labs/ISRO/DRDO potential'],
          cons: ['Competitive, limited seats'],
          nearbyColleges: findColleges('Aerospace')
        },
        {
          title: 'B.Tech (Biotechnology / Biomedical)',
          description: 'Biotech, medical devices, bioinformatics.',
          requirements: 'PCM/PCB; JEE/CUET/Institute exams',
          pros: ['Healthcare + tech intersection', 'R&D scope'],
          cons: ['PG often preferred for R&D'],
          nearbyColleges: findColleges('Biotech')
        },
        {
          title: 'B.Tech (Environmental Engineering)',
          description: 'Sustainability, water treatment, EHS, climate tech.',
          requirements: 'PCM; JEE/CUET',
          pros: ['Growing ESG focus', 'Govt/consulting roles'],
          cons: ['Project-based workloads'],
          nearbyColleges: findColleges('Environmental')
        },
        {
          title: 'B.Tech (Robotics / Mechatronics)',
          description: 'Automation, control systems, robotics integration.',
          requirements: 'PCM; JEE/Institute exams',
          pros: ['Industry 4.0 demand', 'Cross-disciplinary'],
          cons: ['Specialized labs needed'],
          nearbyColleges: findColleges('Mechatronics')
        },
        {
          title: 'B.Sc (Physics / Mathematics) → Tech Careers',
          description: 'Strong fundamentals for analytics, research, software.',
          requirements: 'PCM; CUET/University exams',
          pros: ['Research/academia path', 'Quant/analytics roles'],
          cons: ['Often requires PG for specialization'],
          nearbyColleges: findColleges('B.Sc')
        },
        {
          title: 'BCA (Computer Applications)',
          description: 'Software development and IT solutions (application-focused).',
          requirements: 'Class 12 (any); University/Institute exams',
          pros: ['High demand', 'Multiple entry roles'],
          cons: ['Some roles prefer B.Tech/CS'],
          nearbyColleges: findColleges('BCA')
        },
        {
          title: 'Diploma in Engineering (Polytechnic)',
          description: '3-year practical program; lateral entry to B.Tech possible.',
          requirements: 'After Class 10/12; State polytechnic entrance',
          pros: ['Faster job entry', 'Hands-on training'],
          cons: ['Lower starting salary vs B.Tech'],
          nearbyColleges: collegesData.filter(c => (c.courses||[]).some(course => course.toLowerCase().includes('diploma')))
        },
      ],
      'Teacher': [
        {
          title: 'Corporate Trainer',
          description: 'Train employees in companies',
          requirements: 'Any graduation + Training certification',
          pros: ['Higher salary than school teacher', 'Corporate environment', 'Travel opportunities'],
          cons: ['Job instability', 'Pressure to deliver results'],
          nearbyColleges: collegesData.filter(c => c.courses.some(course => course.includes('B.A')))
        },
        {
          title: 'Content Creator/YouTuber',
          description: 'Create educational content online',
          requirements: 'Subject expertise + Digital skills',
          pros: ['Work from home', 'Unlimited earning potential', 'Creative freedom'],
          cons: ['Uncertain income', 'Need marketing skills', 'Algorithm dependency'],
          nearbyColleges: collegesData.filter(c => c.courses.some(course => course.includes('B.A')))
        }
      ]
    };

    return pathMappings[aspiration] || [
      {
        title: 'Skill-based Career',
        description: 'Focus on developing specific skills rather than traditional degrees',
        requirements: 'Professional certifications and practical experience',
        pros: ['Faster entry to job market', 'Industry-relevant skills', 'Lower education cost'],
        cons: ['May lack theoretical foundation', 'Need continuous upskilling'],
        nearbyColleges: collegesData.slice(0, 3)
      }
    ];
  };

  const handleAspirationSelect = (aspiration) => {
    setSelectedAspiration(aspiration);
    const paths = generateAlternativePaths(aspiration);
    setAlternativePaths(paths);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading alternative paths...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Alternative Career Paths
        </h2>
        <p className="text-center text-gray-600">
          Explore alternative routes to achieve your career goals
        </p>

        {/* Aspiration Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">What's your dream career?</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {commonAspirations.map((aspiration) => (
              <button
                key={aspiration}
                onClick={() => handleAspirationSelect(aspiration)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedAspiration === aspiration
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {aspiration}
              </button>
            ))}
          </div>
        </div>

        {/* Alternative Paths Display */}
        {alternativePaths.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">
              Alternative paths to become a {selectedAspiration}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternativePaths.map((path, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h4 className="text-xl font-bold text-indigo-600 mb-3">{path.title}</h4>
                  <p className="text-gray-700 mb-4">{path.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Requirements:</h5>
                    <p className="text-sm text-gray-600">{path.requirements}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold text-green-600 text-sm mb-1">Pros:</h5>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {path.pros.map((pro, proIndex) => (
                          <li key={proIndex}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-red-600 text-sm mb-1">Cons:</h5>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {path.cons.map((con, conIndex) => (
                          <li key={conIndex}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Nearby Colleges:</h5>
                    <div className="space-y-1">
                      {path.nearbyColleges.slice(0, 2).map((college, collegeIndex) => (
                        <div key={collegeIndex} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <div className="font-medium">{college.name}</div>
                          <div>{college.location.address}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => openCollegesModal(path.nearbyColleges)}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      View Colleges
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz-based Recommendations */}
        {quizResults && (
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Based on Your Quiz Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Object.entries(quizResults.scores).map(([stream, score]) => (
                <div key={stream} className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{score}</div>
                  <div className="text-sm text-gray-600">{stream}</div>
                </div>
              ))}
            </div>
            <p className="text-gray-700">
              Your highest score is in <strong>{Object.keys(quizResults.scores).reduce((a, b) => 
                quizResults.scores[a] > quizResults.scores[b] ? a : b
              )}</strong>. Consider exploring careers in this field, or use the alternative paths above 
              to find different routes to your dream career.
            </p>
          </div>
        )}
      </div>
      {/* Colleges Modal */}
      {isCollegesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeCollegesModal} />
          <div className="relative z-10 w-full max-w-5xl transform rounded-lg bg-white p-6 shadow-xl transition-all duration-200 ease-out scale-95 opacity-0 animate-[fadeIn_200ms_ease-out_forwards]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Nearby Colleges</h3>
              <button
                type="button"
                onClick={closeCollegesModal}
                className="rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-auto pr-1">
              {collegesForModal.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{c.name}</h4>
                  <div className="text-sm text-gray-800 space-y-1">
                    <p><span className="font-semibold">Location:</span> <span className="text-gray-700">{c.location?.address}</span></p>
                    <p><span className="font-semibold">Courses:</span> <span className="text-gray-700">{Array.isArray(c.courses) ? c.courses.join(', ') : ''}</span></p>
                    <p><span className="font-semibold">Eligibility:</span> <span className="text-gray-700">{c.eligibility}</span></p>
                    <p className="mb-2"><span className="font-semibold">Facilities:</span> <span className="text-gray-700">{Array.isArray(c.facilities) ? c.facilities.join(', ') : ''}</span></p>
                    {c.location?.latitude && c.location?.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${c.location.latitude},${c.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline hover:text-indigo-700"
                      >
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {collegesForModal.length === 0 && (
                <div className="text-center text-gray-600">No colleges data available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlternativePaths;

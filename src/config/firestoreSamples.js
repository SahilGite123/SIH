// Sample Firestore data structure and example documents
// Collections:
// - users/{uid}
// - quizzes/{quizId}
// - quizResults/{uid}
// - careers/{careerId}
// - colleges/{collegeId}
// - resources/{resourceId}
// - notificationsTokens/{uid}

export const sampleUserDoc = {
  uid: 'USER_UID',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'student', // or 'parent' or 'admin'
  age: 16,
  gender: 'female',
  class: '12',
  location: 'Pune, MH',
  preferences: 'Science, Engineering',
  createdAt: new Date().toISOString(),
};

export const sampleQuizDoc = {
  id: 'aptitude_v1',
  title: 'Aptitude & Interest Quiz v1',
  version: 1,
  questions: [
    {
      id: 1,
      text: 'I enjoy solving math and science problems.',
      category: 'science', // science | arts | commerce | general
      options: [
        { text: 'Strongly Disagree', value: 1 },
        { text: 'Disagree', value: 2 },
        { text: 'Neutral', value: 3 },
        { text: 'Agree', value: 4 },
        { text: 'Strongly Agree', value: 5 },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
};

export const sampleQuizResultDoc = {
  userId: 'USER_UID',
  quizId: 'aptitude_v1',
  scores: {
    Science: 42,
    Arts: 28,
    Commerce: 31,
  },
  answers: { '1': 4, '2': 3 },
  completedAt: new Date().toISOString(),
  totalQuestions: 30,
  answeredQuestions: 28,
};

export const sampleCareerDoc = {
  id: 'software_engineer',
  name: 'Software Engineer',
  category: 'IT & Computer Science',
  streams: ['Science'],
  required_skills: ['Programming', 'Data Structures', 'Problem Solving'],
  education_requirements: ['B.Tech CSE', 'BSc CS', 'MCA'],
  salary_range: '3 LPA - 30 LPA',
  growth_rate: 'High',
  job_security: 'High',
  micro_experiences: [
    // Store media in Firebase Storage and save signed URLs here
    { type: 'video', storagePath: 'micro/softeng-day1.mp4', caption: 'Day in the life' },
  ],
  future_scope: 'Strong demand across industries',
};

export const sampleCollegeDoc = {
  id: 'gov_college_001',
  name: 'Government College of Engineering, Pune',
  type: 'government',
  location: {
    address: 'Pune, Maharashtra',
    latitude: 18.5293,
    longitude: 73.8567,
  },
  courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech MECH'],
  eligibility: 'JEE Mains / MHT-CET',
  facilities: ['Hostel', 'Library', 'Labs'],
};

export const sampleResourceDoc = {
  id: 'resource_001',
  type: 'scholarship', // ebook | guide | scholarship
  title: 'State Scholarship for 12th Pass Students',
  description: 'Financial aid for students pursuing undergraduate degrees.',
  link: 'https://example.gov/scholarships/123',
  tags: ['scholarship', 'undergraduate', 'government'],
  createdAt: new Date().toISOString(),
};

export const sampleNotificationTokenDoc = {
  uid: 'USER_UID',
  fcmToken: 'FCM_TOKEN_STRING',
  platform: 'web',
  createdAt: new Date().toISOString(),
};

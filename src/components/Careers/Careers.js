import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { expandedCareers } from '../../data/expandedCareers';
import degreesData from '../../data/degrees.json';
import laborTrends from '../../data/laborTrendsByState.json';

function Careers() {
  const { t } = useTranslation();
  const [selectedStream, setSelectedStream] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openCareerIds, setOpenCareerIds] = useState(new Set());
  const [selectedState, setSelectedState] = useState(laborTrends[0]?.state || '');

  const toggleAccordion = (careerId) => {
    const newOpenIds = new Set(openCareerIds);
    if (newOpenIds.has(careerId)) {
      newOpenIds.delete(careerId);
    } else {
      newOpenIds.add(careerId);
    }
    setOpenCareerIds(newOpenIds);
  };

  const getAllCareers = () => {
    return [
      ...expandedCareers.science,
      ...expandedCareers.arts,
      ...expandedCareers.commerce,
      ...expandedCareers.emerging
    ];
  };

  const getFilteredCareers = () => {
    let careers = getAllCareers();
    
    if (selectedStream !== 'all') {
      careers = expandedCareers[selectedStream] || [];
    }
    
    if (searchTerm) {
      careers = careers.filter(career => 
        career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return careers;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Career Opportunities</h2>
          <p className="text-xl text-gray-600">Explore diverse career paths and find your perfect match</p>
        </div>

        {/* Trending by State */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="text-xl font-semibold">Trending job roles by state</h3>
            <select
              className="px-3 py-2 rounded border"
              value={selectedState}
              onChange={(e)=>setSelectedState(e.target.value)}
            >
              {laborTrends.map((s) => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(laborTrends.find(s => s.state === selectedState)?.trendingRoles || []).map((r, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-gray-50">
                <div className="text-sm text-gray-500">Growth Index: {r.growthIndex}</div>
                <div className="text-lg font-semibold">{r.role}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Indicative trends; refine with your own data when available.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search careers, skills, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'science', 'arts', 'commerce', 'emerging'].map((stream) => (
                <button
                  key={stream}
                  onClick={() => setSelectedStream(stream)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStream === stream
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {stream.charAt(0).toUpperCase() + stream.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Career Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {getFilteredCareers().map((career) => (
            <div key={career.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{career.title}</h3>
                  <div className="text-2xl">💼</div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{career.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Salary Range</span>
                    <span className="text-sm font-bold text-green-600">{career.averageSalary}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Growth Rate</span>
                    <span className="text-sm font-bold text-blue-600">{career.growthRate}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Job Security</span>
                    <span className={`text-sm font-bold ${
                      career.jobSecurity === 'Very High' ? 'text-green-600' :
                      career.jobSecurity === 'High' ? 'text-blue-600' :
                      career.jobSecurity === 'Medium-High' ? 'text-yellow-600' :
                      'text-orange-600'
                    }`}>{career.jobSecurity}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleAccordion(career.id)}
                  className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {openCareerIds.has(career.id) ? 'Show Less' : 'Learn More'}
                </button>
                
                {openCareerIds.has(career.id) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Education Requirements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {career.education.map((edu, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            {edu}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Top Companies</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.companies.slice(0, 4).map((company, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Future Scope</h4>
                      <p className="text-sm text-gray-600">{career.futureScope}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Degrees Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Degree Programs</h3>
          <div className="space-y-4">
            {degreesData.map((degree) => (
              <div key={degree.id} className="border border-gray-200 rounded-lg shadow-sm">
                <button
                  type="button"
                  className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-t-lg"
                  onClick={() => toggleAccordion(`degree-${degree.id}`)}
                >
                  <span>{degree.name} ({degree.streams.join(', ')})</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${openCareerIds.has(`degree-${degree.id}`) ? 'rotate-180' : 'rotate-0'}`}
                    fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              {openCareerIds.has(`degree-${degree.id}`) && (
                <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                  <p className="text-gray-700 mb-4">{degree.description}</p>

                  <h4 className="text-xl font-semibold mb-2">Higher Studies:</h4>
                  <ul className="list-disc list-inside mb-4">
                    {degree.higher_studies.map((study, index) => (
                      <li key={index}><strong>{study.name}:</strong> {study.description}</li>
                    ))}
                  </ul>

                  <h4 className="text-xl font-semibold mb-2">Job Roles:</h4>
                  <ul className="list-disc list-inside mb-4">
                    {degree.job_roles.map((role, index) => (
                      <li key={index}><strong>{role.name}:</strong> {role.description}</li>
                    ))}
                  </ul>

                  <h4 className="text-xl font-semibold mb-2">Relevant Exams:</h4>
                  <ul className="list-disc list-inside">
                    {degree.relevant_exams.map((exam, index) => (
                      <li key={index}>{exam}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

export default Careers;


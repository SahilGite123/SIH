import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import degreesData from '../../data/degrees.json';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StreamComparison() {
  const { t } = useTranslation();
  const [selectedStreams, setSelectedStreams] = useState(['Science', 'Commerce']);
  const [comparisonData, setComparisonData] = useState(null);

  const availableStreams = ['Science', 'Arts', 'Commerce'];

  const handleStreamChange = (index, stream) => {
    const newStreams = [...selectedStreams];
    newStreams[index] = stream;
    setSelectedStreams(newStreams);
    generateComparison(newStreams);
  };

  const generateComparison = (streams) => {
    const comparison = streams.map(stream => {
      const streamDegrees = degreesData.filter(degree => 
        degree.streams.includes(stream)
      );
      
      return {
        stream,
        totalDegrees: streamDegrees.length,
        avgJobRoles: streamDegrees.reduce((acc, degree) => acc + degree.job_roles.length, 0) / streamDegrees.length || 0,
        avgHigherStudies: streamDegrees.reduce((acc, degree) => acc + degree.higher_studies.length, 0) / streamDegrees.length || 0,
        avgExams: streamDegrees.reduce((acc, degree) => acc + degree.relevant_exams.length, 0) / streamDegrees.length || 0,
        degrees: streamDegrees
      };
    });
    
    setComparisonData(comparison);
  };

  React.useEffect(() => {
    generateComparison(selectedStreams);
  }, []);

  const chartData = comparisonData ? {
    labels: ['Total Degrees', 'Avg Job Roles', 'Avg Higher Studies', 'Avg Exams'],
    datasets: comparisonData.map((stream, index) => ({
      label: stream.stream,
      data: [
        stream.totalDegrees,
        Math.round(stream.avgJobRoles),
        Math.round(stream.avgHigherStudies),
        Math.round(stream.avgExams)
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)'
      ][index],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ][index],
      borderWidth: 1,
    }))
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="w-full bg-white p-8 rounded-lg shadow-md space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Stream Comparison Tool</h2>
        
        {/* Stream Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {selectedStreams.map((stream, index) => (
            <div key={index} className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Stream {index + 1}
              </label>
              <select
                value={stream}
                onChange={(e) => handleStreamChange(index, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableStreams.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Chart Comparison */}
        {chartData && (
          <div className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Statistical Overview</h3>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Comparison */}
        {comparisonData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {comparisonData.map((streamData, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-center mb-4 text-indigo-600">
                  {streamData.stream}
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold text-lg mb-2">Overview</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Total Degrees:</strong> {streamData.totalDegrees}</li>
                      <li><strong>Avg Job Roles per Degree:</strong> {Math.round(streamData.avgJobRoles)}</li>
                      <li><strong>Avg Higher Studies Options:</strong> {Math.round(streamData.avgHigherStudies)}</li>
                      <li><strong>Avg Relevant Exams:</strong> {Math.round(streamData.avgExams)}</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold text-lg mb-2">Available Degrees</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {streamData.degrees.map((degree, degreeIndex) => (
                        <div key={degreeIndex} className="mb-2 p-2 bg-white rounded border">
                          <h5 className="font-medium text-sm">{degree.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{degree.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold text-lg mb-2">Key Insights</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-green-600 text-sm">Advantages:</h5>
                        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                          {streamData.stream === 'Science' && (
                            <>
                              <li>High-paying career opportunities in tech, healthcare, and research</li>
                              <li>Strong job security and growth potential</li>
                              <li>Opportunities for innovation and making societal impact</li>
                              <li>Government job opportunities through competitive exams</li>
                            </>
                          )}
                          {streamData.stream === 'Commerce' && (
                            <>
                              <li>Diverse career paths in business, finance, and management</li>
                              <li>Strong entrepreneurship and business development opportunities</li>
                              <li>Good earning potential in corporate sector</li>
                              <li>Practical skills applicable across industries</li>
                            </>
                          )}
                          {streamData.stream === 'Arts' && (
                            <>
                              <li>Creative expression and artistic development opportunities</li>
                              <li>Flexible career options in media, education, and social work</li>
                              <li>Strong potential for social impact and community service</li>
                              <li>Develops critical thinking and communication skills</li>
                            </>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-600 text-sm">Considerations:</h5>
                        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                          {streamData.stream === 'Science' && (
                            <>
                              <li>Highly competitive entrance exams and admission process</li>
                              <li>Requires continuous learning and skill updates</li>
                              <li>Longer study duration for specialized fields</li>
                              <li>High academic pressure and workload</li>
                            </>
                          )}
                          {streamData.stream === 'Commerce' && (
                            <>
                              <li>Market-dependent opportunities and economic fluctuations</li>
                              <li>High competition in popular fields like CA, MBA</li>
                              <li>Requires strong business acumen and networking</li>
                              <li>Need to stay updated with changing business trends</li>
                            </>
                          )}
                          {streamData.stream === 'Arts' && (
                            <>
                              <li>Variable income potential in creative fields</li>
                              <li>Job market can be uncertain in some areas</li>
                              <li>May require additional skills for better opportunities</li>
                              <li>Need for strong networking and portfolio building</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamComparison;


import React from 'react';

const CapacitySummary = () => {
  const teamMetrics = {
    totalCapacity: 1126.4,
    estimatedUsage: 478.9,
    remainingCapacity: 647.5
  };

  const memberCapacity = [
    { name: "Muskan", days: 22, manHours: 176, capacity: 140.8 },
    { name: "Shantanu Burlawar", days: 22, manHours: 176, capacity: 140.8 },
    { name: "Nidhi Shende", days: 22, manHours: 176, capacity: 140.8 },
    { name: "Amisha", days: 22, manHours: 176, capacity: 140.8 },
    { name: "Shubhangi", days: 22, manHours: 176, capacity: 140.8 },
    { name: "Adarsh", days: 22, manHours: 176, capacity: 140.8 },
    { name: "Azharuddin Mulla", days: 22, manHours: 176, capacity: 140.8 }
  ];

  return (
    <div>
      <h2>Capacity Calculation Summary</h2>
      <div>
        <p><strong>Total Team Capacity (80%):</strong> {teamMetrics.totalCapacity} hrs</p>
        <p><strong>Estimated Capacity Used:</strong> {teamMetrics.estimatedUsage} hrs</p>
        <p><strong>Remaining Capacity:</strong> {teamMetrics.remainingCapacity} hrs</p>
      </div>
      <table border="1">
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Days</th>
            <th>Man Hours</th>
            <th>80% Capacity</th>
          </tr>
        </thead>
        <tbody>
          {memberCapacity.map((member, index) => (
            <tr key={index}>
              <td>{member.name}</td>
              <td>{member.days}</td>
              <td>{member.manHours}</td>
              <td>{member.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CapacitySummary;
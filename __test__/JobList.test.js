import axios from 'axios';
import { render, waitFor } from '@testing-library/react-native';
import EmployeeDashboardScreen from '../employees/EmployeeDashboardScreen';

// Mock the axios module
jest.mock('axios');

test('renders JobList inside EmployeeDashboard correctly', async () => {
  const mockResponse = {
    data: [
      {
        JobID: 1,
        EmployerID: 1,
        Title: 'Software Developer',
        Description: 'Develop and maintain software applications.',
        SkillsRequired: 'JavaScript, React Native',
        Scope: 'Full-time',
        Salary: '$100,000',
        Location: 'Singapore',
        CompanyName: 'Tech Company',
      },
      {
        JobID: 2,
        EmployerID: 2,
        Title: 'Data Scientist',
        Description: 'Analyze data to provide insights.',
        SkillsRequired: 'Python, Machine Learning',
        Scope: 'Full-time',
        Salary: '$120,000',
        Location: 'Singapore',
        CompanyName: 'Data Inc.',
      },
    ],
  };

  axios.get.mockResolvedValueOnce(mockResponse);

  const mockRoute = { params: { employeeId: 1 } };
  const mockNavigation = jest.fn();

  const { getByText } = render(
    <EmployeeDashboardScreen route={mockRoute} navigation={mockNavigation} />
  );

  // Wait for the JobList to be rendered
  await waitFor(() => {
    expect(getByText('Software Developer')).toBeTruthy();
    expect(getByText('Data Scientist')).toBeTruthy();
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EmployeeDashboardScreen from '../employees/EmployeeDashboardScreen'; 
import axios from 'axios'; // Import axios to mock it
import { API_BASE_URL } from '../config';

jest.mock('axios'); // Mock axios

describe('EmployeeDashboardScreen', () => {
  const mockNavigate = jest.fn();
  const mockRoute = { params: { employeeId: 1 } };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: [] });
  });

  it('handles search button press', async () => {
    const { getByPlaceholderText, getByText } = render(
      <EmployeeDashboardScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    const searchBar = getByPlaceholderText('Preferred job title');
    fireEvent.changeText(searchBar, 'Developer');

    const searchButton = getByText('Search');
    fireEvent.press(searchButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_BASE_URL}/suggest_jobs`, {
        user_id: 1,
        preferred_job_title: 'Developer',
      });
    });
  });

  it('handles reset button press', async () => {
    const { getByText } = render(
      <EmployeeDashboardScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    const resetButton = getByText('Reset');
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${API_BASE_URL}/suggest_jobs`, {
        user_id: 1,
        preferred_job_title: '',
      });
    });
  });

  it('navigates to job details screen when a job card is pressed', async () => {
    const jobDetails = {
      JobID: 1,
      Title: 'Software Developer',
      CompanyName: 'Tech Company',
      Salary: '$100,000',
      Location: 'Singapore',
    };

    axios.get.mockResolvedValue({ data: [jobDetails] });

    const { getByText } = render(
      <EmployeeDashboardScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    await waitFor(() => {
      const jobCard = getByText('Software Developer');
      fireEvent.press(jobCard);

      expect(mockNavigate).toHaveBeenCalledWith('EmployeeJobDetails', { jobDetails });
    });
  });
});

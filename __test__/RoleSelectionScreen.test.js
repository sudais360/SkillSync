import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

describe('RoleSelectionScreen', () => {
  it('navigates to Login screen with "employee" role', () => {
    const mockNavigate = jest.fn(); // Mock the navigation function
    const { getByText } = render(<RoleSelectionScreen navigation={{ navigate: mockNavigate }} />);

    // Find the button and simulate a press
    const employeeButton = getByText('Sign up/Login as Employee');
    fireEvent.press(employeeButton);

    // Check that navigation was called with the correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('Login', { role: 'employee' });
  });

  it('navigates to Login screen with "employer" role', () => {
    const mockNavigate = jest.fn(); // Mock the navigation function
    const { getByText } = render(<RoleSelectionScreen navigation={{ navigate: mockNavigate }} />);

    // Find the button and simulate a press
    const employerButton = getByText('Sign up/Login as Employer');
    fireEvent.press(employerButton);

    // Check that navigation was called with the correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('Login', { role: 'employer' });
  });
});

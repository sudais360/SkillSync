import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { Alert } from 'react-native';

// Mocking the fetch API
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ user_id: 1 }),
}));

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockNavigate = jest.fn();
  const mockRoute = { params: { role: 'employee' } };

  beforeEach(() => {
    mockNavigate.mockClear();
    Alert.alert.mockClear();
  });

  it('renders the login screen correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    expect(getByText('Welcome to SkillSync')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('shows an error when email or password is missing', () => {
    const { getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    fireEvent.press(getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password');
  });

  it('navigates to EmployeeStack on successful login', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ user_id: 1 }),
    });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('EmployeeStack', { employeeId: 1 });
    });
  });

  it('shows error when login credentials are incorrect', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ message: 'Invalid email or password' }),
    });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid email or password');
    });
  });

  it('navigates to Signup screen on sign-up button press', () => {
    const { getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} route={mockRoute} />
    );

    fireEvent.press(getByText('Sign Up'));

    expect(mockNavigate).toHaveBeenCalledWith('Signup', { role: 'employee' });
  });
});

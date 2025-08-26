import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders floating UI demos with navigation', () => {
  render(<App />);
  
  // Check that the main title is rendered
  const titleElement = screen.getByText(/Floating UI Demos/i);
  expect(titleElement).toBeInTheDocument();
  
  // Check that both navigation buttons are rendered
  const followerButton = screen.getByText(/Follower System Demo/i);
  const inertialButton = screen.getByText(/Inertial Floating Demo/i);
  expect(followerButton).toBeInTheDocument();
  expect(inertialButton).toBeInTheDocument();
  
  // Check that the follower demo content is shown by default
  const followerDescription = screen.getByText(/This is a demonstration of a floating follower system/i);
  expect(followerDescription).toBeInTheDocument();
});

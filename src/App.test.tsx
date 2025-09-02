import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders floating UI demos with controls', () => {
  render(<App />);
  
  // Check that the main title is rendered
  const titleElement = screen.getByText(/Floating UI Demos/i);
  expect(titleElement).toBeInTheDocument();
  
  // Check that the control buttons are rendered
  const addButton = screen.getByText(/\+ Add Target/i);
  const removeButton = screen.getByText(/- Remove Target/i);
  const inertialButton = screen.getByText(/⚡ Inertial OFF/i);
  const reshuffleButton = screen.getByText(/🔄 Reshuffle ON/i);
  
  expect(addButton).toBeInTheDocument();
  expect(removeButton).toBeInTheDocument();
  expect(inertialButton).toBeInTheDocument();
  expect(reshuffleButton).toBeInTheDocument();
  
  // Check that the follower demo content is shown
  const followerDescription = screen.getByText(/This is a demonstration of a floating follower system/i);
  expect(followerDescription).toBeInTheDocument();
});

test('reshuffling toggle works correctly', () => {
  render(<App />);
  
  // Initially reshuffling should be enabled
  const reshuffleButton = screen.getByText(/🔄 Reshuffle ON/i);
  expect(reshuffleButton).toBeInTheDocument();
  expect(reshuffleButton).toHaveClass('reshuffle-active');
  
  // Click to disable reshuffling
  fireEvent.click(reshuffleButton);
  
  // Should now show disabled state
  expect(screen.getByText(/⏸️ Reshuffle OFF/i)).toBeInTheDocument();
  expect(reshuffleButton).toHaveClass('reshuffle-inactive');
  
  // Click again to re-enable
  fireEvent.click(reshuffleButton);
  
  // Should be enabled again
  expect(screen.getByText(/🔄 Reshuffle ON/i)).toBeInTheDocument();
  expect(reshuffleButton).toHaveClass('reshuffle-active');
});

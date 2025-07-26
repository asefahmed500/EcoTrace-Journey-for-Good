import React from 'react';
import { render, screen } from '@testing-library/react';
import { Leaderboard } from '../leaderboard';
import type { LeaderboardUser } from '@/lib/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Leaderboard', () => {
  const mockLeaderboard: LeaderboardUser[] = [
    { id: '1', name: 'Alice', totalEmissions: 10.5, rank: 1, image: 'https://placehold.co/40x40' },
    { id: '2', name: 'Bob', totalEmissions: 15.2, rank: 2 },
    { id: '3', name: 'Charlie', totalEmissions: 20.0, rank: 3 },
    { id: '4', name: 'Diana', totalEmissions: 22.1, rank: 4 },
  ];

  it('renders the leaderboard title and description', () => {
    render(<Leaderboard leaderboard={mockLeaderboard} />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Top 10 users with the lowest carbon footprint. Click to view profile.')).toBeInTheDocument();
  });

  it('renders a list of users', () => {
    render(<Leaderboard leaderboard={mockLeaderboard} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();
  });

  it('displays user ranks and emissions', () => {
    render(<Leaderboard leaderboard={mockLeaderboard} />);
    expect(screen.getByText('10.50')).toBeInTheDocument(); // toFixed(2)
    expect(screen.getByText('15.20')).toBeInTheDocument();
    expect(screen.getByText('20.00')).toBeInTheDocument();
    expect(screen.getByText('22.10')).toBeInTheDocument();

    // Ranks 1, 2, 3 have trophies, Rank 4 shows the number
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders a message when the leaderboard is empty', () => {
    render(<Leaderboard leaderboard={[]} />);
    expect(screen.getByText('The leaderboard is currently empty.')).toBeInTheDocument();
    expect(screen.getByText('Log journeys to see how you rank!')).toBeInTheDocument();
  });

  it('renders user avatars and fallbacks', () => {
    render(<Leaderboard leaderboard={mockLeaderboard} />);
    
    const avatarImage = screen.getByRole('img');
    expect(avatarImage).toHaveAttribute('alt', 'Alice');
    expect(avatarImage).toHaveAttribute('src', 'https://placehold.co/40x40');

    // Check fallbacks for users without images
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('links to user profiles', () => {
    render(<Leaderboard leaderboard={mockLeaderboard} />);
    expect(screen.getByText('Alice').closest('a')).toHaveAttribute('href', '/profile/1');
    expect(screen.getByText('Bob').closest('a')).toHaveAttribute('href', '/profile/2');
    expect(screen.getByText('Charlie').closest('a')).toHaveAttribute('href', '/profile/3');
  });
});

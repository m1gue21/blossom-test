import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { CharacterListItem } from '@/components/CharacterListItem';

const mockChar = {
  id: 1,
  externalId: 1,
  name: 'Rick Sanchez',
  status: 'Alive' as const,
  species: 'Human',
  gender: 'Male' as const,
  originName: 'Earth',
  locationName: 'Earth',
  image: 'https://example.com/rick.png',
  url: '',
  isDeleted: false,
  isFavorite: false,
};

describe('CharacterListItem', () => {
  it('renders name and species', () => {
    render(
      <MockedProvider mocks={[]}>
        <CharacterListItem
          character={mockChar}
          isSelected={false}
          userId="u1"
          onSelect={vi.fn()}
        />
      </MockedProvider>
    );
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Human')).toBeInTheDocument();
  });

  it('calls onSelect when row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <MockedProvider mocks={[]}>
        <CharacterListItem
          character={mockChar}
          isSelected={false}
          userId="u1"
          onSelect={onSelect}
        />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('character-list-item'));
    expect(onSelect).toHaveBeenCalledWith(mockChar);
  });
});

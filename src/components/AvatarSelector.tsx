'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarSelectorProps {
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export default function AvatarSelector({ onSelect, selectedUrl }: AvatarSelectorProps) {
  // Define avatar variations with different seeds
  const avatarVariations = [
    { seed: 'Felix', name: 'Felix' },
    { seed: 'Aneka', name: 'Aneka' },
    { seed: 'Zoe', name: 'Zoe' },
    { seed: 'Lily', name: 'Lily' },
    { seed: 'Mia', name: 'Mia' },
    { seed: 'Liam', name: 'Liam' },
    { seed: 'Noah', name: 'Noah' },
    { seed: 'Emma', name: 'Emma' },
    { seed: 'Olivia', name: 'Olivia' },
    { seed: 'Ava', name: 'Ava' },
  ];

  const [selected, setSelected] = useState<string>(selectedUrl || '');

  const handleSelect = (seed: string) => {
    const url = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${seed}`;
    setSelected(url);
    onSelect(url);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 text-black">Choose your avatar</h3>
      <div className="grid grid-cols-5 gap-4">
        {avatarVariations.map((avatar) => {
          const url = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${avatar.seed}`;
          return (
            <div
              key={avatar.seed}
              className={`cursor-pointer p-2 rounded-lg transition-all ${
                selected === url ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(avatar.seed)}
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={url}
                  alt={`Avatar ${avatar.name}`}
                  fill
                  className="object-contain"
                />
              </div>
              {/* <p className="text-center text-sm mt-2 text-black ">{avatar.name}</p> */}
            </div>
          );
        })}
      </div>
    </div>
  );
} 
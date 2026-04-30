import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './Modal';
import type { FilterGroup, FilterItem, FiltersModalProps } from '../../types/ui';

export function FiltersModal({ isOpen, onClose, filterGroups, onSelectionChange }: FiltersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});

  // Sync selections with filterGroups whenever they change
  useEffect(() => {
    const initial: Record<string, Set<string>> = {};
    filterGroups.forEach(group => {
      initial[group.title] = new Set(group.items.filter(item => item.selected).map(item => item.id));
    });
    setSelections(initial);
  }, [filterGroups, isOpen]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredGroups = useMemo(() => {
    return filterGroups.map(group => ({
      ...group,
      items: group.items
        .filter(item => {
          const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
          const matchesLetter = !selectedLetter || (item.name?.toUpperCase().startsWith(selectedLetter) ?? false);
          return matchesSearch && matchesLetter;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    })).filter(group => group.items.length > 0);
  }, [filterGroups, searchTerm, selectedLetter]);

  const handleItemToggle = (groupTitle: string, itemId: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      const groupSelections = new Set(newSelections[groupTitle] || []);

      if (groupSelections.has(itemId)) {
        groupSelections.delete(itemId);
      } else {
        groupSelections.add(itemId);
      }

      newSelections[groupTitle] = groupSelections;
      return newSelections;
    });
  };

  const handleApply = () => {
    Object.entries(selections).forEach(([groupTitle, selectedIds]) => {
      onSelectionChange(groupTitle, Array.from(selectedIds));
    });
    onClose();
  };

  const handleClearGroup = (groupTitle: string) => {
    setSelections(prev => ({
      ...prev,
      [groupTitle]: new Set()
    }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedLetter(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All designation" size="xl">
      <div className="p-6">
        <div className="flex">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search Designation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600 placeholder-gray-400"
            />
            {(searchTerm || selectedLetter) && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-[25px] transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Alphabet Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1">
              {alphabet.map((letter) => {
                const hasItems = filterGroups.some(group =>
                  group.items.some(item => item.name?.toUpperCase().startsWith(letter) ?? false)
                );
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                    className={`w-8 h-6 text-sm font-medium rounded transition-colors ${selectedLetter === letter
                        ? 'bg-blue-500 text-white'
                        : hasItems
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    disabled={!hasItems}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Content */}
        <div className="max-h-[300px] overflow-y-auto rounded-lg">
          <div className="grid grid-cols-2">
            {/* Left Column */}
            <div className="p-4">
              {filteredGroups.slice(0, Math.ceil(filteredGroups.length / 2)).map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg">{group.title}</h3>
                    {selections[group.title]?.size > 0 && (
                      <button
                        onClick={() => handleClearGroup(group.title)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <label key={item.id} className="flex items-center text-gray-600 hover:text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-3 w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          checked={selections[group.title]?.has(item.id) || false}
                          onChange={() => handleItemToggle(group.title, item.id)}
                        />
                        <span className="text-sm">{item.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="p-4">
              {filteredGroups.slice(Math.ceil(filteredGroups.length / 2)).map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg">{group.title}</h3>
                    {selections[group.title]?.size > 0 && (
                      <button
                        onClick={() => handleClearGroup(group.title)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <label key={item.id} className="flex items-center text-gray-600 hover:text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-3 w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          checked={selections[group.title]?.has(item.id) || false}
                          onChange={() => handleItemToggle(group.title, item.id)}
                        />
                        <span className="text-sm">{item.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </Modal>
  );
}
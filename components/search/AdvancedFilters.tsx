import { useState } from 'react';
import { SearchFilters, MediaType } from '@/types/search';
import { RatingSlider } from './RatingSlider';
import { FilterChips } from './FilterChips';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { RotateCcw, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdvancedFiltersProps {
    filters: SearchFilters;
    onChange: (filters: SearchFilters) => void;
    onReset: () => void;
    onApply: () => void; // New prop for Apply action
    activeMediaType: MediaType; // 'movie' | 'tv' | 'game'
}

export function AdvancedFilters({ filters, onChange, onReset, onApply, activeMediaType }: AdvancedFiltersProps) {
    // Helper to update parts of filters
    const updateFilter = (key: keyof SearchFilters, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    // Helper for Rating Toggle logic
    const ratingEnabled = filters.minRating !== undefined;
    const handleRatingToggle = (enabled: boolean) => {
        if (enabled) {
            updateFilter('minRating', 9); // Default to 9 as per requirements
        } else {
            updateFilter('minRating', undefined);
        }
    };

    const isGame = activeMediaType === 'game';
    const isPerson = activeMediaType === 'person';

    if (isPerson) return null; // People don't have advanced filters in this scope

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl mx-auto mt-6 bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-semibold text-white">Advanced Search</h2>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors px-3 py-1 hover:bg-white/10 rounded-full"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset Filters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Column 1: Rating & Primary Attributes */}
                <div className="space-y-10">
                    {/* Your Ratings (User Status) */}
                    <div>
                        <label className="text-sm font-medium text-neutral-300 mb-3 block">Your Ratings</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.userStatus === 'unseen' ? 'bg-purple-600 border-purple-600' : 'border-neutral-600 group-hover:border-neutral-400'}`}>
                                    {filters.userStatus === 'unseen' && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.userStatus === 'unseen'}
                                    onChange={() => updateFilter('userStatus', filters.userStatus === 'unseen' ? undefined : 'unseen')}
                                />
                                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">Exclude titles I've seen</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.userStatus === 'seen' ? 'bg-purple-600 border-purple-600' : 'border-neutral-600 group-hover:border-neutral-400'}`}>
                                    {filters.userStatus === 'seen' && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.userStatus === 'seen'}
                                    onChange={() => updateFilter('userStatus', filters.userStatus === 'seen' ? undefined : 'seen')}
                                />
                                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">Restrict to titles I've seen</span>
                            </label>
                        </div>
                    </div>

                    {/* Rating Slider - Both Games and Movies/TV have ratings */}
                    <RatingSlider
                        value={filters.minRating || 9}
                        onChange={(v) => updateFilter('minRating', v)}
                        enabled={ratingEnabled}
                        onToggle={handleRatingToggle}
                    />

                    {/* Genres - Now Carousel */}
                    <div>
                        <label className="text-sm font-medium text-neutral-300 mb-3 block">Genres (Broad)</label>
                        <FilterChips
                            variant="carousel"
                            options={
                                isGame ? [
                                    { label: 'Action', value: 1 },
                                    { label: 'RPG', value: 2 },
                                    { label: 'Strategy', value: 3 },
                                    { label: 'Adventure', value: 4 },
                                    { label: 'Shooter', value: 5 },
                                    { label: 'Sports', value: 6 },
                                    { label: 'Puzzle', value: 7 },
                                ] : [
                                    { label: 'Action', value: 28 },
                                    { label: 'Adventure', value: 12 },
                                    { label: 'Comedy', value: 35 },
                                    { label: 'Drama', value: 18 },
                                    { label: 'Sci-Fi', value: 878 },
                                    { label: 'Horror', value: 27 },
                                    { label: 'Thriller', value: 53 },
                                    { label: 'Fantasy', value: 14 },
                                    { label: 'Romance', value: 10749 },
                                    { label: 'Mystery', value: 9648 },
                                ]
                            }
                            selected={filters.genres || []}
                            onChange={(v) => updateFilter('genres', v)}
                        />
                    </div>

                    {/* NEW: Subgenres & Keywords Mock */}
                    <div className="space-y-4">

                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-2 block">Keywords</label>
                            <div className="relative">
                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Add keywords..."
                                    className="w-full bg-neutral-800 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:ring-1 focus:ring-white/20"
                                    disabled // Mocking UI primarily
                                />
                            </div>
                        </div>
                    </div>

                    {!isGame && (
                        <>
                            {/* Total Votes */}
                            <div>
                                <label className="text-sm font-medium text-neutral-300 mb-3 block">Total Votes</label>
                                <FilterChips
                                    options={[
                                        { label: '1k+', value: 1000 },
                                        { label: '10k+', value: 10000 },
                                        { label: '100k+', value: 100000 },
                                        { label: '500k+', value: 500000 },
                                    ]}
                                    selected={filters.minVotes ? [filters.minVotes] : []}
                                    onChange={(v) => updateFilter('minVotes', v[0])} // Single select behavior
                                    multiSelect={false}
                                />
                            </div>
                        </>
                    )}

                    {isGame && (
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-3 block">Platforms</label>
                            <FilterChips
                                options={[
                                    { label: 'PC', value: 'pc' },
                                    { label: 'PlayStation', value: 'ps' },
                                    { label: 'Xbox', value: 'xbox' },
                                    { label: 'Switch', value: 'switch' },
                                    { label: 'Mobile', value: 'mobile' },
                                ]}
                                selected={filters.platforms || []}
                                onChange={(v) => updateFilter('platforms', v)}
                            />
                        </div>
                    )}

                    {/* Decade & Year - Moved to Column 1 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-3 block">Decade</label>
                            <div className="space-y-2">
                                <FilterChips
                                    options={[
                                        { label: '2020s', value: 2020 },
                                        { label: '2010s', value: 2010 },
                                        { label: '2000s', value: 2000 },
                                    ]}
                                    selected={filters.releaseDecade ? [filters.releaseDecade] : []}
                                    onChange={(v) => {
                                        const newDecade = v[0] as number | undefined;
                                        const newFilters = { ...filters, releaseDecade: newDecade };
                                        // Clear year if decade changes or is cleared
                                        if (newDecade !== filters.releaseDecade) {
                                            newFilters.releaseYear = undefined;
                                        }
                                        onChange(newFilters);
                                    }}
                                    multiSelect={false}
                                />
                                <FilterChips
                                    options={[
                                        { label: '1990s', value: 1990 },
                                        { label: '1980s', value: 1980 },
                                        { label: 'Older', value: 1900 },
                                    ]}
                                    selected={filters.releaseDecade ? [filters.releaseDecade] : []}
                                    onChange={(v) => {
                                        const newDecade = v[0] as number | undefined;
                                        const newFilters = { ...filters, releaseDecade: newDecade };
                                        // Clear year if decade changes or is cleared
                                        if (newDecade !== filters.releaseDecade) {
                                            newFilters.releaseYear = undefined;
                                        }
                                        onChange(newFilters);
                                    }}
                                    multiSelect={false}
                                />
                            </div>
                        </div>

                        {/* Year specific (Dependent on decade) */}
                        <div className={filters.releaseDecade ? "opacity-100" : "opacity-30 pointer-events-none"}>
                            <label className="text-sm font-medium text-neutral-300 mb-3 block">Specific Year</label>
                            <select
                                className="w-full bg-neutral-800 border-none rounded-lg text-white p-2.5 focus:ring-2 focus:ring-white/20"
                                value={filters.releaseYear || ''}
                                onChange={(e) => updateFilter('releaseYear', e.target.value ? parseInt(e.target.value) : undefined)}
                                disabled={!filters.releaseDecade}
                            >
                                <option value="">Any Year</option>
                                {filters.releaseDecade && [...Array(10)].map((_, i) => (
                                    <option key={i} value={filters.releaseDecade! + i}>
                                        {filters.releaseDecade! + i}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Column 2: Secondary Attributes */}
                <div className="space-y-10">
                    {/* Language, Country, Company (Multi-Selects) */}
                    <div className="space-y-4">
                        <SearchableMultiSelect
                            label="Primary Language"
                            placeholder="Select language..."
                            options={[
                                { label: 'English', value: 'en' },
                                { label: 'French', value: 'fr' },
                                { label: 'Spanish', value: 'es' },
                                { label: 'German', value: 'de' },
                                { label: 'Japanese', value: 'ja' },
                                { label: 'Korean', value: 'ko' },
                                { label: 'Hindi', value: 'hi' },
                            ]}
                            selected={filters.language || []}
                            onChange={(v) => updateFilter('language', v)}
                        />
                        <SearchableMultiSelect
                            label="Primary Country"
                            placeholder="Select country..."
                            options={[
                                { label: 'United States', value: 'US' },
                                { label: 'United Kingdom', value: 'GB' },
                                { label: 'France', value: 'FR' },
                                { label: 'Canada', value: 'CA' },
                                { label: 'Japan', value: 'JP' },
                                { label: 'South Korea', value: 'KR' },
                                { label: 'India', value: 'IN' },
                            ]}
                            selected={filters.country || []}
                            onChange={(v) => updateFilter('country', v)}
                        />
                        <SearchableMultiSelect
                            label="Production Company"
                            placeholder="Select studio..."
                            options={[
                                { label: 'Warner Bros. Pictures', value: 'wb' },
                                { label: 'Universal Pictures', value: 'universal' },
                                { label: 'Sony Pictures', value: 'sony' },
                                { label: 'Walt Disney Pictures', value: 'disney' },
                                { label: 'Marvel Studios', value: 'marvel' },
                                { label: 'A24', value: 'a24' },
                            ]}
                            selected={filters.company || []}
                            onChange={(v) => updateFilter('company', v)}
                        />

                        {/* Awards - Now Searchable and Available for All */}
                        <SearchableMultiSelect
                            label="Award Winning"
                            placeholder="Select awards..."
                            options={isGame ? [
                                { label: 'Game of the Year (TGA)', value: 'tga_goty' },
                                { label: 'Best Narrative', value: 'tga_narrative' },
                                { label: 'Best Art Direction', value: 'tga_art' },
                                { label: 'Golden Joystick', value: 'golden_joystick' },
                                { label: 'BAFTA Games Award', value: 'bafta_games' },
                            ] : [
                                { label: 'Oscar Winner (Academy Awards)', value: 'oscar' },
                                { label: 'Golden Globe Winner', value: 'gg' },
                                { label: 'Emmy Award', value: 'emmy' },
                                { label: 'BAFTA Film Award', value: 'bafta_film' },
                                { label: 'Cannes Palme d\'Or', value: 'cannes' },
                                { label: 'Sundance Grand Jury', value: 'sundance' },
                            ]}
                            selected={filters.awards || []}
                            onChange={(v) => {
                                const newFilters = { ...filters, awards: v };
                                // Clear categories if no awards selected
                                if (v.length === 0) {
                                    newFilters.awardCategories = [];
                                }
                                onChange(newFilters);
                            }}
                        />

                        {/* Condition: Show Categories if Awards are selected */}
                        {filters.awards && filters.awards.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <SearchableMultiSelect
                                    label="Award Category"
                                    placeholder="Select category..."
                                    options={isGame ? [
                                        { label: 'Game of the Year', value: 'goty' },
                                        { label: 'Best RPG', value: 'best_rpg' },
                                        { label: 'Best Action/Adventure', value: 'best_action' },
                                        { label: 'Best Narrative / Story', value: 'best_story' },
                                        { label: 'Best Art Direction', value: 'best_art_direction' },
                                        { label: 'Best Audio Design', value: 'best_audio' },
                                        { label: 'Best Indie Game', value: 'best_indie' },
                                    ] : [
                                        { label: 'Best Picture / Series', value: 'best_picture' }, // Unified logical "Best Top Level"
                                        { label: 'Best Drama Series', value: 'best_drama_series' },
                                        { label: 'Best Comedy Series', value: 'best_comedy_series' },
                                        { label: 'Best Director', value: 'best_director' },
                                        { label: 'Best Actor', value: 'best_actor' },
                                        { label: 'Best Actress', value: 'best_actress' },
                                        { label: 'Best Supporting Actor', value: 'best_supporting_actor' },
                                        { label: 'Best Supporting Actress', value: 'best_supporting_actress' },
                                        { label: 'Best Screenplay', value: 'best_screenplay' },
                                        { label: 'Best Cinematography', value: 'best_cinematography' },
                                        { label: 'Best Animated Feature', value: 'best_animated' },
                                    ]}
                                    selected={filters.awardCategories || []}
                                    onChange={(v) => updateFilter('awardCategories', v)}
                                />
                            </motion.div>
                        )}
                    </div>

                    {!isGame && (
                        <>
                            {/* Streaming Platforms (Multi-Select Chips) */}
                            <div>
                                <label className="text-sm font-medium text-neutral-300 mb-3 block">Streaming Platforms</label>
                                <FilterChips
                                    options={[
                                        { label: 'Netflix', value: 'netflix' },
                                        { label: 'Prime Video', value: 'prime' },
                                        { label: 'Disney+', value: 'disney' },
                                        { label: 'Hulu', value: 'hulu' },
                                        { label: 'Max', value: 'max' },
                                        { label: 'Apple TV+', value: 'apple' },
                                    ]}
                                    selected={filters.streamingProviders || []}
                                    onChange={(v) => updateFilter('streamingProviders', v)}
                                />
                            </div>
                        </>
                    )}

                    {/* Runtime & Certification remain here for Movies/TV */}
                    {!isGame && (
                        <div className="space-y-10 mt-10">
                            {/* Runtime */}
                            <div>
                                <label className="text-sm font-medium text-neutral-300 mb-3 block">Runtime</label>
                                <FilterChips
                                    options={[
                                        { label: '< 90m', value: 'under_90' },
                                        { label: '90-120m', value: '90_120' },
                                        { label: '120-180m', value: '120_180' },
                                        { label: '> 180m', value: 'over_180' },
                                    ]}
                                    selected={[]}
                                    onChange={() => { }}
                                />
                            </div>

                            {/* Certification */}
                            <div>
                                <label className="text-sm font-medium text-neutral-300 mb-3 block">Certification</label>
                                <FilterChips
                                    options={[
                                        { label: 'PG-13', value: 'PG-13' },
                                        { label: 'R', value: 'R' },
                                        { label: 'PG', value: 'PG' },
                                        { label: 'G', value: 'G' },
                                        { label: 'TV-MA', value: 'TV-MA' },
                                    ]}
                                    selected={filters.certification || []}
                                    onChange={(v) => updateFilter('certification', v)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex justify-center pb-4">
                <button
                    onClick={onApply}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold text-base hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
                >
                    <Check className="w-5 h-5" />
                    Apply Filters
                </button>
            </div>
        </motion.div>
    );
}

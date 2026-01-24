
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Tag, Smile, Music } from 'lucide-react';
import { supabase } from '../services/supabase';
import { SEO } from '../components/SEO';

export const SeasonalPage: React.FC = () => {
  const { isDarkMode } = useStore();
  
  const defaultSeasons = [
    'Spring', 'Summer', 'Autumn', 'Winter', 
    'Christmas', 'Halloween', 'New Year', 'Holiday'
  ];

  const [seasons, setSeasons] = useState<string[]>(defaultSeasons.sort());
  
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-sky-500 to-blue-600',
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-violet-500 to-indigo-700',
    'bg-gradient-to-br from-sky-600 to-cyan-700',
    'bg-gradient-to-br from-purple-600 to-fuchsia-700',
  ];

  useEffect(() => {
    const fetchSeasons = async () => {
      const { data } = await supabase.from('squeeze_tracks').select('season');
      if (data) {
        const allSeasons = (data as any[])
          .flatMap((track: any) => {
             const s = track.season;
             if (Array.isArray(s)) return s; 
             if (typeof s === 'string' && s.trim().length > 0) return [s]; 
             return [];
          })
          .filter((s: any): s is string => typeof s === 'string' && s.length > 0)
          .map(s => s.trim()); 
        
        const uniqueSeasons = Array.from(new Set([...defaultSeasons, ...allSeasons])).sort();
        if (uniqueSeasons.length > 0) setSeasons(uniqueSeasons);
      }
    };
    fetchSeasons();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 pb-32">
        <SEO title="Seasonal Music Themes" description="Find the perfect soundtrack for Christmas, Halloween, Summer, and other seasonal holidays." />
        
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-medium">
            <Link to="/library" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <ArrowLeft size={16} /> Back to Library
            </Link>
            <div className="h-4 w-px bg-current opacity-20 hidden sm:block"></div>
            <Link to="/categories/genres" className="flex items-center gap-2 text-sky-500 hover:text-sky-600 hover:underline">
                <Tag size={16} /> Browse by Genre
            </Link>
            <Link to="/categories/moods" className="flex items-center gap-2 text-sky-500 hover:text-sky-600 hover:underline">
                <Smile size={16} /> Browse by Mood
            </Link>
            <Link to="/categories/instruments" className="flex items-center gap-2 text-sky-500 hover:text-sky-600 hover:underline">
                <Music size={16} /> Browse by Instrument
            </Link>
        </div>

        <h1 className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-3 tracking-tight">
            <Calendar className="text-sky-500" size={32} /> SEASONAL THEMES
        </h1>
        <p className="text-lg md:text-xl opacity-70 mb-12 max-w-2xl">
            Find the right music for every time of the year. From spooky Halloween vibes to cozy Christmas jingles.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {seasons.map((season, index) => {
                const gradient = Object.values(gradients)[index % gradients.length];
                return (
                    <Link
                        key={season}
                        to={`/library?search=${encodeURIComponent(season)}`}
                        className={`
                            ${gradient} text-white
                            h-24 flex items-center justify-center text-center px-4
                            rounded-xl font-bold text-sm md:text-base uppercase tracking-widest 
                            transition-all transform hover:-translate-y-1 hover:shadow-lg hover:brightness-110 shadow-md
                        `}
                    >
                        {season}
                    </Link>
                )
            })}
        </div>
    </div>
  );
};

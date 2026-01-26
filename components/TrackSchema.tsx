
import React from 'react';
import { MusicTrack } from '../types';

interface TrackSchemaProps {
  track: MusicTrack;
  currentUrl: string;
}

export const TrackSchema: React.FC<TrackSchemaProps> = ({ track, currentUrl }) => {
  // Conversione durata in ISO 8601 (es: PT3M45S)
  const getDurationISO = (seconds: number | null) => {
    if (!seconds) return undefined;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `PT${mins}M${secs}S`;
  };

  const personId = "https://www.pinegroove.net/about#francescobiondi";

  const schema = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "@id": `${currentUrl}#recording`,
    "name": track.title,
    "url": currentUrl,
    "image": track.cover_url,
    "description": track.description || `Original music track "${track.title}" by Francesco Biondi.`,
    "duration": getDurationISO(track.duration),
    "isrcCode": track.isrc,
    "encodingFormat": "audio/wav (16-bit, 44.1 kHz)",
    "byArtist": {
      "@type": "Person",
      "@id": personId,
      "name": "Francesco Biondi",
      "url": "https://www.pinegroove.net/about"
    },
    "recordingOf": {
      "@type": "MusicComposition",
      "name": track.title,
      "iswcCode": track.iswc,
      "composer": {
        "@type": "Person",
        "@id": personId
      }
    },
    "offers": {
      "@type": "Offer",
      "url": currentUrl,
      "availability": "https://schema.org/InStock",
      "category": "Synchronization License",
      "seller": {
        "@type": "Person",
        "@id": personId
      }
    },
    "acquireLicensePage": currentUrl
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

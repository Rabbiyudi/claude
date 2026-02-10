'use client';

import { useState } from 'react';
import { Camera, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { GalleryImage } from '@/types';

export default function GalleryPage() {
  const albums = useStore((s) => s.albums);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const currentAlbum = albums.find((a) => a.id === selectedAlbum);
  const currentImages = currentAlbum?.images || [];

  const openLightbox = (image: GalleryImage) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxImage || !currentAlbum) return;
    const idx = currentImages.findIndex((i) => i.id === lightboxImage.id);
    if (direction === 'prev' && idx > 0) {
      setLightboxImage(currentImages[idx - 1]);
    } else if (direction === 'next' && idx < currentImages.length - 1) {
      setLightboxImage(currentImages[idx + 1]);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">גלריית תמונות</h1>
          <p className="text-gray-300 text-lg">רגעים מיוחדים מפעילויות בית חב&quot;ד</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selectedAlbum ? (
          <>
            {/* Albums Grid */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              אלבומים ({albums.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.id)}
                  className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-right"
                >
                  <div className="h-52 relative overflow-hidden">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4">
                      <h3 className="text-white font-bold text-lg">{album.title}</h3>
                      <p className="text-white/70 text-sm">
                        {album.images.length} תמונות
                      </p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="badge bg-white/20 backdrop-blur-sm text-white">
                        {album.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {album.description && (
                      <p className="text-gray-500 text-sm mb-2">{album.description}</p>
                    )}
                    <p className="text-gray-400 text-xs">
                      {new Date(album.date).toLocaleDateString('he-IL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {albums.length === 0 && (
              <div className="text-center py-20">
                <Camera size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">
                  עדיין אין אלבומים
                </h3>
                <p className="text-gray-400 mt-2">בקרוב יעלו תמונות חדשות</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Album Detail */}
            <button
              onClick={() => setSelectedAlbum(null)}
              className="flex items-center gap-2 text-primary hover:text-primary-light font-medium mb-6"
            >
              <ChevronRight size={18} />
              חזרה לאלבומים
            </button>

            {currentAlbum && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {currentAlbum.title}
                  </h2>
                  {currentAlbum.description && (
                    <p className="text-gray-500 text-lg">{currentAlbum.description}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(currentAlbum.date).toLocaleDateString('he-IL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    | {currentAlbum.images.length} תמונות
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => openLightbox(image)}
                      className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity relative group"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || ''}
                        className="w-full h-full object-cover"
                      />
                      {image.caption && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                          <p className="text-white text-sm p-3">{image.caption}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-white/10 rounded-full p-2"
          >
            <ChevronRight size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-white/10 rounded-full p-2"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {lightboxImage.caption && (
              <p className="text-white text-center mt-4 text-lg">
                {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

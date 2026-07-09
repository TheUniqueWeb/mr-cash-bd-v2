import React, { useEffect, useRef, useState } from 'react';

export default function AdBanner() {
  const [adsenseCode, setAdsenseCode] = useState<string>('');
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch settings to get AdSense code
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/v1/admin/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings.adsenseCode) {
            setAdsenseCode(settings.adsenseCode);
          }
        }
      } catch (err) {
        console.error('Failed to fetch adsense settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (adsenseCode && bannerRef.current) {
      // Clear previous content
      bannerRef.current.innerHTML = '';
      
      // Create a range to parse the HTML and execute scripts
      const range = document.createRange();
      const fragment = range.createContextualFragment(adsenseCode);
      
      // Append the fragment
      bannerRef.current.appendChild(fragment);

      // Trigger adsbygoogle push if available
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }
    }
  }, [adsenseCode]);

  if (!adsenseCode) return null;

  return (
    <div className="w-full flex justify-center py-4 my-2 overflow-hidden" id="google-adsense-container">
      <div 
        ref={bannerRef}
        className="adsense-banner-wrapper"
        style={{ minHeight: '90px', width: '100%', maxWidth: '728px' }}
      />
    </div>
  );
}

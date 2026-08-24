import { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

export default function SEO({ title, description }) {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    
    const defaultTitle = settings.site?.title || settings.businessName || 'Trattoria Bar Cantone';
    const defaultDesc = settings.site?.metaDescription || settings.description || 'La vera cucina emiliana.';
    
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle;
    
    // Gestione meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || defaultDesc);

  }, [title, description, settings]);

  // Schema Markup (LocalBusiness / Restaurant)
  useEffect(() => {
    if (!settings || !settings.address) return;

    const schemaId = 'restaurant-schema';
    let script = document.getElementById(schemaId);
    
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('id', schemaId);
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": settings.businessName || "Trattoria Bar Cantone",
      "image": "https://trattoriabarcantone.it/img/hero.jpg", 
      "@id": "https://trattoriabarcantone.it",
      "url": "https://trattoriabarcantone.it",
      "telephone": settings.phone || "",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.address.street || "",
        "addressLocality": settings.address.city || "",
        "postalCode": settings.address.zip || "",
        "addressRegion": settings.address.province || "",
        "addressCountry": "IT"
      },
      "servesCuisine": "Emiliana",
      "priceRange": "€€",
      "acceptsReservations": "True"
    };

    if (settings.hours?.schedule) {
       // Convertiamo orari Firebase in format schema
       schemaData.openingHoursSpecification = [];
       const dayMap = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday' };
       Object.entries(settings.hours.schedule).forEach(([day, slots]) => {
         if (!settings.hours.closedDays?.includes(day)) {
           slots.forEach(slot => {
             schemaData.openingHoursSpecification.push({
               "@type": "OpeningHoursSpecification",
               "dayOfWeek": [dayMap[day]],
               "opens": slot.open,
               "closes": slot.close
             });
           });
         }
       });
    }

    script.textContent = JSON.stringify(schemaData);

    return () => {
      // Cleanup facoltativo, ma utile per evitare duplicati in dev
      if (script && document.head.contains(script)) {
         // document.head.removeChild(script); 
         // Meglio lasciarlo fisso o aggiornarlo.
      }
    };
  }, [settings]);

  return null;
}

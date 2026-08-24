import React, { useMemo } from 'react';
import { useAdminBookingsList } from '../../hooks/useAdminBookings';
import { BOOKING_STATUS } from '../../hooks/useBookings';
import { format, subDays, parseISO, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';
import PageHeader from '../../components/admin/ui/PageHeader';
import StatCard from '../../components/admin/ui/StatCard';
import LoadingState from '../../components/admin/ui/LoadingState';
import { TrendingUp, Users, CalendarDays, Clock, Ban, CalendarX2, BarChart2 } from 'lucide-react';

export default function Statistiche() {
  const now = new Date();
  const endDateStr = format(now, 'yyyy-MM-dd');
  const startDateStr = format(subDays(now, 30), 'yyyy-MM-dd'); // Ultimi 30 giorni

  // Scarica SOLO l'ultimo mese
  const { bookings, loading, error } = useAdminBookingsList(startDateStr, endDateStr);

  const stats = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;

    const valid30 = bookings.filter(b => b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.NO_SHOW);
    
    // Se non ci sono prenotazioni valide, restituiamo un subset nullo per evitare NaN
    if (valid30.length === 0) return { insufficientData: true };

    const cancelled30 = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length;
    const noShow30 = bookings.filter(b => b.status === BOOKING_STATUS.NO_SHOW).length;

    // Sottoinsieme a 7 giorni
    const sevenDaysAgoStr = format(subDays(now, 7), 'yyyy-MM-dd');
    const valid7 = valid30.filter(b => b.date >= sevenDaysAgoStr);
    
    // Calcolo Coperti
    const totalCovers30 = valid30.reduce((sum, b) => sum + (b.guests || 0), 0);
    const avgCovers = (totalCovers30 / valid30.length).toFixed(1);

    // Giorno più affollato (raggruppa per data)
    const coversByDate = {};
    valid30.forEach(b => {
      coversByDate[b.date] = (coversByDate[b.date] || 0) + (b.guests || 0);
    });
    
    let busiestDayStr = null;
    let maxCoversDay = 0;
    Object.entries(coversByDate).forEach(([date, covers]) => {
      if (covers > maxCoversDay) {
        maxCoversDay = covers;
        busiestDayStr = date;
      }
    });
    const busiestDayLabel = busiestDayStr ? format(parseISO(busiestDayStr), 'EEEE d MMM', { locale: it }) : '-';

    // Fascia oraria più richiesta (Moda matematica)
    const timeCount = {};
    valid30.forEach(b => {
      timeCount[b.time] = (timeCount[b.time] || 0) + 1;
    });
    
    let busiestTime = '-';
    let maxTimeCount = 0;
    Object.entries(timeCount).forEach(([time, count]) => {
      if (count > maxTimeCount) {
        maxTimeCount = count;
        busiestTime = time;
      }
    });

    // Tassi
    const totalRequests = bookings.length;
    const cancelRate = ((cancelled30 / totalRequests) * 100).toFixed(1);
    const noShowRate = ((noShow30 / totalRequests) * 100).toFixed(1);

    return {
      insufficientData: false,
      bookings30: valid30.length,
      bookings7: valid7.length,
      totalCovers30,
      avgCovers,
      busiestDayLabel,
      maxCoversDay,
      busiestTime,
      cancelled30,
      cancelRate,
      noShow30,
      noShowRate
    };
  }, [bookings, now]);

  if (loading) return <LoadingState />;
  if (error) return <div style={{ padding: '24px', color: 'red' }}>Errore: {error}</div>;

  return (
    <div>
      <PageHeader 
        title="Statistiche" 
        subtitle={`Analisi intelligente degli ultimi 30 giorni (${format(parseISO(startDateStr), 'dd/MM/yyyy')} - ${format(now, 'dd/MM/yyyy')})`}
      />

      {!stats || stats.insufficientData ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <BarChart2 size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Dati Insufficienti</h3>
          <p style={{ color: 'var(--admin-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Non ci sono abbastanza prenotazioni confermate negli ultimi 30 giorni per generare statistiche affidabili. 
            Il sistema inizierà a calcolare le medie non appena riceverai nuove prenotazioni.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <StatCard 
            title="Prenotazioni Mensili" 
            value={stats.bookings30}
            icon={TrendingUp} 
            trend={`Di cui ${stats.bookings7} negli ultimi 7 giorni`} 
            trendUp={true}
          />

          <StatCard 
            title="Coperti Mensili" 
            value={stats.totalCovers30}
            icon={Users} 
            trend={`Media: ${stats.avgCovers} persone a tavolo`} 
            trendUp={true}
          />

          <StatCard 
            title="Giorno Più Affollato" 
            value={stats.busiestDayLabel.charAt(0).toUpperCase() + stats.busiestDayLabel.slice(1)}
            icon={CalendarDays} 
            trend={`Con un picco di ${stats.maxCoversDay} coperti`} 
            trendUp={true}
          />

          <StatCard 
            title="Orario Più Richiesto" 
            value={stats.busiestTime}
            icon={Clock} 
            trend="Fascia di punta preferita dai clienti" 
            trendUp={true}
          />

          <StatCard 
            title="Cancellazioni" 
            value={stats.cancelled30}
            icon={Ban} 
            trend={`Tasso di disdetta: ${stats.cancelRate}%`} 
            trendUp={stats.cancelRate < 15} // Verde se sotto il 15%
          />

          <StatCard 
            title="No-Show (Mancati Arrivi)" 
            value={stats.noShow30}
            icon={CalendarX2} 
            trend={`Tasso di no-show: ${stats.noShowRate}%`} 
            trendUp={stats.noShowRate < 5} // Verde se sotto il 5%
          />

        </div>
      )}

      {/* Nota sull'ottimizzazione */}
      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
        <strong>Nota tecnica:</strong> Le metriche sono calcolate in tempo reale sul sottoinsieme degli ultimi 30 giorni. I dati storici più vecchi vengono ignorati da questa vista per ottimizzare i costi e le performance del server.
      </div>
    </div>
  );
}

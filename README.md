# Komponen QuoteDisplay

## Tujuan dan Gambaran Umum

Komponen QuoteDisplay adalah fitur utama dari aplikasi Semangat, dirancang untuk menampilkan kutipan motivasi dengan antarmuka pengguna yang menarik dan interaktif. Komponen ini berfungsi sebagai elemen utama yang menghadap pengguna untuk menyampaikan konten inspirasional dengan animasi dan efek visual yang menarik.

## Fungsi Utama

1. **Tampilan Kutipan**: Menampilkan kutipan motivasi beserta penulisnya dalam format kartu yang estetis dan menarik.

2. **Latar Belakang Dinamis**: Menampilkan latar belakang gradien yang berubah warna setiap kali kutipan baru ditampilkan untuk menciptakan variasi visual dan mempertahankan keterlibatan pengguna.

3. **Penghitung Motivasi**: Melacak dan menampilkan jumlah berapa kali pengguna telah menerima motivasi melalui aplikasi, menciptakan rasa komunitas dan dampak positif.

4. **Elemen Interaktif**: Menyertakan tombol "Quote Baru" yang memungkinkan pengguna untuk meminta kutipan motivasi baru kapan saja.

5. **Animasi Loading**: Menampilkan animasi loading yang menarik dengan persentase kemajuan saat mengambil kutipan baru.

6. **Efek Confetti**: Memicu animasi confetti sebagai perayaan ketika kutipan baru ditampilkan, meningkatkan dampak emosional positif.

7. **Penanganan Kesalahan**: Menangani situasi di mana kutipan tidak tersedia dengan anggun, memberikan umpan balik yang jelas kepada pengguna.

## Implementasi Teknis

### Manajemen State
- Menggunakan React hooks (useState, useEffect, useCallback, useMemo) untuk manajemen state yang efisien
- Mempertahankan state untuk konten kutipan, animasi, status loading, dan elemen visual

### Efek Visual
- Mengimplementasikan animasi CSS kustom untuk elemen mengambang, efek pulse, dan rotasi
- Menggunakan filter backdrop dan gradien untuk estetika desain glass-morphism yang modern
- Menampilkan emoji dinamis yang berubah dengan setiap kutipan

### Optimasi Kinerja
- Memanfaatkan useMemo untuk array statis untuk mencegah render ulang yang tidak perlu
- Mengimplementasikan useCallback untuk fungsi-fungsi guna mengoptimalkan kinerja dalam struktur komponen React
- Mensimulasikan kemajuan loading dengan interval terkontrol untuk pengalaman pengguna yang lebih mulus

### Desain Responsif
- Beradaptasi dengan berbagai ukuran layar dengan tata letak dan tipografi yang responsif
- Mempertahankan daya tarik visual di perangkat desktop dan mobile

## Poin Integrasi

Komponen ini terintegrasi dengan:
- Database kutipan melalui prop quotes yang disediakan
- Sistem penghitung motivasi melalui fungsi updateMotivationCount
- Library confetti untuk efek perayaan

## Penggunaan

```tsx
import QuoteDisplay from '../components/QuoteDisplay';
import { Quote } from '../types';

// Contoh penggunaan dalam komponen induk
function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [motivationCount, setMotivationCount] = useState(0);
  
  // Ambil kutipan dan jumlah motivasi...
  
  return (
    <QuoteDisplay 
      quotes={quotes}
      motivationCount={motivationCount}
      setMotivationCount={setMotivationCount}
    />
  );
}

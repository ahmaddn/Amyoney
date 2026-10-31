import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export interface PatchNoteItem {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const APP_PATCH_NOTES: PatchNoteItem[] = [
  {
    version: '1.3.1',
    date: '31 Oktober 2026',
    title: 'Desain Minimalis Modern Pagu Anggaran & Bottom Sheet Sticky Footer',
    highlights: [
      'Bottom Sheet Input Transaksi Sticky Footer: Tombol "Simpan Transaksi" dan "Batal" pada modal input pemasukan/pengeluaran/transfer kini diposisikan tetap di bawah (Sticky Action Footer). Pengguna dapat langsung menekan tombol simpan seketika tanpa perlu scroll ke bawah.',
      'Bottom Sheet Atur Pagu Sticky Footer: Tombol "Terapkan Target" dan "Batal" pada pengaturan pagu keseluruhan serta pagu kategori juga dibuat sticky di dasar modal.',
      'Perombakan Hero Card Pagu Anggaran: Menghilangkan penumpukan chip dompet yang ramai dari kartu utama menjadi indikator saldo ringkas yang elegan, lapang, dan bernafas.',
      'Banner Evaluasi Finansial Minimalis: Mengganti kotak insight yang terlalu mencolok dengan status bar tipis, bersih, dan proporsional sesuai kaidah antislop.',
      'Tata Letak Kartu Kategori Bernafas: Memberikan whitespace yang cukup pada kartu kategori belanja dengan pembatasan teks rapi agar tidak saling bertabrakan di layar ponsel sempit.',
    ],
  },
  {
    version: '1.3.0',
    date: '30 Oktober 2026',
    title: 'Arsitektur State Reaktif Real-Time & Konversi Kurs Valuta Dinamis',
    highlights: [
      'Arsitektur Data Reaktif Tanpa Sync Manual: Menghilangkan kebutuhan tombol Sync atau reload. Setiap transaksi (pemasukan, pengeluaran, transfer), perubahan dompet, dan penambahan/penghapusan kategori kini langsung tampil di layar seketika (0 ms) melalui React Context Store global.',
      'Optimistic State Updates: Saldo dompet, daftar transaksi, dan pagu langsung diperbarui di memori aplikasi sebelum dan bersamaan dengan penyimpanan aman ke SQLite lokal serta Cloud Firestore secara background.',
      'Konversi Kurs Valuta Dinamis & Akurat: Mengganti sistem simbol statis dengan mesin konversi nilai tukar riil (ExchangeRateService). Mengubah mata uang (USD, EUR, SGD, JPY, IDR) kini secara otomatis menghitung konversi angka riil berbasis kurs pasar harian, bukan sekadar mengganti simbol mata uang.',
      'Sistem Caching Kurs & Offline Resilient: Nilai tukar kurs diambil secara otomatis dan disimpan di cache perangkat selama 1 jam, serta memiliki fallback nilai tukar terkalibrasi sehingga tetap berfungsi sempurna saat offline.',
    ],
  },
  {
    version: '1.2.9',
    date: '29 Oktober 2026',
    title: 'Alur Pagu Berbasis Saldo Dompet, Date Picker Kalender & Sinkronisasi Paralel',
    highlights: [
      'Alur Pagu Berbasis Saldo Dompet Nyata: Menentukan anggaran kini diawali dengan memilih sumber dana (Dompet/Rekening tertentu atau Semua Dompet). Nominal pagu otomatis dibatasi dan tidak dapat melebihi saldo awal yang tersedia di dompet.',
      'Alokasi Anggaran ke Kategori Belanja: Dari total pagu yang telah ditetapkan sesuai saldo dompet, dana dialokasikan ke masing-masing pos kategori pengeluaran (baik secara persentase % maupun nominal Rp) dengan kalkulator real-time.',
      'Pilihan Date Picker & Multi Rentang Pagu: Penentuan periode pagu anggaran kini mendukung pemilihan rentang kalender (Tanggal Mulai s/d Tanggal Selesai) lengkap dengan preset Bulan Ini, Siklus Gajian (25-25), dan 30 Hari Ke Depan.',
      'Perbaikan Simpan Transaksi Instan: Pencatatan pemasukan, pengeluaran, dan transfer kini tersimpan secara paralel ke SQLite lokal dan Cloud Firestore, saldo langsung berubah seketika tanpa delay.',
      'Sinkronisasi Nol-kan Saldo Terjamin: Aksi "Nol-kan Saldo" kini otomatis tersinkronisasi seketika ke database lokal SQLite dan Cloud Firestore.',
      'Notifikasi Persisten & Evaluasi Pagu: Status toggle notifikasi kini tersimpan permanen di perangkat. Cakupan notifikasi diperluas: pengingat malam 20:00, evaluasi ritme belanja harian, dan peringatan pagu hampir habis (≥80%).',
      'Kelola Akun & Dompet Mandiri: Pengguna dapat menambah rekening/dompet baru, mengubah saldo, nama, tipe, warna, menghapus dompet, serta memilih akun mana saja yang aktif dan tampil di beranda.',
      'Tambah & Hapus Kategori Pagu: Kategori pengeluaran kini dapat ditambah langsung dengan tombol "+ Kategori" di layar Pagu Anggaran dan dihapus dengan tombol "Hapus Kategori Ini".',
      'Penyatuan Kategori Pagu: Menghilangkan redundansi antara pagu aktif dan semua kategori menjadi satu daftar terpadu yang bersih.',
      'Bottom Sheet Interaktif: Semua bottom sheet kini dapat ditutup dengan mengetuk area luar/latar belakang, menekan tombol tutup, atau swipe.',
    ],
  },
  {
    version: '1.2.8',
    date: '29 Oktober 2026',
    title: 'Sesi Login Permanen & Bottom Bar Safe Area Adaptif',
    highlights: [
      'Sesi Login Permanen (Auto-Login): Mengaktifkan AsyncStorage persistence pada Firebase Auth sehingga saat aplikasi ditutup dan dibuka kembali, pengguna tetap login dan tidak perlu login ulang.',
      'Perbaikan Tab Bar Safe Area: Bilah navigasi bawah otomatis terangkat dan menyesuaikan insets layar agar tidak menutupi tombol navigasi 3-tombol HP.',
      'Integrasi Pagu di Tab Utama: Pagu Anggaran kini berada di bilah tab bawah, sedangkan Statistik Keuangan dapat diakses lewat shortcut header atas beranda.',
      'Sistem Catatan Pembaruan Terjamin: Modal catatan pembaruan selalu otomatis muncul menyambut pengguna setiap kali aplikasi mendapatkan rilis versi baru.',
    ],
  },
  {
    version: '1.2.7',
    date: '28 Oktober 2026',
    title: 'Perbaikan Intent Filter & Redirect Google Sign-In Native',
    highlights: [
      'Penyesuaian Safe Area Bottom Bar: Memperbaiki bilah tab navigasi bawah agar tidak bertabrakan dengan bilah tombol navigasi sistem Android (3 tombol / gesture bar) menggunakan insets dinamis.',
      'Restrukturisasi Bottom Bar: Memindahkan Pagu Anggaran ke bilah navigasi utama menggantikan Statistik untuk kemudahan pemantauan batas pengeluaran harian.',
      'Akses Cepat Statistik: Tombol Statistik & Laporan Analisis kini ditempatkan di header atas beranda.',
      'Intent Filter Native Android: Mendaftarkan skema Reversed Client ID ke AndroidManifest sehingga callback otorisasi Google dari browser langsung dialihkan kembali ke aplikasi secara mulus.',
      'Auto-Login & Redirect Beranda: Menghilangkan masalah tersangkut di halaman Google.com setelah login berhasil.',
      'Peningkatan Versi Build: Naik ke versi 1.2.7 (Version Code 4).',
    ],
  },
  {
    version: '1.2.6',
    date: '27 Oktober 2026',
    title: 'Dukungan Penuh Google Sign-In di HP Android',
    highlights: [
      'Login Google Native Android & iOS: Mengintegrasikan expo-auth-session dan Google IdToken provider sehingga pengguna di ponsel Android dapat login dengan akun Google tanpa error popup.',
      'Konversi Kredensial Firebase: Mengonversi Google ID Token ke kredensial Firebase Auth secara instan dan aman.',
      'Peningkatan Versi Build: Naik ke versi 1.2.6 (Version Code 3).',
    ],
  },
  {
    version: '1.2.5',
    date: '27 Oktober 2026',
    title: 'Deteksi Otomatis Pembaruan Aplikasi',
    highlights: [
      'Modal Otomatis Catatan Pembaruan: Setiap kali aplikasi mendapatkan pembaruan atau versi baru, sistem otomatis memunculkan modal Catatan Pembaruan saat pengguna masuk kembali.',
      'Pelacakan Versi Berbasis Penyimpanan: Menggunakan AsyncStorage untuk menyimpan versi terakhir yang dilihat pengguna sehingga modal tidak mengganggu berulang-ulang untuk versi yang sama.',
      'Peningkatan Keterbacaan & Kontras: Teks dan angka di seluruh kartu saldo utama kini selalu kontras tinggi di mode terang maupun gelap.',
      'Perbaikan Splash Screen Native: Menggunakan icon.png bertema transparan tanpa latar putih pada konfigurasi expo-splash-screen Android.',
      'Proteksi Autentikasi Mobile: Mencegah crash undefined is not a function pada platform mobile dengan membatasi metode popup hanya untuk web browser.',
    ],
  },
  {
    version: '1.2.4',
    date: '27 Oktober 2026',
    title: 'Dukungan EAS Update (OTA - Over-The-Air)',
    highlights: [
      'Pembaruan Instan Tanpa Install Ulang APK: Mengintegrasikan expo-updates dan EAS Update branch channel.',
      'Auto-Update di Latar Belakang: Perubahan desain UI, perbaikan bug, dan penambahan fitur JS langsung tersinkronisasi otomatis ke aplikasi pengguna saat dibuka.',
      'Konfigurasi Runtime Version: Pengikatan versi aplikasi dinamis berbasis runtime policy appVersion.',
      'Perbaikan Path Sinkronisasi Cloud: Mengarahkan sinkronisasi manual database lokal ke sub-koleksi pengguna yang terisolasi dengan aman (users/{uid}/...).',
      'Peningkatan Kontras Hero Card: Memperbaiki keterbacaan teks label, angka pengeluaran, dan batas aman pada kartu saldo utama agar selalu tajam dan kontras di semua mode.',
    ],
  },
  {
    version: '1.2.3',
    date: '27 Oktober 2026',
    title: 'Penanganan Kesalahan Firestore & Keamanan Data',
    highlights: [
      'Penanganan Error Listener Cloud: Listener realtime Firestore kini dilengkapi penangkap error permission-denied yang elegan sehingga aplikasi tetap stabil saat izin database belum dipublikasikan.',
      'Optimasi Kinerja Snapshot: Menghilangkan uncaught exception listener pada koneksi web.',
    ],
  },
  {
    version: '1.2.2',
    date: '27 Oktober 2026',
    title: 'Rekap Harian & Bulanan serta Sinkronisasi Tema Penuh',
    highlights: [
      'Rekap Mutasi Harian: Pengelompokan transaksi otomatis per tanggal lengkap dengan akumulasi pengeluaran dan pemasukan harian.',
      'Rekap Mutasi Bulanan: Pengelompokan transaksi per bulan dengan total arus kas bersih.',
      'Sinkronisasi Warna Badge & Font: Warna avatar inisial, teks mutasi, dan indikator status otomatis adaptif terhadap preset tema aktif.',
      'Konfigurasi APK Android: Pendaftaran identitas com.company.amyoney dan integrasi google-services.json.',
    ],
  },
  {
    version: '1.2.1',
    date: '27 Oktober 2026',
    title: 'Multi-Mata Uang Global & Favicon Dinamis',
    highlights: [
      'Reaktivitas Kurs Real-Time: Perubahan mata uang di pengaturan (IDR, USD, EUR, SGD, JPY) langsung mengonversi seluruh angka di beranda, tabungan, dan pagu.',
      'Favicon Base64 Data URI: Tampilan logo favicon di tab browser kini selalu muncul dan warnanya berubah dinamis sesuai tema yang dipilih.',
      'Deteksi Jaringan Cerdas: Modal otomatis yang memicu sinkronisasi data lokal ke Firebase saat perangkat kembali online.',
    ],
  },
  {
    version: '1.2.0',
    date: '27 Oktober 2026',
    title: 'Smart Receipt Scanner & Kustomisasi Penuh',
    highlights: [
      'Pindai Struk Belanja Otomatis (OCR): Ambil foto atau unggah nota struk belanja untuk mengisi nominal, tanggal, dan catatan transaksi secara instan.',
      'Sistem Tema & Kurs: Pilihan Mode Terang, Gelap, dan Sistem, serta dukungan multi-mata uang (IDR, USD, EUR, SGD, JPY).',
      'Pilihan Palet Aksen Fintech: Emerald Forest, Royal Sapphire, Midnight Obsidian, dan Nordic Terracotta.',
      'Mode Tamu Bijak: Mode tamu offline untuk pencatatan kas harian dengan proteksi fitur akun.',
      'Audio & Notifikasi: Suara konfirmasi transaksi kristal dan pengingat harian pada jam 20:00.',
      'Ikon Vektor Standar: Navigasi dan tombol kini menggunakan Ionicons resmi tanpa karakter emoji.',
    ],
  },
  {
    version: '1.1.0',
    date: '27 Oktober 2026',
    title: 'Integrasi Firebase & Navigasi 5-Posisi',
    highlights: [
      'Sinkronisasi Realtime Cloud Firestore untuk pengguna login.',
      'Persistent Bottom Bar dengan 5 posisi dan tombol aksi elevated center (+).',
      'Desain identitas brand khas Amyoney dengan palet Deep Forest Green dan Fresh Lime.',
    ],
  },
];

interface PatchNotesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PatchNotesModal({ visible, onClose }: PatchNotesModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Catatan Pembaruan
              </ThemedText>
              <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Riwayat fitur dan peningkatan Amyoney
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup Catatan Pembaruan"
              style={[styles.closeBtn, { backgroundColor: colors.backgroundSelected }]}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* List Patch Notes */}
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {APP_PATCH_NOTES.map((patch, idx) => (
              <View
                key={patch.version}
                style={[
                  styles.patchCard,
                  { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                  idx < APP_PATCH_NOTES.length - 1 && { marginBottom: 16 },
                ]}
              >
                <View style={styles.patchHeaderRow}>
                  <View style={[styles.versionBadge, { backgroundColor: colors.brandPrimary }]}>
                    <ThemedText style={styles.versionBadgeText}>v{patch.version}</ThemedText>
                  </View>
                  <ThemedText style={[styles.patchDate, { color: colors.textSecondary }]}>
                    {patch.date}
                  </ThemedText>
                </View>

                <ThemedText style={[styles.patchTitle, { color: colors.text }]}>
                  {patch.title}
                </ThemedText>

                <View style={styles.highlightList}>
                  {patch.highlights.map((h, hIdx) => (
                    <View key={hIdx} style={styles.highlightRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={colors.brandPrimary}
                        style={{ marginTop: 2, marginRight: 8 }}
                      />
                      <ThemedText style={[styles.highlightText, { color: colors.text }]}>
                        {h}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Tombol Tutup */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mengerti dan Tutup"
            style={[styles.bottomBtn, { backgroundColor: colors.brandPrimary }]}
            onPress={onClose}
          >
            <ThemedText style={styles.bottomBtnText}>Tutup Catatan</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 22, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    paddingBottom: 10,
  },
  patchCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  patchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  patchDate: {
    fontSize: 11,
  },
  patchTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  highlightList: {
    gap: 6,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  highlightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  bottomBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

# Amyoney Changelog & Patch Notes

Dokumentasi riwayat pembaruan sistem dan perubahan aplikasi Amyoney.

## [1.3.5] - 4 November 2026

### Persistensi Sesi Login Mobile & Dialog Pemilihan Akun Google
- **Penyimpanan Sesi Login Permanen di Mobile (AsyncStorage Persistence Adapter)**:
  - Memperbaiki kegagalan resolusi fungsi `getReactNativePersistence` dari paket `firebase/auth` v13 pada lingkungan React Native.
  - Mengimplementasikan adapter persistensi kustom berbasis `@react-native-async-storage/async-storage` yang mengadopsi standar interface `Persistence` Firebase secara mandiri dan aman.
  - Token autentikasi dan status user login kini tersimpan permanen di penyimpanan lokal HP sehingga pengguna tidak ter-logout secara tiba-tiba saat aplikasi ditutup atau dimatikan oleh sistem.
- **Dialog Pemilihan Akun Google (Select Account)**:
  - Mengonfigurasi parameter `selectAccount: true` dan `extraParams: { prompt: 'select_account' }` pada `Google.useIdTokenAuthRequest`.
  - Sistem kini menyajikan dialog *Choose an Account* (pemilih akun Google yang tersimpan di HP) alih-alih menampilkan formulir pengisian email & kata sandi secara manual.

---

## [1.3.4] - 2 November 2026

### Umpan Balik Getaran Native (Haptic & Vibration) & Pengujian Respon
- **Integrasi Vibration Native Android/iOS Universal**:
  - Mengimplementasikan `haptic-service` menggunakan API `Vibration` bawaan React Native yang kompatibel dan terasa bergetar di seluruh tipe perangkat smartphone Android (tanpa memerlukan haptic motor mahal).
  - Setiap kali menekan angka pada keypad bawaan modal transaksi, smartphone akan bergetar singkat (15ms tactile click feedback).
- **Pola Getar Sukses Simpan Transaksi**:
  - Saat menekan tombol simpan transaksi (✓) atau tombol konfirmasi, smartphone akan bergetar pola ganda (success pattern: 25ms-40ms-35ms) disinkronkan bersama nada audio kristal *chime*.
- **Tombol Uji Coba Getaran di Menu Pengaturan**:
  - Menyediakan dua tombol interaktif di tab Pengaturan (*Tes Ketukan Keypad* dan *Tes Simpan Transaksi*) agar pengguna dapat menguji dan merasakan respon getaran secara langsung.

---

## [1.3.3] - 2 November 2026

### Persistensi Tema & Sinkronisasi Warna Splash Screen Native
- **Penyimpanan Tema Permanen di HP (AsyncStorage Native)**:
  - Memperbaiki akar masalah di mana pemilihan tema warna (*Emerald Forest, Royal Sapphire, Midnight Obsidian, Nordic Terracotta*), mode gelap/terang, dan mata uang sebelumnya hanya disimpan via `window.localStorage` (yang tidak bekerja di lingkungan React Native mobile).
  - Mengintegrasikan `@react-native-async-storage/async-storage` sebagai media persistensi utama di Android dan iOS sehingga tema tidak pernah ter-reset kembali ke default saat aplikasi di-close atau di-kill.
- **Sinkronisasi Splash Screen Mengikuti Warna Tema**:
  - `AnimatedSplashOverlay` dan `RootContent` kini menunggu status `isThemeLoaded` sebelum menyembunyikan splash screen, memastikan warna latar, teks branding, dan ikon logo splash screen langsung memakai palet tema aktif Anda seketika saat aplikasi dibuka.
- **Persistensi Pilihan Mata Uang**:
  - Pilihan mata uang (IDR, USD, EUR, SGD, JPY) kini juga disimpan secara persisten di penyimpanan native perangkat.

---

## [1.3.2] - 2 November 2026

### Desain Input Transaksi Terintegrasi & Penyempurnaan Riwayat Transaksi
- **Desain Input Transaksi Baru Ergonomis**:
  - Mengadopsi inspirasi visual satu tangan (*one-handed mobile friendly*) dengan susunan yang bersih: tombol *Batalkan* di kiri atas, tab segmented tipe transaksi (*Pengeluaran, Pemasukan, Transfer*), dan grid ikon kategori 4-kolom yang nyaman disentuh.
  - Slot kategori terakhir dilengkapi tombol *+ Pengaturan* untuk mengelola atau menambah kategori kustom dengan cepat.
- **Keypad Angka Terintegrasi (Built-in Numeric Keypad)**:
  - Menyertakan custom keypad angka yang konsisten di semua layar tanpa gangguan keyboard bawaan sistem HP yang sering menutupi konten.
  - Dilengkapi tombol cepat nominal `000`, tombol hapus `⌫`, tombol shortcut kalender `Hari ini`, serta tombol simpan centang `✓`.
- **Perbaikan Riwayat Transaksi (Nama Kategori & Ikon Asli)**:
  - Memperbaiki bug di mana nama kategori sebelumnya tidak tampil dan tertutup oleh catatan. Kini nama kategori selalu menjadi judul utama.
  - Mengganti inisial teks dua huruf dengan ikon grafis kategori (`Ionicons`) berwarna aksen asli.
  - Catatan transaksi kini tersusun rapi di baris kedua dan tidak lagi terpotong kaku.
- **Modal Detail Transaksi Utuh**:
  - Mengetuk item transaksi di riwayat kini membuka kartu detail lengkap untuk membaca catatan panjang, informasi dompet sumber & tujuan, serta aksi hapus transaksi secara aman.

---

## [1.3.1] - 31 Oktober 2026

### Desain Minimalis Modern Pagu Anggaran & Bottom Sheet Sticky Footer
- **Bottom Sheet Input Transaksi Sticky Footer (Pemasukan/Pengeluaran/Transfer)**:
  - Tombol **"Simpan Transaksi"** dan **"Batal"** pada modal input pemasukan, pengeluaran, dan transfer kini dibuat **terkunci permanen di bawah (Sticky Action Footer)**. Pengguna dapat langsung menekan tombol simpan seketika tanpa perlu men-scroll layar, dengan safe area bottom insets yang nyaman.
  - Bagian form (pilihan dompet, scanner struk, input nominal, grid kategori, catatan) berada di dalam area scroll tersendiri yang mulus (*smooth scrolling*).
- **Bottom Sheet Atur Pagu Sticky Footer**:
  - Tombol **"Terapkan Target"** dan **"Batal"** pada modal pengaturan pagu keseluruhan maupun pagu kategori kini juga dibuat sticky di dasar modal.
- **Pembersihan Kartu Hero Pagu Anggaran**:
  - Mengeliminasi tumpukan chip dompet yang berdesakan di kartu target utama menjadi satu badge status ringkas: *Sumber Dana: [Nama Dompet / Semua Dompet] (Tersedia Rp ...)*.
  - Memperbarui hierarki tipografi dengan angka target yang proporsional, serta progress bar yang ramping dan elegan.
- **Banner Evaluasi Finansial Minimalis (Anti-Slop)**:
  - Mengganti kotak insight yang sebelumnya tebal dan mencolok dengan status bar horizontal yang ringkas, bersih, dan menggunakan micro-badge ikon yang proporsional.
- **Penyempurnaan Kartu Kategori Belanja**:
  - Memberikan *whitespace* yang lega pada tiap kartu kategori, membatasi teks nama kategori dengan `numberOfLines={1}` agar tidak bertabrakan dengan tombol aksi, dan menyederhanakan ukuran tombol aksi.

---

## [1.3.0] - 30 Oktober 2026

### Arsitektur State Reaktif Real-Time & Konversi Kurs Valuta Dinamis
- **Arsitektur State Reaktif Global Tanpa Sync Manual**:
  - Rombak total alur data menggunakan `MoneyContext` dan `MoneyProvider` terpusat di `_layout.tsx`.
  - Semua layar dan komponen (`OverviewTab`, `TransactionsTab`, `BudgetTab`, modal input) kini terhubung ke Single Source of Truth yang sama.
  - Setiap penambahan transaksi, penghapusan transaksi, penambahan/penghapusan dompet, hingga perubahan kategori **langsung tampil di layar seketika (0 ms)** tanpa perlu sinkronisasi manual atau buka-tutup tab.
- **Optimistic State Updates**:
  - Manipulasi data mutasi secara instan mengupdate memory state aplikasi sebelum dan bersamaan dengan operasi asinkron ke SQLite lokal dan Cloud Firestore.
- **Konversi Nilai Tukar Kurs Valuta Dinamis**:
  - Mengubah mata uang di pengaturan (USD, EUR, SGD, JPY, IDR) kini **menghitung nilai tukar riil secara dinamis dan proporsional**, bukan sekadar mengganti simbol mata uang.
  - Nilai Rp 162.000 otomatis terkonversi secara matematis menjadi sekitar ~$10.00 di USD, €9.17 di EUR, S$13.22 di SGD, dan ¥1.540 di JPY sesuai kurs pasar aktual.
- **Layanan Kurs & Offline Resilient**:
  - Mengimplementasikan `ExchangeRateService` yang mengambil kurs terkini secara otomatis dari API valuta dengan cache lokal 1 jam dan fallback terkalibrasi saat perangkat sedang offline.

---

## [1.2.9] - 29 Oktober 2026

### Alur Pagu Berbasis Saldo Dompet, Date Picker Kalender & Sinkronisasi Paralel
- **Alur Pagu Berbasis Saldo Dompet Nyata**:
  - Menentukan anggaran kini diawali dengan memilih sumber dana (Dompet/Rekening tertentu atau Semua Dompet).
  - Nominal pagu otomatis divalidasi dan **tidak dapat melebihi saldo awal yang tersedia di dompet yang dipilih**.
  - Dilengkapi tombol cepat proporsional (25%, 50%, 75%, dan 100% dari saldo dompet terpilih).
- **Alokasi Pagu ke Kategori Belanja**:
  - Setelah pagu utama ditentukan dari saldo dompet, pengguna membagi/mengalokasikan anggaran ke pos-pos kategori belanja (secara nominal Rp atau persentase %).
  - Terdapat indikator real-time persentase penggunaan dan sisa alokasi.
- **Date Picker & Multi Rentang Pagu Anggaran**:
  - Modal Atur Pagu kini menyediakan pilihan metode periode: **Hitungan Hari** atau **Pilih Rentang Tanggal** (Tanggal Mulai s/d Tanggal Selesai) lengkap dengan shortcut: *Bulan Ini*, *Siklus Gajian (25 - 25)*, dan *30 Hari Ke Depan*.
- **Perbaikan Simpan Transaksi Instan**:
  - Transaksi pemasukan, pengeluaran, dan transfer kini tersimpan secara paralel ke SQLite lokal dan Cloud Firestore, saldo langsung berubah seketika tanpa delay.
- **Sinkronisasi Otomatis Nol-kan Saldo**:
  - Aksi "Nol-kan Saldo" kini otomatis tersinkronisasi seketika ke database SQLite lokal dan Cloud Firestore secara paralel, sehingga status saldo selalu konsisten di perangkat manapun.
- **Notifikasi Persisten & Evaluasi Pagu Pintar**:
  - Preferensi toggle notifikasi kini tersimpan secara persisten menggunakan AsyncStorage sehingga tidak mati/berubah saat aplikasi ditutup dan dibuka kembali.
  - Cakupan notifikasi diperluas: pengingat malam pukul 20:00 WIB, notifikasi peringatan pagu kritis (≥80%), dan rekomendasi batas belanja aman harian.
- **Kelola Akun & Dompet Mandiri**:
  - Menambahkan akun bank/dompet digital baru dengan pilihan tipe (Bank, Tunai, E-Wallet, Lainnya), warna tema, dan saldo awal.
  - Mengubah saldo, nama, dan warna dompet yang ada kapan saja.
  - Menghapus akun/dompet dengan dialog konfirmasi aman.
  - Memilih dompet mana saja yang aktif dan ditampilkan pada beranda ringkasan saldo.
- **Tambah & Hapus Kategori Pagu Anggaran**:
  - Tombol "+ Kategori" langsung pada daftar Pagu Anggaran untuk menambahkan kategori pengeluaran baru dengan warna dan ikon kustom.
  - Tombol "Hapus Kategori Ini" pada modal ubah kategori untuk menghapus kategori belanja yang tidak diinginkan.
- **Alur Pagu Anggaran Fleksibel**:
  - Menentukan total pagu target keseluruhan terlebih dahulu (nominal & periode jangka waktu hari/minggu/bulan).
  - Alokasi ke masing-masing kategori pengeluaran bisa diatur secara persentase (%) terhadap target keseluruhan atau nominal langsung (Rp).
  - Dilengkapi progress bar visual alokasi real-time dan perhitungan batas aman belanja harian.
- **Penyatuan Daftar Kategori Pagu (No Redundancy)**:
  - Menggabungkan "Pagu Kategori Aktif" dan "Semua Kategori Belanja" menjadi satu daftar terpadu yang elegan dan informatif.
- **Fitur Ubah Kategori Mandiri**:
  - Setiap kategori kini memiliki tombol "Ubah" untuk mengedit nama kategori, warna aksen, dan ikonnya kapan saja.
- **Bottom Sheet Interaktif & Mudah Ditutup**:
  - Semua bottom sheet (Catat Transaksi, Pemilih Kategori, Atur Pagu, Kelola Dompet) kini bisa ditutup dengan mengetuk area luar / latar belakang modal atau tombol batal/tutup.
- **Pembersihan Navbar Beranda**:
  - Header atas beranda kini hanya memuat shortcut **Statistik** dan **Pengaturan**.
  - Tombol **Sync** dan **Profil Akun** ditempatkan rapi di dalam halaman Pengaturan.
- **Perbaikan Garis Kurs & Safe Area**:
  - Teks kurs "Rp" sejajar horizontal dengan angka tanpa tenggelam.
  - Seluruh modal memiliki padding bawah dinamis agar tombol aksi tidak tabrakan dengan bilah navigasi 3-tombol HP Android.

---

## [1.2.8] - 29 Oktober 2026

### Sesi Login Permanen & Bottom Bar Safe Area Adaptif
- **Sesi Login Permanen (Firebase Persistence)**:
  - Mengintegrasikan `getReactNativePersistence(ReactNativeAsyncStorage)` pada [firebase.ts](file:///d:/laragon/www/Amyoney/src/services/firebase.ts) sehingga akun Google tetap login saat aplikasi ditutup dan dibuka kembali.
- **Perbaikan Tab Bar Safe Area & Navigasi**:
  - Menggunakan `useSafeAreaInsets` pada [custom-tab-bar.tsx](file:///d:/laragon/www/Amyoney/src/components/navigation/custom-tab-bar.tsx) agar bilah menu tidak menabrak bilah navigasi 3-tombol sistem HP.
  - Menukar posisi tab: **Pagu Anggaran** kini menjadi menu utama bilah bawah, sedangkan **Statistik** dapat diakses lewat shortcut header atas beranda.
- **Deteksi Patch Notes Otomatis**:
  - Memastikan modal catatan pembaruan selalu otomatis muncul menyambut pengguna setiap kali rilis versi baru diterapkan.

---

## [1.2.7] - 28 Oktober 2026
 
### Perbaikan Bottom Bar Safe Area, Pagu Anggaran, & Intent Filter Google Native
- **Safe Area Insets pada Custom Bottom Bar**:
  - Mengintegrasikan `useSafeAreaInsets` pada [custom-tab-bar.tsx](file:///d:/laragon/www/Amyoney/src/components/navigation/custom-tab-bar.tsx) agar bilah navigasi bawah otomatis memiliki padding aman dan tidak menabrak bilah navigasi 3-tombol atau bar gesture bawaan sistem Android.
- **Pembaruan Susunan Menu Bottom Bar**:
  - Memasukkan tab **Pagu Anggaran** ke bilah bawah utama menggantikan Statistik.
  - Memindahkan shortcut akses cepat **Statistik & Analisis** ke deretan tombol header atas beranda ([overview-tab.tsx](file:///d:/laragon/www/Amyoney/src/components/tabs/overview-tab.tsx)).
- **Intent Filter Native Android**:
  - Menambahkan rute penerima deep-link `oauth2redirect.tsx` dan intent filter Google.
  - Memperbarui versi ke **1.2.7** dan Android `versionCode: 4`.

---

## [1.2.6] - 27 Oktober 2026
 
### Dukungan Penuh Google Sign-In Native di HP Android
- **Integrasi expo-auth-session Google Provider**:
  - Mengintegrasikan modul `expo-auth-session/providers/google` dan `expo-crypto`.
  - Mengonversi Google ID Token hasil otorisasi native ke Firebase Credential (`GoogleAuthProvider.credential(idToken)`).
  - Mengaktifkan tombol *Lanjutkan dengan Google* di layar autentikasi ([auth.tsx](file:///d:/laragon/www/Amyoney/src/app/auth.tsx)) untuk platform Mobile dan Web secara mulus.
  - Memperbarui versi ke **1.2.6** dan Android `versionCode: 3`.

---

## [1.2.5] - 27 Oktober 2026
 
### Deteksi Otomatis Pembaruan Aplikasi (Auto-Show Patch Notes)
- **Modal Pembaruan Otomatis**:
  - Mengintegrasikan mekanisme pendeteksi versi baru di [index.tsx](file:///d:/laragon/www/Amyoney/src/app/index.tsx).
  - Setiap kali aplikasi diperbarui (misal via OTA Update atau build baru) dan versi terbaru di `APP_PATCH_NOTES` belum pernah dilihat oleh pengguna, modal **Catatan Pembaruan** akan otomatis muncul saat pengguna login atau membuka aplikasi.
  - Menggunakan `@react-native-async-storage/async-storage` dengan kunci `@amyoney_last_seen_patch_version` sehingga pengguna hanya disuguhkan modal sekali per versi baru.
  - Memperbaiki ikon splash screen native Android pada [app.json](file:///d:/laragon/www/Amyoney/app.json) menggunakan `icon.png` bertema tanpa background putih.
  - Memperbaiki handler Google Sign In di [auth-service.ts](file:///d:/laragon/www/Amyoney/src/services/auth-service.ts) dan [auth.tsx](file:///d:/laragon/www/Amyoney/src/app/auth.tsx) untuk mencegah error runtime `undefined is not a function` pada platform mobile native (karena `signInWithPopup` milik Firebase Web SDK membutuhkan environment browser DOM).

---

## [1.2.4] - 27 Oktober 2026
 
### Dukungan EAS Update (OTA - Over-The-Air)
- **Integrasi Penuh expo-updates**:
  - Mengintegrasikan modul `expo-updates` dengan endpoint EAS Update cloud project `9add902a-4521-4ec4-b4fa-68ad37d58677`.
  - Mengonfigurasi `runtimeVersion` berbasis `appVersion` pada [app.json](file:///d:/laragon/www/Amyoney/app.json).
  - Mengonfigurasi saluran kanal (`channel: preview`, `channel: production`, `channel: development`) pada [eas.json](file:///d:/laragon/www/Amyoney/eas.json).
  - Memungkinkan pengembang mengirimkan perbaikan bug, pembaruan warna, tata letak, dan fitur JavaScript secara instan ke HP pengguna tanpa perlu membuat atau mengunduh file APK baru.
  - Memperbaiki endpoint sinkronisasi lokal ke Cloud Firestore ([sync.ts](file:///d:/laragon/www/Amyoney/src/services/sync.ts)) agar tepat mengarah ke sub-koleksi `users/{userId}/...`.
  - Memperbaiki keterbacaan teks label dan angka mutasi pada Hero Balance Card di mode terang agar selalu berkontras tinggi dan jelas terbaca.

---

## [1.2.3] - 27 Oktober 2026

### Penanganan Kesalahan Firestore & Keamanan Data
- **Graceful Error Handling Listener**:
  - Menambahkan callback penanganan error pada fungsi `onSnapshot` (`subscribeWallets`, `subscribeCategories`, dan `subscribeTransactions`) di [firestore-service.ts](file:///d:/laragon/www/Amyoney/src/services/firestore-service.ts).
  - Menghilangkan crash layar `Uncaught Error in snapshot listener: FirebaseError: [code=permission-denied]` ketika Security Rules Firestore belum diizinkan.

---

## [1.2.2] - 27 Oktober 2026

### Rekap Mutasi Harian & Bulanan Lengkap
- **Tab Transaksi dengan Pilihan Mode Pengelompokan**:
  - Menambahkan switcher tampilan: **Rekap Harian**, **Rekap Bulanan**, dan **Semua**.
  - **Rekap Harian**: Menampilkan tanggal, jumlah transaksi di hari tersebut, total pengeluaran harian, total pemasukan harian, serta rincian tiap mutasi.
  - **Rekap Bulanan**: Menampilkan bulan berjalan, akumulasi pengeluaran dan pemasukan bulanan, total kuantitas transaksi, serta daftar mutasi bulan tersebut.
  - Semua nominal di rekap otomatis mengikuti mata uang aktif (IDR, USD, EUR, SGD, JPY).

### Penyelarasan Warna Badge & Font Tema
- **Sinkronisasi Otomatis**:
  - Badge inisial dan teks mutasi kini mengadopsi token warna tema aktif (`colors.brandPrimary`, `colors.backgroundSelected`, `colors.income`, dan `colors.incomeBg`) sehingga selalu sinkron dengan preset warna yang dipilih di menu Pengaturan.

---

## [1.2.1] - 27 Oktober 2026
- Multi-Mata Uang & Kurs Global secara reaktif.
- Perbaikan Favicon Web Metro dengan Base64 Data URI.
- Penambahan Aturan Patch Note Otomatis di [.agents/PATCH_NOTE_RULE.md](file:///d:/laragon/www/Amyoney/.agents/PATCH_NOTE_RULE.md).

## [1.2.0] - 27 Oktober 2026
- Smart Receipt Scanner (OCR).
- Preset 4 Palet Warna Fintech & Dark/Light mode.

## [1.1.0] - 27 Oktober 2026
- Sinkronisasi Cloud Firestore realtime.
- Floating bottom bar 5 navigasi.

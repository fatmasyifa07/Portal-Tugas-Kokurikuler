/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DestinationType, Question } from './types';

export const DESTINATIONS = [
  {
    id: 'jogjakarta' as DestinationType,
    title: 'Studi Literasi Jogjakarta',
    tagline: 'Mengeksplorasi keagungan Keraton, sejarah Candi, dan studi pertanian modern di PIAT UGM.',
    themeColor: 'emerald',
    imageKeyword: 'jogja_keraton',
    description: 'Bagi siswa yang melakukan kegiatan di kota budaya Yogyakarta. Kunjungan berpusat pada wisata sejarah, candi, keraton, dan riset agroteknologi inovatif di PIAT UGM.',
    spots: ['Museum Merapi', 'Candi Prambanan', 'Keraton Yogyakarta', 'PIAT UGM', 'Malioboro']
  },
  {
    id: 'blitar' as DestinationType,
    title: 'Studi Literasi Kampung Coklat',
    tagline: 'Edukasi budidaya kakao dan studi interaktif pengolahan pangan modern di Blitar.',
    themeColor: 'amber',
    imageKeyword: 'blitar_proklamator',
    description: 'Bagi siswa yang melakukan perjalanan literasi ke Kampung Coklat Blitar. Kegiatan difokuskan pada pengolahan pangan, budidaya tanaman kakao, inovasi industri, serta ketahanan pangan lokal.',
    spots: ['Kebun Pembibitan Kakao', 'Cooking Class & Edukasi Pangan', 'Pabrik Sentra Pengolahan Kakao', 'Museum Coklat', 'Gallery Produk Olahan Pangan']
  },
  {
    id: 'mandiri' as DestinationType,
    title: 'Studi Literasi Mandiri (Pabrik / UMKM)',
    tagline: 'Wajib observasi Pabrik/UMKM lokal dan melampirkan Vlog edukasi maks 3 menit tanpa musik.',
    themeColor: 'indigo',
    imageKeyword: 'mandiri_literasi',
    description: 'Bagi siswa yang melaksanakan riset mandiri secara langsung dengan mengunjungi pabrik, industri rumahan, atau unit UMKM terdekat. Siswa wajib mendokumentasikan kegiatan dalam bentuk link vlog maksimal 3 menit tanpa suara musik latar (backsound).',
    spots: ['Pabrik Olahan Rumah Tangga', 'Unit Usaha Mikro (UMKM) Lokal', 'Sentra Produksi Makanan', 'Bengkel Kerajinan Rakyat', 'Agribisnis Mandiri']
  },
  {
    id: 'teknologi_tepat_guna' as DestinationType,
    title: 'Evaluasi Kokurikuler Tema 3',
    tagline: 'Refleksi proyek kokurikuler inovasi Teknologi Tepat Guna (TTG) untuk Kelas VII, VIII, IX.',
    themeColor: 'purple',
    imageKeyword: 'teknologi_tepat_guna',
    description: 'Wadah evaluasi khusus bagi seluruh siswa UPT SMPN 2 Gandusari (Kelas 7, 8, dan 9) untuk melaporkan hasil rancangan proyek inovasi teknologi tepat guna yang ramah lingkungan dan ekonomis.',
    spots: ['Alat Filtrasi Sederhana', 'Kompos Organik Mandiri', 'Lampu Darurat Ekonomis', 'Alat Penyiram Otomatis', 'Pengolah Sampah Kreatif']
  }
];

export const CLASS_OPTIONS = [
  // Kelas VIII diutamakan di list teratas karena merupakan sasaran utama kegiatan
  'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII F', 'VIII G', 'VIII H', 'VIII I', 'VIII J',
  // Kelas VII
  'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F', 'VII G', 'VII H', 'VII I', 'VII J',
  // Kelas IX
  'IX A', 'IX B', 'IX C', 'IX D', 'IX E', 'IX F', 'IX G', 'IX H', 'IX I', 'IX J'
];

export const DESTINATION_QUESTIONS: Record<DestinationType, Question[]> = {
  jogjakarta: [
    {
      id: 'jogja_q1',
      label: 'Objek wisata, sejarah, atau budaya apa saja yang kamu kunjungi selama kegiatan di Yogyakarta?',
      placeholder: 'Contoh: Saya mengunjungi Candi Prambanan, Keraton Yogyakarta, Museum Gunungapi Merapi, dan melakukan studi ilmiah di PIAT UGM...',
      type: 'textarea',
      required: true
    },
    {
      id: 'jogja_q2',
      label: 'Jelaskan nilai sejarah, cerita peninggalan, atau pengetahuan agroteknologi penting yang kamu pelajari dari objek-objek tersebut!',
      placeholder: 'Contoh: Di Candi Prambanan saya mempelajari relief kisah sejarah, di Keraton memahami filosofi kebudayaan Jawa, dan di PIAT UGM mempelajari pengelolaan pertanian ramah lingkungan serta daur ulang sampah organik...',
      type: 'textarea',
      required: true
    },
    {
      id: 'jogja_q3',
      label: 'Bagaimana keunikan adat istiadat, metode pembibitan/teknologi pangan, atau kuliner lokal yang kamu amati selama di Yogyakarta?',
      placeholder: 'Contoh: Saya mengamati teknologi pengolahan kompos dan kultur jaringan tanaman di PIAT UGM, serta mencicipi kuliner gudeg legendaris khas Yogyakarta...',
      type: 'textarea',
      required: true
    },
    {
      id: 'jogja_q4',
      label: 'Deskripsikan satu pengalaman belajar atau momen ilmiah yang paling berkesan bagimu selama berada di Yogyakarta!',
      placeholder: 'Contoh: Momen paling berkesan adalah ketika melihat langsung uji coba inovasi pupuk organik cair dan teknologi pemilahan sampah modern di PIAT UGM...',
      type: 'textarea',
      required: true
    },
    {
      id: 'jogja_q5',
      label: 'Berikan kesimpulan umum mengenai hasil kegiatan ini dan tuliskan saran agar pelaksanaan studi literasi berikutnya lebih baik lagi!',
      placeholder: 'Contoh: Studi literasi ini sangat memperluas wawasan kebudayaan dan sains kami. Masukan saya, durasi eksplorasi sains pertanian di PIAT UGM dapat diperpanjang...',
      type: 'textarea',
      required: true
    }
  ],
  blitar: [
    {
      id: 'blitar_q1',
      label: 'Sebutkan wahana edukasi, area pembibitan kakao, atau pos pengamatan pangan apa saja yang kamu kunjungi di Kampung Coklat Blitar!',
      placeholder: 'Contoh: Saya mengunjungi area pembibitan bibit buah kakao kering, menyusuri pabrik mesin pengolahan pasta coklat, serta pos studi pengolahan pangan...',
      type: 'textarea',
      required: true
    },
    {
      id: 'blitar_q2',
      label: 'Jelaskan proses pengolahan pangan coklat yang kamu pelajari (mulai dari pembibitan, panen, fermentasi biji kakao, hingga jadi produk siap saji)!',
      placeholder: 'Contoh: Proses di Kampung Coklat meliputi pemilahan buah, fermentasi alami selama beberapa hari untuk mengeluarkan aroma coklat, pengeringan, penyangraian (roasting), penggilingan pasta coklat, hingga pencetakan aneka coklat batangan...',
      type: 'textarea',
      required: true
    },
    {
      id: 'blitar_q3',
      label: 'Bagaimana peran pengolahan pangan modern dan edukasi agribisnis di Kampung Coklat dalam memajukan industri pangan lokal di Blitar?',
      placeholder: 'Contoh: Kampung Coklat berhasil mengintegrasikan sektor pertanian kakao tradisional dengan industri pangan modern bernilai tinggi, sekaligus membuka lapangan pekerjaan dan memberdayakan petani lokal di Blitar...',
      type: 'textarea',
      required: true
    },
    {
      id: 'blitar_q4',
      label: 'Gambarkan situasi atau pengalaman belajar praktik (seperti menghias coklat, mencicipi, atau teknik budidaya) yang paling berkesan di Kampung Coklat!',
      placeholder: 'Contoh: Pengalaman yang paling berkesan adalah saat mengikuti kelas memasak (cooking class) untuk menghias produk olahan coklat kami sendiri secara mandiri sesuai kreativitas...',
      type: 'textarea',
      required: true
    },
    {
      id: 'blitar_q5',
      label: 'Sebutkan kesimpulan keseluruhan dari perjalanan studi pengolahan pangan di Kampung Coklat, serta berikan saran perbaikan bagi fasilitas edukasi di sana!',
      placeholder: 'Contoh: Kunjungan ini sangat menginspirasi kami untuk berwirausaha pangan. Saran saya, penjelasan pemandu mengenai detail kimiawi pengawetan coklat alami bisa ditambahkan...',
      type: 'textarea',
      required: true
    }
  ],
  mandiri: [
    {
      id: 'mandiri_q1',
      label: 'Sebutkan nama tempat/Pabrik/UMKM lokal yang dikunjungi, alamat lengkapnya, serta jenis produk usaha yang dihasilkan!',
      placeholder: 'Contoh: Saya mengunjungi pabrik UMKM pembuatan Opak Gambir "Barokah" yang beralamat di Desa Gandusari Lor, Kecamatan Gandusari, Blitar. Jenis usahanya adalah camilan tradisional opak kering...',
      type: 'textarea',
      required: true
    },
    {
      id: 'mandiri_q2',
      label: 'Bagaimana detail proses produksi barang/pangan di Pabrik atau UMKM tersebut dari bahan baku mentah hingga barang siap dikemas?',
      placeholder: 'Contoh: Proses dimulai dengan memarut singkong dan mencampurkan tepung tapioka serta santan manis. Adonan kemudian dicetak satu-satu di wajan besi panas, digulung cepat selagi panas, lalu didinginkan sebelum masuk plastik...',
      type: 'textarea',
      required: true
    },
    {
      id: 'mandiri_q3',
      label: 'Tuliskan tantangan ekonomi, jumlah tenaga kerja (tetangga sekitar) yang terbantu, serta sejarah berdirinya usaha tersebut dari narasumber!',
      placeholder: 'Contoh: Usaha didirikan tahun 2015 untuk memanfaatkan singkong murah di desa. Saat ini memperkerjakan 4 orang ibu rumah tangga sekitar. Tantangan utama adalah cuaca mendung karena mereka mengandalkan sinar matahari...',
      type: 'textarea',
      required: true
    },
    {
      id: 'mandiri_q4',
      label: 'Cantumkan link Tautan Vlog Edukasi (Maksimal 3 Menit, Wajib Tanpa Musik Latar) yang sudah kamu unggah (di Drive/YouTube/Sosmed), serta ceritakan isi vlog-mu!',
      placeholder: 'Contoh: Link Vlog: https://youtu.be/contohvlogsiswa. Isi vlog yang saya buat berdurasi 2 menit 45 detik tanpa backsound musik, menampilkan wawancara pemilik dan demonstrasi penggorengan opak...',
      type: 'textarea',
      required: true
    },
    {
      id: 'mandiri_q5',
      label: 'Tuliskan kesimpulan berharga mengenai nilai kemandirian ekonomi, etos kerja, serta jiwa wirausaha yang kamu petik dari kunjungan industri ini!',
      placeholder: 'Contoh: Pelajaran terbesar adalah ketekunan dan gotong-royong. Ternyata usaha lokal kecil mampu menghidupkan perekonomian berkelanjutan bagi masyarakat sekitar desa kita...',
      type: 'textarea',
      required: true
    }
  ],
  teknologi_tepat_guna: [
    {
      id: 'ttg_q1',
      label: 'Sebutkan nama inovasi atau proyek Alat Teknologi Tepat Guna (TTG) yang kamu rancang, pelajari, atau buat!',
      placeholder: 'Contoh: Alat Penyaring Air Keruh Sederhana Menggunakan Bahan Alami Organik...',
      type: 'textarea',
      required: true
    },
    {
      id: 'ttg_q2',
      label: 'Jelaskan masalah lingkungan, sosial, atau tantangan harian di wilayah Gandusari / sekitar tempat tinggalmu yang ingin diselesaikan oleh alat ini!',
      placeholder: 'Contoh: Saat musim hujan, beberapa sumur warga di daerah Gandusari menjadi sangat keruh dan mengandung zat besi tinggi, sehingga menyulitkan kebutuhan air bersih untuk mencuci...',
      type: 'textarea',
      required: true
    },
    {
      id: 'ttg_q3',
      label: 'Uraikan bahan-bahan murah, ramah lingkungan, atau barang bekas yang digunakan serta langkah-langkah pembuatan alat tersebut!',
      placeholder: 'Contoh: Bahan yang digunakan adalah botol plastik bekas 1.5L, sabut kelapa pasir silika, arang kayu aktif, ijuk kelapa, dan batu kerikil kecil. Botol dibalik, lalu diisi bahan-bahan tersebut berlapis dari yang paling tebal ke yang paling halus...',
      type: 'textarea',
      required: true
    },
    {
      id: 'ttg_q4',
      label: 'Bagaimana hasil uji coba alat tersebut? Tuliskan kendala teknis yang dihadapi serta solusi perbaikan yang kamu lakukan!',
      placeholder: 'Contoh: Saat pertama dicoba air masih kehitaman karena debu arang. Solusinya, air dialirkan terus-menerus selama 10 menit terlebih dahulu sebagai pembilas alami, barulah air filtrasi berikutnya keluar sangat jernih dan bebas bau...',
      type: 'textarea',
      required: true
    },
    {
      id: 'ttg_q5',
      label: 'Berikan kesimpulan mengenai kelayakan alat ini untuk diproduksi mandiri oleh warga, serta saran untuk peningkatan kinerja teknologi tepat guna ini!',
      placeholder: 'Contoh: Alat ini sangat layak karena berbiaya di bawah Rp 10.000 dan bernilai guna tinggi. Saran peningkatannya adalah menambahkan saringan spons halus di kran keluarnya agar partikel mikro pasir tidak terbawa...',
      type: 'textarea',
      required: true
    }
  ]
};

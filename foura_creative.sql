-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 31, 2026 at 10:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foura_creative`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `username` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(150) DEFAULT '',
  `last_name` varchar(150) DEFAULT '',
  `email` varchar(255) DEFAULT '',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`id`, `username`, `password`, `first_name`, `last_name`, `email`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$L2inVNtZ4.wr3/ruEZ9hF.zjJ1aJq5CFoTbGPuVgQeZfiWbBhaFJi', 'Admin Foura', '', 'admin@foura.test', '2026-10-18 21:27:57', '2026-10-18 21:27:57'),
(3, 'budi', '$2a$10$pbyrqcLcZzk8QzVRATWQZONbURak3t.mCTFdFCdJ8nPGSWfnkjKmG', 'Budi', '', 'budi@foura.test', '2026-10-18 21:27:57', '2026-10-18 21:27:57'),
(4, 'shofiyah', '$2a$10$2wqHwlHO0q2zSLOkr0T8leVdKYO68czHGSev0ByX5t99ghuo2Ry.W', 'Shofiyah Jihan Aulia', '', 'shofiyahjihanauliaanwar@gmail.com', '2026-10-28 23:52:55', '2026-10-28 23:52:55');

-- --------------------------------------------------------

--
-- Table structure for table `category_product`
--

CREATE TABLE `category_product` (
  `id` int(11) NOT NULL,
  `name_kategori` varchar(100) NOT NULL,
  `deskripsi_kategori` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category_product`
--

INSERT INTO `category_product` (`id`, `name_kategori`, `deskripsi_kategori`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Paket Bundling', 'Solusi lengkap untuk mengelola media sosial bisnismu.', NULL, '2026-10-18 21:27:57', '2026-10-18 21:27:57'),
(2, 'Konten & Foto', 'Konten visual yang menarik untuk brand fashion.', NULL, '2026-10-18 21:27:57', '2026-10-18 21:27:57'),
(3, 'Manajemen Akun', 'Pengelolaan akun media sosial agar tetap aktif dan konsisten.', NULL, '2026-10-18 21:27:57', '2026-10-18 21:28:12'),
(4, 'Laporan & Konsultasi', 'Pantau performa dan dapatkan arahan strategi dari tim kami.', NULL, '2026-10-18 21:27:57', '2026-10-18 21:28:12');

-- --------------------------------------------------------

--
-- Table structure for table `keranjang`
--

CREATE TABLE `keranjang` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media_file`
--

CREATE TABLE `media_file` (
  `id` int(11) NOT NULL,
  `file` varchar(255) NOT NULL,
  `uploaded_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id` int(11) NOT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `nama_pelanggan` varchar(255) DEFAULT '',
  `total` int(11) DEFAULT 0,
  `status` varchar(255) DEFAULT 'menunggu',
  `tahap` int(11) DEFAULT 0,
  `tahap_tanggal` text DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pesanan_item`
--

CREATE TABLE `pesanan_item` (
  `id` int(11) NOT NULL,
  `pesanan_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `kategori` varchar(255) DEFAULT '',
  `harga` int(11) DEFAULT 0,
  `satuan` varchar(255) DEFAULT '',
  `jumlah` int(11) DEFAULT 1,
  `gambar` varchar(255) DEFAULT '',
  `fitur` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `name`, `deskripsi`, `price`, `image`, `created_at`, `updated_at`, `category_id`) VALUES
(1, 'Paket Basic', 'Cocok untuk bisnis yang baru memulai.', 500000.00, NULL, '2026-10-18 21:27:57', '2026-10-31 09:30:03', 1),
(2, 'Paket Pro', 'Untuk bisnis yang ingin lebih berkembang.', 1100000.00, NULL, '2026-10-18 21:27:57', '2026-10-31 09:30:03', 1),
(3, 'Paket Premium', 'Untuk brand yang ingin hasil maksimal.', 2000000.00, NULL, '2026-10-18 21:27:57', '2026-10-31 09:30:03', 1),
(14, 'Konten Feed Instagram', 'Desain feed Instagram yang rapi dan sesuai karakter brand.', 35000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 2),
(15, 'Konten Video TikTok', 'Video pendek untuk meningkatkan engagement.', 45000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 2),
(16, 'Sesi Foto Produk Profesional', 'Foto produk berkualitas tinggi dan estetik.', 350000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 2),
(17, 'Video Promosi Produk', 'Video promosi untuk menampilkan produk secara menarik.', 150000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 2),
(18, 'Desain Konten Promo Musiman', 'Desain promosi untuk momen spesial.', 200000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 2),
(19, 'Kelola Instagram', 'Pengelolaan akun Instagram secara rutin.', 130000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 3),
(20, 'Kelola TikTok', 'Pengelolaan akun TikTok secara rutin.', 130000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 3),
(21, 'Jadwal Posting Instagram', 'Penjadwalan posting Instagram agar konsisten.', 45000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 3),
(22, 'Jadwal Posting TikTok', 'Penjadwalan posting TikTok agar konsisten.', 45000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 3),
(23, 'Setup Awal Akun', 'Penyiapan akun media sosial dari awal.', 200000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 3),
(24, 'Riset & Strategi Konten Bulanan', 'Riset tren dan rencana konten untuk satu bulan.', 150000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 3),
(25, 'Laporan Performa Sederhana', 'Ringkasan performa akun media sosial.', 75000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 4),
(26, 'Laporan Performa Detail', 'Analisis performa akun yang lebih mendalam.', 175000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 4),
(27, 'Sesi Konsultasi Strategi', 'Diskusi strategi konten bersama tim kami.', 100000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 4),
(28, 'Paket Konsultasi Rutin', 'Konsultasi berkala untuk menjaga arah strategi.', 180000.00, NULL, '2026-10-18 21:28:12', '2026-10-31 09:30:03', 4);

-- --------------------------------------------------------

--
-- Table structure for table `product_media`
--

CREATE TABLE `product_media` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` int(11) NOT NULL,
  `media_file_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_admin`
--

CREATE TABLE `user_admin` (
  `id` int(11) NOT NULL,
  `alamat` text DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_admin`
--

INSERT INTO `user_admin` (`id`, `alamat`, `no_hp`, `created_at`, `updated_at`, `user_id`, `foto`) VALUES
(1, NULL, NULL, '2026-10-18 21:27:57', '2026-10-18 21:27:57', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_costumer`
--

CREATE TABLE `user_costumer` (
  `id` int(11) NOT NULL,
  `alamat` text DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `nama_umkm` varchar(150) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_costumer`
--

INSERT INTO `user_costumer` (`id`, `alamat`, `no_hp`, `created_at`, `updated_at`, `user_id`, `nama_umkm`, `foto`) VALUES
(1, NULL, NULL, '2026-10-18 21:27:57', '2026-10-18 21:27:57', 3, NULL, NULL),
(2, '-', '082293658120', '2026-10-28 23:52:55', '2026-10-31 03:58:30', 4, '-', '/uploads/profil/u4-1793419110971.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `category_product`
--
ALTER TABLE `category_product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `keranjang`
--
ALTER TABLE `keranjang`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media_file`
--
ALTER TABLE `media_file`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`);

--
-- Indexes for table `pesanan_item`
--
ALTER TABLE `pesanan_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_media`
--
ALTER TABLE `product_media`
  ADD PRIMARY KEY (`product_id`,`media_file_id`),
  ADD KEY `media_file_id` (`media_file_id`);

--
-- Indexes for table `user_admin`
--
ALTER TABLE `user_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_costumer`
--
ALTER TABLE `user_costumer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `category_product`
--
ALTER TABLE `category_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `keranjang`
--
ALTER TABLE `keranjang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `media_file`
--
ALTER TABLE `media_file`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pesanan_item`
--
ALTER TABLE `pesanan_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `user_admin`
--
ALTER TABLE `user_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_costumer`
--
ALTER TABLE `user_costumer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category_product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_media`
--
ALTER TABLE `product_media`
  ADD CONSTRAINT `product_media_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_media_ibfk_2` FOREIGN KEY (`media_file_id`) REFERENCES `media_file` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_admin`
--
ALTER TABLE `user_admin`
  ADD CONSTRAINT `user_admin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_costumer`
--
ALTER TABLE `user_costumer`
  ADD CONSTRAINT `user_costumer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

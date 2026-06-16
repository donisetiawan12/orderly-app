-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 16 Jun 2026 pada 16.41
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `orderly_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(2, 4, 2, 3, '2026-06-16 09:33:38', '2026-06-16 09:33:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `slug`, `created_at`, `updated_at`, `image`) VALUES
(1, 'Makanan', 'Aneka makanan berat dan jajanan kampus.', 'makanan', '2026-05-28 19:22:56', '2026-06-12 19:40:16', 'makanan.jpeg'),
(2, 'Minuman', 'Kopi, teh, jus, dan minuman segar lainnya', 'minuman', '2026-05-28 19:22:56', '2026-06-16 12:20:01', 'minuman.jpeg'),
(3, 'Elektronik', 'Charger, kabel data, flashdisk, dan aksesori gadget.', 'elektronik', '2026-05-28 19:22:56', '2026-06-12 19:44:44', 'elektronik.jpeg'),
(4, 'ATK & Buku', 'Alat tulis, buku catatan, dan keperluan tugas.', 'atk-buku', '2026-05-28 19:22:56', '2026-06-12 19:44:52', 'atk.jpeg'),
(5, 'Fashion', 'Jaket almamater, kaos, dan perlengkapan kampus.', 'fashion', '2026-05-28 19:22:56', '2026-06-12 19:44:57', 'fashion.jpeg'),
(7, 'jasa', 'membuat kategori jasa', '', '2026-05-30 18:41:00', '2026-05-30 19:42:06', 'jasa.jpeg');

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('pending','paid','confirmed','shipped','completed','cancelled','canceled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `buyer_id`, `product_id`, `seller_id`, `quantity`, `total_price`, `status`, `payment_method`, `payment_proof`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 2, 2, 30000.00, 'completed', 'Transfer Bank', 'proof_doni.jpg', 'Ayamnya bagian paha aja ya bray.', '2026-06-16 09:33:38', '2026-06-16 09:33:38'),
(3, 3, 2, 2, 1, 12000.00, 'completed', 'Transfer Bank', NULL, 'Nanti diambil pas jam istirahat.', '2026-06-16 09:33:38', '2026-06-16 09:41:41'),
(5, 3, 1, 2, 1, 15000.00, 'completed', 'qris', 'test.jpeg', NULL, '2026-06-16 09:58:02', '2026-06-16 13:18:22'),
(6, 3, 3, 2, 2, 50000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:30:46', '2026-06-16 14:30:46'),
(7, 3, 1, 2, 3, 45000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:32:10', '2026-06-16 14:32:10'),
(8, 3, 2, 2, 3, 36000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:32:10', '2026-06-16 14:32:10'),
(9, 3, 1, 2, 1, 15000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:32:41', '2026-06-16 14:32:41'),
(10, 3, 2, 2, 1, 12000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:33:40', '2026-06-16 14:33:40'),
(11, 3, 2, 2, 1, 12000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:33:45', '2026-06-16 14:33:45'),
(12, 3, 2, 2, 1, 12000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:34:17', '2026-06-16 14:34:17'),
(13, 3, 1, 2, 2, 30000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:37:08', '2026-06-16 14:37:08'),
(14, 3, 2, 2, 1, 12000.00, 'pending', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-16 14:37:41', '2026-06-16 14:37:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `po_quota` int(11) DEFAULT 0,
  `po_deadline` datetime DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location` varchar(100) DEFAULT NULL,
  `sold_quantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `seller_id`, `category_id`, `name`, `description`, `price`, `quantity`, `image`, `po_quota`, `po_deadline`, `status`, `created_at`, `updated_at`, `location`, `sold_quantity`) VALUES
(1, 2, 1, 'Nasi Ayam Geprek Kampus', 'Ayam geprek krispi dengan sambal korek membara plus nasi hangat.', 15000.00, 0, 'ayam-geprel.jpeg', 50, '2026-06-30 03:00:00', 'active', '2026-06-16 09:33:38', '2026-06-16 14:37:08', 'Kampus B', 8),
(2, 2, 2, 'Es Kopi Susu Gula Aren', 'Espresso premium ditambah susu segar dan manisnya gula aren asli.', 12000.00, 40, '1781603778465-natrix.png', 0, NULL, 'active', '2026-06-16 09:33:38', '2026-06-16 14:37:41', 'Kantin Utama', 7),
(3, 2, 3, 'Kabel Data Type-C Fast Charging', 'Kabel data awet dukung pengisian daya cepat 60W.', 25000.00, 15, '1781615626806-_ (1).jpeg', 0, NULL, 'active', '2026-06-16 09:33:38', '2026-06-16 14:30:46', 'Koperasi Mahasiswa', 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `reviews`
--

INSERT INTO `reviews` (`id`, `order_id`, `buyer_id`, `seller_id`, `product_id`, `rating`, `comment`, `created_at`) VALUES
(1, 11, 1, 1, 1, 5, 'Rasanya mantap banget bro, porsinya juga mengenyangkan. Pas buat anak kos!', '2026-06-16 13:43:03'),
(2, 12, 1, 1, 1, 4, 'Enak bray! Cuma sambelnya kurang banyak dikit, next time tambahin ya.', '2026-06-16 13:43:03'),
(3, 13, 1, 1, 1, 5, 'Gokil sih ini, respon penjualnya cepet banget langsung dikonfirmasi.', '2026-06-16 13:43:03'),
(4, 14, 1, 1, 1, 3, 'Rasa oke lah standar, cuma pas dateng makanannya agak dingin sedikit.', '2026-06-16 13:43:03'),
(5, 15, 1, 1, 1, 5, 'Gak nyesel beli di sini, recommended banget buat dicoba temen-temen Kampus A!', '2026-06-16 13:43:03'),
(6, 16, 1, 1, 1, 4, 'Bintang 4 dulu, kalau besok rasanya tetep konsisten gua kasih bintang 5.', '2026-06-16 13:43:03'),
(7, 17, 1, 1, 1, 2, 'Porsinya agak lebih sedikit dari biasanya nih bray, rasanya sih tetep juara.', '2026-06-16 13:43:03'),
(8, 18, 1, 1, 1, 5, 'Langganan tiap minggu di sini, gak pernah ngecewain rasanya top bgt!', '2026-06-16 13:43:03'),
(9, 19, 1, 1, 1, 4, 'Packing-nya rapi, aman sentosa gak ada yang tumpah pas sampe.', '2026-06-16 13:43:03'),
(10, 20, 1, 1, 1, 5, 'Juara umum sih ini mah! Murah meriah tapi rasanya ga murahan.', '2026-06-16 13:43:03');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','seller','buyer') DEFAULT 'buyer',
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `ktm_path` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `verification_status`, `ktm_path`, `phone`, `address`, `profile_picture`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@gmail.com', '$2b$10$ftmlH7dDGBbTN87eFLE0.e1YSJ5GN7Ihwotxo1TyMJSkI1z96NQ2q', 'admin', 'approved', NULL, '0878736238', 'Jl.Administrator No.99999, RT.000/9999, KP.AdminajaYangtau', 'ktm-1781613535060.jpeg', '2026-06-16 09:28:01', '2026-06-16 12:50:45'),
(2, 'seller', 'seller@gmail.com', '$2b$10$PMlpyrPe2a2Zrp30zoBooe/HThQ95EM9tyiY8imNfpaXEmiQQms8K', 'seller', 'approved', 'uploads/ktm/ktm-1781602125058.jpeg', NULL, NULL, 'ktm-1781605101907.jpeg', '2026-06-16 09:28:45', '2026-06-16 10:18:21'),
(3, 'Doni Setiawan', 'buyer@gmail.com', '$2b$10$e8Aq68Vq0Q103wHR4S8Eguvx8XeN.9jRXErNOarYJzmlE3JlpSKw2', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-16 09:30:29', '2026-06-16 09:30:29'),
(4, 'Reza ', 'buyer2@gmail.com', '$2b$10$sU4o7cXKvBOOFWUTpbd/ZeaCHkFn3B8mJ0rFOKoIcOX.M/TU9Rx7e', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-16 09:30:52', '2026-06-16 09:30:52');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_user_cart` (`user_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

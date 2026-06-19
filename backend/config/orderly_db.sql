-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 19 Jun 2026 pada 22.44
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
(23, 3, 4, 2, 2, 36000.00, 'completed', 'Transfer Bank', 'pay-seblak-lunas.jpeg', 'Kerupuknya jangan pelit bray, sama pisahin ranjau cabenya!', '2026-06-17 03:00:00', '2026-06-17 17:40:13'),
(24, 3, 5, 2, 3, 15000.00, 'completed', 'Transfer Bank', 'pay-esteh.jpeg', 'Plastikin aja bray, sedotannya minta dua kali aja gua mau patungan ama gebetan.', '2026-06-17 03:00:00', '2026-06-17 17:40:13'),
(25, 3, 6, 2, 1, 85000.00, 'cancelled', 'Transfer Bank', NULL, 'Kirim ke perpus lantai 3 bray, gua lagi nyamar jadi mahasiswa rajin.', '2026-06-17 16:15:00', '2026-06-17 18:43:08'),
(26, 3, 5, 2, 1, 5000.00, 'cancelled', 'Transfer Bank', NULL, 'Esnya dikit aja biar kaga kembung.', '2026-06-17 16:15:00', '2026-06-17 17:45:29'),
(27, 3, 4, 2, 1, 18000.00, 'cancelled', 'Transfer Bank', NULL, 'Gajadi bray, dompet gua ketinggalan di jok motor temen.', '2026-06-17 01:00:00', '2026-06-17 17:40:13'),
(28, 3, 5, 2, 1, 5000.00, 'cancelled', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-17 17:45:20', '2026-06-17 18:06:23'),
(29, 3, 6, 2, 1, 85000.00, 'completed', 'Transfer Bank', 'pay-1781719043242.jpeg', 'Mantap Cek  Dulu deh', '2026-06-17 17:47:00', '2026-06-17 18:00:59'),
(30, 3, 5, 2, 1, 5000.00, 'completed', 'Transfer Bank', 'pay-1781721608645.jpeg', 'Pre-order via web', '2026-06-17 18:28:32', '2026-06-17 18:44:11'),
(31, 3, 6, 2, 1, 85000.00, 'completed', 'Transfer Bank', 'pay-1781721596096.jpeg', 'Pre-order via web', '2026-06-17 18:36:47', '2026-06-17 18:44:13'),
(32, 3, 6, 2, 1, 85000.00, 'cancelled', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-17 18:36:51', '2026-06-17 18:39:30'),
(33, 3, 6, 2, 1, 85000.00, 'cancelled', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-17 18:36:57', '2026-06-17 18:39:28'),
(34, 3, 6, 2, 2, 170000.00, 'completed', 'Transfer Bank', 'pay-1781721653929.jpeg', 'Pre-order via web', '2026-06-17 18:40:27', '2026-06-17 18:44:17'),
(35, 3, 5, 2, 2, 10000.00, 'cancelled', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-17 18:41:09', '2026-06-17 18:41:21'),
(36, 3, 5, 2, 1, 5000.00, 'completed', 'Transfer Bank', 'pay-1781721714605.jpeg', 'Pre-order via web', '2026-06-17 18:41:31', '2026-06-17 18:44:19'),
(37, 3, 6, 2, 1, 85000.00, 'completed', 'Transfer Bank', 'pay-1781722087885.jpeg', 'Pre-order via web', '2026-06-17 18:47:50', '2026-06-17 18:48:25'),
(38, 3, 5, 2, 3, 15000.00, 'cancelled', 'Transfer Bank', NULL, 'Pre-order via web', '2026-06-17 20:01:42', '2026-06-17 20:01:55'),
(39, 3, 5, 2, 3, 15000.00, 'completed', 'Transfer Bank', 'pay-1781726539389.jpeg', 'Pre-order via web', '2026-06-17 20:02:07', '2026-06-17 20:02:43'),
(40, 3, 6, 2, 1, 85000.00, 'completed', 'Transfer Bank', 'pay-1781875327042.jpeg', 'Pre-order via web', '2026-06-19 13:21:29', '2026-06-19 13:22:30'),
(41, 3, 5, 2, 1, 5000.00, 'cancelled', 'Transfer Bank', 'pay-1781876082961.jpeg', 'Pre-order via web', '2026-06-19 13:34:22', '2026-06-19 13:35:12'),
(42, 3, 6, 2, 1, 85000.00, 'completed', 'Transfer Bank', 'pay-1781879071095.jpeg', 'Pre-order via web', '2026-06-19 14:24:18', '2026-06-19 14:25:08'),
(43, 3, 5, 2, 4, 20000.00, 'completed', 'Transfer Bank', 'pay-1781893019421.png', 'Pre-order via web', '2026-06-19 18:16:40', '2026-06-19 18:21:06'),
(44, 3, 6, 2, 1, 85000.00, 'paid', 'Transfer Bank', 'pay-1781897924805.png', 'Pre-order via web', '2026-06-19 19:38:35', '2026-06-19 19:38:44'),
(45, 3, 10, 11, 1, 312312.00, 'completed', 'Transfer Bank', 'pay-1781898919085.jpeg', 'Pre-order via web', '2026-06-19 19:55:01', '2026-06-19 19:55:58'),
(46, 3, 10, 11, 1, 312312.00, 'cancelled', 'Transfer Bank', 'pay-1781899112385.jpeg', 'Pre-order via web', '2026-06-19 19:58:20', '2026-06-19 19:59:21');

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
(4, 2, 1, 'Seblak Mercon Level Ku Menangis', 'Seblak yang level pedesnya bikin lu inget dosa masa lalu dan auto-tobat di tempat.', 18000.00, 0, '1781718131465-seblak.webp', 30, '2026-06-30 05:00:00', 'active', '2026-06-17 17:40:13', '2026-06-17 17:42:11', 'Kantin Teknik', 45),
(5, 2, 2, 'Es Teh Manis Dingin (Tanpa PHP)', 'Seger banget bray, manisnya konsisten, kagak kayak janji mantan lu yang penuh kepalsuan.', 5000.00, 100, '1781718227571-esteh.jpeg', 0, '2026-06-22 04:00:00', 'active', '2026-06-17 17:40:13', '2026-06-19 18:16:40', 'Kantin Utama', 128),
(6, 2, 3, 'Powerbank Solar Anti Kiamat', 'Bisa dicharge pake sinar matahari. Pas banget buat mahasiswa yang kosannya sering token listriknya bunyi itut-itut.', 85000.00, 5, '1781718269874-bp.jpeg', 0, NULL, 'active', '2026-06-17 17:40:13', '2026-06-19 19:38:35', 'Koperasi Pusat', 9),
(7, 2, 2, 'sa', 's', 123.00, 32, NULL, 0, NULL, 'active', '2026-06-19 19:11:33', '2026-06-19 19:11:33', 'Kampus A', 0),
(8, 2, 2, 'sas', '', 3232.00, 32, NULL, 0, NULL, 'active', '2026-06-19 19:11:41', '2026-06-19 19:11:41', 'Kampus A', 0),
(10, 11, 1, 'Produk Seller 123', 'dsd', 312312.00, 0, '1781898863533-_ (10).jpeg', 50, '2026-06-30 05:57:00', 'active', '2026-06-19 19:54:23', '2026-06-19 19:59:21', 'Kampus B', 1),
(11, 11, 2, 'sas', '211', 2.00, 12, NULL, 0, NULL, 'active', '2026-06-19 19:59:02', '2026-06-19 19:59:02', 'Kampus A', 0);

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
  `reply_comment` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `reviews`
--

INSERT INTO `reviews` (`id`, `order_id`, `buyer_id`, `seller_id`, `product_id`, `rating`, `comment`, `reply_comment`, `replied_at`, `created_at`) VALUES
(15, 23, 3, 2, 4, 5, 'Gokil seblaknya bray! Baru makan satu sendok langsung keringet dingin, dosen penguji lewat aja sampe kaga gua salamin.', NULL, NULL, '2026-06-17 04:30:00'),
(16, 24, 3, 2, 5, 4, 'Es tehnya oke seger, tapi abang sellernya senyumnya manis banget, saingan ama gulanya huff.', NULL, NULL, '2026-06-17 04:35:00'),
(17, 99, 4, 2, 4, 1, 'Pedesnya kaga ngotak! Gua makan malemnya, paginya pas di toilet serasa dapet cobaan hidup paling berat. Bintang 1 dulu biar sellernya mikir.', NULL, NULL, '2026-06-16 13:00:00'),
(18, 100, 4, 2, 6, 5, 'Powerbanknya mantap bray. Kemarin gua jemur di genteng seharian, pas malem bisa dipake buat ngelingling kosan bapak kos yang mati lampu.', NULL, NULL, '2026-06-16 14:00:00'),
(19, 29, 3, 2, 6, 5, 'wihh mantep pw nya berfungsi dengan baik', NULL, NULL, '2026-06-17 18:01:21'),
(20, 36, 3, 2, 5, 3, 'KO TUMOAH', NULL, NULL, '2026-06-17 18:44:47'),
(21, 34, 3, 2, 6, 1, 'PAIT', NULL, NULL, '2026-06-17 18:45:16'),
(22, 31, 3, 2, 6, 1, 'RUSAK', NULL, NULL, '2026-06-17 18:46:09'),
(23, 30, 3, 2, 5, 1, 'PAOT', NULL, NULL, '2026-06-17 18:46:17'),
(24, 37, 3, 2, 6, 5, 'KEREN CANGGIH', NULL, NULL, '2026-06-17 18:48:49'),
(25, 39, 3, 2, 5, 5, 'ENAK', NULL, NULL, '2026-06-17 20:03:03'),
(26, 40, 3, 2, 6, 5, 'mnto', NULL, NULL, '2026-06-19 13:22:50'),
(27, 41, 3, 2, 6, 2, 'dsds', NULL, NULL, '2026-06-19 13:23:56'),
(28, 42, 3, 2, 6, 5, 'KEREN', 'mang eya', '2026-06-19 20:16:34', '2026-06-19 14:25:22'),
(29, 43, 3, 2, 5, 5, 'enak', 'Makasih kak', '2026-06-19 20:15:32', '2026-06-19 18:21:43'),
(30, 45, 3, 11, 10, 1, 'Mantap Dah', 'Terimakasih kak hehe', '2026-06-19 20:10:20', '2026-06-19 19:56:24');

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
(4, 'Reza ', 'buyer2@gmail.com', '$2b$10$sU4o7cXKvBOOFWUTpbd/ZeaCHkFn3B8mJ0rFOKoIcOX.M/TU9Rx7e', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-16 09:30:52', '2026-06-16 09:30:52'),
(5, 'DOni stwn', 'doni@gmail.com', '$2b$10$UUqMnVrBkY29FJi7.j5Y3eKwE5PrOAi4hf/CDBNAoqGBYz1SqoTlq', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-16 17:35:23', '2026-06-16 17:35:23'),
(8, 'res', 'tes@gmail.com', '$2b$10$l5JCvobVUusW8cg7cx4obeOK7vixbD0li2qrZgOZUV9jIdhBed6gG', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-16 17:46:45', '2026-06-16 17:46:45'),
(10, 'sa', 'sas@gmail.com', '$2b$10$xPAvh7Bg8mOqJn/JbqjgNuj7u4Zw0o.SVK0Aw9Ox0pmVrmxxw9zRq', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-19 14:53:31', '2026-06-19 14:53:31'),
(11, 'seller123', 'seller123@gmail.com', '$2b$10$.AWdzznuwkDprGBMR7yu7.tgArnFvcR4M3wTQpWqFfstdkHRvjXdm', 'seller', 'approved', 'uploads/ktm/ktm-1781896597755.jpeg', NULL, NULL, NULL, '2026-06-19 19:16:38', '2026-06-19 19:17:01');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 13 Jun 2026 pada 23.19
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
(2, 'Minuman', 'Kopi, teh, jus, dan minuman segar lainnya.', 'minuman', '2026-05-28 19:22:56', '2026-06-12 19:44:35', 'minuman.jpeg'),
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
  `payment_id_gateway` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','success','failed','expired') DEFAULT 'pending',
  `buyer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('pending','paid','confirmed','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `payment_id_gateway`, `payment_status`, `buyer_id`, `product_id`, `seller_id`, `quantity`, `total_price`, `status`, `payment_method`, `payment_proof`, `notes`, `created_at`, `updated_at`) VALUES
(1, NULL, 'pending', 2, 1, 1, 1, 15000.00, 'completed', NULL, NULL, NULL, '2026-06-13 16:17:07', '2026-06-13 18:17:07'),
(2, NULL, 'pending', 2, 1, 1, 1, 12000.00, 'completed', NULL, NULL, NULL, '2026-06-13 13:17:07', '2026-06-13 19:10:40'),
(3, NULL, 'pending', 2, 1, 1, 2, 30000.00, 'completed', NULL, NULL, NULL, '2026-06-12 18:17:07', '2026-06-13 18:36:52'),
(4, NULL, 'pending', 2, 1, 1, 1, 12000.00, 'completed', NULL, NULL, NULL, '2026-06-11 18:17:07', '2026-06-13 19:10:43'),
(5, NULL, 'pending', 2, 1, 1, 1, 15000.00, 'completed', NULL, NULL, NULL, '2026-06-10 18:17:07', '2026-06-13 18:17:07'),
(6, NULL, 'pending', 2, 1, 1, 1, 15000.00, 'completed', NULL, NULL, NULL, '2026-06-09 18:17:07', '2026-06-13 18:36:57'),
(7, NULL, 'pending', 2, 1, 1, 1, 12000.00, 'completed', NULL, NULL, NULL, '2026-06-08 18:17:07', '2026-06-13 19:10:45');

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
(1, 1, 1, 'Ayam Katsu', 'Ayam KAtsu enak', 20000.00, 0, '1781375300982-_ (3).jpeg', 50, '2026-06-27 01:35:00', 'active', '2026-06-13 18:26:37', '2026-06-13 18:28:20', 'Kampus B', 0);

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
(1, 1, 2, 1, 1, 5, 'Gilaaa ini nasi goreng spesialnya enak banget! Bumbunya pas, porsinya juga ngebantu banget buat kantong mahasiswa. Fix bakal langganan sih bro!', '2026-06-13 16:17:07'),
(2, 2, 2, 1, 1, 4, 'Mie ayamnya empuk dan baksonya berasa daging banget bray. Cuma sayang tadi kuahnya agak sedikit dingin pas dateng, tapi overall rasanya tetep oke.', '2026-06-13 13:17:07'),
(3, 3, 2, 1, 1, 5, 'Nasi gorengnya mantap! Wanginya khas banget, porsinya kuli cocok buat nemenin nugas malem.', '2026-06-12 18:17:07'),
(4, 4, 2, 1, 1, 5, 'Mie ayamnya seger parah bray! Manis gurihnya pas kagak bikin enek di tenggorokan. Pas banget dimakan pas kelar kelas siang bolong.', '2026-06-11 18:17:07'),
(5, 5, 2, 1, 1, 3, 'Rasanya sih oke, cuma kerupuknya tadi agak memble alias mleemem bray. Semoga ke depannya bisa lebih diperhatikan bungkusnya.', '2026-06-10 18:17:07'),
(6, 6, 2, 1, 1, 4, 'Repeat order nasi gorengnya bray, rasanya konsisten tetep enak kayak biasa. Pengiriman ke area Kampus A juga cepet gak pake lama.', '2026-06-09 18:17:07'),
(7, 7, 2, 1, 1, 5, 'Mie ayam bakso terenak di area kampus sih ini! Kuahnya gurih, sambelnya pedes nampol abis. Rekomendasi buat yang bingung nyari makan siang.', '2026-06-08 18:17:07');

-- --------------------------------------------------------

--
-- Struktur dari tabel `seller_payments`
--

CREATE TABLE `seller_payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_name` varchar(150) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `qris_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `seller_payments`
--

INSERT INTO `seller_payments` (`id`, `user_id`, `bank_name`, `account_name`, `account_number`, `qris_image`, `created_at`, `updated_at`) VALUES
(1, 1, 'MANDIRI ', 'DONI SETIAWANa', '121324324324', 'qris-1781384029157-297487991.jpeg', '2026-06-13 20:32:25', '2026-06-13 20:54:00');

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
(1, 'seller', 'seller@gmail.com', '$2b$10$dahPLwA5dT32AC3TmqjPp.7ujNSzw7ERMcYlsVeEv6U0u36X2iI7e', 'seller', 'approved', 'uploads/ktm/ktm-1781374839347.png', NULL, NULL, NULL, '2026-06-13 18:20:39', '2026-06-13 20:29:02'),
(2, 'buyer', 'buyer@gmail.com', '$2b$10$qR7UnEEHdMz6tyb9bBsEOegcZLbOZhxuz/GaCKMhSdlT6oBpQo4AG', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-13 18:17:07', '2026-06-13 18:17:07'),
(6, 'tes3', 'tes3@gmail.com', '$2b$10$Eh9hOCKxEr7Pnkm3cHAyFOAd5dTeGtM1fAEVVGbYWi2JY6IQW3o6a', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-13 18:17:07', '2026-06-13 18:17:07'),
(9, 'buyer1', 'buyer1@gmail.com', '$2b$10$iLP48IxMpD9A0o3Ve96LsuokWPT2AmkY1ghcWqj.TBRYKh0zbFam.', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-13 18:17:07', '2026-06-13 18:17:07'),
(11, 'admin', 'admin@gmail.com', '$2b$10$3Pf2w53p0.MmmXWz5XBDp.cJlZl1RKaNmbLE8yyi7t6ywpFI3EHIm', 'admin', 'approved', 'uploads/ktm/ktm-1781374878329.png', NULL, NULL, NULL, '2026-06-13 18:21:18', '2026-06-13 18:21:34');

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_buyer_id` (`buyer_id`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

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
-- Indeks untuk tabel `seller_payments`
--
ALTER TABLE `seller_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `seller_payments`
--
ALTER TABLE `seller_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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

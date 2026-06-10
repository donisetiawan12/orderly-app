-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 10 Jun 2026 pada 21.03
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
(1, 'Makanan', 'Aneka makanan berat dan jajanan kampus.', 'makanan', '2026-05-28 19:22:56', '2026-05-30 19:32:37', 'makanan.png'),
(2, 'Minuman', 'Kopi, teh, jus, dan minuman segar lainnya.', 'minuman', '2026-05-28 19:22:56', '2026-05-30 19:41:02', 'minuman.png'),
(3, 'Elektronik', 'Charger, kabel data, flashdisk, dan aksesori gadget.', 'elektronik', '2026-05-28 19:22:56', '2026-05-30 19:02:12', 'elektronik.jpg'),
(4, 'ATK & Buku', 'Alat tulis, buku catatan, dan keperluan tugas.', 'atk-buku', '2026-05-28 19:22:56', '2026-05-30 19:02:12', 'atk.jpg'),
(5, 'Fashion', 'Jaket almamater, kaos, dan perlengkapan kampus.', 'fashion', '2026-05-28 19:22:56', '2026-05-30 19:41:43', 'fashion.png'),
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
  `status` enum('pending','paid','confirmed','shipped','completed') DEFAULT 'pending',
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
(1, 2, 1, 1, 19, 20000.00, 'completed', NULL, 'test.jpg', 'mantap', '2026-05-30 20:25:03', '2026-05-30 20:25:33');

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
  `location` varchar(100) DEFAULT 'Kampus A',
  `sold_quantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `seller_id`, `category_id`, `name`, `description`, `price`, `quantity`, `image`, `po_quota`, `po_deadline`, `status`, `created_at`, `updated_at`, `location`, `sold_quantity`) VALUES
(1, 1, 1, 'Nasi Goreng Spesial', 'Nasi goreng dengan bumbu rempah rahasia.', 15000.00, 20, 'nasigoreng.jpg', 0, '2026-05-31 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(2, 1, 1, 'Mie Ayam Bakso', 'Mie kenyal dengan topping ayam cincang.', 12000.00, 25, 'miayambakso.jpeg', 0, '2026-05-31 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(3, 1, 2, 'Kopi Arabika', 'Kopi asli dari dataran tinggi.', 10000.00, 30, 'kopiarabika.jpeg', 0, '2026-06-01 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 18:03:38', 'Kampus A', 0),
(4, 1, 2, 'Es Teh Manis', 'Teh segar dengan rasa manis yang pas.', 5000.00, 50, 'estehmanis.jpeg', 0, '2026-06-01 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 18:05:12', 'Kampus A', 0),
(5, 1, 3, 'Kabel Data Type-C', 'Fast charging untuk perangkat Android.', 25000.00, 10, 'kabeldata.jpg', 0, '2026-06-01 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 18:26:55', 'Kampus A', 0),
(6, 1, 3, 'Flashdisk 32GB', 'Penyimpanan data cepat dan awet.', 65000.00, 5, 'flashdisk.jpg', 0, '2026-06-03 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(7, 1, 4, 'Buku Catatan A5', 'Buku tulis untuk keperluan kuliah.', 7000.00, 40, 'buku.jpg', 0, '2026-06-03 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(8, 1, 4, 'Pulpen Gel Hitam', 'Pulpen nyaman untuk menulis tugas.', 3500.00, 100, 'pulpen.jpg', 0, '2026-06-05 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(9, 1, 5, 'Kaos Polos Cotton', 'Bahan katun adem, nyaman dipakai.', 45000.00, 20, 'kaos.jpg', 0, '2026-06-05 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(10, 1, 5, 'Jaket Hoodie', 'Hoodie tebal dengan desain simpel.', 120000.00, 10, 'hoodie.jpg', 0, '2026-06-05 23:59:59', 'active', '2026-05-29 15:31:57', '2026-05-30 20:58:44', 'Kampus A', 0),
(11, 3, 7, 'Jasa Membuat Website', 'Jasa Pembuatan Website Developer sampai hosting dengan vps gratis dan bebas domaind', 500000.00, 0, 'default.jpg', 0, NULL, 'active', '2026-05-30 18:43:06', '2026-05-30 18:43:06', 'Kampus A', 0);

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

-- --------------------------------------------------------

--
-- Struktur dari tabel `seller_stats`
--

CREATE TABLE `seller_stats` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `total_sold` int(11) DEFAULT 0,
  `total_revenue` decimal(12,2) DEFAULT 0.00,
  `rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Admin', 'admin@gmail.com', '$2b$10$UXfajGH6Np456xCUMwauGOz9Lsm/VNzxIhOEddKlBcFsmgXkSBaEK', 'admin', 'approved', NULL, NULL, NULL, NULL, '2026-05-27 15:51:45', '2026-05-27 15:52:08'),
(2, 'buyer', 'buyer@gmail.com', '$2b$10$qR7UnEEHdMz6tyb9bBsEOegcZLbOZhxuz/GaCKMhSdlT6oBpQo4AG', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-05-27 15:52:41', '2026-05-27 15:52:41'),
(3, 'seller', 'seller@gmail.com', '$2b$10$sIs/iUczCdAqr.ydlhz3s.dITgqPzBGlGjET4lzwtaSd/SFJ53Ksq', 'seller', 'approved', 'uploads/ktm/ktm-1779897267043.png', NULL, NULL, NULL, '2026-05-27 15:54:27', '2026-05-27 15:56:41'),
(4, 'tes1', 'tes@gmail.com', '$2b$10$dogwqHszwsm6I8TJ3r8HzO2n62ykwp0c/FR1buAAmNUtUPWyi65eq', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-10 14:02:30', '2026-06-10 14:02:30'),
(5, 'tes2', 'tes2@gmail.com', '$2b$10$Ij1P.l0YIOiMCXOX7Yrh7utgBUUTSnZTpyOVTtxaTnLvIni7ACwTG', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-10 14:03:30', '2026-06-10 14:03:30'),
(6, 'tes3', 'tes3@gmail.com', '$2b$10$Eh9hOCKxEr7Pnkm3cHAyFOAd5dTeGtM1fAEVVGbYWi2JY6IQW3o6a', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-10 14:09:32', '2026-06-10 14:09:32'),
(7, 'seller1', 'seller1@gmail.com', '$2b$10$4Jziw0v6IW9m88YjBuwHQ.JQU/016W.Is08fquWpLqnbq03SoSiZi', 'seller', 'approved', 'uploads/ktm/ktm-1781101182631.png', NULL, NULL, NULL, '2026-06-10 14:19:42', '2026-06-10 14:20:01'),
(8, 'seller2', 'seller2@gmail.com', '$2b$10$VpBfW0br1EJmP/qrmzloauSYL77/4UvFiEEIILQBfj4wun7tFKuA6', 'seller', 'approved', 'uploads/ktm/ktm-1781101818606.jpeg', NULL, NULL, NULL, '2026-06-10 14:30:18', '2026-06-10 14:30:45'),
(9, 'buyer1', 'buyer1@gmail.com', '$2b$10$iLP48IxMpD9A0o3Ve96LsuokWPT2AmkY1ghcWqj.TBRYKh0zbFam.', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-10 14:33:19', '2026-06-10 14:33:19');

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
-- Indeks untuk tabel `seller_stats`
--
ALTER TABLE `seller_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `seller_id` (`seller_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `seller_stats`
--
ALTER TABLE `seller_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `seller_stats`
--
ALTER TABLE `seller_stats`
  ADD CONSTRAINT `seller_stats_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

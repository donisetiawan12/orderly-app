-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 14 Jun 2026 pada 20.12
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
(2, 5, 1, 'Ayam Katsu ', 'Ayam Katsu RiceBowl Paket Nasi dan Telur serta Sambal ', 10000.00, 0, '1781460655335-_ (8).jpeg', 50, '2026-06-22 09:00:00', 'active', '2026-06-14 18:10:55', '2026-06-14 18:10:55', 'Kampus B', 0);

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
(1, 1, 'MANDIRI ', 'DONI SETIAWAN ', '121324324324', 'qris-1781444483297-661975626.jpg', '2026-06-13 20:32:25', '2026-06-14 13:41:23');

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
(1, 'Administrator', 'admin@gmail.com', '$2b$10$yUm7eVimo2egdZJFYEivlOZ3QxcdouAe.sx5X4DV0f2/I34SkFNzC', 'admin', 'approved', NULL, NULL, NULL, NULL, '2026-06-14 16:27:27', '2026-06-14 16:27:39'),
(2, 'seller', 'seller@gmail.com', '$2b$10$ujT3g/q27D5xubZrVKJe4umWy9n.GziwWsrYmUf1Vp9vH1bMCPPha', 'seller', 'rejected', 'uploads/ktm/ktm-1781455117062.jpeg', NULL, NULL, NULL, '2026-06-14 16:38:37', '2026-06-14 18:08:58'),
(3, 'seller2', 'seller2@gmail.com', '$2b$10$zw1XMduQOXbPk8ctqNKGF.zdShVB7D6S9aoKKrkSR8EQyW41dpO3q', 'seller', 'approved', 'uploads/ktm/ktm-1781455369201.jpeg', NULL, NULL, NULL, '2026-06-14 16:42:49', '2026-06-14 17:56:46'),
(4, 'buyer', 'buyer@gmail.com', '$2b$10$i81w1Qd5BTPfzb..v2gwCu2blskxjtBLujqpcsCPceW7b1Zl7jRHe', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-14 17:00:14', '2026-06-14 17:56:48'),
(5, 'seller 3', 'seller3@gmail.com', '$2b$10$rS8fA9vZuXeVkjQBeeRQ3ezLeZmWjp1BJoERMQDIpj0VBui6UOxrO', 'seller', 'approved', 'uploads/ktm/ktm-1781456455518.jpeg', NULL, NULL, NULL, '2026-06-14 17:00:55', '2026-06-14 17:56:50'),
(6, 'dsd', 'dsd@gmail.com', '$2b$10$ndY1meu.ISPHYloXOC411eRczDrbFIWlaMZ1V7FGdKChVPV.B2bgW', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-14 18:00:32', '2026-06-14 18:00:32'),
(7, 'efdfdsf', 'dsdsf@gmail.com', '$2b$10$fiLuW790JhtnOWSyEUbx6ec2yjnuUH3TH6DfPFtM02lhoPX42B5gi', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-14 18:00:43', '2026-06-14 18:00:43'),
(8, 'dsadadfd', 'fdfd@gmail.com', '$2b$10$Q.ui8fnas1W.VsKBGEROKuCUWWtK92Y7d2Yu1vFm3sQRuOW5Xpioq', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-14 18:00:57', '2026-06-14 18:00:57'),
(9, 'dsdsds', 'dsdsd@gmail.com', '$2b$10$xsiIghdRaW5IoE9pJts1jOL4FCeA28pIQhAt/84.5S3CHIonBE9XW', 'buyer', 'approved', NULL, NULL, NULL, NULL, '2026-06-14 18:01:20', '2026-06-14 18:01:20');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `seller_payments`
--
ALTER TABLE `seller_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

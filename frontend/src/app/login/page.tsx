"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Login berhasil!");

      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (
        data.user.role === "seller"
      ) {
        router.push("/seller/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg,#eef2ff,#ffffff,#fff1f2)",
      }}
    >
      <div
        className="row shadow-lg overflow-hidden"
        style={{
          width: "1000px",
          maxWidth: "95%",
          borderRadius: "25px",
          background: "#fff",
        }}
      >
        {/* LEFT */}
        <div
          className="col-md-6 d-flex flex-column justify-content-center p-5"
          style={{
            background:
              "linear-gradient(135deg,#4f46e5,#7c3aed)",
            color: "white",
          }}
        >
          <h1
            style={{
              fontWeight: 800,
              fontSize: "3rem",
            }}
          >
            Orderly
          </h1>

          <h2 className="mt-4 fw-bold">
            Marketplace Pre-Order Mahasiswa
          </h2>

          <p className="mt-3">
            Platform yang membantu mahasiswa
            menjual dan memesan berbagai produk
            secara lebih terorganisir. Mulai dari
            makanan, minuman, merchandise,
            kebutuhan akademik, hingga jasa.
          </p>

          <div className="mt-4">
            🛍️ Marketplace Mahasiswa
            <br />
            📦 Tracking Pesanan
            <br />
            💳 Pembayaran Aman
            <br />
            ⚡ Pre-Order Terjadwal
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-md-6 p-5">
          <h2
            className="text-center mb-4"
            style={{
              fontWeight: 700,
            }}
          >
            Login
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Email</label>

              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="mb-4">
              <label>Password</label>

              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100 py-3"
              disabled={loading}
              style={{
                background:
                  "linear-gradient(90deg,#4f46e5,#ec4899)",
                color: "white",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Loading..."
                : "Login"}
            </button>
          </form>

          <p className="text-center mt-4">
            Belum punya akun?{" "}
            <Link href="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
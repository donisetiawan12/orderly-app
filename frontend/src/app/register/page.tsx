"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [role, setRole] =
    useState("buyer");

  const [ktm, setKtm] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      password !==
      confirmPassword
    ) {
      alert(
        "Konfirmasi password tidak cocok!"
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        name
      );
      formData.append(
        "email",
        email
      );
      formData.append(
        "password",
        password
      );
      formData.append(
        "role",
        role
      );

      if (
        role === "seller" &&
        ktm
      ) {
        formData.append(
          "ktm",
          ktm
        );
      }

      const response =
        await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      router.push("/login");
    } catch (error) {
      console.error(error);
      alert(
        "Terjadi kesalahan"
      );
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
          width: "1100px",
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
            Bergabung Bersama Orderly
          </h2>

          <p className="mt-3">
            Jadilah bagian dari marketplace
            mahasiswa yang memudahkan
            transaksi pre-order berbagai
            produk dan layanan kampus
            secara aman, cepat, dan
            terorganisir.
          </p>

          <div className="mt-4">
            🛍️ Marketplace Mahasiswa
            <br />
            📦 Tracking Pesanan
            <br />
            💳 Pembayaran Aman
            <br />
            🏪 Kelola Produk dengan Mudah
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
            Register
          </h2>

          <form
            onSubmit={
              handleRegister
            }
          >
            <div className="mb-3">
              <label>
                Nama Lengkap
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="mb-3">
              <label>Email</label>

              <input
                type="email"
                className="form-control form-control-lg"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="mb-3">
              <label>Password</label>

              <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="mb-3">
              <label>
                Konfirmasi Password
              </label>

              <input
                type="password"
                className="form-control form-control-lg"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="mb-3">
              <label>
                Daftar Sebagai
              </label>

              <select
                className="form-select form-select-lg"
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
              >
                <option value="buyer">
                  Pembeli
                </option>

                <option value="seller">
                  Penjual
                </option>
              </select>
            </div>

            {role ===
              "seller" && (
              <div className="mb-4">
                <label>
                  Upload KTM
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    setKtm(
                      e.target
                        .files?.[0] ||
                        null
                    )
                  }
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 py-3"
              style={{
                background:
                  "linear-gradient(90deg,#4f46e5,#ec4899)",
                color: "white",
                borderRadius:
                  "12px",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Memproses..."
                : "Register"}
            </button>
          </form>

          <p className="text-center mt-4">
            Sudah punya akun?{" "}
            <Link href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
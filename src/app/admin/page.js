"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const S3_UPLOAD_URL = `${API_BASE}/products/upload-s3`;

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  // Default to "users" because overview tab is removed
  const [activeTab, setActiveTab] = useState("users");

  const [stats, setStats] = useState(null);

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
  name: "",
  price: "",
  description: "",
  affiliated_url: "",
  imageFile: null,
  stock: 0,
});


  const [orders, setOrders] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [rescueReports, setRescueReports] = useState([]);
  const [adoptionReqs, setAdoptionReqs] = useState([]);

  // real users list
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function init() {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Check current user
        const meRes = await fetch(`${API_BASE}/users/me`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!meRes.ok) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        setMe(meData);

        if (!meData.is_admin) {
          router.push("/"); // or /not-authorized
          return;
        }

        // Load all admin data in parallel
        const [
          statsRes,
          productsRes,
          ordersRes,
          lostRes,
          rescueRes,
          adoptionRes,
          usersRes, // NEW
        ] = await Promise.all([
          fetch(`${API_BASE}/api/stats`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/products/`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/cart/recent`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/lost-found/`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/rescue-rep/`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/adoption_reqs/all`, {
            headers: getAuthHeaders(),
          }),
          fetch(`${API_BASE}/users/`, { headers: getAuthHeaders() }), // REAL USERS ENDPOINT
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (lostRes.ok) setLostReports(await lostRes.json());
        if (rescueRes.ok) setRescueReports(await rescueRes.json());
        if (adoptionRes.ok) setAdoptionReqs(await adoptionRes.json());
        if (usersRes.ok) setUsers(await usersRes.json()); // SET USERS
      } catch (err) {
        console.error(err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  //actions

  async function handleCreateProduct(e) {
    e.preventDefault();
    setError("");

    try {
      let imageUrl = null;
      if (newProduct.imageFile) {
        imageUrl = await uploadToS3(newProduct.imageFile);
      }

      const res = await fetch(`${API_BASE}/products/`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          stock: newProduct.stock,  
          image_url: imageUrl,
          affiliated_url: newProduct.affiliated_url,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to create product:", res.status, text);
        setError(`Could not create product (${res.status})`);
        return;
      }

      const created = await res.json();
      setProducts((prev) => [created, ...prev]);

      setNewProduct({
        name: "",
        price: "",
        description: "",
        affiliated_url: "",
        imageFile: null,
        stock: 0,
      });
    } catch (err) {
      console.error(err);
      setError("Could not create product (network error)");
    }
  }


  // Soft delete user (uses DELETE /users/{id})
  async function softDeleteUser(userId) {
    if (!userId) return;

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setError("");
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        console.error("Failed to soft delete user:", res.status, text);
        setError(`Failed to delete user (${res.status})`);
        return;
      }

      // Remove from UI
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete user (network error)");
    }
  }

  // Lost & Found delete – takes the whole row, resolves the correct id inside
  async function deleteLostReport(row) {
    const id = row.report_id ?? row.id;
    console.log("deleteLostReport row:", row, "resolved id:", id);

    if (!id) {
      console.error("deleteLostReport: could not resolve id from row");
      setError("Cannot delete lost report: missing id");
      return;
    }

    setError("");
    try {
      const res = await fetch(`${API_BASE}/lost-found/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      // Check for non-204 success
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        console.error("Failed to delete lost report:", res.status, text);
        setError(`Failed to delete lost pet report (${res.status})`);
        return;
      }

      setLostReports((prev) =>
        prev.filter((r) => {
          const rid = r.report_id ?? r.id;
          return rid !== id;
        })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete lost pet report (network error)");
    }
  }

  // Rescue delete
  async function deleteRescueReport(row) {
    const id = row.report_id ?? row.id;
    console.log("deleteRescueReport row:", row, "resolved id:", id);

    if (!id) {
      console.error("deleteRescueReport: could not resolve id from row");
      setError("Cannot delete rescue report: missing id");
      return;
    }

    setError("");
    try {
      const res = await fetch(`${API_BASE}/rescue-rep/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        console.error("Failed to delete rescue report:", res.status, text);
        setError(`Failed to delete rescue report (${res.status})`);
        return;
      }

      setRescueReports((prev) =>
        prev.filter((r) => {
          const rid = r.report_id ?? r.id;
          return rid !== id;
        })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete rescue report (network error)");
    }
  }

  // Adoption delete
  async function deleteAdoptionReq(row) {
    const id = row.adopt_id ?? row.id;
    console.log("deleteAdoptionReq row:", row, "resolved id:", id);

    if (!id) {
      console.error("deleteAdoptionReq: could not resolve id from row");
      setError("Cannot delete adoption request: missing id");
      return;
    }

    setError("");
    try {
      const res = await fetch(`${API_BASE}/adoption_reqs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        console.error("Failed to delete adoption request:", res.status, text);
        setError(`Failed to delete adoption request (${res.status})`);
        return;
      }

      setAdoptionReqs((prev) =>
        prev.filter((r) => {
          const rid = r.adopt_id ?? r.id;
          return rid !== id;
        })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete adoption request (network error)");
    }
  }




  //upload to aws s3 

  async function uploadToS3(file) {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(S3_UPLOAD_URL, {
        method: "POST",
        headers: {
          ...getAuthHeaders(), // includes Bearer token
        },
        body: formData,
      });

      if (!res.ok) {
        console.error("S3 upload failed", res.status);
        return null;
      }

      const data = await res.json();
      return data.url || null;
    } catch (err) {
      console.error("S3 upload error:", err);
      return null;
    }
  }


  //  Render helpers 

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg border transition 
      ${
        activeTab === id
          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-sm">Loading admin dashboard...</div>
      </main>
    );
  }

  if (!me || !me.is_admin) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Not authorized
          </h1>
          <p className="text-gray-600 text-sm">
            You must be an admin to access this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, <span className="font-medium">{me.first_name}</span>{" "}
              <span className="text-gray-400">({me.email})</span>
            </p>
          </div>
        </header>

        {/* Error alert */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {/* <TabButton id="overview" label="Overview" /> */}
          <TabButton id="users" label="Users" />
          <TabButton id="products" label="Store / Products" />
          <TabButton id="orders" label="Orders" />
          <TabButton id="lost" label="Lost & Found" />
          <TabButton id="rescue" label="Rescue Reports" />
          <TabButton id="adoption" label="Adoption Requests" />
        </div>

        {/* Content card */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          {/* === USERS TAB === */}
          {activeTab === "users" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                <span className="text-xs text-gray-400">
                  Showing data from{" "}
                  <code className="bg-gray-100 px-1 rounded">GET /users/</code>
                </span>
              </div>

              {users.length === 0 ? (
                <p className="text-sm text-gray-500">No users found.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          User
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Preferences
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Age Range
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Admin
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          ID
                        </th>
                        {/* Actions column */}
                        <th className="px-4 py-2 text-right font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u, index) => (
                        <tr
                          key={u.id ?? `user-${index}`}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2 text-gray-800">
                            <div className="flex items-center gap-2">
                              {u.profile_photo_url && (
                                <Image
                                  src={u.profile_photo_url}
                                  alt={u.first_name ?? "User avatar"}
                                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {u.first_name} {u.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            <div className="text-xs text-gray-700">
                              <div>
                                Species:{" "}
                                <span className="font-medium">
                                  {u.preferred_species ?? "-"}
                                </span>
                              </div>
                              <div>
                                Size:{" "}
                                <span className="font-medium">
                                  {u.preferred_size ?? "-"}
                                </span>
                              </div>
                              <div>
                                Temperament:{" "}
                                <span className="font-medium">
                                  {u.temperament ?? "-"}
                                </span>
                              </div>
                              <div>
                                Activity:{" "}
                                <span className="font-medium">
                                  {u.activity_level ?? "-"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            <span className="text-xs font-medium">
                              {u.min_age} – {u.max_age}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                u.is_admin
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-gray-50 text-gray-700 border border-gray-100"
                              }`}
                            >
                              {u.is_admin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            <span className="text-xs text-gray-500">
                              {u.id}
                            </span>
                          </td>
                          {/* Delete button */}
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => softDeleteUser(u.id)}
                              disabled={u.id === me?.id}
                              className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium border ${
                                u.id === me?.id
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                              }`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/*PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Store / Products
              </h2>

              {/* Add product form */}
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Add Product
                </h3>
                <form
                  onSubmit={handleCreateProduct}
                  className="grid gap-4 md:grid-cols-2 text-black"
                >
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, name: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, price: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                    />

                    
                  </div>
                  <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1 mt-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            stock: Number(e.target.value),  // convert to number
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                      />



                  </div>




                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                    />
                  </div>



                  {/* Affiliated URL */}
                  <div className="md:col-span-2 text-black">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Affiliated URL
                    </label>
                    <input
                      type="url"
                      value={newProduct.affiliated_url}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, affiliated_url: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="https://example.com/product"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="md:col-span-2 text-black">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          imageFile: e.target.files?.[0] || null,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                    >
                      Create Product
                    </button>
                  </div>
                </form>
              </div>

              {/* Products table */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-2">
                  Existing Products
                </h3>
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500">No products found.</p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            ID
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map((p, index) => {
                          const id = p.id ?? p.product_id ?? `prod-${index}`;
                          return (
                            <tr key={id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-2 text-gray-800">{id}</td>
                              <td className="px-4 py-2 text-gray-800">
                                {p.name ?? p.title}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {p.price}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">No recent orders.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          User
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Total
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((o, index) => {
                        const id = o.id ?? o.order_id ?? `order-${index}`;
                        return (
                          <tr key={id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 text-gray-800">{id}</td>
                            <td className="px-4 py-2 text-gray-800">
                              {o.user_email ?? o.user_id ?? "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {o.total ?? o.amount ?? "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {o.status ?? "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* LOST & FOUND TAB */}
          {activeTab === "lost" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Lost &amp; Found Reports
              </h2>
              {lostReports.length === 0 ? (
                <p className="text-sm text-gray-500">No lost pets reported.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Title / Pet
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lostReports.map((r, index) => {
                        const id = r.id ?? r.report_id;
                        const key = id ?? `lost-${index}`;
                        return (
                          <tr key={key} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 text-gray-800">
                              {id ?? "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {r.pet_name ??
                                r.title ??
                                r.description?.slice(0, 40)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => deleteLostReport(r)}
                                className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 border border-red-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RESCUE REPORTS TAB */}
          {activeTab === "rescue" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Rescue Reports
              </h2>
              {rescueReports.length === 0 ? (
                <p className="text-sm text-gray-500">No rescue reports.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Title / Location
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rescueReports.map((r, index) => {
                        const id = r.id ?? r.report_id;
                        const key = id ?? `rescue-${index}`;
                        return (
                          <tr key={key} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 text-gray-800">
                              {id ?? "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {r.title ??
                                r.location ??
                                r.description?.slice(0, 40)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => deleteRescueReport(r)}
                                className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 border border-red-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ADOPTION REQUESTS TAB */}
          {activeTab === "adoption" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Adoption Requests
              </h2>
              {adoptionReqs.length === 0 ? (
                <p className="text-sm text-gray-500">No adoption requests.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          User / Pet
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adoptionReqs.map((r, index) => {
                        const id = r.adopt_id ?? r.id;
                        const key = id ?? `adopt-${index}`;
                        return (
                          <tr key={key} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 text-gray-800">
                              {id ?? "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {r.user_email ?? r.user_id} →{" "}
                              {r.pet_name ?? r.pet_id}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {r.status ?? "-"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => deleteAdoptionReq(r)}
                                className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 border border-red-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



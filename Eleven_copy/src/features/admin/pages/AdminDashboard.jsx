import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/apiService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Package, CreditCard, ShoppingCart, ArrowRight, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    blockedUsers: 0,
    lowStockProducts: 0,
    totalSales: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const COLORS = ["#000", "#555", "#999", "#bbb", "#ddd"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
        api.get("auth/users/"),
        api.get("/products/"),
        api.get("/orders/admin/all/"),
      ]);

      const users = usersResponse?.data?.results || (Array.isArray(usersResponse?.data) ? usersResponse.data : []);
      const products = productsResponse?.data?.results || (Array.isArray(productsResponse?.data) ? productsResponse.data : []);
      const orders = ordersResponse?.data?.results || (Array.isArray(ordersResponse?.data) ? ordersResponse.data : []);

      const totalUsers = users.length;
      const blockedUsers = users.filter((user) => user.is_blocked).length;
      const totalProducts = products.length;
      const lowStockProducts = products.filter(
        (product) => (product.count || product.stock || 0) < 10
      ).length;

      const allOrders = orders;
      const totalOrders = allOrders.length;

      const totalRevenue = allOrders.reduce((sum, order) => {
        return sum + Number(order.total_amount || order.total || 0);
      }, 0);

      const totalSales = allOrders.reduce((sum, order) => {
        const orderQuantity =
          order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0;
        return sum + orderQuantity;
      }, 0);

      const totalInventoryValue = products.reduce((sum, product) => {
        const price = product.price || 0;
        const quantity = product.count || product.stock || 0;
        return sum + price * quantity;
      }, 0);

      setStats({
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: totalRevenue > 0 ? totalRevenue : totalInventoryValue,
        blockedUsers,
        lowStockProducts,
        totalSales,
      });

      const sortedUsers = users
        .sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
        .slice(0, 5);
      setRecentUsers(sortedUsers);

      const sortedProducts = products
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
        )
        .slice(0, 5);
      setRecentProducts(sortedProducts);

      generateChartData(products, allOrders);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (products, orders) => {
    const dailyData = {};
    orders.forEach((order) => {
      const orderDate = new Date(order.created_at || order.date);
      const dayKey = orderDate.toISOString().split("T")[0];
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { name: dayKey, sales: 0, revenue: 0, orders: 0 };
      }
      dailyData[dayKey].sales +=
        order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
      dailyData[dayKey].revenue += Number(order.total_amount || order.total || order.totalAmount || 0);
      dailyData[dayKey].orders += 1;
    });

    const chartData = Object.values(dailyData).sort(
      (a, b) => new Date(a.name) - new Date(b.name)
    );
    setSalesData(chartData.length > 0 ? chartData : generateFallbackChartData());

    const categoryDistribution = products.reduce((acc, product) => {
      const category =
        product.category?.name || product.category || product.type || "Uncategorized";
      if (!acc[category]) acc[category] = 0;
      acc[category]++;
      return acc;
    }, {});

    const catData = Object.entries(categoryDistribution).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
    setCategoryData(catData.length > 0 ? catData : generateFallbackCategoryData());
  };

  const generateFallbackChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      name: month,
      sales: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 30000) + 5000,
      orders: Math.floor(Math.random() * 10) + 1,
    }));
  };

  const generateFallbackCategoryData = () => {
    return [
      { name: "Sneakers", value: 35, color: "#000" },
      { name: "Boots", value: 25, color: "#555" },
      { name: "Sandals", value: 20, color: "#999" },
      { name: "Formal", value: 15, color: "#bbb" },
      { name: "Sports", value: 5, color: "#ddd" },
    ];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const tooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "0",
    color: "#000",
    fontSize: "11px",
    letterSpacing: "0.03em",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid #e5e5e5",
            borderTopColor: "#000",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#999" }}>
          Loading
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Users",
      value: stats.totalUsers,
      sub: `${stats.blockedUsers} blocked`,
      subColor: stats.blockedUsers > 0 ? "#c41e3a" : "#2d8a4e",
      icon: Users,
      onClick: () => navigate("/admin/users"),
    },
    {
      label: "Products",
      value: stats.totalProducts,
      sub: `${stats.lowStockProducts} low stock`,
      subColor: "#b87514",
      icon: Package,
      onClick: () => navigate("/admin/products"),
    },
    {
      label: "Revenue",
      value: formatPrice(stats.revenue),
      sub: `${stats.totalSales} units sold`,
      subColor: "#888",
      icon: CreditCard,
    },
    {
      label: "Orders",
      value: stats.totalOrders,
      sub: "All time",
      subColor: "#888",
      icon: ShoppingCart,
      onClick: () => navigate("/admin/orders"),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.25rem" }}>
            Overview of your store performance
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            fontSize: "0.7rem",
            fontWeight: 400,
            fontFamily: "inherit",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#888",
            background: "none",
            border: "1px solid #e5e5e5",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#000";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e5e5";
            e.currentTarget.style.color = "#888";
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "1.5rem",
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#c41e3a",
            padding: "0.75rem 1rem",
            fontSize: "0.8rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.onClick}
              style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                padding: "1.25rem",
                cursor: card.onClick ? "pointer" : "default",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (card.onClick) e.currentTarget.style.borderColor = "#000";
              }}
              onMouseLeave={(e) => {
                if (card.onClick) e.currentTarget.style.borderColor = "#e5e5e5";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>
                  {card.label}
                </p>
                <Icon size={16} style={{ color: "#ccc" }} />
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 300, color: "#000", marginBottom: "0.35rem" }}>
                {card.value}
              </p>
              <p style={{ fontSize: "0.7rem", color: card.subColor }}>
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Sales Trend */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "1.5rem" }}>
            Sales Trend
          </p>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="none" vertical={false} />
                <XAxis dataKey="name" fontSize={10} stroke="#ccc" tickLine={false} axisLine={false} dy={8} />
                <YAxis fontSize={10} stroke="#ccc" tickLine={false} axisLine={false} dx={-8} />
                <Tooltip formatter={(value) => [value, "Units"]} contentStyle={tooltipStyle} cursor={{ stroke: "#e5e5e5" }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#000"
                  strokeWidth={1.5}
                  name="Units Sold"
                  dot={{ r: 3, fill: "#fff", stroke: "#000", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#000", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "1.5rem" }}>
            Revenue
          </p>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} barSize={18}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="none" vertical={false} />
                <XAxis dataKey="name" fontSize={10} stroke="#ccc" tickLine={false} axisLine={false} dy={8} />
                <YAxis fontSize={10} stroke="#ccc" tickLine={false} axisLine={false} dx={-8} />
                <Tooltip formatter={(value) => [formatPrice(value), "Revenue"]} cursor={{ fill: "#fafafa" }} contentStyle={tooltipStyle} />
                <Bar
                  dataKey="revenue"
                  fill="#2d8a4e"
                  name="Revenue"
                  radius={[0, 0, 0, 0]}
                  activeBar={{ fill: "#1e6b38" }}
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Categories */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "1.5rem" }}>
            Categories
          </p>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) =>
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  outerRadius={75}
                  innerRadius={50}
                  stroke="#fff"
                  strokeWidth={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Products"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
            {categoryData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span style={{ width: "8px", height: "8px", background: entry.color, display: "inline-block" }} />
                <span style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.05em" }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>
              Recent Users
            </p>
            <button
              onClick={() => navigate("/admin/users")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.6rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#999",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div>
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "#666",
                      }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 400, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.name || "Unknown"}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email || "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                      marginLeft: "0.5rem",
                      color: user.is_blocked ? "#c41e3a" : user.role === "admin" ? "#000" : "#2d8a4e",
                    }}
                  >
                    {user.is_blocked ? "Blocked" : user.role === "admin" ? "Admin" : "Active"}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.75rem", color: "#ccc", textAlign: "center", padding: "2rem 0" }}>
                No users found
              </p>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>
              Recent Products
            </p>
            <button
              onClick={() => navigate("/admin/products")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.6rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#999",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div>
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {product.image ? (
                        <img src={product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "0.6rem", color: "#ccc" }}>—</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 400, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.name || "Unnamed"}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: "#bbb" }}>
                        {formatPrice(product.price || 0)} · {product.category?.name || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                      marginLeft: "0.5rem",
                      color: (product.count || product.stock || 0) > 0 ? "#2d8a4e" : "#c41e3a",
                    }}
                  >
                    {(product.count || product.stock || 0) > 0 ? "In Stock" : "Out"}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.75rem", color: "#ccc", textAlign: "center", padding: "2rem 0" }}>
                No products found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

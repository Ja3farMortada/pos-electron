require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const http = require("http");

// allow Cross-Origin calls to this app
const cors = require("cors");
app.use(cors());

const { auth } = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// socket init
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origins: ["*"],
    },
});

//import routes
const AuthRoutes = require("./routes/auth.routes");
const UsersRoutes = require("./routes/users.routes");
const CustomersRoutes = require("./routes/customers.routes");
const SuppliersRoutes = require("./routes/suppliers.routes");
const StockRoutes = require("./routes/stock.routes");
const ProfileRoutes = require("./routes/profile.routes");
const SellOrdersRoutes = require("./routes/sell-orders.routes");
const HistoryRoutes = require("./routes/history.routes");
const PaymentRoutes = require("./routes/payment.routes");
const BalanceRoutes = require("./routes/balance.routes");
const ExpenseRoutes = require("./routes/expense.routes");
const ReportRoutes = require("./routes/report.routes");
const ReturnRoutes = require("./routes/return.routes");
const PurchaseOrdersRoutes = require("./routes/purchase.routes");
const DatabaseRoutes = require("./routes/database.routes");
const NotesRoutes = require("./routes/notes.routes");
const SettingsRoutes = require("./routes/settings.routes");
const PrintRoutes = require("./routes/print.routes");

app.use((req, res, next) => {
    req.io = io;
    next();
});

// common routes
app.use("/auth", AuthRoutes);
app.use("/database", DatabaseRoutes);

app.use("/print", auth, PrintRoutes);
app.use("/stock", auth, StockRoutes);
app.use("/profile", auth, ProfileRoutes);
app.use("/sell-orders", auth, SellOrdersRoutes);
app.use("/history", auth, HistoryRoutes);
app.use("/payment", auth, PaymentRoutes);
app.use("/balance", auth, BalanceRoutes);
app.use("/customers", auth, CustomersRoutes);
app.use("/expense", auth, ExpenseRoutes);
app.use("/report", auth, ReportRoutes);
app.use("/return", auth, ReturnRoutes);
app.use("/suppliers", auth, SuppliersRoutes);
app.use("/supply", auth, PurchaseOrdersRoutes);
app.use("/notes", auth, NotesRoutes);
app.use("/settings", SettingsRoutes);
app.use("/rate", require("./routes/rate.routes"));

// admin routes
app.use("/users", auth, UsersRoutes);

// check API status page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// handle errors
app.use(errorHandler);

module.exports = server;

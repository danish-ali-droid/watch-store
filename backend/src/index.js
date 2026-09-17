import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import twilio from "twilio";
import { query } from "./db.js";
import {
  sendVerificationEmail,
  sendPurchaseConfirmationEmail,
  verifyEmailConnection,
} from "./services/emailService.js";
import {
  clearProductsCache,
  deleteOtp,
  getOtp,
  getProductsCache,
  setOtp,
  setProductsCache,
} from "./services/redisService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Public directory (contains /assets and /uploads)
const publicDir = path.resolve(__dirname, "..", "..", "public");
const uploadDir = path.resolve(publicDir, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${extension}`);
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());

// Serve /public/uploads  → http://localhost:4000/uploads/...
app.use("/uploads", express.static(uploadDir));
// Serve /public/assets   → http://localhost:4000/assets/...
app.use("/assets", express.static(path.resolve(publicDir, "assets")));

app.use(express.json());

const PORT = process.env.PORT || 4000;
const PASSWORD_SALT = process.env.PASSWORD_SALT || "watch-store-salt";

// Twilio – only initialise when credentials look valid
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID?.startsWith("AC") &&
  process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phone, message) {
  console.log(`[SMS] Attempting to send to ${phone}: ${message}`);
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith("+") ? phone : `+92${phone.replace(/^0/, "")}`,
      });
      console.log(`[SMS SUCCESS] Real SMS sent to ${phone} via Twilio`);
      return true;
    } catch (error) {
      console.error("[SMS ERROR] Twilio failed:", error.message);
      return false;
    }
  }
  console.log(`[SMS MOCK] Twilio not configured. OTP: ${message}`);
  return true;
}

function hashPassword(password) {
  return crypto
    .pbkdf2Sync(password, PASSWORD_SALT, 100000, 64, "sha512")
    .toString("hex");
}

// ── Helper: build the standard Watch object the frontend expects ─────────────
// Joins brands / categories / movements / case_materials and pulls images from
// watch_images, returning the exact shape of the Watch interface in useStore.ts
const WATCH_SELECT = `
  SELECT
    w.id,
    w.name,
    b.name            AS brand,
    c.name            AS category,
    m.name            AS movement,
    cm.name           AS caseMaterial,
    w.price,
    w.original_price  AS originalPrice,
    w.primary_image   AS image,
    w.water_resistance AS waterResistance,
    w.warranty,
    w.case_size       AS caseSize,
    w.description,
    w.stock,
    w.rating,
    w.reviews,
    w.featured,
    w.is_new          AS isNew
  FROM watches w
  JOIN brands         b  ON b.id  = w.brand_id
  JOIN categories     c  ON c.id  = w.category_id
  JOIN movements      m  ON m.id  = w.movement_id
  JOIN case_materials cm ON cm.id = w.case_material_id
`;

// Attach images array and normalise isNew → new
async function hydrateWatch(watch) {
  if (!watch) return watch;
  const imgs = await query(
    "SELECT image_url FROM watch_images WHERE watch_id = ? ORDER BY sort_order",
    [watch.id],
  );
  const images = imgs.length ? imgs.map((r) => r.image_url) : [watch.image];
  const { isNew, ...rest } = watch;
  return { ...rest, images, new: Boolean(isNew) };
}

async function hydrateWatches(watches) {
  return Promise.all(watches.map(hydrateWatch));
}

// ── Helper: upsert a lookup value and return its id ──────────────────────────
async function upsertLookup(table, name) {
  await query(`INSERT IGNORE INTO ${table} (name) VALUES (?)`, [name]);
  const [row] = await query(`SELECT id FROM ${table} WHERE name = ?`, [name]);
  return row.id;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/products", async (req, res) => {
  try {
    const cachedProducts = await getProductsCache();
    if (cachedProducts) return res.json(cachedProducts);

    const watches = await query(`${WATCH_SELECT} ORDER BY w.id`);
    const products = await hydrateWatches(watches);
    await setProductsCache(products);
    res.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    res.status(500).json({ error: "Unable to load products." });
  }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      originalPrice,
      category = "Luxury",
      movement = "",
      waterResistance = "",
      caseMaterial = "",
      warranty = "",
      caseSize = "",
      description = "",
      stock = "0",
      rating = "0",
      reviews = "0",
      featured = "false",
      isNew = "false",
    } = req.body;

    if (!name || !brand || !price) {
      return res
        .status(400)
        .json({ error: "Product name, brand, and price are required." });
    }

    const imagePath = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : req.body.image || "";
    if (!imagePath) {
      return res.status(400).json({ error: "Product image is required." });
    }

    let extraImages = [imagePath];
    if (req.body.images) {
      try {
        const parsed =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;
        if (Array.isArray(parsed) && parsed.length) extraImages = parsed;
      } catch (_) {
        extraImages = [imagePath];
      }
    }

    // Upsert all lookup values
    const brandId = await upsertLookup("brands", brand);
    const categoryId = await upsertLookup("categories", category);
    const movementId = await upsertLookup("movements", movement || "Unknown");
    const caseMaterialId = await upsertLookup(
      "case_materials",
      caseMaterial || "Unknown",
    );

    const result = await query(
      `INSERT INTO watches
         (name, brand_id, category_id, movement_id, case_material_id,
          price, original_price, primary_image,
          water_resistance, warranty, case_size, description,
          stock, rating, reviews, featured, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        brandId,
        categoryId,
        movementId,
        caseMaterialId,
        parseFloat(price),
        originalPrice ? parseFloat(originalPrice) : null,
        imagePath,
        waterResistance,
        warranty,
        caseSize,
        description,
        parseInt(stock, 10),
        parseFloat(rating),
        parseInt(reviews, 10),
        featured === "true" || featured === true,
        isNew === "true" || isNew === true,
      ],
    );

    const newId = result.insertId;

    // Insert into watch_images
    for (let i = 0; i < extraImages.length; i++) {
      await query(
        "INSERT INTO watch_images (watch_id, image_url, sort_order) VALUES (?, ?, ?)",
        [newId, extraImages[i], i],
      );
    }

    const [newProduct] = await query(`${WATCH_SELECT} WHERE w.id = ?`, [newId]);
    await clearProductsCache();
    res.status(201).json(await hydrateWatch(newProduct));
  } catch (error) {
    console.error("Create product error:", error.message || error);
    res
      .status(500)
      .json({ error: error.message || "Unable to create product." });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await query(`${WATCH_SELECT} WHERE w.id = ?`, [id]);
    if (!existing.length)
      return res.status(404).json({ error: "Product not found." });

    const current = existing[0];
    const {
      name = current.name,
      brand = current.brand,
      price = current.price,
      originalPrice,
      category = current.category,
      movement = current.movement,
      waterResistance = current.waterResistance,
      caseMaterial = current.caseMaterial,
      warranty = current.warranty,
      caseSize = current.caseSize,
      description = current.description,
      stock = current.stock,
      rating = current.rating,
      reviews = current.reviews,
      featured = current.featured,
      isNew = current.isNew,
    } = req.body;

    const imagePath = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : req.body.image || current.image;

    const brandId = await upsertLookup("brands", brand);
    const categoryId = await upsertLookup("categories", category);
    const movementId = await upsertLookup("movements", movement);
    const caseMaterialId = await upsertLookup("case_materials", caseMaterial);

    await query(
      `UPDATE watches SET
         name = ?, brand_id = ?, category_id = ?, movement_id = ?, case_material_id = ?,
         price = ?, original_price = ?, primary_image = ?,
         water_resistance = ?, warranty = ?, case_size = ?, description = ?,
         stock = ?, rating = ?, reviews = ?, featured = ?, is_new = ?
       WHERE id = ?`,
      [
        name,
        brandId,
        categoryId,
        movementId,
        caseMaterialId,
        parseFloat(price),
        originalPrice != null ? parseFloat(originalPrice) : null,
        imagePath,
        waterResistance,
        warranty,
        caseSize,
        description,
        parseInt(stock, 10),
        parseFloat(rating),
        parseInt(reviews, 10),
        featured === "true" || featured === true || featured === 1,
        isNew === "true" || isNew === true || isNew === 1,
        id,
      ],
    );

    const [updated] = await query(`${WATCH_SELECT} WHERE w.id = ?`, [id]);
    await clearProductsCache();
    res.json(await hydrateWatch(updated));
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Unable to update product." });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query("DELETE FROM watches WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Product not found." });
    await clearProductsCache();
    res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Unable to delete product." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

app.post("/api/auth/register-otp", async (req, res) => {
  let { name, email, password, phone, address, city } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }
  email = email.toLowerCase().trim();

  try {
    const existing = await query(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [email],
    );
    if (existing.length)
      return res.status(409).json({ error: "Email already exists." });

    const otp = generateOtp();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    await setOtp(`reg_${email}`, {
      otp,
      expiresAt,
      data: { name, email, password, phone, address, city },
    });

    const emailResult = await sendVerificationEmail(email, otp, "registration");
    if (emailResult.success) {
      res.json({ message: "Verification code sent to your email." });
    } else {
      await deleteOtp(`reg_${email}`);
      res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Register OTP route error:", error);
    res.status(500).json({ error: "Error processing registration." });
  }
});

app.post("/api/auth/register-verify", async (req, res) => {
  let { email, otp } = req.body;
  email = email.toLowerCase().trim();
  const pending = await getOtp(`reg_${email}`);

  if (!pending || pending.otp !== otp || Date.now() > pending.expiresAt) {
    return res
      .status(400)
      .json({ error: "Invalid or expired verification code." });
  }

  const { name, password, phone, address, city } = pending.data;
  try {
    const hashedPassword = hashPassword(password);

    // Insert user (no phone/address/city on users table — they go to user_addresses)
    const result = await query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"],
    );
    const userId = result.insertId;

    // Insert default address if provided
    if (phone || address || city) {
      await query(
        "INSERT INTO user_addresses (user_id, phone, address, city, is_default) VALUES (?, ?, ?, ?, ?)",
        [userId, phone || "", address || "", city || "", true],
      );
    }

    const [newUser] = await query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [userId],
    );

    // Attach default address fields for the frontend User interface
    const [addr] = await query(
      "SELECT phone, address, city FROM user_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1",
      [userId],
    );

    await deleteOtp(`reg_${email}`);
    res.status(201).json({
      ...newUser,
      phone: addr?.phone || "",
      address: addr?.address || "",
      city: addr?.city || "",
    });
  } catch (error) {
    console.error("Register verify error:", error);
    res.status(500).json({ error: "Unable to register user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  email = email.toLowerCase().trim();

  try {
    const [user] = await query("SELECT * FROM users WHERE LOWER(email) = ?", [
      email,
    ]);
    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { password: _pw, ...cleanUser } = user;

    // Attach default address for the frontend User interface
    const [addr] = await query(
      "SELECT phone, address, city FROM user_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1",
      [user.id],
    );

    res.json({
      ...cleanUser,
      phone: addr?.phone || "",
      address: addr?.address || "",
      city: addr?.city || "",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Unable to login." });
  }
});

app.post("/api/auth/forgot-password-otp", async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  email = email.toLowerCase().trim();

  try {
    const [user] = await query(
      "SELECT id, email FROM users WHERE LOWER(email) = ?",
      [email],
    );
    if (!user)
      return res
        .status(404)
        .json({ error: "No account found with this email." });

    const otp = generateOtp();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    await setOtp(`reset_${email}`, { otp, expiresAt, userId: user.id });

    const emailResult = await sendVerificationEmail(
      email,
      otp,
      "passwordReset",
    );
    if (emailResult.success) {
      res.json({ message: "Reset code sent to your email." });
    } else {
      await deleteOtp(`reset_${email}`);
      res
        .status(500)
        .json({ error: "Failed to send reset email. Please try again." });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Error processing password reset." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  let { email, otp, newPassword } = req.body;
  email = email.toLowerCase().trim();
  const pending = await getOtp(`reset_${email}`);

  if (!pending || pending.otp !== otp || Date.now() > pending.expiresAt) {
    return res
      .status(400)
      .json({ error: "Invalid or expired verification code." });
  }

  try {
    await query("UPDATE users SET password = ? WHERE id = ?", [
      hashPassword(newPassword),
      pending.userId,
    ]);
    await deleteOtp(`reset_${email}`);
    res.json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Unable to reset password." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// USERS (admin)
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/users", async (req, res) => {
  try {
    const users = await query(
      `SELECT
         u.id, u.name, u.email, u.role,
         u.created_at  AS createdAt,
         ua.phone, ua.address, ua.city
       FROM users u
       LEFT JOIN user_addresses ua ON ua.user_id = u.id AND ua.is_default = 1
       ORDER BY u.id`,
    );
    res.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    res.status(500).json({ error: "Unable to load users." });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await query("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.role === "admin") {
      return res.status(400).json({ error: "Cannot delete an admin account." });
    }
    await query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Unable to delete user." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/orders", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? "WHERE o.user_id = ?" : "";
    const params = userId ? [userId] : [];

    const orders = await query(
      `SELECT
         o.id,
         o.user_id       AS userId,
         u.name          AS userName,
         o.total,
         o.status,
         o.payment_method  AS paymentMethod,
         o.tracking_number AS trackingNumber,
         o.created_at    AS createdAt,
         ua.address      AS shippingAddress,
         ua.phone,
         ua.city
       FROM orders o
       LEFT JOIN users          u  ON u.id  = o.user_id
       LEFT JOIN user_addresses ua ON ua.id = o.address_id
       ${filter}
       ORDER BY o.created_at DESC`,
      params,
    );

    // Attach order_items with watch details for each order
    const hydrated = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          `SELECT
             oi.quantity,
             oi.unit_price AS unitPrice,
             w.id, w.name, w.primary_image AS image, w.price,
             b.name AS brand
           FROM order_items oi
           JOIN watches w ON w.id = oi.watch_id
           JOIN brands  b ON b.id = w.brand_id
           WHERE oi.order_id = ?`,
          [order.id],
        );
        // Shape items to match the CartItem structure the frontend expects
        const formattedItems = items.map((item) => ({
          quantity: item.quantity,
          watch: {
            id: item.id,
            name: item.name,
            brand: item.brand,
            image: item.image,
            price: Number(item.unitPrice), // price at time of purchase
          },
        }));
        return { ...order, items: formattedItems };
      }),
    );

    res.json(hydrated);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    res.status(500).json({ error: "Unable to load orders." });
  }
});

app.get("/api/orders/sales-report", async (req, res) => {
  try {
    const rows = await query(
      `SELECT
         DATE(o.created_at) AS saleDate,
         SUM(o.total) AS revenue,
         COUNT(*) AS orders,
         COALESCE(SUM(oi.item_count), 0) AS items
       FROM orders o
       LEFT JOIN (
         SELECT order_id, COUNT(*) AS item_count
         FROM order_items
         GROUP BY order_id
       ) oi ON oi.order_id = o.id
       WHERE o.status <> 'Cancelled'
       GROUP BY DATE(o.created_at)
       ORDER BY saleDate DESC`,
      [],
    );

    const detailRows = await query(
      `SELECT
         DATE(o.created_at) AS saleDate,
         w.name AS watchName,
         oi.quantity,
         oi.unit_price AS unitPrice
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN watches w ON w.id = oi.watch_id
       WHERE o.status <> 'Cancelled'
       ORDER BY saleDate DESC, w.name`,
      [],
    );

    // Helper: normalize any date-like value to YYYY-MM-DD
    const toDateKey = (v) => {
      try {
        return new Date(v).toISOString().split("T")[0];
      } catch (e) {
        return String(v);
      }
    };

    // Group detail rows by saleDate and aggregate quantities for the same watch
    const detailsByDate = {};
    for (const d of detailRows) {
      const dateKey = toDateKey(d.saleDate);
      if (!detailsByDate[dateKey]) detailsByDate[dateKey] = {};
      const map = detailsByDate[dateKey];
      const name = d.watchName || "Unknown";
      const qty = Number(d.quantity || 0);
      const unit = Number(d.unitPrice || 0);
      if (!map[name]) {
        map[name] = { name, quantity: qty, unitPrice: unit };
      } else {
        map[name].quantity += qty;
      }
    }

    const report = rows.map((row) => {
      const dateKey = toDateKey(row.saleDate);
      const soldMap = detailsByDate[dateKey] || {};
      const soldWatches = Object.values(soldMap).map((v) => ({
        name: v.name,
        quantity: Number(v.quantity || 0),
        unitPrice: Number(v.unitPrice || 0),
      }));

      return {
        date: dateKey,
        revenue: Number(row.revenue || 0),
        orders: Number(row.orders || 0),
        items: Number(row.items || 0),
        soldWatches,
      };
    });

    res.json(report);
  } catch (error) {
    console.error("GET /api/orders/sales-report error:", error);
    res.status(500).json({ error: "Unable to generate sales report." });
  }
});

app.post("/api/orders/request-otp", async (req, res) => {
  const { phone, userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required." });

  try {
    const [user] = await query("SELECT email FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user) return res.status(404).json({ error: "User not found." });

    const email = user.email.toLowerCase().trim();
    const otp = generateOtp();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    await setOtp(`order_${email}`, { otp, expiresAt, userId, phone });

    const emailResult = await sendVerificationEmail(
      email,
      otp,
      "orderVerification",
    );
    if (emailResult.success) {
      res.json({ message: "Verification code sent to your email." });
    } else {
      await deleteOtp(`order_${email}`);
      res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Order OTP request error:", error);
    res.status(500).json({ error: "Error processing order verification." });
  }
});

app.post("/api/orders/verify", async (req, res) => {
  let { email, otp, orderData } = req.body;
  email = email.toLowerCase().trim();
  const pending = await getOtp(`order_${email}`);

  if (!pending || pending.otp !== otp || Date.now() > pending.expiresAt) {
    return res
      .status(400)
      .json({ error: "Invalid or expired verification code." });
  }

  const { userId, total, status, paymentMethod, shippingAddress, items } =
    orderData;
  const phone = orderData.phone || pending.phone || "";

  if (
    !userId ||
    !total ||
    !paymentMethod ||
    !shippingAddress ||
    !Array.isArray(items) ||
    !items.length
  ) {
    return res.status(400).json({ error: "Incomplete order data." });
  }

  const orderId = uuidv4();
  const createdAt = new Date();

  try {
    // Parse shippingAddress — could be "address, city" string or separate fields
    const addressText = shippingAddress;
    const city = orderData.city || "";

    // Upsert the shipping address into user_addresses
    let addressId;
    const existingAddr = await query(
      "SELECT id FROM user_addresses WHERE user_id = ? AND address = ? AND city = ? AND phone = ?",
      [userId, addressText, city, phone],
    );
    if (existingAddr.length) {
      addressId = existingAddr[0].id;
    } else {
      const addrResult = await query(
        "INSERT INTO user_addresses (user_id, phone, address, city, is_default) VALUES (?, ?, ?, ?, ?)",
        [userId, phone, addressText, city, false],
      );
      addressId = addrResult.insertId;
    }

    await query(
      `INSERT INTO orders (id, user_id, address_id, total, status, payment_method, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        addressId,
        total,
        status || "Pending",
        paymentMethod,
        createdAt,
      ],
    );

    await Promise.all(
      items.map((item) =>
        query(
          "INSERT INTO order_items (order_id, watch_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, item.watchId, item.quantity, item.unitPrice],
        ),
      ),
    );

    const confirmationResult = await sendPurchaseConfirmationEmail(email, {
      orderId,
      totalAmount: total,
      itemCount: items.length,
      shippingAddress,
      paymentMethod,
    });
    if (!confirmationResult.success) {
      console.warn(
        `⚠️  Purchase confirmation email failed for order ${orderId}, but order was created.`,
      );
    }

    await deleteOtp(`order_${email}`);
    res.status(201).json({ orderId, message: "Order created successfully." });
  } catch (error) {
    console.error("[CRITICAL] Order Creation Error:", error);
    res.status(500).json({ error: "Unable to place order. Database error." });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Only allow deleting orders that are in 'Shipped' status
    const [order] = await query("SELECT id, status FROM orders WHERE id = ?", [
      id,
    ]);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.status !== "Shipped") {
      return res
        .status(400)
        .json({ error: "Only shipped orders can be deleted." });
    }
    await query("DELETE FROM orders WHERE id = ?", [id]);
    res.json({ message: "Order deleted." });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Unable to delete order." });
  }
});

app.post("/api/orders/update-status", async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status)
    return res.status(400).json({ error: "Order ID and Status are required." });

  try {
    const result = await query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Order not found in database." });
    res.json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Unable to update order status." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await verifyEmailConnection();
});

<div align="center">

# 🛍️ AMIRA E-Commerce Website

### A Premium Full-Stack E-Commerce Experience for Custom Wedding Dress Collections

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white">
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square">
  <img src="https://img.shields.io/github/last-commit/kafkakaif/Amira-E-Commerce-Website?style=flat-square">
  <img src="https://img.shields.io/github/repo-size/kafkakaif/Amira-E-Commerce-Website?style=flat-square">
</p>

<p>
  <a href="#-features">Features</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-project-structure">Structure</a>
</p>

</div>

---

## 📖 Overview

**AMIRA** is a premium full-stack e-commerce platform designed for showcasing and selling custom wedding dress collections.

The application provides a complete shopping experience including:

- 👗 Product catalogue
- 🔐 User authentication
- 🛒 Shopping cart
- 💳 Checkout workflow
- 📦 Order management
- 👤 Customer accounts
- 🛠️ Admin product management
- 🖼️ Product image uploads
- 💱 Currency display
- 📱 Responsive interface

The project combines a modern fashion-focused frontend with a Node.js/Express backend and SQLite database.

---

## ✨ Key Highlights

- 🎨 Premium wedding-fashion inspired UI
- 🛍️ Complete e-commerce shopping flow
- 🔐 Secure password hashing with `bcryptjs`
- 👤 Session-based authentication
- 🗄️ SQLite database integration
- 📸 Product image upload support
- 🛠️ Admin management interface
- 📦 Order and checkout workflow
- 💱 USD / INR currency display
- 🚀 Deployment-ready configuration
- 📱 Responsive design

---

# 🚀 Features

## 👗 Customer Features

### Product Catalogue

Customers can browse the available AMIRA wedding dress collection.

Features include:

- Product images
- Product names
- Product descriptions
- Pricing
- Product categories
- Product details

---

### 🔐 Authentication

Users can create accounts and log in securely.

Authentication includes:

- Sign up
- Login
- Logout
- Password hashing
- Session management
- Customer account handling

Passwords are hashed using **bcryptjs** rather than being stored as plain text.

---

### 🛒 Shopping Cart

Customers can add products to their shopping bag.

Cart functionality includes:

- Add products
- Remove products
- Update quantities
- View subtotal
- View total
- Continue shopping
- Proceed to checkout

---

### 💳 Checkout

The checkout interface allows customers to review their order before placing it.

The checkout workflow includes:

1. Customer information
2. Delivery information
3. Order summary
4. Product quantities
5. Total price
6. Order confirmation

---

### 📦 Orders

Customer orders can be stored and managed through the backend.

The system is structured to support:

- Order creation
- Order details
- Customer information
- Product information
- Order totals

---

# 🛠️ Admin Features

AMIRA includes an administration interface for managing products.

### Admin capabilities

- Add products
- Upload product images
- Edit products
- Delete products
- Manage product information
- Manage pricing
- Manage product catalogue

This provides administrators with a centralized interface for maintaining the store.

---

# 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 |
| Styling | CSS3 |
| Client-side Logic | JavaScript |
| Backend | Node.js |
| Web Framework | Express.js |
| Database | SQLite |
| Authentication | bcryptjs |
| Session Management | express-session |
| File Uploads | Multer |
| Package Manager | npm |
| Version Control | Git & GitHub |
| Deployment | Render |

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    AMIRA Frontend    │
                    │   HTML/CSS/JS        │
                    └──────────┬───────────┘
                               │
                         HTTP Requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express.js Server  │
                    │      Node.js         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │   Auth     │   │  Products  │   │   Orders   │
       │  System    │   │ Management │   │ Management │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │    SQLite Database   │
                    └──────────────────────┘

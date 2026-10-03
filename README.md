# ☁️ StoreItNow Cloud

A modern **full-stack cloud storage platform** built using the **MERN Stack**. StoreItNow Cloud enables users to securely upload, organize, manage, and access their files from anywhere through a clean, responsive, and user-friendly interface.

The application provides secure authentication, folder management, file uploads, email verification, password recovery, subscription management, and an admin dashboard, making it a complete cloud storage solution.

---

# 🌐 Live Demo

🚀 **Experience the application here:**
[https://storeitnow-cloud-1.onrender.com/](https://storeitnow-cloud-dqqs.onrender.com/)

> **Note:** The application is hosted on Render. If the server has been inactive, it may take **30–60 seconds** to wake up on the first request.

---

# 🚀 Features

### 🔐 Authentication

* User Registration
* Secure Login
* JWT Authentication
* Email OTP Verification
* Forgot Password
* Reset Password
* Protected Routes

### 📁 File Management

* Upload Files
* View Uploaded Files
* Delete Files
* Download Files
* Organize Files
* Search & Manage Files

### 📂 Folder Management

* Create Folders
* Rename Folders
* Delete Folders
* Organize Files Inside Folders

### 👤 User Profile

* View Profile
* Update Profile
* Account Management

### 💳 Subscription & Payments

* Razorpay Payment Gateway
* Subscription Plans
* Premium Features

### 👑 Admin Panel

* Admin Dashboard
* User Management
* File Monitoring
* Subscription Monitoring

### 📱 Responsive Design

* Desktop Friendly
* Tablet Friendly
* Mobile Friendly

---

# 🛠 Tech Stack

## Frontend

* React.js
* Vite
* React Router DOM
* Axios
* Tailwind CSS

## Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* ImageKit
* Nodemailer
* Razorpay

---

# 📂 Project Structure

```text
StoreItNow.cloud
│
├── frontend
│   ├── api
│   │   ├── authApi.js
│   │   ├── fileApi.js
│   │   ├── folderApi.js
│   │   ├── paymentApi.js
│   │   └── userApi.js
│   │
│   ├── Pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Subscription.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── VerifyOtp.jsx
│   │
│   ├── routes
│   ├── App.jsx
│   └── main.jsx
│
└── backend
    ├── config
    ├── controller
    ├── db
    ├── middleware
    ├── models
    ├── Routers
    ├── utils
    └── app.js
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/code-prafull/storeItNow.cloud.git
```

## Navigate to Project

```bash
cd storeItNow.cloud
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

# ▶️ Running the Project

### Start Backend

```bash
npm run dev
```

or

```bash
npm start
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Open your browser:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=

MONGO_URI=

JWT_SECRET=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

EMAIL_USER=
EMAIL_PASS=
```

---

# 📌 API Modules

* Authentication API
* User API
* File API
* Folder API
* Payment API
* Admin API

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Email Verification
* Secure API Access
* Authentication Middleware

---


# 🌟 Future Improvements

* Drag & Drop Upload
* File Sharing
* Dark Mode
* Storage Analytics
* Recent Activity
* Trash Bin
* File Version History
* Google Login
* GitHub Login

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Prafull Singh**

* GitHub: https://github.com/code-prafull

---

⭐ If you found this project helpful, please consider giving it a **Star** on GitHub. It helps support the project and motivates future development.

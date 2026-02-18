# Blood Bank Management System with AI demand Forecasting

Blood Bank Management System with AI demand forecasting is a MERN-stack web application to manage blood donation, inventory, and requests across donors, hospitals, organisations, and admins.

## Methodology

For the Blood-Axis-MERN project, an iterative development methodology was employed to facilitate a responsive and user-centered design process. This structured approach guided the project through key phases including requirement analysis, system architecture design, role-based interface development, AI forecasting integration, testing, and deployment. By improvising continuous feedback loops and incremental improvements, the team was able to adapt to emerging stakeholder needs and refine the platform's features accordingly, ensuring seamless blood bank management and intelligent demand forecasting capabilities.

## Features

- Role-based access: Donor, Hospital, Organisation, Admin.
- Donor registration, profile, donation history, and donation interest.
- Hospital blood requests with optional eSewa/Khalti payments (500 NPR/ML).
- Organisation inventory management and hospital request handling.
- Admin dashboards for users, blood requests, and account approvals.
- Public landing page with Blood Bank Directory and emergency request form.
- Analytics and 7‑day demand forecasting per blood group and organisation.

## Tech Stack

- Frontend: React, Bootstrap 5, Material UI, React Router, React Query.
- Backend: Node.js, Express, MongoDB.
- Charts: Chart.js (via react-chartjs-2).
- Payments: eSewa & Khalti services (port 5000).
- Forecasting: SARIMA-based forecasting service (port 8080).

## Main User Flows

- **Donor**: Register → Login → Donor Dashboard → Express interest / view donation history.
- **Hospital**: Login → Request Supply (/request-supply) → (Optional) pay → Confirm received blood.
- **Organisation**: Login → Inventory Dashboard (/home) → Manage inventory, donors, and requests.
- **Admin**: Login → Manage donors, hospitals, organisations, blood requests, and account requests.

## Getting Started

1. Clone this repository.
2. Install dependencies in `blood/client` and `blood/server`.
3. Set environment variables (MongoDB URI, JWT secret, payment keys, forecasting URLs).
4. Run backend, frontend, payment service (5000), and forecasting service (8080).
5. Open `http://localhost:3000` in your browser.

## Documentation

See the `/blood` docs:

- `README_FORECASTING.md`
- `QUICK_REFERENCE.md`
- `INTEGRATION_GUIDE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `DEPLOYMENT_CHECKLIST.md`
- `DELIVERABLES.md`
- `FORECASTING_FIXES.md`
- `FORECAST_DISPLAY_FIX.md`

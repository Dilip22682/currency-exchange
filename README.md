# 💱 Currency Exchange Platform

A Django-based currency exchange web application that allows users to convert currencies using real-time exchange-rate data retrieved from an external API.

This project demonstrates practical use of Django, REST API integration, JSON data processing, dynamic currency conversion, template rendering, static-file handling, Git/GitHub, and cloud deployment.

---

## 🌐 Live Demo

🚀 Live Application:  
[https://your-render-service.onrender.com](https://currency-exchange-rtd3.onrender.com/)

> Replace the above URL with your actual Render URL after deployment.

---

## 📂 Source Code

💻 GitHub Repository:  
[https://github.com/Dilip22682/currency-exchange](https://github.com/Dilip22682/currency-exchange)

---

## ✨ Features

- 💱 Convert amounts between multiple currencies
- 🌐 Fetch live exchange-rate data from an external API
- 📡 Dynamic currency-rate retrieval
- 🔄 Perform conversion using the latest returned exchange rate
- 💰 Accept a user-defined conversion amount
- 🔽 Select source and target currencies dynamically
- 📊 Process JSON responses from the external API
- ⚠️ Handle invalid input and API errors
- 📜 Show recent conversions
- 📈 Retrieve historical exchange-rate data
- 📱 Responsive user interface
- 🗄️ SQLite database support
- 🚀 Render deployment support
- 📦 Production support using Gunicorn and WhiteNoise

---

## 🖥️ Application Overview

The application provides a simple interface where users select:

- Amount
- Source currency
- Target currency

### Example

```text
Amount:          100
From Currency:   USD
To Currency:     INR
```

### Result

```text
100 USD = 8,300 INR
```

The exchange rate is retrieved dynamically from an external currency exchange API rather than being hardcoded.

---

## 🔌 API Integration

One of the main parts of this project is its integration with an external Currency Exchange API.

The Django backend:

1. Receives the conversion request.
2. Sends an HTTP request to the external currency API.
3. Receives exchange-rate data in JSON format.
4. Parses the JSON response.
5. Extracts the required exchange rate.
6. Calculates the converted amount.
7. Returns the result to the frontend.

---

## 🔄 Currency Conversion Logic

The application uses the following formula:

```text
Converted Amount = Input Amount × Exchange Rate
```

### Example

```text
Amount = 100 USD
USD to INR Rate = 83.00

100 × 83.00 = 8,300 INR
```

The exchange rate is obtained dynamically through the external API.

---

## 🧠 Request Flow

```text
User
  │
  │ Amount + Source Currency + Target Currency
  ▼
Django Frontend
  │
  ▼
Django View
  │
  │ Validate user input
  │ Build API request
  ▼
Currency Exchange API
  │
  │ JSON response
  ▼
Django Backend
  │
  │ Parse JSON
  │ Extract exchange rate
  │ Calculate converted amount
  ▼
Result Display
```

---

## 📡 Available API Endpoints

| Endpoint | Description |
|---|---|
| `/` | Home page |
| `/api/rates/?base=EUR` | Fetch exchange rates for a base currency |
| `/api/convert/?amount=1000&from=USD&to=EUR` | Convert one currency amount to another |
| `/api/recent/` | Retrieve recent conversion records |
| `/api/historical/?from=USD&to=EUR&days=30` | Retrieve historical exchange-rate information |

### Example API Request

```text
/api/convert/?amount=1000&from=USD&to=EUR
```

### Example Response

```json
{
  "from_currency": "USD",
  "to_currency": "EUR",
  "amount": 1000,
  "converted_amount": 920.50
}
```

> The exact JSON keys may vary depending on your current Django view implementation.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Programming Language | Python |
| Web Framework | Django |
| Frontend | HTML5, CSS3, JavaScript |
| UI Framework | Bootstrap |
| API Integration | Currency Exchange API |
| Data Format | JSON |
| HTTP Requests | Python Requests |
| Database | SQLite |
| Version Control | Git and GitHub |
| Production Server | Gunicorn |
| Static Files | WhiteNoise |
| Deployment | Render |

---

## 📁 Project Structure

```text
currency-exchange/
│
├── conversionapp/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   └── views.py
│
├── money_exchange/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── static/
├── staticfiles/
├── templates/
├── db.sqlite3
├── manage.py
├── build.sh
├── requirements.txt
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Dilip22682/currency-exchange.git
```

### 2. Move into the project folder

```bash
cd currency-exchange
```

### 3. Create a virtual environment

#### Windows

```bat
python -m venv venv
venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Collect static files

```bash
python manage.py collectstatic --noinput
```

### 7. Start the Django development server

```bash
python manage.py runserver
```

Open the application in your browser:

```text
http://127.0.0.1:8000/
```

---

## 🔐 Environment Variables

For production deployment, do not store sensitive values directly in your source code.

Use environment variables for values such as:

```text
SECRET_KEY=your-secret-key
DEBUG=False
```

If your external currency API requires an API key, use an environment variable such as:

```text
EXCHANGE_API_KEY=your-api-key
```

Add secret files to `.gitignore`:

```text
.env
```

> Never commit API keys, passwords, or Django secret keys to GitHub.

---

## 🗄️ Database

This project currently uses SQLite:

```text
Database Engine: SQLite
Database File: db.sqlite3
```

The project can be deployed on Render without a Render PostgreSQL database.

However, SQLite on a normal Render free web service is suitable only for a portfolio project or demo because the service filesystem is not persistent. Recent conversion history may be reset after redeployment or a service restart.

For a production application that must preserve user data and conversion history, use PostgreSQL.

---

## 🚀 Deploying on Render

This project can be deployed to Render as a **Web Service**.

### Render Configuration

| Render Field | Value |
|---|---|
| Service Type | Web Service |
| Runtime | Python |
| Branch | `main` |
| Root Directory | Leave empty |
| Build Command | `./build.sh` |
| Start Command | `gunicorn money_exchange.wsgi:application --bind 0.0.0.0:$PORT` |
| Database | Optional for demo deployment |
| Compute Type | Free for testing/demo |

### Build Script

Create a `build.sh` file in the project root:

```bash
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### Render Environment Variables

Add these in the Render dashboard:

```text
DEBUG=False
SECRET_KEY=your-long-random-secret-key
```

Generate a secure secret key locally:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## 📸 Screenshots

Create a `screenshots` folder:

```text
screenshots/
├── home.png
├── conversion.png
└── result.png
```

Then add screenshot links here:

```md





```

---

## 🧪 Future Improvements

- User registration and authentication
- Permanent conversion history using PostgreSQL
- Favorite currency pairs
- Historical exchange-rate charts
- Currency trend analysis
- API response caching
- Django REST Framework integration
- Automated unit tests
- Scheduled exchange-rate updates
- Better mobile user interface
- Docker support
- CI/CD deployment pipeline

---

## 🎯 Skills Demonstrated

- Python
- Django
- REST API integration
- HTTP requests
- JSON parsing and processing
- API error handling
- Django URL routing
- Django templates
- HTML, CSS, and JavaScript
- Bootstrap
- SQLite
- Static-file deployment
- WhiteNoise
- Gunicorn
- Git and GitHub
- Render deployment

---

## 👨‍💻 Author

**Dilip Kumar Patel**

Python and Django Developer  
Interested in building web applications, REST APIs, backend systems, and cloud-deployed Python projects.

### Technical Skills

- Python
- Django
- Django REST Framework
- REST APIs
- API Integration
- JavaScript
- HTML5 and CSS3
- Bootstrap
- SQLite
- Git and GitHub
- Render Deployment

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a star.

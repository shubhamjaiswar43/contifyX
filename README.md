# [Contify - Competitive Contest Analyzer](https://contifyX.netlify.app) 🚀
**Contify** is a comprehensive tool designed to help competitive programmers track and analyze their performance across various platforms, including Codeforces, CodeChef, and LeetCode. With features like performance analysis, competitor tracking, and contest comparison, Contify provides valuable insights to enhance your competitive programming experience.

## Features ✅
- **Contest Information**: Shows upcoming and past contests of codeforces, codechef and leetcode.
- **Performance Analysis**: Visualize your progress over time with detailed charts and graphs.
- **Competitor Tracking**: Keep track of your competitors' performance and compare their stats with yours.
- **Comparison**: Compare your performance with that of your friends and peers to improve yourself.
- **User-friendly Interface**: Intuitive and easy-to-navigate dashboard with a clean design.
- **Cross-platform Compatibility**: Supports major competitive coding platforms like Codeforces, CodeChef, and LeetCode.
- **Dark and Light Modes**: Switch between themes for a comfortable viewing experience.

## Technologies Used 🛠️
- **Frontend**: React, Tailwind CSS, TypeScript
- **APIs/Libraries**:
  - [Recharts](https://recharts.org/): For building interactive charts.
  - [React Router DOM](https://reactrouter.com/): For client-side routing.
  - [React Toastify](https://www.npmjs.com/package/react-toastify): For displaying notifications.
  - [Puppeteer](https://pptr.dev/): For web scraping (if needed in the future).

## Installation 💾
Clone the repository and install the dependencies:
```bash
git clone https://github.com/your-username/contify.git
cd contify
npm install
```

## Usage Guide 🔍
Run the app in development mode:
```bash
npm run dev
```

To build the app for production:
```bash
npm run build
```

## API Documentation 📡
Contify uses several external APIs to fetch data. Below is a summary of the primary APIs used:

| Platform     | Base URL                                 | Description                                                                                         |
|--------------|------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Codeforces   | `https://codeforces.com/api`             | Fetches user ratings, submission data, and contest details.                                         |
| CodeChef     | `https://codechef-api.vercel.app`        | Provides user rankings.                                                                             |
| LeetCode     | `https://alfa-leetcode-api.onrender.com` | Retrieves LeetCode contest information and user stats.                                              |

*Note: Some API calls may have rate limits or require API keys.*

### Additional Notes 📝
- The app uses **cookies** to store user settings and preferences, such as chosen competitors.
- The project includes comprehensive **ESLint** configurations to ensure code quality and consistency.
- The **theme provider** (`ThemeProvider.tsx`) allows switching between light and dark modes and saves the user's preference in `localStorage`.

## Project Structure 📂
Key files and directories:
- `public/`: Contains static assets like images and `index.html`.
- `src/`: Contains all source code.
  - `Contexts/`: Holds context providers (e.g., theme management).
  - `Components/`: Contains all React components:
    - `Analysis.tsx`: Renders performance analysis with charts.
    - `Competitors.tsx`: Allows tracking and comparison of competitors.
    - `Compare.tsx`: Compares contest statistics of two users.
    - `Dashboard.tsx`: Shows upcoming and past contests.
    - `Navbar.tsx`: Provides navigation across the app.
  - `userData.tsx`: Contains helper functions to fetch data from external APIs.
  - `main.tsx`: The entry point of the app.
  - `App.tsx`: The root component for routing and application setup.

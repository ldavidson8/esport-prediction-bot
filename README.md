# Esport Prediction Bot

This bot tracks certain esport schedules, provides prediction messages, and tracks users who vote. It uses Discord.js for interaction with Discord, better-sqlite3 for database operations, and node-schedule for scheduling tasks.

## Getting Started

### Prerequisites

-   Node.js installed
-   pnpm installed
-   A Discord bot token
-   A Discord server to test the bot
-   Liquipedia API key for fetching esport data

### Installation

1. Clone the repository:

    ```sh
    git clone <repository-url>
    cd esport-prediction-bot
    ```

2. Install dependencies:

    ```sh
    pnpm install
    ```

3. Create a .env file based on the .env.sample file and fill in the required environment variables:

    ```sh
    cp .env.sample .env
    ```

4. Build the project:

    ```sh
    pnpm build
    ```

### Running the Bot

1. Start the bot:

    ```sh
    pnpm start
    ```

2. Deploy commands:

    ```sh
    pnpm commands:deploy
    ```

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

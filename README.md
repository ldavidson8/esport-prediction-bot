# Esport Prediction Bot

This bot tracks certain esport schedules, provides prediction messages, and tracks users who vote. It uses Discord.js for interaction with Discord, better-sqlite3 for database operations, and node-schedule for scheduling tasks.

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   pnpm (v6 or higher)

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

3. Create a [`.env`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2F.env%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/.env') file based on the [`.env.sample`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2F.env.sample%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/.env.sample') file and fill in the required environment variables:

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

## Features

### Tracking Esport Schedules

The bot tracks esport schedules using a scheduler that runs every hour. It fetches the latest schedules from an API and updates the cache.

### Providing Prediction Messages

The bot sends prediction messages to a specified channel, allowing users to vote on the outcome of upcoming matches. The predictions are stored in a SQLite database.

### Tracking User Votes

The bot tracks user votes and stores them in the database. It ensures that each user can only vote once per match.

## Project Structure

-   [`src/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/src/')
    -   `api/`
        -   `apiRequests.ts`: Contains functions to fetch data from external APIs.
    -   [`bot.ts`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fbot.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/src/bot.ts'): Main entry point for the bot.
    -   `classes/`
        -   [`client.ts`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fclasses%2Fclient.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/src/classes/client.ts'): Custom client class extending Discord.js Client.
    -   [`commands/`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fbot.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A12%2C%22character%22%3A27%7D%7D%2C%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fclasses%2Fclient.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A18%2C%22character%22%3A4%7D%7D%2C%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fdeploy-command.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A24%2C%22character%22%3A6%7D%7D%5D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D 'Go to definition')
        -   `ping.ts`: Example command.
    -   `database/`
        -   `sqlite.ts`: SQLite setup and database functions.
        -   `cacheManager.ts`: Cache manager for handling cached data.
    -   [`deploy-command.ts`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fdeploy-command.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/src/deploy-command.ts'): Script to deploy commands to Discord.
    -   [`env.ts`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fclasses%2Fclient.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A34%2C%22character%22%3A19%7D%7D%2C%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fdeploy-command.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A11%2C%22character%22%3A9%7D%7D%5D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D 'Go to definition'): Environment variable setup.
    -   `events/`
    -   [`interfaces/`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Fdeploy-command.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A12%2C%22character%22%3A27%7D%7D%5D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D 'Go to definition')
        -   [`command.ts`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Flewis%2Fprojects%2Fesport-prediction-bot%2Fsrc%2Finterfaces%2Fcommand.ts%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22e0a51dfa-5934-475b-bc54-7a5b9f27b8e4%22%5D '/home/lewis/projects/esport-prediction-bot/src/interfaces/command.ts'): Command interface.
        -   `event.ts`: Event interface.
    -   `services/`
        -   `scheduler.ts`: Scheduler for updating cache.
    -   `utils/`

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

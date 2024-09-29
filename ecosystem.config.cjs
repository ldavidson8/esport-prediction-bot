module.exports = {
    apps: [
        {
            name: 'Esport Prediction Bot',
            script: 'dist/bot.js',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};

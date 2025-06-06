// To toggle between blue and green deployments:
// sudo vim /etc/apache2/sites-enabled/api.webamp.org-le-ssl.conf
// Update port number
// sudo systemctl reload apache2
module.exports = {
  apps: [
    {
      name: "skin-database-blue",
      script: "yarn",
      interpreter: "bash",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "skin-database-green",
      script: "yarn",
      interpreter: "bash",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
    },
  ],
};

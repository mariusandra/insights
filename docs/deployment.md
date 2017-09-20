Deploying on a new Ubuntu 16.04 for server usage:

1) make a vhost and point to the server, e.g. insights.mycompany.com

2) ssh, setup cerificates, etc

3) loosely based on [this guide](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)

```
INSIGHTS_DOMAIN=insights.mycompany.com

# general upgrades
apt-get update
apt-get upgrade -y

# nodejs
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# other tools
apt-get install -y git

# install insights
npm install -g insights insights-core insights-server

# enable the firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# install certbots
apt install software-properties-common -y
add-apt-repository ppa:certbot/certbot -y
apt-get update
apt-get install python-certbot-nginx -y

# setup nginx domain
sed -i -e "s/server_name _;/server_name $INSIGHTS_DOMAIN;/g" /etc/nginx/sites-available/default
nginx -t
systemctl reload nginx

# get the certificate
certbot --nginx -d $INSIGHTS_DOMAIN
# enter your e-mail and set to redirect all traffic to HTTPS

# set up auto-renewal
crontab -e
# EDIT: add this line:
15 3 * * * /usr/bin/certbot renew --quiet
# /EDIT

# make it more secure (grade from B to A)
openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048 # takes a few min
nano /etc/nginx/sites-available/default
# EDIT: add this line anywhere within the server { } block
ssl_dhparam /etc/ssl/certs/dhparam.pem;
# /EDIT
nginx -t
systemctl reload nginx


# proxy all requests to localhost:3030
nano /etc/nginx/sites-available/default
# EDIT: update the "location /" block like so:
        location / {
                proxy_pass http://127.0.0.1:3030;
        }
        location /socket.io/ {
                proxy_pass http://127.0.0.1:3030;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }
# /EDIT
nginx -t
systemctl reload nginx

# create user for insights
adduser --disabled-password -q insights

su insights
insights createsecret     # create a new authentication secret at ~/.insights/secret
insights createsuperuser  # create an admin user to access the server
# mark down your user and password

# create service
nano /etc/systemd/system/insights.service
# EDIT: copy this
[Unit]
Description=Insights
After=network.target

[Service]
User=insights
Restart=always
Type=simple
ExecStart=/usr/bin/insights
# /EDIT

systemctl start insights




```
